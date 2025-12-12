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
    cart: string;
    product: string;
    user: string;
  };
  order?: {
    numberPrefix?: string;
    maxItems?: number;
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
  // Use process.cwd() as base, config is at root level
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
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : mergedConfig.server?.port || 3005,
      env: env,
      requestTimeout: mergedConfig.server?.requestTimeout || 30000,
      shutdownTimeout: mergedConfig.server?.shutdownTimeout || 30000,
      maxRequestSize: mergedConfig.server?.maxRequestSize || '10mb',
    },
    database: {
      ...mergedConfig.database,
      url: process.env.DATABASE_URL || mergedConfig.database?.url,
    },
    services: {
      cart: process.env.CART_SERVICE_URL || mergedConfig.services?.cart || 'http://localhost:3004',
      product: process.env.PRODUCT_SERVICE_URL || mergedConfig.services?.product || 'http://localhost:3003',
      user: process.env.USER_SERVICE_URL || mergedConfig.services?.user || 'http://localhost:3002',
    },
    jwt: {
      secret: process.env.JWT_SECRET || mergedConfig.jwt?.secret || '',
    },
    redis: {
      url: process.env.REDIS_URL || mergedConfig.redis?.url,
    },
    order: {
      numberPrefix: process.env.ORDER_NUMBER_PREFIX || mergedConfig.order?.numberPrefix || 'ORD',
      maxItems: process.env.MAX_ORDER_ITEMS ? parseInt(process.env.MAX_ORDER_ITEMS, 10) : mergedConfig.order?.maxItems || 100,
    },
  };

  config = mergedConfig as Config;
  return config;
}

