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
  };
  encryption?: {
    key?: string;
  };
  paymentProviders?: {
    default?: string;
    stripe?: {
      secretKey?: string;
      webhookSecret?: string;
      webhookIps?: string[];
    };
    paypal?: {
      clientId?: string;
      clientSecret?: string;
      webhookId?: string;
      webhookIps?: string[];
    };
  };
  externalServices?: {
    orderServiceUrl?: string;
    userServiceUrl?: string;
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
  eventing?: {
    publisherType?: string;
    consumerType?: string;
    oci?: {
      compartmentId?: string;
      streamId?: string;
      queueId?: string;
      region?: string;
    };
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
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : mergedConfig.server?.port || 3005,
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
    },
    redis: {
      url: process.env.REDIS_URL || mergedConfig.redis?.url,
      cacheTtl: process.env.REDIS_CACHE_TTL ? parseInt(process.env.REDIS_CACHE_TTL, 10) : (mergedConfig.redis?.cacheTtl || 3600),
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY || mergedConfig.encryption?.key,
    },
    paymentProviders: {
      ...mergedConfig.paymentProviders,
      default: process.env.PAYMENT_PROVIDER || mergedConfig.paymentProviders?.default || 'mock',
      stripe: {
        ...mergedConfig.paymentProviders?.stripe,
        secretKey: process.env.STRIPE_SECRET_KEY || mergedConfig.paymentProviders?.stripe?.secretKey,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || mergedConfig.paymentProviders?.stripe?.webhookSecret,
        webhookIps: process.env.STRIPE_WEBHOOK_IPS ? process.env.STRIPE_WEBHOOK_IPS.split(',').map(ip => ip.trim()) : (mergedConfig.paymentProviders?.stripe?.webhookIps || []),
      },
      paypal: {
        ...mergedConfig.paymentProviders?.paypal,
        clientId: process.env.PAYPAL_CLIENT_ID || mergedConfig.paymentProviders?.paypal?.clientId,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || mergedConfig.paymentProviders?.paypal?.clientSecret,
        webhookId: process.env.PAYPAL_WEBHOOK_ID || mergedConfig.paymentProviders?.paypal?.webhookId,
        webhookIps: process.env.PAYPAL_WEBHOOK_IPS ? process.env.PAYPAL_WEBHOOK_IPS.split(',').map(ip => ip.trim()) : (mergedConfig.paymentProviders?.paypal?.webhookIps || []),
      },
    },
    externalServices: {
      ...mergedConfig.externalServices,
      orderServiceUrl: process.env.ORDER_SERVICE_URL || mergedConfig.externalServices?.orderServiceUrl || 'http://localhost:3004',
      userServiceUrl: process.env.USER_SERVICE_URL || mergedConfig.externalServices?.userServiceUrl || 'http://localhost:3002',
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
    eventing: {
      ...mergedConfig.eventing,
      publisherType: process.env.EVENT_PUBLISHER_TYPE || mergedConfig.eventing?.publisherType || 'mock',
      consumerType: process.env.EVENT_CONSUMER_TYPE || mergedConfig.eventing?.consumerType || 'mock',
      oci: {
        ...mergedConfig.eventing?.oci,
        compartmentId: process.env.OCI_COMPARTMENT_ID || mergedConfig.eventing?.oci?.compartmentId,
        streamId: process.env.OCI_STREAM_ID || mergedConfig.eventing?.oci?.streamId,
        queueId: process.env.OCI_QUEUE_ID || mergedConfig.eventing?.oci?.queueId,
        region: process.env.OCI_REGION || mergedConfig.eventing?.oci?.region || 'us-ashburn-1',
      },
    },
  };

  config = mergedConfig as Config;
  return config;
}

