/**
 * Logout Use Case
 * Business logic for user logout (revokes refresh token)
 */

import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { LogoutRequest } from '../../application/dto/AuthDTOs';

export class LogoutUseCase {
  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  /**
   * Execute logout (revoke refresh token)
   */
  async execute(request: LogoutRequest): Promise<void> {
    await this.refreshTokenRepository.revoke(request.refreshToken);
  }
}

