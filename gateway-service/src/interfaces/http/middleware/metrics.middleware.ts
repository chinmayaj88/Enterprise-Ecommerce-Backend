import { Response, NextFunction } from 'express';
import { getMetricsCollector } from '../../../infrastructure/metrics/MetricsCollector';
import { RequestWithId } from './requestId.middleware';

const metricsCollector = getMetricsCollector();

// Middleware to collect request metrics
export function metricsMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Extract service name from path
  const serviceName = getServiceNameFromPath(req.path);

  // Override res.end to capture response time
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
    const responseTime = Date.now() - startTime;

    metricsCollector.recordRequest({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      service: serviceName,
      timestamp: Date.now(),
    });

    // Call original end
    if (typeof cb === 'function') {
      return originalEnd(chunk, encoding, cb);
    } else if (typeof encoding === 'function') {
      return originalEnd(chunk, encoding);
    } else {
      return originalEnd(chunk, encoding);
    }
  };

  next();
}

function getServiceNameFromPath(path: string): string {
  if (path.startsWith('/api/v1/auth') || path.startsWith('/api/v1/security')) {
    return 'auth-service';
  } else if (path.startsWith('/api/v1/users')) {
    return 'user-service';
  } else if (path.startsWith('/api/v1/products') || path.startsWith('/api/v1/categories')) {
    return 'product-service';
  } else if (path.startsWith('/api/v1/carts')) {
    return 'cart-service';
  } else if (path.startsWith('/api/v1/orders')) {
    return 'order-service';
  } else if (path.startsWith('/api/v1/payments') || path.startsWith('/api/v1/payment-methods') || path.startsWith('/api/v1/webhooks')) {
    return 'payment-service';
  } else if (path.startsWith('/api/v1/notifications') || path.startsWith('/api/v1/templates') || path.startsWith('/api/v1/preferences')) {
    return 'notification-service';
  } else if (path.startsWith('/api/v1/coupons') || path.startsWith('/api/v1/promotions') || path.startsWith('/api/v1/discounts')) {
    return 'discount-service';
  } else if (path.startsWith('/api/v1/shipments') || path.startsWith('/api/v1/rates') || path.startsWith('/api/v1/zones') || path.startsWith('/api/v1/methods')) {
    return 'shipping-service';
  } else if (path.startsWith('/api/v1/returns')) {
    return 'return-service';
  }
  return 'gateway';
}

