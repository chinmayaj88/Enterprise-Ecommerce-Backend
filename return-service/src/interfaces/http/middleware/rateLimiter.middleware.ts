import rateLimit from 'express-rate-limit';
import { getConfig } from '../../../infrastructure/config/config-provider';

const config = getConfig();

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 900000, // 15 minutes
  max: config.rateLimit?.maxRequests || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

