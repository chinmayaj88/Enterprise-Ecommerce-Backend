import * as fs from 'fs';
import * as path from 'path';

interface Config {
  server: {
    port: number;
    env: string;
    requestTimeout?: number;
    shutdownTimeout?: number;
    maxRequestSize?: string;
    proxyTimeout?: number;
  };
  jwt?: {
    secret?: string;
  };
  rateLimit?: {
    windowMs?: number;
    maxRequests?: number;
    authMaxRequests?: number;
  };
  cors?: {
    allowedOrigins?: string[];
  };
  logging?: {
    level?: string;
  };
  redis?: {
    url?: string;
  };
  services?: {
    authServiceUrl?: string;
    userServiceUrl?: string;
    productServiceUrl?: string;
    cartServiceUrl?: string;
    orderServiceUrl?: string;
    paymentServiceUrl?: string;
    notificationServiceUrl?: string;
    discountServiceUrl?: string;
    shippingServiceUrl?: string;
    returnServiceUrl?: string;
  };
  [key: string]: any;
}

let config: Config | null = null;

export function getConfig(): Config {
  if (config) {
    return config;
  }

  const env = process.env.NODE_ENV || 'development';
  const configDir = path.join(process.cwd(), 'config');

  // Load default config
  const defaultConfigPath = path.join(configDir, 'default.json');
  let mergedConfig: any = {};

  if (fs.existsSync(defaultConfigPath)) {
    mergedConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
  }

  // Load environment-specific config
  const envConfigPath = path.join(configDir, `${env}.json`);
  if (fs.existsSync(envConfigPath)) {
    const envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf-8'));
    mergedConfig = { ...mergedConfig, ...envConfig };
  }

  // Override with environment variables
  mergedConfig = {
    ...mergedConfig,
    server: {
      ...mergedConfig.server,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : mergedConfig.server?.port || 3000,
      env: env,
      requestTimeout: process.env.REQUEST_TIMEOUT_MS ? parseInt(process.env.REQUEST_TIMEOUT_MS, 10) : (mergedConfig.server?.requestTimeout || 30000),
      shutdownTimeout: process.env.SHUTDOWN_TIMEOUT_MS ? parseInt(process.env.SHUTDOWN_TIMEOUT_MS, 10) : (mergedConfig.server?.shutdownTimeout || 30000),
      maxRequestSize: process.env.MAX_REQUEST_SIZE_MB ? `${process.env.MAX_REQUEST_SIZE_MB}mb` : (mergedConfig.server?.maxRequestSize || '10mb'),
      proxyTimeout: process.env.PROXY_TIMEOUT_MS ? parseInt(process.env.PROXY_TIMEOUT_MS, 10) : (mergedConfig.server?.proxyTimeout || 25000),
    },
    jwt: {
      secret: process.env.JWT_SECRET || mergedConfig.jwt?.secret || '',
    },
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : (mergedConfig.rateLimit?.windowMs || 900000),
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : (mergedConfig.rateLimit?.maxRequests || 100),
      authMaxRequests: process.env.RATE_LIMIT_AUTH_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS, 10) : (mergedConfig.rateLimit?.authMaxRequests || 5),
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim()) : (mergedConfig.cors?.allowedOrigins || []),
    },
    logging: {
      level: process.env.LOG_LEVEL || mergedConfig.logging?.level || 'info',
    },
    redis: {
      url: process.env.REDIS_URL || mergedConfig.redis?.url,
    },
    services: {
      authServiceUrl: process.env.AUTH_SERVICE_URL || mergedConfig.services?.authServiceUrl || 'http://localhost:3001',
      userServiceUrl: process.env.USER_SERVICE_URL || mergedConfig.services?.userServiceUrl || 'http://localhost:3002',
      productServiceUrl: process.env.PRODUCT_SERVICE_URL || mergedConfig.services?.productServiceUrl || 'http://localhost:3003',
      cartServiceUrl: process.env.CART_SERVICE_URL || mergedConfig.services?.cartServiceUrl || 'http://localhost:3006',
      orderServiceUrl: process.env.ORDER_SERVICE_URL || mergedConfig.services?.orderServiceUrl || 'http://localhost:3007',
      paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || mergedConfig.services?.paymentServiceUrl || 'http://localhost:3006',
      notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || mergedConfig.services?.notificationServiceUrl || 'http://localhost:3009',
      discountServiceUrl: process.env.DISCOUNT_SERVICE_URL || mergedConfig.services?.discountServiceUrl || 'http://localhost:3008',
      shippingServiceUrl: process.env.SHIPPING_SERVICE_URL || mergedConfig.services?.shippingServiceUrl || 'http://localhost:3007',
      returnServiceUrl: process.env.RETURN_SERVICE_URL || mergedConfig.services?.returnServiceUrl || 'http://localhost:3010',
    },
  };

  config = mergedConfig as Config;
  return config;
}

