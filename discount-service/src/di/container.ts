import { PrismaClient } from '@prisma/client';
import { getConfig } from '../infrastructure/config/config-provider';
import { createLogger } from '../infrastructure/logging/logger';

// Repositories
import { ICouponRepository } from '../domain/repositories/ICouponRepository';
import { ICouponUsageRepository } from '../domain/repositories/ICouponUsageRepository';
import { IPromotionRepository } from '../domain/repositories/IPromotionRepository';
import { IPromotionRuleRepository } from '../domain/repositories/IPromotionRuleRepository';
import { IPromotionUsageRepository } from '../domain/repositories/IPromotionUsageRepository';
import { PrismaCouponRepository } from '../infrastructure/db/PrismaCouponRepository';
import { PrismaCouponUsageRepository } from '../infrastructure/db/PrismaCouponUsageRepository';
import { PrismaPromotionRepository } from '../infrastructure/db/PrismaPromotionRepository';
import { PrismaPromotionRuleRepository } from '../infrastructure/db/PrismaPromotionRuleRepository';
import { PrismaPromotionUsageRepository } from '../infrastructure/db/PrismaPromotionUsageRepository';

// Use Cases
import { ValidateCouponUseCase } from '../application/use-cases/ValidateCouponUseCase';
import { CalculateDiscountUseCase } from '../application/use-cases/CalculateDiscountUseCase';
import { ApplyCouponUseCase } from '../application/use-cases/ApplyCouponUseCase';
import { EvaluatePromotionUseCase } from '../application/use-cases/EvaluatePromotionUseCase';
import { ApplyPromotionUseCase } from '../application/use-cases/ApplyPromotionUseCase';

// Controllers
import { CouponController } from '../application/controllers/CouponController';
import { PromotionController } from '../application/controllers/PromotionController';
import { DiscountController } from '../application/controllers/DiscountController';

// Event Consumer
import { IEventConsumer } from '../infrastructure/events/IEventConsumer';
import { OCIQueueEventConsumer } from '../infrastructure/events/OCIQueueEventConsumer';
import { DiscountEventHandlers } from '../infrastructure/events/DiscountEventHandlers';

// Clients
import { ICartServiceClient } from '../infrastructure/clients/CartServiceClient';
import { CartServiceClient } from '../infrastructure/clients/CartServiceClient';
import { IOrderServiceClient } from '../infrastructure/clients/OrderServiceClient';
import { OrderServiceClient } from '../infrastructure/clients/OrderServiceClient';

const logger = createLogger();
const config = getConfig();

export class Container {
  private static instance: Container;
  private prisma: PrismaClient;
  private couponRepository: ICouponRepository;
  private couponUsageRepository: ICouponUsageRepository;
  private promotionRepository: IPromotionRepository;
  private promotionRuleRepository: IPromotionRuleRepository;
  private promotionUsageRepository: IPromotionUsageRepository;
  private validateCouponUseCase: ValidateCouponUseCase;
  private calculateDiscountUseCase: CalculateDiscountUseCase;
  private applyCouponUseCase: ApplyCouponUseCase;
  private evaluatePromotionUseCase: EvaluatePromotionUseCase;
  private applyPromotionUseCase: ApplyPromotionUseCase;
  private couponController: CouponController;
  private promotionController: PromotionController;
  private discountController: DiscountController;
  private eventConsumer: IEventConsumer;
  private eventHandlers: DiscountEventHandlers;
  private cartServiceClient: ICartServiceClient;
  private orderServiceClient: IOrderServiceClient;

  private constructor() {
    // Initialize Prisma
    this.prisma = new PrismaClient({
      log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Initialize repositories
    this.couponRepository = new PrismaCouponRepository(this.prisma);
    this.couponUsageRepository = new PrismaCouponUsageRepository(this.prisma);
    this.promotionRepository = new PrismaPromotionRepository(this.prisma);
    this.promotionRuleRepository = new PrismaPromotionRuleRepository(this.prisma);
    this.promotionUsageRepository = new PrismaPromotionUsageRepository(this.prisma);

    // Initialize clients
    this.cartServiceClient = new CartServiceClient();
    this.orderServiceClient = new OrderServiceClient();

    // Initialize use cases
    this.validateCouponUseCase = new ValidateCouponUseCase(
      this.couponRepository,
      this.couponUsageRepository
    );
    this.calculateDiscountUseCase = new CalculateDiscountUseCase();
    this.applyCouponUseCase = new ApplyCouponUseCase(
      this.couponRepository,
      this.couponUsageRepository,
      this.validateCouponUseCase,
      this.calculateDiscountUseCase
    );
    this.evaluatePromotionUseCase = new EvaluatePromotionUseCase(
      this.promotionRepository,
      this.promotionRuleRepository
    );
    this.applyPromotionUseCase = new ApplyPromotionUseCase(
      this.promotionRepository,
      this.promotionUsageRepository,
      this.evaluatePromotionUseCase
    );

    // Initialize controllers
    this.couponController = new CouponController(this.couponRepository);
    this.promotionController = new PromotionController(
      this.promotionRepository,
      this.promotionRuleRepository
    );
    this.discountController = new DiscountController(
      this.validateCouponUseCase,
      this.calculateDiscountUseCase,
      this.applyCouponUseCase,
      this.evaluatePromotionUseCase,
      this.applyPromotionUseCase,
      this.cartServiceClient,
      this.promotionRepository
    );

    // Initialize event handlers
    this.eventHandlers = new DiscountEventHandlers(
      this.couponUsageRepository,
      this.promotionUsageRepository,
      this.orderServiceClient
    );

    // Initialize event consumer
    this.eventConsumer = new OCIQueueEventConsumer();
    this.setupEventHandlers();

    logger.info('Container initialized');
  }

  private setupEventHandlers(): void {
    // Register event handlers
    this.eventConsumer.subscribe('order.created', (event) =>
      this.eventHandlers.handleOrderCreated(event as any)
    );
    this.eventConsumer.subscribe('order.cancelled', (event) =>
      this.eventHandlers.handleOrderCancelled(event as any)
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

  getCouponController(): CouponController {
    return this.couponController;
  }

  getPromotionController(): PromotionController {
    return this.promotionController;
  }

  getDiscountController(): DiscountController {
    return this.discountController;
  }

  getEventConsumer(): IEventConsumer {
    return this.eventConsumer;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    await this.eventConsumer.stop();
    logger.info('Container disconnected');
  }
}

