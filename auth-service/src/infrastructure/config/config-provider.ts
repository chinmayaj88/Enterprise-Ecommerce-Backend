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
  redis?: {
    url?: string;
    cacheTtl?: number;
  };
  jwt: {
    secret: string;
    refreshSecret?: string;
    accessTokenExpiresIn?: string;
    refreshTokenExpiresIn?: string;
  };
  auth?: {
    maxLoginAttempts?: number;
    lockoutDurationMinutes?: number;
    cookieSecret?: string;
    cookieDomain?: string;
    cookieSecure?: boolean;
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
  product?: {
    maxSearchResults?: number;
    cacheTtl?: number;
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
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : mergedConfig.server?.port || 3003,
      env: env,
      requestTimeout: process.env.REQUEST_TIMEOUT_MS ? parseInt(process.env.REQUEST_TIMEOUT_MS, 10) : (mergedConfig.server?.requestTimeout || 30000),
      shutdownTimeout: process.env.SHUTDOWN_TIMEOUT_MS ? parseInt(process.env.SHUTDOWN_TIMEOUT_MS, 10) : (mergedConfig.server?.shutdownTimeout || 30000),
      maxRequestSize: process.env.MAX_REQUEST_SIZE_MB ? `${process.env.MAX_REQUEST_SIZE_MB}mb` : (mergedConfig.server?.maxRequestSize || '10mb'),
    },
    database: {
      ...mergedConfig.database,
      url: process.env.DATABASE_URL || mergedConfig.database?.url,
    },
    jwt: {
      secret: process.env.JWT_SECRET || mergedConfig.jwt?.secret || '',
      refreshSecret: process.env.JWT_REFRESH_SECRET || mergedConfig.jwt?.refreshSecret || mergedConfig.jwt?.secret || '',
      accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || mergedConfig.jwt?.accessTokenExpiresIn || '15m',
      refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || mergedConfig.jwt?.refreshTokenExpiresIn || '7d',
    },
    auth: {
      maxLoginAttempts: process.env.MAX_LOGIN_ATTEMPTS ? parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) : (mergedConfig.auth?.maxLoginAttempts || 5),
      lockoutDurationMinutes: process.env.LOCKOUT_DURATION_MINUTES ? parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) : (mergedConfig.auth?.lockoutDurationMinutes || 30),
      cookieSecret: process.env.COOKIE_SECRET || mergedConfig.auth?.cookieSecret || '',
      cookieDomain: process.env.COOKIE_DOMAIN || mergedConfig.auth?.cookieDomain || '',
      cookieSecure: process.env.COOKIE_SECURE === 'true' || mergedConfig.auth?.cookieSecure || false,
    },
    redis: {
      url: process.env.REDIS_URL || mergedConfig.redis?.url,
      cacheTtl: process.env.REDIS_CACHE_TTL ? parseInt(process.env.REDIS_CACHE_TTL, 10) : (mergedConfig.redis?.cacheTtl || 3600),
    },
    product: {
      maxSearchResults: process.env.MAX_SEARCH_RESULTS ? parseInt(process.env.MAX_SEARCH_RESULTS, 10) : (mergedConfig.product?.maxSearchResults || 100),
      cacheTtl: process.env.PRODUCT_CACHE_TTL ? parseInt(process.env.PRODUCT_CACHE_TTL, 10) : (mergedConfig.product?.cacheTtl || 3600),
    },
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : (mergedConfig.rateLimit?.windowMs || 900000),
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : (mergedConfig.rateLimit?.maxRequests || 100),
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim()) : (mergedConfig.cors?.allowedOrigins || []),
    },
    logging: {
      level: process.env.LOG_LEVEL || mergedConfig.logging?.level || 'info',
    },
  };

  config = mergedConfig as Config;
  return config;
}

