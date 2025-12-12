#!/usr/bin/env ts-node

/**
 * Seed test data for orders
 * Run with: npm run seed
 */

import { PrismaClient } from '@prisma/client';
import { createLogger } from '../src/infrastructure/logging/logger';

const logger = createLogger();
const prisma = new PrismaClient();

async function seed() {
  try {
    logger.info('Seeding test data...');

    // Add your seed data here
    // Example:
    // await prisma.order.create({
    //   data: {
    //     orderNumber: 'ORD-20241109-000001',
    //     userId: 'test-user-id',
    //     status: 'pending',
    //     paymentStatus: 'pending',
    //     subtotal: 100.00,
    //     taxAmount: 10.00,
    //     shippingAmount: 5.00,
    //     discountAmount: 0.00,
    //     totalAmount: 115.00,
    //     currency: 'USD',
    //   },
    // });

    logger.info('Seed data created successfully');
  } catch (error) {
    logger.error('Seeding failed', { error });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(() => {
    logger.info('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seeding failed', { error });
    process.exit(1);
  });

