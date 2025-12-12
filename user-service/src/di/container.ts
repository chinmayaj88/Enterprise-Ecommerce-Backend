import { PrismaClient } from '@prisma/client';
import { getConfig } from '../infrastructure/config/config-provider';
import { createLogger } from '../infrastructure/logging/logger';

// Repositories
import { IUserProfileRepository } from '../domain/repositories/IUserProfileRepository';
import { IAddressRepository } from '../domain/repositories/IAddressRepository';
import { IPaymentMethodRepository } from '../domain/repositories/IPaymentMethodRepository';
import { IWishlistItemRepository } from '../domain/repositories/IWishlistItemRepository';
import { IRecentlyViewedProductRepository } from '../domain/repositories/IRecentlyViewedProductRepository';
import { IUserActivityRepository } from '../domain/repositories/IUserActivityRepository';
import { INotificationPreferenceRepository } from '../domain/repositories/INotificationPreferenceRepository';
import { IUserPreferenceRepository } from '../domain/repositories/IUserPreferenceRepository';
import { IAuthServiceClient } from '../domain/repositories/IAuthServiceClient';
import { IEventConsumer } from '../domain/repositories/IEventConsumer';

import { PrismaUserProfileRepository } from '../infrastructure/db/PrismaUserProfileRepository';
import { PrismaAddressRepository } from '../infrastructure/db/PrismaAddressRepository';
import { PrismaPaymentMethodRepository } from '../infrastructure/db/PrismaPaymentMethodRepository';
import { PrismaWishlistItemRepository } from '../infrastructure/db/PrismaWishlistItemRepository';
import { PrismaRecentlyViewedProductRepository } from '../infrastructure/db/PrismaRecentlyViewedProductRepository';
import { PrismaUserActivityRepository } from '../infrastructure/db/PrismaUserActivityRepository';
import { PrismaNotificationPreferenceRepository } from '../infrastructure/db/PrismaNotificationPreferenceRepository';
import { PrismaUserPreferenceRepository } from '../infrastructure/db/PrismaUserPreferenceRepository';
import { AuthServiceClient } from '../infrastructure/clients/AuthServiceClient';
import { createEventConsumer } from '../infrastructure/events/EventConsumerFactory';

// Use Cases
import { CreateUserProfileUseCase } from '../application/use-cases/CreateUserProfileUseCase';
import { GetUserProfileUseCase } from '../application/use-cases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../application/use-cases/UpdateUserProfileUseCase';
import { CreateAddressUseCase } from '../application/use-cases/CreateAddressUseCase';
import { GetAddressesUseCase } from '../application/use-cases/GetAddressesUseCase';
import { UpdateAddressUseCase } from '../application/use-cases/UpdateAddressUseCase';
import { DeleteAddressUseCase } from '../application/use-cases/DeleteAddressUseCase';
import { CreatePaymentMethodUseCase } from '../application/use-cases/CreatePaymentMethodUseCase';
import { UpdatePaymentMethodUseCase } from '../application/use-cases/UpdatePaymentMethodUseCase';
import { DeletePaymentMethodUseCase } from '../application/use-cases/DeletePaymentMethodUseCase';
import { AddToWishlistUseCase } from '../application/use-cases/AddToWishlistUseCase';
import { GetWishlistUseCase } from '../application/use-cases/GetWishlistUseCase';
import { TrackProductViewUseCase } from '../application/use-cases/TrackProductViewUseCase';
import { GetRecentlyViewedProductsUseCase } from '../application/use-cases/GetRecentlyViewedProductsUseCase';
import { TrackUserActivityUseCase } from '../application/use-cases/TrackUserActivityUseCase';
import { GetUserActivityUseCase } from '../application/use-cases/GetUserActivityUseCase';
import { GetUserActivityStatsUseCase } from '../application/use-cases/GetUserActivityStatsUseCase';
import { CalculateProfileCompletionScoreUseCase } from '../application/use-cases/CalculateProfileCompletionScoreUseCase';
import { UpdateNotificationPreferenceUseCase } from '../application/use-cases/UpdateNotificationPreferenceUseCase';
import { GetNotificationPreferencesUseCase } from '../application/use-cases/GetNotificationPreferencesUseCase';
import { ExportUserDataUseCase } from '../application/use-cases/ExportUserDataUseCase';
import { DeleteUserDataUseCase } from '../application/use-cases/DeleteUserDataUseCase';
import { HandleUserCreatedEventUseCase } from '../application/use-cases/HandleUserCreatedEventUseCase';

// Controllers
import { UserController } from '../application/controllers/UserController';

const logger = createLogger();
const config = getConfig();

export class Container {
  private static instance: Container;
  private prisma: PrismaClient;
  
  // Repositories
  private userProfileRepository: IUserProfileRepository;
  private addressRepository: IAddressRepository;
  private paymentMethodRepository: IPaymentMethodRepository;
  private wishlistItemRepository: IWishlistItemRepository;
  private recentlyViewedProductRepository: IRecentlyViewedProductRepository;
  private userActivityRepository: IUserActivityRepository;
  private notificationPreferenceRepository: INotificationPreferenceRepository;
  private userPreferenceRepository: IUserPreferenceRepository;
  
  // External Services
  private authServiceClient: IAuthServiceClient;
  private eventConsumer: IEventConsumer;
  
  // Use Cases
  private handleUserCreatedEventUseCase: HandleUserCreatedEventUseCase;
  private getUserProfileUseCase: GetUserProfileUseCase;
  private updateUserProfileUseCase: UpdateUserProfileUseCase;
  private createAddressUseCase: CreateAddressUseCase;
  private getAddressesUseCase: GetAddressesUseCase;
  private updateAddressUseCase: UpdateAddressUseCase;
  private deleteAddressUseCase: DeleteAddressUseCase;
  private createPaymentMethodUseCase: CreatePaymentMethodUseCase;
  private updatePaymentMethodUseCase: UpdatePaymentMethodUseCase;
  private deletePaymentMethodUseCase: DeletePaymentMethodUseCase;
  private addToWishlistUseCase: AddToWishlistUseCase;
  private getWishlistUseCase: GetWishlistUseCase;
  private trackProductViewUseCase: TrackProductViewUseCase;
  private getRecentlyViewedProductsUseCase: GetRecentlyViewedProductsUseCase;
  private trackUserActivityUseCase: TrackUserActivityUseCase;
  private getUserActivityUseCase: GetUserActivityUseCase;
  private getUserActivityStatsUseCase: GetUserActivityStatsUseCase;
  private calculateProfileCompletionScoreUseCase: CalculateProfileCompletionScoreUseCase;
  private updateNotificationPreferenceUseCase: UpdateNotificationPreferenceUseCase;
  private getNotificationPreferencesUseCase: GetNotificationPreferencesUseCase;
  private exportUserDataUseCase: ExportUserDataUseCase;
  private deleteUserDataUseCase: DeleteUserDataUseCase;
  
  // Controllers
  private userController: UserController;

  private constructor() {
    // Initialize Prisma
    this.prisma = new PrismaClient({
      log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Initialize repositories
    this.userProfileRepository = new PrismaUserProfileRepository(this.prisma);
    this.addressRepository = new PrismaAddressRepository(this.prisma);
    this.paymentMethodRepository = new PrismaPaymentMethodRepository(this.prisma);
    this.wishlistItemRepository = new PrismaWishlistItemRepository(this.prisma);
    this.recentlyViewedProductRepository = new PrismaRecentlyViewedProductRepository(this.prisma);
    this.userActivityRepository = new PrismaUserActivityRepository(this.prisma);
    this.notificationPreferenceRepository = new PrismaNotificationPreferenceRepository(this.prisma);
    this.userPreferenceRepository = new PrismaUserPreferenceRepository(this.prisma);

    // Initialize external services
    this.authServiceClient = new AuthServiceClient();
    this.eventConsumer = createEventConsumer();

    // Initialize use cases
    this.handleUserCreatedEventUseCase = new HandleUserCreatedEventUseCase(
      this.userProfileRepository
    );
    this.getUserProfileUseCase = new GetUserProfileUseCase(this.userProfileRepository);
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(
      this.userProfileRepository,
      this.addressRepository,
      this.paymentMethodRepository
    );
    this.createAddressUseCase = new CreateAddressUseCase(this.addressRepository);
    this.getAddressesUseCase = new GetAddressesUseCase(this.addressRepository);
    this.updateAddressUseCase = new UpdateAddressUseCase(this.addressRepository);
    this.deleteAddressUseCase = new DeleteAddressUseCase(this.addressRepository);
    this.createPaymentMethodUseCase = new CreatePaymentMethodUseCase(this.paymentMethodRepository);
    this.updatePaymentMethodUseCase = new UpdatePaymentMethodUseCase(this.paymentMethodRepository);
    this.deletePaymentMethodUseCase = new DeletePaymentMethodUseCase(this.paymentMethodRepository);
    this.addToWishlistUseCase = new AddToWishlistUseCase(this.wishlistItemRepository);
    this.getWishlistUseCase = new GetWishlistUseCase(this.wishlistItemRepository);
    this.trackProductViewUseCase = new TrackProductViewUseCase(
      this.recentlyViewedProductRepository,
      this.userActivityRepository
    );
    this.getRecentlyViewedProductsUseCase = new GetRecentlyViewedProductsUseCase(
      this.recentlyViewedProductRepository
    );
    this.trackUserActivityUseCase = new TrackUserActivityUseCase(this.userActivityRepository);
    this.getUserActivityUseCase = new GetUserActivityUseCase(this.userActivityRepository);
    this.getUserActivityStatsUseCase = new GetUserActivityStatsUseCase(this.userActivityRepository);
    this.calculateProfileCompletionScoreUseCase = new CalculateProfileCompletionScoreUseCase(
      this.userProfileRepository
    );
    this.updateNotificationPreferenceUseCase = new UpdateNotificationPreferenceUseCase(
      this.notificationPreferenceRepository
    );
    this.getNotificationPreferencesUseCase = new GetNotificationPreferencesUseCase(
      this.notificationPreferenceRepository
    );
    this.exportUserDataUseCase = new ExportUserDataUseCase(
      this.userProfileRepository,
      this.addressRepository,
      this.paymentMethodRepository,
      this.wishlistItemRepository,
      this.recentlyViewedProductRepository,
      this.userActivityRepository,
      this.notificationPreferenceRepository
    );
    this.deleteUserDataUseCase = new DeleteUserDataUseCase(
      this.userProfileRepository,
      this.recentlyViewedProductRepository
    );

    // Initialize controller
    this.userController = new UserController(
      this.getUserProfileUseCase,
      this.updateUserProfileUseCase,
      this.createAddressUseCase,
      this.getAddressesUseCase,
      this.updateAddressUseCase,
      this.deleteAddressUseCase,
      this.createPaymentMethodUseCase,
      this.updatePaymentMethodUseCase,
      this.deletePaymentMethodUseCase,
      this.addToWishlistUseCase,
      this.getWishlistUseCase,
      this.trackProductViewUseCase,
      this.getRecentlyViewedProductsUseCase,
      this.trackUserActivityUseCase,
      this.getUserActivityUseCase,
      this.getUserActivityStatsUseCase,
      this.calculateProfileCompletionScoreUseCase,
      this.updateNotificationPreferenceUseCase,
      this.getNotificationPreferencesUseCase,
      this.exportUserDataUseCase,
      this.deleteUserDataUseCase,
      this.paymentMethodRepository,
      this.wishlistItemRepository
    );

    // Setup event handlers
    this.setupEventHandlers();

    logger.info('Container initialized');
  }

  private setupEventHandlers(): void {
    // Register user.created event handler
    this.eventConsumer.onUserCreated((event) =>
      this.handleUserCreatedEventUseCase.execute(event).catch((error) => {
        logger.error('Failed to handle user.created event', { error, event });
      })
    );
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Getters
  getPrisma(): PrismaClient {
    return this.prisma;
  }

  getUserController(): UserController {
    return this.userController;
  }

  getEventConsumer(): IEventConsumer {
    return this.eventConsumer;
  }

  getAuthServiceClient(): IAuthServiceClient {
    return this.authServiceClient;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    await this.eventConsumer.stop();
    logger.info('Container disconnected');
  }
}

