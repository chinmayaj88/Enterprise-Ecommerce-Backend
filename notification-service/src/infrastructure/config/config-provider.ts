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
  jwt?: {
    secret?: string;
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
  notification?: {
    emailProvider?: string;
    smsProvider?: string;
    pushProvider?: string;
    sendgridApiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    smtpFromEmail?: string;
    smtpFromName?: string;
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioPhoneNumber?: string;
    retryAttempts?: number;
    retryDelayMs?: number;
    maxNotificationsPerBatch?: number;
  };
  services?: {
    authServiceUrl?: string;
    userServiceUrl?: string;
    userServiceApiKey?: string;
    userServiceInternalToken?: string;
    frontendUrl?: string;
  };
  events?: {
    publisherType?: string;
    consumerType?: string;
    ociCompartmentId?: string;
    ociStreamId?: string;
    ociQueueId?: string;
    ociRegion?: string;
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
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : mergedConfig.server?.port || 3007,
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
    notification: {
      emailProvider: process.env.EMAIL_PROVIDER || mergedConfig.notification?.emailProvider || 'mock',
      smsProvider: process.env.SMS_PROVIDER || mergedConfig.notification?.smsProvider || 'mock',
      pushProvider: process.env.PUSH_PROVIDER || mergedConfig.notification?.pushProvider || 'mock',
      sendgridApiKey: process.env.SENDGRID_API_KEY || mergedConfig.notification?.sendgridApiKey,
      smtpHost: process.env.SMTP_HOST || mergedConfig.notification?.smtpHost,
      smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : mergedConfig.notification?.smtpPort,
      smtpUser: process.env.SMTP_USER || mergedConfig.notification?.smtpUser,
      smtpPassword: process.env.SMTP_PASSWORD || mergedConfig.notification?.smtpPassword,
      smtpFromEmail: process.env.SMTP_FROM_EMAIL || mergedConfig.notification?.smtpFromEmail || 'noreply@ecommerce.com',
      smtpFromName: process.env.SMTP_FROM_NAME || mergedConfig.notification?.smtpFromName || 'E-Commerce Platform',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || mergedConfig.notification?.twilioAccountSid,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || mergedConfig.notification?.twilioAuthToken,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || mergedConfig.notification?.twilioPhoneNumber,
      retryAttempts: process.env.NOTIFICATION_RETRY_ATTEMPTS ? parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS, 10) : (mergedConfig.notification?.retryAttempts || 3),
      retryDelayMs: process.env.NOTIFICATION_RETRY_DELAY_MS ? parseInt(process.env.NOTIFICATION_RETRY_DELAY_MS, 10) : (mergedConfig.notification?.retryDelayMs || 1000),
      maxNotificationsPerBatch: process.env.MAX_NOTIFICATIONS_PER_BATCH ? parseInt(process.env.MAX_NOTIFICATIONS_PER_BATCH, 10) : (mergedConfig.notification?.maxNotificationsPerBatch || 100),
    },
    services: {
      authServiceUrl: process.env.AUTH_SERVICE_URL || mergedConfig.services?.authServiceUrl || 'http://localhost:3001',
      userServiceUrl: process.env.USER_SERVICE_URL || mergedConfig.services?.userServiceUrl || 'http://localhost:3002',
      userServiceApiKey: process.env.USER_SERVICE_API_KEY || mergedConfig.services?.userServiceApiKey,
      userServiceInternalToken: process.env.USER_SERVICE_INTERNAL_TOKEN || mergedConfig.services?.userServiceInternalToken,
      frontendUrl: process.env.FRONTEND_URL || mergedConfig.services?.frontendUrl || 'http://localhost:3000',
    },
    events: {
      publisherType: process.env.EVENT_PUBLISHER_TYPE || mergedConfig.events?.publisherType || 'mock',
      consumerType: process.env.EVENT_CONSUMER_TYPE || mergedConfig.events?.consumerType || 'mock',
      ociCompartmentId: process.env.OCI_COMPARTMENT_ID || mergedConfig.events?.ociCompartmentId,
      ociStreamId: process.env.OCI_STREAM_ID || mergedConfig.events?.ociStreamId,
      ociQueueId: process.env.OCI_QUEUE_ID || mergedConfig.events?.ociQueueId,
      ociRegion: process.env.OCI_REGION || mergedConfig.events?.ociRegion || 'IN-HYDERABAD-1',
    },
  };

  config = mergedConfig as Config;
  return config;
}

