/**
 * Get Notification Preferences Use Case
 */

import { INotificationPreferenceRepository } from '../../domain/repositories/INotificationPreferenceRepository';
import { NotificationPreference } from '../../domain/entities/NotificationPreference';

export class GetNotificationPreferencesUseCase {
  constructor(private readonly notificationPreferenceRepository: INotificationPreferenceRepository) {}

  async execute(userId: string, channel?: string): Promise<NotificationPreference[]> {
    if (channel) {
      return this.notificationPreferenceRepository.findByUserIdAndChannel(userId, channel);
    }
    return this.notificationPreferenceRepository.findByUserId(userId);
  }
}

