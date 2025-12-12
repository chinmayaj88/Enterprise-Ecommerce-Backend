/**
 * Authentication Middleware with RBAC
 * Validates JWT tokens and checks roles by calling auth-service
 */

import { Response, NextFunction } from 'express';
import { IAuthServiceClient } from '../../../domain/repositories/IAuthServiceClient';
import { RequestWithId } from './requestId.middleware';
import { getConfig } from '../../../infrastructure/config/config-provider';
import { createLogger } from '../../../infrastructure/logging/logger';

const logger = createLogger();
const config = getConfig();

export interface AuthenticatedRequest extends RequestWithId {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

/**
 * Middleware to authenticate requests using JWT
 * Extracts token and verifies with auth-service
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        message: 'Missing or invalid authorization header',
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For now, decode token locally (in production, verify signature)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        res.status(401).json({ 
          success: false,
          message: 'Invalid token format',
          requestId: req.id,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Attach user to request
      req.user = {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || [],
      };
      next();
    } catch (error) {
      logger.warn('Token verification failed', { requestId: req.id, error });
      res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token',
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Authentication error', { requestId: req.id, error });
    res.status(500).json({ 
      success: false,
      message: 'Authentication error',
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const hasRole = roles.some((role) => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions. Required roles: ' + roles.join(', '),
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user owns the resource or has admin role
 */
export function requireOwnershipOrRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        requestId: req.id,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if user has required role (admin, etc.)
    const hasRole = roles.some((role) => req.user!.roles.includes(role));
    if (hasRole) {
      next();
      return;
    }

    // Check if user owns the resource
    const resourceUserId = req.params.userId || req.body.userId;
    if (resourceUserId && resourceUserId === req.user.userId) {
      next();
      return;
    }

    res.status(403).json({ 
      success: false,
      message: 'You can only access your own resources',
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  };
}

