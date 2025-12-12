import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db',
    },
  },
});

beforeAll(async () => {
  // Clean up test database
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE shipments, carriers, shipping_zones, shipping_methods, shipping_rates, shipment_tracking CASCADE;'
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };

