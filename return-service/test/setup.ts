import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db',
    },
  },
});

beforeAll(async () => {
  // Setup test database if needed
  // await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };

