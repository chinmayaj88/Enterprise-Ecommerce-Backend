/**
 * Get Sessions Use Case
 * Retrieves active sessions for a user
 */

import { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository';
import { UserSession } from '../../domain/entities/UserSession';

export class GetSessionsUseCase {
  constructor(private readonly sessionRepository: IUserSessionRepository) {}

  async execute(userId: string, activeOnly = true): Promise<UserSession[]> {
    if (activeOnly) {
      return this.sessionRepository.findActiveByUserId(userId);
    }
    return this.sessionRepository.findByUserId(userId);
  }
}

