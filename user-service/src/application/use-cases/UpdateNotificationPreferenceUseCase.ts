/**
 * Update Notification Preference Use Case
 */

import { INotificationPreferenceRepository } from '../../domain/repositories/INotificationPreferenceRepository';
import { NotificationPreference, CreateNotificationPreferenceData, UpdateNotificationPreferenceData } from '../../domain/entities/NotificationPreference';
import { AppError } from '../../shared/errors/AppError';

export class UpdateNotificationPreferenceUseCase {
  constructor(private readonly notificationPreferenceRepository: INotificationPreferenceRepository) {}

  async execute(
    userId: string,
    data: CreateNotificationPreferenceData
  ): Promise<NotificationPreference> {
    return this.notificationPreferenceRepository.upsert({
      ...data,
      userId,
    });
  }

  async updatePreference(
    preferenceId: string,
    userId: string,
    data: UpdateNotificationPreferenceData
  ): Promise<NotificationPreference> {
    // Verify ownership
    const preference = await this.notificationPreferenceRepository.findById(preferenceId);
    if (!preference) {
      throw new AppError(404, 'Notification preference not found');
    }

    if (preference.userId !== userId) {
      throw new AppError(403, 'Unauthorized');
    }

    return this.notificationPreferenceRepository.update(preferenceId, data);
  }
}

