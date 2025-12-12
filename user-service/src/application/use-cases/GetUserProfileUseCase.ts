/**
 * Get User Profile Use Case
 */

import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { UserProfile } from '../../domain/entities/UserProfile';

export class GetUserProfileUseCase {
  constructor(
    private readonly userProfileRepository: IUserProfileRepository
  ) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return await this.userProfileRepository.findByUserId(userId);
  }
}

