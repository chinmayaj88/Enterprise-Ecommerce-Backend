import rateLimit from 'express-rate-limit';
import { getConfig } from '../../../infrastructure/config/config-provider';

const config = getConfig();

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 900000,
  max: config.rateLimit?.maxRequests || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit?.authMaxRequests || 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

