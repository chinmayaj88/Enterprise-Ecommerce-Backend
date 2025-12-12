/**
 * Resend Verification Email Use Case
 * Generates new verification token and publishes event
 */

import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailVerificationTokenRepository } from '../../domain/repositories/IEmailVerificationTokenRepository';
import { IEventPublisher } from '../../domain/repositories/IEventPublisher';
import { ResendVerificationEmailRequest } from '../../application/dto/AuthDTOs';
import { randomBytes } from 'crypto';

export class ResendVerificationEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  /**
   * Execute resend verification email
   * @throws {Error} If user not found or already verified
   */
  async execute(request: ResendVerificationEmailRequest): Promise<void> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    // Delete existing verification tokens for this user
    await this.emailVerificationTokenRepository.deleteByUserId(user.id);

    // Generate secure verification token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 86400000); // 24 hours

    // Create verification token
    await this.emailVerificationTokenRepository.create({
      token: verificationToken,
      userId: user.id,
      expiresAt,
    });

    // Publish email verification event (async)
    const event = {
      userId: user.id,
      email: user.email,
      verificationToken,
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString(),
      source: 'auth-service',
    };

    this.eventPublisher.publish('user.email.verification.requested', event).catch((error) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Failed to publish email verification event:', error);
      }
    });
  }
}

