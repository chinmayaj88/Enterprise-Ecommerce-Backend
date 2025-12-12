import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import timeout from 'connect-timeout';
import { getConfig } from '../../infrastructure/config/config-provider';
import { Container } from '../../di/container';
import { createProductRoutes } from './routes/product.routes';
import { createCategoryRoutes } from './routes/category.routes';
import { createProductVariantRoutes } from './routes/product-variant.routes';
import { createProductVariantDirectRoutes } from './routes/product-variant-direct.routes';
import { createProductImageRoutes } from './routes/product-image.routes';
import { createProductTagRoutes } from './routes/product-tag.routes';
import { createProductInventoryRoutes } from './routes/product-inventory.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { requestIdMiddleware, RequestWithId } from './middleware/requestId.middleware';
import { prometheusMetricsMiddleware } from './middleware/prometheus.middleware';
import { performHealthCheck, performReadinessCheck } from '../../infrastructure/health/healthCheck';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { createLogger } from '../../infrastructure/logging/logger';
import { register as prometheusRegister } from '../../infrastructure/metrics/PrometheusMetrics';

const logger = createLogger();
const config = getConfig();

export function createExpressApp(container: Container): express.Application {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  const corsOptions: cors.CorsOptions = {
    credentials: true,
    optionsSuccessStatus: 200,
  };

  // CORS config - strict in prod, permissive in dev
  if (config.server.env === 'production') {
    const allowedOrigins = config.cors?.allowedOrigins || [];
    
    if (allowedOrigins.length === 0) {
      logger.warn('No ALLOWED_ORIGINS configured in production. CORS will be restrictive.');
    }
    
    corsOptions.origin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    };
  } else {
    corsOptions.origin = '*';
  }

  app.use(cors(corsOptions));
  app.use(requestIdMiddleware);
  app.use(prometheusMetricsMiddleware);

  const requestTimeoutMs = config.server.requestTimeout || 30000;
  app.use(timeout(`${requestTimeoutMs}ms`));

  app.use((req: RequestWithId, res: express.Response, next: express.NextFunction) => {
    if (!req.timedout) {
      next();
    } else {
      res.status(408).json({
        success: false,
        message: 'Request timeout',
        requestId: req.id,
      });
    }
  });

  const maxRequestSizeMB = parseInt(config.server.maxRequestSize?.replace('mb', '') || '10', 10);
  app.use(express.json({ limit: `${maxRequestSizeMB}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${maxRequestSizeMB}mb` }));
  app.use(cookieParser());

  app.use((req: RequestWithId, _res: express.Response, next: express.NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      requestId: req.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  app.get('/health', async (_req: express.Request, res: express.Response) => {
    try {
      const prisma = container.getPrisma();
      const healthStatus = await performHealthCheck(prisma);

      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        service: 'product-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  app.get('/ready', async (_req: express.Request, res: express.Response) => {
    try {
      const prisma = container.getPrisma();
      const readiness = await performReadinessCheck(prisma);

      const statusCode = readiness.ready ? 200 : 503;
      res.status(statusCode).json({
        ready: readiness.ready,
        service: 'product-service',
        timestamp: new Date().toISOString(),
        checks: readiness.checks,
      });
    } catch (error: any) {
      logger.error('Readiness check failed', { error: error.message });
      res.status(503).json({
        ready: false,
        service: 'product-service',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  // Metrics endpoint - Prometheus format
  app.get('/metrics', async (_req: express.Request, res: express.Response) => {
    try {
      res.set('Content-Type', 'text/plain; version=0.0.4');
      const metrics = await prometheusRegister.metrics();
      res.send(metrics);
    } catch (error) {
      logger.error('Error generating metrics', { error });
      res.status(500).send('# Error generating metrics\n');
    }
  });

  // Apply global rate limiting
  app.use(globalRateLimiter);

  // Initialize controllers from container
  const categoryController = container.getCategoryController();
  const productController = container.getProductController();
  const productVariantController = container.getProductVariantController();
  const productImageController = container.getProductImageController();
  const productTagController = container.getProductTagController();
  const productInventoryController = container.getProductInventoryController();

  // Register routes in order of specificity
  // Direct variant routes (by ID) - for service-to-service communication (must come before nested routes)
  app.use('/api/v1/products/variants', createProductVariantDirectRoutes(productVariantController));
  // Nested routes (by productId)
  app.use('/api/v1/products/:productId/variants', createProductVariantRoutes(productVariantController));
  app.use('/api/v1/products/:productId/images', createProductImageRoutes(productImageController));
  app.use('/api/v1/products/:productId/tags', createProductTagRoutes(productTagController));
  app.use('/api/v1/products/:productId/inventory', createProductInventoryRoutes(productInventoryController));
  // Main product routes (must come last to avoid conflicts)
  app.use('/api/v1/products', createProductRoutes(productController));
  app.use('/api/v1/categories', createCategoryRoutes(categoryController));

  // API Documentation
  try {
    const openApiSpecPath = path.join(__dirname, '../../../openapi.yaml');
    const openApiSpec = YAML.load(openApiSpecPath);

    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(openApiSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Product Service API Documentation',
        customfavIcon: '/favicon.ico',
      })
    );

    app.get('/api-docs/openapi.yaml', (_req: express.Request, res: express.Response) => {
      res.setHeader('Content-Type', 'text/yaml');
      res.sendFile(path.resolve(openApiSpecPath));
    });

    logger.info('OpenAPI documentation available at /api-docs');
  } catch (error) {
    logger.warn('Failed to load OpenAPI documentation', { error });
  }

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

