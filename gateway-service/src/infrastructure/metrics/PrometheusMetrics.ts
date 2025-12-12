/**
 * Prometheus Metrics for Gateway Service
 * Includes proxy-specific metrics
 */

import * as client from 'prom-client';

// Create a Registry for gateway metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ 
  register,
  prefix: 'gateway_',
});

// HTTP Request Metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestErrors = new client.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'status_code', 'error_type'],
  registers: [register],
});

/**
 * Normalize route path for metrics
 */
function normalizeRoute(path: string): string {
  // Replace UUIDs
  path = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
  // Replace numeric IDs
  path = path.replace(/\/\d+/g, '/:id');
  // Remove query strings
  path = path.split('?')[0];
  return path || 'unknown';
}

export {
  register,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestErrors,
  normalizeRoute,
};

