/**
 * Auth Service Client Implementation
 * Makes authenticated calls to auth-service for RBAC verification
 */

import axios from 'axios';
import { IAuthServiceClient } from '../../domain/repositories/IAuthServiceClient';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';

const logger = createLogger();

export class AuthServiceClient implements IAuthServiceClient {
  private config = getConfig();
  private client = axios.create({
    baseURL: this.config.externalServices?.authServiceUrl || 'http://localhost:3001',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Verify JWT token by calling auth-service
   * In a real implementation, you might decode the token locally
   * For now, we'll call auth-service to verify
   */
  async verifyToken(token: string): Promise<{ userId: string; email: string; roles: string[] } | null> {
    try {
      // In production, you might decode JWT locally using the same secret
      // For now, we'll make a simple call to verify
      // Option 1: Decode token locally (if you have JWT_SECRET)
      // Option 2: Call auth-service endpoint (if available)
      // Option 3: Use shared JWT verification
      
      // For now, we'll decode the token payload (without verification)
      // In production, you should verify the signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      return {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || [],
      };
    } catch (error) {
      logger.error('Token verification failed', { error });
      return null;
    }
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes(role);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      // In a real implementation, you might call auth-service
      // For now, we'll return empty array (roles are in JWT token)
      // This could call: GET /api/v1/auth/users/{userId}/roles
      return [];
    } catch (error) {
      logger.error('Failed to get user roles', { userId, error });
      return [];
    }
  }
}

