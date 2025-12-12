import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../../../infrastructure/config/config-provider';
import { sendError, sendNotFound, sendInternalError } from '../../../application/dto/response.util';
import { createLogger } from '../../../infrastructure/logging/logger';
import { RequestWithId } from './requestId.middleware';
import { AppError } from '../../../shared/errors/AppError';

const logger = createLogger();

export function errorHandler(
  err: Error | AppError,
  req: RequestWithId,
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
    requestId: req.id,
  };

  if (err instanceof AppError) {
    logger.warn('Operational error', errorContext);
    const errorDetails = config.server.env === 'development' ? err.stack : undefined;
    sendError(res, err.statusCode, err.message, errorDetails, req.id);
    return;
  }

  logger.error('Unhandled error', errorContext);
  const errorDetails = config.server.env === 'development' ? err.stack : undefined;
  sendInternalError(res, 'Internal server error', errorDetails, req.id);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendNotFound(res, 'Route not found');
}

