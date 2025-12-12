import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../../../infrastructure/config/config-provider';
import { createLogger } from '../../../infrastructure/logging/logger';
import { RequestWithId } from './requestId.middleware';
import { sendUnauthorized, sendForbidden } from '../../../application/dto/response.util';

const config = getConfig();
const logger = createLogger();

export interface AuthenticatedRequest extends RequestWithId {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
  sessionId?: string;
}

// Optional auth middleware - doesn't fail if no token
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = jwt.verify(token, config.jwt.secret) as {
          userId: string;
          email: string;
          roles?: string[];
        };

        req.user = {
          userId: payload.userId,
          email: payload.email,
          roles: payload.roles || [],
        };
      } catch (error) {
        logger.warn('Invalid token in optional auth', { error });
      }
    }
  } catch (error) {
    logger.warn('Error in optional auth middleware', { error });
  }

  next();
}

// Required auth middleware - fails if no valid token
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Authentication required', undefined, req.id);
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        roles?: string[];
      };

      req.user = {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || [],
      };

      next();
    } catch (error) {
      logger.warn('Invalid token', { error });
      return sendUnauthorized(res, 'Invalid or expired token', undefined, req.id);
    }
  } catch (error) {
    logger.error('Error in auth middleware', { error });
    return sendUnauthorized(res, 'Authentication failed', undefined, req.id);
  }
}

// Alias for backward compatibility (returns middleware function)
export function authenticate() {
  return requireAuth;
}

// Role-based authorization
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required', undefined, req.id);
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return sendForbidden(res, 'Insufficient permissions', undefined, req.id);
    }

    next();
  };
}
