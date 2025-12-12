import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../domain/repositories/IRefreshTokenRepository';
import { IRoleRepository } from '../domain/repositories/IRoleRepository';
import { IPasswordResetTokenRepository } from '../domain/repositories/IPasswordResetTokenRepository';
import { IEmailVerificationTokenRepository } from '../domain/repositories/IEmailVerificationTokenRepository';
import { ISecurityAuditLogRepository } from '../domain/repositories/ISecurityAuditLogRepository';
import { IDeviceRepository } from '../domain/repositories/IDeviceRepository';
import { ILoginHistoryRepository } from '../domain/repositories/ILoginHistoryRepository';
import { IUserSessionRepository } from '../domain/repositories/IUserSessionRepository';
import { IPasswordHasher } from '../domain/repositories/IPasswordHasher';
import { ITokenService } from '../domain/repositories/ITokenService';
import { IEventPublisher } from '../domain/repositories/IEventPublisher';

import { PrismaUserRepository } from '../infrastructure/db/PrismaUserRepository';
import { PrismaRefreshTokenRepository } from '../infrastructure/db/PrismaRefreshTokenRepository';
import { PrismaRoleRepository } from '../infrastructure/db/PrismaRoleRepository';
import { PrismaPasswordResetTokenRepository } from '../infrastructure/db/PrismaPasswordResetTokenRepository';
import { PrismaEmailVerificationTokenRepository } from '../infrastructure/db/PrismaEmailVerificationTokenRepository';
import { PrismaSecurityAuditLogRepository } from '../infrastructure/db/PrismaSecurityAuditLogRepository';
import { PrismaDeviceRepository } from '../infrastructure/db/PrismaDeviceRepository';
import { PrismaLoginHistoryRepository } from '../infrastructure/db/PrismaLoginHistoryRepository';
import { PrismaUserSessionRepository } from '../infrastructure/db/PrismaUserSessionRepository';
import { BcryptPasswordHasher } from '../infrastructure/password/BcryptPasswordHasher';
import { JwtTokenService } from '../infrastructure/token/JwtTokenService';
import { MockEventPublisher } from '../infrastructure/events/MockEventPublisher';
import { OCIStreamingEventPublisher } from '../infrastructure/events/OCIStreamingEventPublisher';
import { createLogger } from '../infrastructure/logging/logger';
import { getConfig } from '../infrastructure/config/config-provider';

import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { RefreshTokenUseCase } from '../application/use-cases/RefreshTokenUseCase';
import { LogoutUseCase } from '../application/use-cases/LogoutUseCase';
import { ForgotPasswordUseCase } from '../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../application/use-cases/ResetPasswordUseCase';
import { VerifyEmailUseCase } from '../application/use-cases/VerifyEmailUseCase';
import { ResendVerificationEmailUseCase } from '../application/use-cases/ResendVerificationEmailUseCase';
import { ChangePasswordUseCase } from '../application/use-cases/ChangePasswordUseCase';
import { DeactivateAccountUseCase } from '../application/use-cases/DeactivateAccountUseCase';
import { GetDevicesUseCase } from '../application/use-cases/GetDevicesUseCase';
import { UpdateDeviceUseCase } from '../application/use-cases/UpdateDeviceUseCase';
import { RevokeDeviceUseCase } from '../application/use-cases/RevokeDeviceUseCase';
import { GetLoginHistoryUseCase } from '../application/use-cases/GetLoginHistoryUseCase';
import { GetSessionsUseCase } from '../application/use-cases/GetSessionsUseCase';
import { RevokeSessionUseCase } from '../application/use-cases/RevokeSessionUseCase';
import { RevokeAllSessionsUseCase } from '../application/use-cases/RevokeAllSessionsUseCase';
import { EnableMFAUseCase } from '../application/use-cases/EnableMFAUseCase';
import { VerifyMFAUseCase } from '../application/use-cases/VerifyMFAUseCase';
import { DisableMFAUseCase } from '../application/use-cases/DisableMFAUseCase';
import { DetectSuspiciousLoginUseCase } from '../application/use-cases/DetectSuspiciousLoginUseCase';

import { AuthController } from '../application/controllers/AuthController';
import { SecurityController } from '../application/controllers/SecurityController';

const logger = createLogger();

export class Container {
  private static instance: Container;
  private prisma: PrismaClient;
  private userRepository: IUserRepository;
  private refreshTokenRepository: IRefreshTokenRepository;
  private roleRepository: IRoleRepository;
  private passwordResetTokenRepository: IPasswordResetTokenRepository;
  private emailVerificationTokenRepository: IEmailVerificationTokenRepository;
  private securityAuditLogRepository: ISecurityAuditLogRepository;
  private deviceRepository: IDeviceRepository;
  private loginHistoryRepository: ILoginHistoryRepository;
  private userSessionRepository: IUserSessionRepository;
  private passwordHasher: IPasswordHasher;
  private tokenService: ITokenService;
  private eventPublisher: IEventPublisher;
  private registerUserUseCase: RegisterUserUseCase;
  private loginUseCase: LoginUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private logoutUseCase: LogoutUseCase;
  private forgotPasswordUseCase: ForgotPasswordUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;
  private verifyEmailUseCase: VerifyEmailUseCase;
  private resendVerificationEmailUseCase: ResendVerificationEmailUseCase;
  private changePasswordUseCase: ChangePasswordUseCase;
  private deactivateAccountUseCase: DeactivateAccountUseCase;
  private getDevicesUseCase: GetDevicesUseCase;
  private updateDeviceUseCase: UpdateDeviceUseCase;
  private revokeDeviceUseCase: RevokeDeviceUseCase;
  private getLoginHistoryUseCase: GetLoginHistoryUseCase;
  private getSessionsUseCase: GetSessionsUseCase;
  private revokeSessionUseCase: RevokeSessionUseCase;
  private revokeAllSessionsUseCase: RevokeAllSessionsUseCase;
  private enableMFAUseCase: EnableMFAUseCase;
  private verifyMFAUseCase: VerifyMFAUseCase;
  private disableMFAUseCase: DisableMFAUseCase;
  private detectSuspiciousLoginUseCase: DetectSuspiciousLoginUseCase;
  private authController: AuthController;
  private securityController: SecurityController;

  private constructor() {
    const config = getConfig();
    
    this.prisma = new PrismaClient({
      log: config.server.env === 'development' 
        ? ['query', 'error', 'warn'] 
        : config.server.env === 'staging'
        ? ['error', 'warn']
        : ['error'],
    });

    this.userRepository = new PrismaUserRepository(this.prisma);
    this.refreshTokenRepository = new PrismaRefreshTokenRepository(this.prisma);
    this.roleRepository = new PrismaRoleRepository(this.prisma);
    this.passwordResetTokenRepository = new PrismaPasswordResetTokenRepository(this.prisma);
    this.emailVerificationTokenRepository = new PrismaEmailVerificationTokenRepository(this.prisma);
    this.securityAuditLogRepository = new PrismaSecurityAuditLogRepository(this.prisma);
    this.deviceRepository = new PrismaDeviceRepository(this.prisma);
    this.loginHistoryRepository = new PrismaLoginHistoryRepository(this.prisma);
    this.userSessionRepository = new PrismaUserSessionRepository(this.prisma);

    this.passwordHasher = new BcryptPasswordHasher();
    this.tokenService = new JwtTokenService();
    this.eventPublisher = this.createEventPublisher();

    this.registerUserUseCase = new RegisterUserUseCase(
      this.userRepository,
      this.passwordHasher,
      this.tokenService,
      this.eventPublisher,
      this.roleRepository,
      this.emailVerificationTokenRepository
    );

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.passwordHasher,
      this.tokenService,
      this.refreshTokenRepository,
      this.securityAuditLogRepository
    );

    this.refreshTokenUseCase = new RefreshTokenUseCase(
      this.tokenService,
      this.refreshTokenRepository,
      this.userRepository
    );

    this.logoutUseCase = new LogoutUseCase(this.refreshTokenRepository);

    this.forgotPasswordUseCase = new ForgotPasswordUseCase(
      this.userRepository,
      this.passwordResetTokenRepository,
      this.eventPublisher
    );

    this.resetPasswordUseCase = new ResetPasswordUseCase(
      this.userRepository,
      this.passwordResetTokenRepository,
      this.passwordHasher
    );

    this.verifyEmailUseCase = new VerifyEmailUseCase(
      this.userRepository,
      this.emailVerificationTokenRepository
    );

    this.resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
      this.userRepository,
      this.emailVerificationTokenRepository,
      this.eventPublisher
    );

    this.changePasswordUseCase = new ChangePasswordUseCase(
      this.userRepository,
      this.passwordHasher
    );

    this.deactivateAccountUseCase = new DeactivateAccountUseCase(
      this.userRepository,
      this.passwordHasher,
      this.refreshTokenRepository,
      this.eventPublisher
    );

    this.getDevicesUseCase = new GetDevicesUseCase(this.deviceRepository);
    this.updateDeviceUseCase = new UpdateDeviceUseCase(this.deviceRepository);
    this.revokeDeviceUseCase = new RevokeDeviceUseCase(
      this.deviceRepository,
      this.userSessionRepository
    );
    this.getLoginHistoryUseCase = new GetLoginHistoryUseCase(this.loginHistoryRepository);
    this.getSessionsUseCase = new GetSessionsUseCase(this.userSessionRepository);
    this.revokeSessionUseCase = new RevokeSessionUseCase(this.userSessionRepository);
    this.revokeAllSessionsUseCase = new RevokeAllSessionsUseCase(this.userSessionRepository);
    this.enableMFAUseCase = new EnableMFAUseCase(this.userRepository);
    this.verifyMFAUseCase = new VerifyMFAUseCase(this.userRepository);
    this.disableMFAUseCase = new DisableMFAUseCase(this.userRepository);
    this.detectSuspiciousLoginUseCase = new DetectSuspiciousLoginUseCase(
      this.loginHistoryRepository,
      this.deviceRepository
    );

    // Set up controllers
    this.authController = new AuthController(
      this.registerUserUseCase,
      this.loginUseCase,
      this.refreshTokenUseCase,
      this.logoutUseCase,
      this.forgotPasswordUseCase,
      this.resetPasswordUseCase,
      this.verifyEmailUseCase,
      this.resendVerificationEmailUseCase,
      this.changePasswordUseCase,
      this.deactivateAccountUseCase
    );

    this.securityController = new SecurityController(
      this.getDevicesUseCase,
      this.updateDeviceUseCase,
      this.revokeDeviceUseCase,
      this.getLoginHistoryUseCase,
      this.getSessionsUseCase,
      this.revokeSessionUseCase,
      this.revokeAllSessionsUseCase,
      this.enableMFAUseCase,
      this.verifyMFAUseCase,
      this.disableMFAUseCase,
      this.detectSuspiciousLoginUseCase
    );
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Getters
  public getAuthController(): AuthController {
    return this.authController;
  }

  public getSecurityController(): SecurityController {
    return this.securityController;
  }

  public getTokenService(): ITokenService {
    return this.tokenService;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  private createEventPublisher(): IEventPublisher {
    const config = getConfig();
    const eventPublisherType = process.env.EVENT_PUBLISHER_TYPE;

    if (eventPublisherType) {
      switch (eventPublisherType.toLowerCase()) {
        case 'oci-streaming':
        case 'sns':
          logger.info('Using OCI Streaming Event Publisher (explicit configuration)');
          return new OCIStreamingEventPublisher();
        case 'mock':
          logger.info('Using Mock Event Publisher (explicit configuration)');
          return new MockEventPublisher();
        default:
          logger.warn(`Unknown EVENT_PUBLISHER_TYPE: ${eventPublisherType}, using mock`);
          return new MockEventPublisher();
      }
    }

    if (config.server.env === 'development') {
      logger.info('Development environment detected, using Mock Event Publisher');
      return new MockEventPublisher();
    }

    if (config.server.env === 'staging') {
      logger.info('Staging environment detected, using OCI Streaming');
      return new OCIStreamingEventPublisher();
    }

    if (config.server.env === 'production') {
      logger.info('Production environment detected, using OCI Streaming');
      return new OCIStreamingEventPublisher();
    }

    logger.info('Using Mock Event Publisher (default)');
    return new MockEventPublisher();
  }

  // Clean up resources on shutdown
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      logger.error('Error disconnecting Prisma', { error });
    }
  }
}

