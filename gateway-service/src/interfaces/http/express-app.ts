import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import timeout from 'connect-timeout';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { getConfig } from '../../infrastructure/config/config-provider';
import { createProxyRoutes, serviceHealthChecker, circuitBreakerManager } from './routes/proxy.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { requestIdMiddleware, RequestWithId } from './middleware/requestId.middleware';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { prometheusMetricsMiddleware } from './middleware/prometheus.middleware';
import { requestValidator } from './middleware/requestValidator.middleware';
import { createLogger } from '../../infrastructure/logging/logger';
import { getMetricsCollector } from '../../infrastructure/metrics/MetricsCollector';
import { register as prometheusRegister } from '../../infrastructure/metrics/PrometheusMetrics';
import { getResponseCache } from '../../infrastructure/cache/ResponseCache';

const logger = createLogger();
const config = getConfig();

export function createExpressApp(): express.Application {
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

  // CORS configuration
  const corsOptions: cors.CorsOptions = {
    credentials: true,
    optionsSuccessStatus: 200,
  };

  if (config.server.env === 'production') {
    const allowedOrigins = config.cors?.allowedOrigins || [];
    
    if (allowedOrigins.length === 0) {
      // Backend-only deployment: Allow all origins for API access
      logger.info('No ALLOWED_ORIGINS configured in production. Allowing all origins (backend-only mode).');
      logger.info('Update ALLOWED_ORIGINS when frontend is deployed for better security.');
      corsOptions.origin = '*';
    } else {
      // Frontend is deployed: Use strict origin checking
      corsOptions.origin = (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked request from origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      };
    }
  } else {
    // Allow all origins in development
    corsOptions.origin = '*';
  }

  app.use(cors(corsOptions));
  app.use(requestIdMiddleware);

  // Request timeout
  const requestTimeoutMs = config.server.requestTimeout || 30000;
  app.use(timeout(`${requestTimeoutMs}ms`));

  app.use((req: RequestWithId, res, next) => {
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

  // Body parsing
  const maxRequestSizeMB = parseInt(config.server.maxRequestSize?.replace('mb', '') || '10', 10);
  app.use(express.json({ limit: `${maxRequestSizeMB}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${maxRequestSizeMB}mb` }));
  app.use(cookieParser());

  // Request logging
  app.use((req: RequestWithId, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      requestId: req.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Request validation
  app.use(requestValidator);

  // Metrics middleware (must be before routes)
  // Use Prometheus metrics middleware for /metrics endpoint compatibility
  app.use(prometheusMetricsMiddleware);
  // Keep legacy metrics middleware for backward compatibility
  app.use(metricsMiddleware);

  // Health check with service status
  app.get('/health', async (_req, res) => {
    const serviceHealth = serviceHealthChecker.getAllHealth();
    const allHealthy = serviceHealth.every((h) => h.healthy);

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      status: allHealthy ? 'healthy' : 'degraded',
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
      services: serviceHealth,
    });
  });

  // Readiness check
  app.get('/ready', async (_req, res) => {
    // Check if at least one service is available
    const serviceHealth = serviceHealthChecker.getAllHealth();
    const hasHealthyService = serviceHealth.some((h) => h.healthy);

    res.status(hasHealthyService ? 200 : 503).json({
      ready: hasHealthyService,
      service: 'gateway-service',
      timestamp: new Date().toISOString(),
      services: serviceHealth,
    });
  });

  // Metrics endpoint - Prometheus format
  app.get('/metrics', async (_req, res) => {
    try {
      // Return Prometheus format metrics
      res.set('Content-Type', 'text/plain; version=0.0.4');
      const metrics = await prometheusRegister.metrics();
      res.send(metrics);
    } catch (error) {
      logger.error('Error generating metrics', { error });
      res.status(500).send('# Error generating metrics\n');
    }
  });

  // Legacy metrics endpoint (JSON format) - for backward compatibility
  app.get('/metrics/json', (_req, res) => {
    const metricsCollector = getMetricsCollector();
    const metrics = metricsCollector.getMetricsSummary();
    const circuitBreakers = circuitBreakerManager.getBreakerMetrics();
    const cacheStats = getResponseCache().getStats();

    res.json({
      gateway: {
        service: 'gateway-service',
        timestamp: new Date().toISOString(),
      },
      requests: metrics,
      circuitBreakers,
      cache: cacheStats,
      services: serviceHealthChecker.getAllHealth(),
    });
  });

  // Service health endpoint
  app.get('/health/services', (_req, res) => {
    res.json({
      services: serviceHealthChecker.getAllHealth(),
      timestamp: new Date().toISOString(),
    });
  });

  // API Documentation
  try {
    const openApiSpecPath = path.join(process.cwd(), 'openapi.yaml');
    const openApiSpec = YAML.load(openApiSpecPath);

    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(openApiSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Gateway Service API Documentation',
        customfavIcon: '/favicon.ico',
      })
    );

    app.get('/api-docs/openapi.yaml', (_req, res) => {
      res.setHeader('Content-Type', 'text/yaml');
      res.sendFile(path.resolve(openApiSpecPath));
    });

    logger.info('OpenAPI documentation available at /api-docs');
  } catch (error) {
    logger.warn('Failed to load OpenAPI documentation', { error });
  }

  // Apply global rate limiting
  app.use(globalRateLimiter);

  // Apply stricter rate limiting to auth endpoints
  app.use('/api/v1/auth/login', authRateLimiter);
  app.use('/api/v1/auth/register', authRateLimiter);
  app.use('/api/v1/auth/forgot-password', authRateLimiter);
  app.use('/api/v1/auth/reset-password', authRateLimiter);

  // Proxy routes
  const proxyRoutes = createProxyRoutes();
  app.use(proxyRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

