/**
 * Change Password Use Case
 * Validates current password and updates to new password
 */

import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../../domain/repositories/IPasswordHasher';
import { ChangePasswordRequest } from '../../application/dto/AuthDTOs';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  /**
   * Execute password change
   * @throws {Error} If current password is incorrect
   */
  async execute(userId: string, request: ChangePasswordRequest): Promise<void> {
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Verify current password
    const isValid = await this.passwordHasher.compare(request.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await this.passwordHasher.hash(request.newPassword);

    // Update user password
    await this.userRepository.update(user.id, {
      ...user,
      passwordHash,
    });
  }
}

