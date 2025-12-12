import { Response, NextFunction } from 'express';
import { createLogger } from '../../../infrastructure/logging/logger';
import { RequestWithId } from './requestId.middleware';
import { getConfig } from '../../../infrastructure/config/config-provider';

const logger = createLogger();
const config = getConfig();

// Basic request validation middleware
export function requestValidator(req: RequestWithId, res: Response, next: NextFunction): void {
  // Validate request size
  const contentLength = req.get('content-length');
  if (contentLength) {
    const maxSizeMB = parseInt(config.server.maxRequestSize?.replace('mb', '') || '10', 10);
    const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      logger.warn('Request too large', {
        requestId: req.id,
        sizeMB,
        maxSizeMB,
        path: req.path,
      });
      res.status(413).json({
        success: false,
        message: 'Request entity too large',
        requestId: req.id,
      });
      return;
    }
  }

  // Validate JSON for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (req.get('content-type')?.includes('application/json')) {
      if (!req.body || Object.keys(req.body).length === 0) {
        // Empty body is sometimes valid, so we don't reject it
        // But we log it for debugging
        logger.debug('Empty JSON body', {
          requestId: req.id,
          path: req.path,
        });
      }
    }
  }

  next();
}

