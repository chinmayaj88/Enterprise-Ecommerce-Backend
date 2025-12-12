import * as fs from 'fs';
import * as path from 'path';

interface Config {
  server: {
    port: number;
    env: string;
    requestTimeout?: number;
    shutdownTimeout?: number;
    maxRequestSize?: string;
  };
  database: {
    url: string;
  };
  services: {
    product: string;
  };
  cart?: {
    expirationDays?: number;
    maxItems?: number;
    maxItemQuantity?: number;
  };
  redis?: {
    url?: string;
  };
  jwt: {
    secret: string;
  };
  rateLimit?: {
    windowMs?: number;
    maxRequests?: number;
  };
  cors?: {
    allowedOrigins?: string[];
  };
  logging?: {
    level?: string;
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
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : mergedConfig.server?.port || 3004,
      env: env,
      requestTimeout: process.env.REQUEST_TIMEOUT_MS ? parseInt(process.env.REQUEST_TIMEOUT_MS, 10) : (mergedConfig.server?.requestTimeout || 30000),
      shutdownTimeout: process.env.SHUTDOWN_TIMEOUT_MS ? parseInt(process.env.SHUTDOWN_TIMEOUT_MS, 10) : (mergedConfig.server?.shutdownTimeout || 30000),
      maxRequestSize: process.env.MAX_REQUEST_SIZE_MB ? `${process.env.MAX_REQUEST_SIZE_MB}mb` : (mergedConfig.server?.maxRequestSize || '10mb'),
    },
    database: {
      ...mergedConfig.database,
      url: process.env.DATABASE_URL || mergedConfig.database?.url,
    },
    services: {
      product: process.env.PRODUCT_SERVICE_URL || mergedConfig.services?.product || 'http://localhost:3003',
    },
    jwt: {
      secret: process.env.JWT_SECRET || mergedConfig.jwt?.secret || '',
    },
    redis: {
      url: process.env.REDIS_URL || mergedConfig.redis?.url,
    },
    cart: {
      expirationDays: process.env.CART_EXPIRATION_DAYS ? parseInt(process.env.CART_EXPIRATION_DAYS, 10) : (mergedConfig.cart?.expirationDays || 30),
      maxItems: process.env.MAX_CART_ITEMS ? parseInt(process.env.MAX_CART_ITEMS, 10) : (mergedConfig.cart?.maxItems || 100),
      maxItemQuantity: process.env.MAX_ITEM_QUANTITY ? parseInt(process.env.MAX_ITEM_QUANTITY, 10) : (mergedConfig.cart?.maxItemQuantity || 99),
    },
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : (mergedConfig.rateLimit?.windowMs || 900000),
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : (mergedConfig.rateLimit?.maxRequests || 100),
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : (mergedConfig.cors?.allowedOrigins || []),
    },
    logging: {
      level: process.env.LOG_LEVEL || mergedConfig.logging?.level || 'info',
    },
  };

  config = mergedConfig as Config;
  return config;
}

