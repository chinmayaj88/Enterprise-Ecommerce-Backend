import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getConfig } from '../../../infrastructure/config/config-provider';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

// JWT validation middleware for protected routes
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const config = getConfig();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!config.jwt?.secret) {
      res.status(500).json({
        success: false,
        message: 'JWT secret not configured',
      });
      return;
    }

    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        roles: string[];
        exp?: number;
      };

      // Attach user info to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || [],
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
}

// Optional auth - doesn't fail if no token
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const config = getConfig();
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (config.jwt?.secret) {
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
        } catch (_error) {
          // Invalid token, but continue without user
        }
      }
    }

    next();
  } catch (_error) {
    next();
  }
}

// Role-based access control (currently only used in tests, available for future use)
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

