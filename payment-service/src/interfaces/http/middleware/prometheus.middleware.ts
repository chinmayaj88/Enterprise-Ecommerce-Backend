/**
 * Prometheus Metrics Middleware for Payment Service
 */

import { Request, Response, NextFunction } from 'express';
import {
  httpRequestDuration,
  httpRequestTotal,
  httpRequestErrors,
  normalizeRoute,
} from '../../../infrastructure/metrics/PrometheusMetrics';

export function prometheusMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const route = normalizeRoute(req.route?.path || req.path);

  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode.toString();

    httpRequestDuration.observe(
      {
        method: req.method.toUpperCase(),
        route,
        status_code: statusCode,
      },
      duration
    );

    httpRequestTotal.inc({
      method: req.method.toUpperCase(),
      route,
      status_code: statusCode,
    });

    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      httpRequestErrors.inc({
        method: req.method.toUpperCase(),
        route,
        status_code: statusCode,
        error_type: errorType,
      });
    }

    originalEnd(chunk, encoding);
    return this;
  };

  next();
}

