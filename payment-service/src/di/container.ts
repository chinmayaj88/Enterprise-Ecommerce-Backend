import { PrismaClient } from '@prisma/client';
import { getConfig } from '../infrastructure/config/config-provider';
import { createLogger } from '../infrastructure/logging/logger';

// Repositories
import { IPaymentRepository } from '../domain/repositories/IPaymentRepository';
import { IPaymentTransactionRepository } from '../domain/repositories/IPaymentTransactionRepository';
import { IRefundRepository } from '../domain/repositories/IRefundRepository';
import { IPaymentMethodRepository } from '../domain/repositories/IPaymentMethodRepository';
import { IPaymentWebhookRepository } from '../domain/repositories/IPaymentWebhookRepository';
import { PrismaPaymentRepository } from '../infrastructure/db/PrismaPaymentRepository';
import { PrismaPaymentTransactionRepository } from '../infrastructure/db/PrismaPaymentTransactionRepository';
import { PrismaRefundRepository } from '../infrastructure/db/PrismaRefundRepository';
import { PrismaPaymentMethodRepository } from '../infrastructure/db/PrismaPaymentMethodRepository';
import { PrismaPaymentWebhookRepository } from '../infrastructure/db/PrismaPaymentWebhookRepository';

// Use Cases
import { CreatePaymentUseCase } from '../application/use-cases/CreatePaymentUseCase';
import { ProcessPaymentUseCase } from '../application/use-cases/ProcessPaymentUseCase';
import { RefundPaymentUseCase } from '../application/use-cases/RefundPaymentUseCase';
import { GetPaymentUseCase } from '../application/use-cases/GetPaymentUseCase';
import { CreatePaymentMethodUseCase } from '../application/use-cases/CreatePaymentMethodUseCase';
import { GetPaymentMethodsUseCase } from '../application/use-cases/GetPaymentMethodsUseCase';
import { ProcessWebhookUseCase } from '../application/use-cases/ProcessWebhookUseCase';
import { HandleOrderCreatedEventUseCase } from '../application/use-cases/HandleOrderCreatedEventUseCase';
import { HandleOrderCancelledEventUseCase } from '../application/use-cases/HandleOrderCancelledEventUseCase';

// Controllers
import { PaymentController } from '../application/controllers/PaymentController';

// Event Publisher & Consumer
import { IEventPublisher } from '../domain/repositories/IEventPublisher';
import { IEventConsumer } from '../domain/repositories/IEventConsumer';
import { createEventPublisher } from '../infrastructure/events/EventPublisherFactory';
import { createEventConsumer } from '../infrastructure/events/EventConsumerFactory';

// Clients
import { IOrderServiceClient } from '../domain/repositories/IOrderServiceClient';
import { OrderServiceClient } from '../infrastructure/clients/OrderServiceClient';

const logger = createLogger();
const config = getConfig();

export class Container {
  private static instance: Container;
  private prisma: PrismaClient;
  private paymentRepository: IPaymentRepository;
  private paymentTransactionRepository: IPaymentTransactionRepository;
  private refundRepository: IRefundRepository;
  private paymentMethodRepository: IPaymentMethodRepository;
  private paymentWebhookRepository: IPaymentWebhookRepository;
  private orderServiceClient: IOrderServiceClient;
  private eventPublisher: IEventPublisher;
  private eventConsumer: IEventConsumer;
  private createPaymentUseCase: CreatePaymentUseCase;
  private processPaymentUseCase: ProcessPaymentUseCase;
  private refundPaymentUseCase: RefundPaymentUseCase;
  private getPaymentUseCase: GetPaymentUseCase;
  private createPaymentMethodUseCase: CreatePaymentMethodUseCase;
  private getPaymentMethodsUseCase: GetPaymentMethodsUseCase;
  private processWebhookUseCase: ProcessWebhookUseCase;
  private handleOrderCreatedEventUseCase: HandleOrderCreatedEventUseCase;
  private handleOrderCancelledEventUseCase: HandleOrderCancelledEventUseCase;
  private paymentController: PaymentController;

  private constructor() {
    // Initialize Prisma
    this.prisma = new PrismaClient({
      log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Initialize repositories
    this.paymentRepository = new PrismaPaymentRepository(this.prisma);
    this.paymentTransactionRepository = new PrismaPaymentTransactionRepository(this.prisma);
    this.refundRepository = new PrismaRefundRepository(this.prisma);
    this.paymentMethodRepository = new PrismaPaymentMethodRepository(this.prisma);
    this.paymentWebhookRepository = new PrismaPaymentWebhookRepository(this.prisma);

    // Initialize external clients
    this.orderServiceClient = new OrderServiceClient();
    this.eventPublisher = createEventPublisher();
    this.eventConsumer = createEventConsumer();

    // Initialize use cases
    this.createPaymentUseCase = new CreatePaymentUseCase(
      this.prisma,
      this.paymentRepository,
      this.paymentTransactionRepository,
      this.orderServiceClient
    );
    this.processPaymentUseCase = new ProcessPaymentUseCase(
      this.prisma,
      this.paymentRepository,
      this.paymentTransactionRepository,
      this.orderServiceClient,
      this.eventPublisher
    );
    this.refundPaymentUseCase = new RefundPaymentUseCase(
      this.prisma,
      this.paymentRepository,
      this.paymentTransactionRepository,
      this.refundRepository,
      this.orderServiceClient,
      this.eventPublisher
    );
    this.getPaymentUseCase = new GetPaymentUseCase(
      this.paymentRepository,
      this.paymentTransactionRepository,
      this.refundRepository
    );
    this.createPaymentMethodUseCase = new CreatePaymentMethodUseCase(this.paymentMethodRepository);
    this.getPaymentMethodsUseCase = new GetPaymentMethodsUseCase(this.paymentMethodRepository);
    this.processWebhookUseCase = new ProcessWebhookUseCase(
      this.prisma,
      this.paymentWebhookRepository,
      this.paymentRepository,
      this.paymentTransactionRepository,
      this.orderServiceClient,
      this.eventPublisher
    );
    this.handleOrderCreatedEventUseCase = new HandleOrderCreatedEventUseCase(
      this.createPaymentUseCase,
      this.processPaymentUseCase
    );
    this.handleOrderCancelledEventUseCase = new HandleOrderCancelledEventUseCase(
      this.paymentRepository
    );

    // Register event handlers
    this.eventConsumer.onOrderCreated(async (event) => {
      await this.handleOrderCreatedEventUseCase.execute(event);
    });
    this.eventConsumer.onOrderCancelled(async (event) => {
      await this.handleOrderCancelledEventUseCase.execute(event);
    });

    // Initialize controller
    this.paymentController = new PaymentController(
      this.createPaymentUseCase,
      this.processPaymentUseCase,
      this.refundPaymentUseCase,
      this.getPaymentUseCase,
      this.createPaymentMethodUseCase,
      this.getPaymentMethodsUseCase,
      this.processWebhookUseCase
    );

    logger.info('Container initialized');
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

  getPaymentController(): PaymentController {
    return this.paymentController;
  }

  getEventConsumer(): IEventConsumer {
    return this.eventConsumer;
  }

  async disconnect(): Promise<void> {
    await this.eventConsumer.stop();
    await this.prisma.$disconnect();
    logger.info('Container disconnected');
  }
}

