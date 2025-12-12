/**
 * Prometheus Metrics for Return Service
 */

import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'return_service_',
});

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

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Return-specific metrics
const returnRequestsCreated = new client.Counter({
  name: 'return_requests_created_total',
  help: 'Total number of return requests created',
  labelNames: ['reason', 'refund_method'],
  registers: [register],
});

const refundsProcessed = new client.Counter({
  name: 'refunds_processed_total',
  help: 'Total number of refunds processed',
  labelNames: ['status', 'method'],
  registers: [register],
});

function normalizeRoute(path: string): string {
  path = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
  path = path.replace(/\/\d+/g, '/:id');
  path = path.split('?')[0];
  return path || 'unknown';
}

export {
  register,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestErrors,
  databaseQueryDuration,
  returnRequestsCreated,
  refundsProcessed,
  normalizeRoute,
};

