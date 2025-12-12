import { Response, NextFunction } from 'express';
import { createLogger } from '../../../infrastructure/logging/logger';
import { RequestWithId } from './requestId.middleware';

const logger = createLogger();

// Error handler middleware
export function errorHandler(
  err: Error,
  req: RequestWithId,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Gateway error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
  });

  // Determine status code from error
  let statusCode = 500;
  if ('status' in err && typeof err.status === 'number') {
    statusCode = err.status;
  } else if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  const message = isDevelopment ? err.message || 'Internal server error' : 'Internal server error';

  if (!res.headersSent) {
    res.status(statusCode).json({
      success: false,
      message,
      ...(isDevelopment && { error: err.message }),
      requestId: req.id,
    });
  }
}

// 404 handler
export function notFoundHandler(req: RequestWithId, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.id,
  });
}

