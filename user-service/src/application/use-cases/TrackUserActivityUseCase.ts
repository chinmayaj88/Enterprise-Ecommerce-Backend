/**
 * Track User Activity Use Case
 * Records user actions for analytics
 */

import { IUserActivityRepository } from '../../domain/repositories/IUserActivityRepository';
import { UserActivity, CreateUserActivityData } from '../../domain/entities/UserActivity';

export class TrackUserActivityUseCase {
  constructor(private readonly activityRepository: IUserActivityRepository) {}

  async execute(data: CreateUserActivityData): Promise<UserActivity> {
    return this.activityRepository.create(data);
  }
}

