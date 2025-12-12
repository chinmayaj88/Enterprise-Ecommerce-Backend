import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConfig } from '../../../infrastructure/config/config-provider';
import { createLogger } from '../../../infrastructure/logging/logger';
import { RequestWithId } from './requestId.middleware';

const config = getConfig();
const logger = createLogger();

export interface AuthenticatedRequest extends RequestWithId {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header',
        requestId: req.id,
      });
      return;
    }

    const token = authHeader.substring(7);

    if (!config.jwt?.secret) {
      logger.warn('JWT_SECRET not configured, authentication will fail');
      res.status(401).json({
        success: false,
        message: 'Authentication not configured',
        requestId: req.id,
      });
      return;
    }

    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        roles: string[];
      };

      req.user = {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || [],
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired', { requestId: req.id });
        res.status(401).json({
          success: false,
          message: 'Token expired',
          requestId: req.id,
        });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid token', { requestId: req.id, error });
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          requestId: req.id,
        });
        return;
      }
      logger.error('Token verification error', { requestId: req.id, error });
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
        requestId: req.id,
      });
    }
  } catch (error) {
    logger.error('Authentication error', { requestId: req.id, error });
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      requestId: req.id,
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        requestId: req.id,
      });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        requestId: req.id,
      });
      return;
    }

    next();
  };
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth header - continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!config.jwt?.secret) {
      // No secret configured - continue without user
      next();
      return;
    }

    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        roles: string[];
      };

      req.user = {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || [],
      };
    } catch (error) {
      // Invalid token - continue without user
    }

    next();
  } catch (error) {
    // Error - continue without user
    next();
  }
}

