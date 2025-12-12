/**
 * Integration tests for Order Repository
 * These tests require a database connection
 */

import { PrismaClient } from '@prisma/client';
import { PrismaOrderRepository } from '../../../src/infrastructure/db/PrismaOrderRepository';
import { OrderStatus, PaymentStatus } from '../../../src/domain/entities/Order';

describe('PrismaOrderRepository Integration', () => {
  let prisma: PrismaClient;
  let repository: PrismaOrderRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PrismaOrderRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.order.deleteMany({});
  });

  it('should create an order', async () => {
    const orderData = {
      orderNumber: 'ORD-TEST-001',
      userId: 'test-user-1',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      subtotal: 100,
      taxAmount: 10,
      shippingAmount: 5,
      discountAmount: 0,
      totalAmount: 115,
      currency: 'USD',
      paymentMethodId: null,
      shippingMethod: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      metadata: null,
    };

    const order = await repository.create(orderData);

    expect(order).toBeDefined();
    expect(order.orderNumber).toBe('ORD-TEST-001');
    expect(order.userId).toBe('test-user-1');
    expect(order.status).toBe(OrderStatus.PENDING);
  });

  it('should find order by id', async () => {
    const orderData = {
      orderNumber: 'ORD-TEST-002',
      userId: 'test-user-1',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      subtotal: 100,
      taxAmount: 10,
      shippingAmount: 5,
      discountAmount: 0,
      totalAmount: 115,
      currency: 'USD',
      paymentMethodId: null,
      shippingMethod: null,
      trackingNumber: null,
      estimatedDeliveryDate: null,
      metadata: null,
    };

    const created = await repository.create(orderData);
    const found = await repository.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.orderNumber).toBe('ORD-TEST-002');
  });
});

