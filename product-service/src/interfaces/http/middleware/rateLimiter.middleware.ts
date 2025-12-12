import rateLimit from 'express-rate-limit';
import { getConfig } from '../../../infrastructure/config/config-provider';
import { RequestWithId } from './requestId.middleware';

const config = getConfig();

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 900000,
  max: config.rateLimit?.maxRequests || 100,
  message: (req: RequestWithId) => {
    const requestId = (req as any).id || 'unknown';
    return {
      success: false,
      message: 'Too many requests, please try again later.',
      requestId,
    };
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: RequestWithId) => req.ip || 'unknown',
});
