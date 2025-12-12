import { getConfig } from './config-provider';
import { createLogger } from '../logging/logger';
import axios from 'axios';

const logger = createLogger();

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates production configuration
 * Should be called at startup in production environment
 */
export async function validateProductionConfig(): Promise<ValidationResult> {
  const config = getConfig();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check NODE_ENV
  if (config.server.env !== 'production') {
    warnings.push(`NODE_ENV is set to "${config.server.env}" instead of "production"`);
  }

  // Check JWT_SECRET strength
  if (!config.jwt?.secret || config.jwt.secret.length < 32) {
    errors.push(`JWT_SECRET must be at least 32 characters long (currently ${config.jwt?.secret?.length || 0})`);
  }

  if (config.jwt?.secret && (config.jwt.secret.includes('CHANGE_THIS') || config.jwt.secret.includes('your-super-secret'))) {
    errors.push('JWT_SECRET appears to be a placeholder value. Please set a strong, randomly generated secret.');
  }

  // Check service URLs are not localhost in production
  const services = config.services || {};
  const serviceUrls = [
    { name: 'AUTH_SERVICE_URL', url: services.authServiceUrl },
    { name: 'USER_SERVICE_URL', url: services.userServiceUrl },
    { name: 'PRODUCT_SERVICE_URL', url: services.productServiceUrl },
    { name: 'CART_SERVICE_URL', url: services.cartServiceUrl },
    { name: 'ORDER_SERVICE_URL', url: services.orderServiceUrl },
    { name: 'PAYMENT_SERVICE_URL', url: services.paymentServiceUrl },
    { name: 'NOTIFICATION_SERVICE_URL', url: services.notificationServiceUrl },
    { name: 'DISCOUNT_SERVICE_URL', url: services.discountServiceUrl },
    { name: 'SHIPPING_SERVICE_URL', url: services.shippingServiceUrl },
    { name: 'RETURN_SERVICE_URL', url: services.returnServiceUrl },
  ];

  for (const { name, url } of serviceUrls) {
    if (!url) {
      warnings.push(`${name} is not configured`);
      continue;
    }

    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      errors.push(`${name} is set to localhost (${url}). Use production service URLs.`);
    }

    if (url.includes('yourdomain.com')) {
      errors.push(`${name} appears to be a placeholder (${url}). Update with actual service URL.`);
    }
  }

  // Check ALLOWED_ORIGINS in production
  if (config.server.env === 'production') {
    if (!config.cors?.allowedOrigins || config.cors.allowedOrigins.length === 0) {
      warnings.push(
        'ALLOWED_ORIGINS is not set. Gateway will allow all origins (acceptable for backend-only deployment). ' +
        'Update when frontend is deployed for better security.'
      );
    }
  }

  // Check Redis configuration (optional but recommended)
  if (!config.redis?.url && config.server.env === 'production') {
    warnings.push(
      'REDIS_URL is not configured. Distributed rate limiting will not work across multiple instances. ' +
      'Consider setting up Redis for production deployments.'
    );
  }

  // Validate service URLs are reachable (non-blocking, just log warnings)
  if (config.server.env === 'production') {
    logger.info('Validating service URLs are reachable...');
    
    // Run health checks in parallel (with timeout)
    const healthCheckPromises = serviceUrls
      .filter(({ url }) => url)
      .map(async ({ name, url }) => {
        try {
          const healthUrl = `${url}/health`;
          await axios.get(healthUrl, { timeout: 5000 });
          logger.debug(`✓ ${name} is reachable`);
        } catch (error: any) {
          warnings.push(`${name} (${url}) may not be reachable: ${error.message}`);
          logger.warn(`${name} health check failed`, { url, error: error.message });
        }
      });

    // Don't wait for all checks, just start them
    Promise.all(healthCheckPromises).catch(() => {
      // Ignore errors, we're just checking
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates and logs production configuration
 * Throws error if critical issues found
 */
export async function validateAndLogProductionConfig(): Promise<void> {
  const result = await validateProductionConfig();

  // Log warnings
  if (result.warnings.length > 0) {
    logger.warn('Production configuration warnings:', { warnings: result.warnings });
    result.warnings.forEach((warning) => logger.warn(`  - ${warning}`));
  }

  // Log errors and throw if critical
  if (result.errors.length > 0) {
    logger.error('Production configuration errors:', { errors: result.errors });
    result.errors.forEach((error) => logger.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Production configuration validation failed:\n${result.errors.join('\n')}\n` +
        'Please fix these issues before starting the service.'
      );
    } else {
      logger.warn('Configuration errors found but NODE_ENV is not production. Service will start anyway.');
    }
  }

  if (result.valid && result.warnings.length === 0) {
    logger.info('✓ Production configuration validation passed');
  }
}

