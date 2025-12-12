import { Router } from 'express';
import { ProductVariantController } from '../../../application/use-cases/ProductVariantController';
import { globalRateLimiter } from '../middleware/rateLimiter.middleware';

// Direct variant routes (by ID) - for service-to-service communication
export function createProductVariantDirectRoutes(controller: ProductVariantController): Router {
  const router = Router();

  // Public route to get variant by ID (for cart service and other services)
  router.get('/:id', globalRateLimiter, (req, res, next) => {
    controller.getById(req, res).catch(next);
  });

  return router;
}

