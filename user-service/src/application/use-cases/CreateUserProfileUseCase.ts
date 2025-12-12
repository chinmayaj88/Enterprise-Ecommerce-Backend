import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { CreateUserProfileData, UserProfile } from '../../domain/entities/UserProfile';
import { AppError } from '../../shared/errors/AppError';

export class CreateUserProfileUseCase {
  constructor(
    private readonly userProfileRepository: IUserProfileRepository
  ) {}

  async execute(data: CreateUserProfileData): Promise<UserProfile> {
    const exists = await this.userProfileRepository.existsByUserId(data.userId);
    if (exists) {
      throw new AppError(409, 'User profile already exists');
    }

    const emailExists = await this.userProfileRepository.existsByEmail(data.email);
    if (emailExists) {
      throw new AppError(409, 'Email already registered');
    }

    return await this.userProfileRepository.create(data);
  }
}

