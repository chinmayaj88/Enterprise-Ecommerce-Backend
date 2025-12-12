import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../../../infrastructure/config/config-provider';
import { createLogger } from '../../../infrastructure/logging/logger';
import { RequestWithId } from './requestId.middleware';
import { AppError } from '../../../shared/errors/AppError';

const logger = createLogger();

export function errorHandler(
  err: Error | AppError,
  req: Request & RequestWithId,
  res: Response,
  _next: NextFunction
): void {
  const config = getConfig();

  const errorContext = {
    error: err.message,
    stack: config.server.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: (req as RequestWithId).id,
  };

  if (err instanceof AppError) {
    logger.warn('Operational error', errorContext);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      requestId: (req as RequestWithId).id,
    });
    return;
  }

  logger.error('Unhandled error', errorContext);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    requestId: (req as RequestWithId).id,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

