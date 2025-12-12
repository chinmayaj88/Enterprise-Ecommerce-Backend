/**
 * Security Controller
 * Handles device management, session management, and login history
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/http/middleware/auth.middleware';
import { GetDevicesUseCase } from '../../application/use-cases/GetDevicesUseCase';
import { UpdateDeviceUseCase } from '../../application/use-cases/UpdateDeviceUseCase';
import { RevokeDeviceUseCase } from '../../application/use-cases/RevokeDeviceUseCase';
import { GetLoginHistoryUseCase } from '../../application/use-cases/GetLoginHistoryUseCase';
import { GetSessionsUseCase } from '../../application/use-cases/GetSessionsUseCase';
import { RevokeSessionUseCase } from '../../application/use-cases/RevokeSessionUseCase';
import { RevokeAllSessionsUseCase } from '../../application/use-cases/RevokeAllSessionsUseCase';
import { EnableMFAUseCase } from '../../application/use-cases/EnableMFAUseCase';
import { VerifyMFAUseCase } from '../../application/use-cases/VerifyMFAUseCase';
import { DisableMFAUseCase } from '../../application/use-cases/DisableMFAUseCase';
import { DetectSuspiciousLoginUseCase } from '../../application/use-cases/DetectSuspiciousLoginUseCase';
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
} from '../dto/response.util';

export class SecurityController {
  constructor(
    private readonly getDevicesUseCase: GetDevicesUseCase,
    private readonly updateDeviceUseCase: UpdateDeviceUseCase,
    private readonly revokeDeviceUseCase: RevokeDeviceUseCase,
    private readonly getLoginHistoryUseCase: GetLoginHistoryUseCase,
    private readonly getSessionsUseCase: GetSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly revokeAllSessionsUseCase: RevokeAllSessionsUseCase,
    private readonly enableMFAUseCase: EnableMFAUseCase,
    private readonly verifyMFAUseCase: VerifyMFAUseCase,
    private readonly disableMFAUseCase: DisableMFAUseCase,
    private readonly detectSuspiciousLoginUseCase: DetectSuspiciousLoginUseCase
  ) {}

  /**
   * Get all devices for the authenticated user
   */
  async getDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const devices = await this.getDevicesUseCase.execute(
        req.user!.userId,
        includeInactive
      );

      sendSuccess(res, 'Devices retrieved successfully', { devices });
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }

  /**
   * Update device (name, trust status)
   */
  async updateDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deviceId } = req.params;
      const { deviceName, isTrusted } = req.body;

      const device = await this.updateDeviceUseCase.execute(deviceId, req.user!.userId, {
        deviceName,
        isTrusted,
      });

      sendSuccess(res, 'Device updated successfully', { device });
    } catch (error: any) {
      if (error.message === 'Device not found' || error.message === 'Unauthorized') {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message);
      }
    }
  }

  /**
   * Revoke device (logout from specific device)
   */
  async revokeDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deviceId } = req.params;

      await this.revokeDeviceUseCase.execute(deviceId, req.user!.userId);

      sendSuccess(res, 'Device revoked successfully');
    } catch (error: any) {
      if (error.message === 'Device not found' || error.message === 'Unauthorized') {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message);
      }
    }
  }

  /**
   * Get login history for the authenticated user
   */
  async getLoginHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const status = req.query.status as 'success' | 'failed' | 'blocked' | undefined;
      const isSuspicious = req.query.isSuspicious === 'true' ? true : undefined;

      const result = await this.getLoginHistoryUseCase.execute(req.user!.userId, {
        limit,
        offset,
        status,
        isSuspicious,
      });

      sendSuccess(res, 'Login history retrieved successfully', result);
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }

  /**
   * Get active sessions for the authenticated user
   */
  async getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const sessions = await this.getSessionsUseCase.execute(req.user!.userId, activeOnly);

      sendSuccess(res, 'Sessions retrieved successfully', { sessions });
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      await this.revokeSessionUseCase.execute(sessionId, req.user!.userId);

      sendSuccess(res, 'Session revoked successfully');
    } catch (error: any) {
      if (error.message === 'Session not found' || error.message === 'Unauthorized') {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message);
      }
    }
  }

  /**
   * Revoke all sessions (logout from all devices)
   */
  async revokeAllSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentSessionToken = req.headers['x-session-token'] as string | undefined;

      await this.revokeAllSessionsUseCase.execute(req.user!.userId, currentSessionToken);

      sendSuccess(res, 'All sessions revoked successfully');
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }

  /**
   * Enable MFA for authenticated user
   */
  async enableMFA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const email = req.user!.email || '';

      const result = await this.enableMFAUseCase.execute(userId, email);

      sendSuccess(res, 'MFA enabled successfully. Save your backup codes securely.', { ...result });
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { code } = req.body;

      if (!code) {
        sendBadRequest(res, 'MFA code is required');
        return;
      }

      const result = await this.verifyMFAUseCase.execute(userId, code);

      sendSuccess(res, 'MFA code verified successfully', result);
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }

  /**
   * Disable MFA for authenticated user
   */
  async disableMFA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { password } = req.body;

      if (!password) {
        sendBadRequest(res, 'Password is required to disable MFA');
        return;
      }

      await this.disableMFAUseCase.execute(userId, password);

      sendSuccess(res, 'MFA disabled successfully');
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }

  /**
   * Detect suspicious login
   */
  async detectSuspiciousLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || '';
      const userAgent = req.get('user-agent') || '';
      const deviceId = req.headers['x-device-id'] as string || '';

      const detection = await this.detectSuspiciousLoginUseCase.execute(
        userId,
        ipAddress,
        userAgent,
        deviceId
      );

      sendSuccess(res, 'Suspicious login detection completed', detection);
    } catch (error: any) {
      sendBadRequest(res, error.message);
    }
  }
}

