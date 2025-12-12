/**
 * End-to-end tests for Order API
 */

import request from 'supertest';
import { createApp } from '../../src/app';

describe('Order API E2E', () => {
  let app: any;

  beforeAll(() => {
    const { app: expressApp } = createApp();
    app = expressApp;
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service', 'order-service');
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/orders')
        .expect(401);
    });
  });
});

