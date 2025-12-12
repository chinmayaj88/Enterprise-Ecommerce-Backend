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
    path: (req as Request).path,
    method: (req as Request).method,
    ip: (req as Request).ip,
    userAgent: (req as Request).get('user-agent'),
    requestId: req.id,
  };

  if (err instanceof AppError) {
    logger.warn('Operational error', errorContext);
    const errorDetails = config.server.env === 'development' ? err.stack : undefined;
    return sendError(res, err.statusCode, err.message, errorDetails, req.id);
  }

  logger.error('Unexpected error', errorContext);
  const errorDetails = config.server.env === 'development' ? err.stack : undefined;
  return sendInternalError(res, 'An unexpected error occurred', errorDetails, req.id);
}

export function notFoundHandler(req: RequestWithId, res: Response): void {
  return sendNotFound(res, `Route ${(req as Request).method} ${(req as Request).path} not found`, undefined, req.id);
}
