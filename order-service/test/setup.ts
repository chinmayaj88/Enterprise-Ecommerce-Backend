/**
 * Global test setup
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/order_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-min-32-chars-long-for-testing';

// Mock external services
jest.mock('../src/infrastructure/clients/CartServiceClient');
jest.mock('../src/infrastructure/clients/ProductServiceClient');
jest.mock('../src/infrastructure/clients/UserServiceClient');

