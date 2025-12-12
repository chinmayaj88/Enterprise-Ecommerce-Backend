import { PrismaClient } from '@prisma/client';

// Global test setup
beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  // Cleanup test database if needed
});

// Mock Prisma for tests
export const mockPrisma = new PrismaClient();

