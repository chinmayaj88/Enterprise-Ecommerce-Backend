import { PrismaClient } from '@prisma/client';
import { getConfig } from '../infrastructure/config/config-provider';

// Repositories
import { PrismaShippingZoneRepository } from '../infrastructure/db/PrismaShippingZoneRepository';
import { PrismaShippingMethodRepository } from '../infrastructure/db/PrismaShippingMethodRepository';
import { PrismaShippingRateRepository } from '../infrastructure/db/PrismaShippingRateRepository';
import { PrismaShipmentRepository } from '../infrastructure/db/PrismaShipmentRepository';
import { PrismaShipmentTrackingRepository } from '../infrastructure/db/PrismaShipmentTrackingRepository';
import { PrismaCarrierRepository } from '../infrastructure/db/PrismaCarrierRepository';

// Use Cases
import { CalculateShippingRateUseCase } from '../application/use-cases/CalculateShippingRateUseCase';
import { CreateShipmentUseCase } from '../application/use-cases/CreateShipmentUseCase';
import { GetShipmentTrackingUseCase } from '../application/use-cases/GetShipmentTrackingUseCase';
import { UpdateShipmentStatusUseCase } from '../application/use-cases/UpdateShipmentStatusUseCase';

// Controllers
import { ShippingRateController } from '../application/controllers/ShippingRateController';
import { ShipmentController } from '../application/controllers/ShipmentController';
import { ShippingZoneController } from '../application/controllers/ShippingZoneController';
import { ShippingMethodController } from '../application/controllers/ShippingMethodController';

// Interfaces
import { IShippingZoneRepository } from '../domain/repositories/IShippingZoneRepository';
import { IShippingMethodRepository } from '../domain/repositories/IShippingMethodRepository';
import { IShippingRateRepository } from '../domain/repositories/IShippingRateRepository';
import { IShipmentRepository } from '../domain/repositories/IShipmentRepository';
import { IShipmentTrackingRepository } from '../domain/repositories/IShipmentTrackingRepository';
import { ICarrierRepository } from '../domain/repositories/ICarrierRepository';

// Clients
import { OrderServiceClient, IOrderServiceClient } from '../infrastructure/clients/OrderServiceClient';
import { ProductServiceClient, IProductServiceClient } from '../infrastructure/clients/ProductServiceClient';

// Events
import { OCIQueueEventConsumer } from '../infrastructure/events/OCIQueueEventConsumer';
import { ShippingEventHandlers } from '../infrastructure/events/ShippingEventHandlers';
import { IEventConsumer } from '../domain/repositories/IEventConsumer';
import { createLogger } from '../infrastructure/logging/logger';

const config = getConfig();
const logger = createLogger();

export class Container {
  private static instance: Container;
  private prisma: PrismaClient;
  private shippingZoneRepository: IShippingZoneRepository;
  private shippingMethodRepository: IShippingMethodRepository;
  private shippingRateRepository: IShippingRateRepository;
  private shipmentRepository: IShipmentRepository;
  private shipmentTrackingRepository: IShipmentTrackingRepository;
  private carrierRepository: ICarrierRepository;
  private calculateShippingRateUseCase: CalculateShippingRateUseCase;
  private createShipmentUseCase: CreateShipmentUseCase;
  private getShipmentTrackingUseCase: GetShipmentTrackingUseCase;
  private updateShipmentStatusUseCase: UpdateShipmentStatusUseCase;
  private shippingRateController: ShippingRateController;
  private shipmentController: ShipmentController;
  private shippingZoneController: ShippingZoneController;
  private shippingMethodController: ShippingMethodController;
  private orderServiceClient: IOrderServiceClient;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _productServiceClient: IProductServiceClient;
  private eventConsumer: IEventConsumer;
  private eventHandlers: ShippingEventHandlers;

  private constructor() {
    // Initialize Prisma
    this.prisma = new PrismaClient({
      log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Initialize repositories
    this.shippingZoneRepository = new PrismaShippingZoneRepository(this.prisma);
    this.shippingMethodRepository = new PrismaShippingMethodRepository(this.prisma);
    this.shippingRateRepository = new PrismaShippingRateRepository(this.prisma);
    this.shipmentRepository = new PrismaShipmentRepository(this.prisma);
    this.shipmentTrackingRepository = new PrismaShipmentTrackingRepository(this.prisma);
    this.carrierRepository = new PrismaCarrierRepository(this.prisma);

    // Initialize use cases
    this.calculateShippingRateUseCase = new CalculateShippingRateUseCase(
      this.shippingZoneRepository,
      this.shippingMethodRepository,
      this.shippingRateRepository
    );

    this.createShipmentUseCase = new CreateShipmentUseCase(
      this.shipmentRepository,
      this.shippingMethodRepository,
      this.carrierRepository
    );

    this.getShipmentTrackingUseCase = new GetShipmentTrackingUseCase(
      this.shipmentRepository,
      this.shipmentTrackingRepository
    );

    this.updateShipmentStatusUseCase = new UpdateShipmentStatusUseCase(
      this.shipmentRepository,
      this.shipmentTrackingRepository
    );

    // Initialize controllers
    this.shippingRateController = new ShippingRateController(
      this.calculateShippingRateUseCase
    );

    this.shipmentController = new ShipmentController(
      this.createShipmentUseCase,
      this.getShipmentTrackingUseCase,
      this.updateShipmentStatusUseCase,
      this.shipmentRepository
    );

    this.shippingZoneController = new ShippingZoneController(
      this.shippingZoneRepository
    );

    this.shippingMethodController = new ShippingMethodController(
      this.shippingMethodRepository
    );

    // Initialize service clients
    this.orderServiceClient = new OrderServiceClient();
    this._productServiceClient = new ProductServiceClient();

    // Initialize event handlers
    this.eventHandlers = new ShippingEventHandlers(
      this.createShipmentUseCase, // Passed for future use in handleOrderCreated
      this.updateShipmentStatusUseCase,
      this.shipmentRepository,
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
    this.eventConsumer.subscribe('order.shipped', (event) =>
      this.eventHandlers.handleOrderShipped(event as any)
    );
    this.eventConsumer.subscribe('order.delivered', (event) =>
      this.eventHandlers.handleOrderDelivered(event as any)
    );
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public getShippingRateController(): ShippingRateController {
    return this.shippingRateController;
  }

  public getShipmentController(): ShipmentController {
    return this.shipmentController;
  }

  public getShippingZoneController(): ShippingZoneController {
    return this.shippingZoneController;
  }

  public getShippingMethodController(): ShippingMethodController {
    return this.shippingMethodController;
  }

  public getEventConsumer(): IEventConsumer {
    return this.eventConsumer;
  }

  public async disconnect(): Promise<void> {
    await this.eventConsumer.stop();
    await this.prisma.$disconnect();
  }
}

