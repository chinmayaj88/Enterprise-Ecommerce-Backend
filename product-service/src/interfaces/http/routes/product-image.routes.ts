import { Router } from 'express';
import { body } from 'express-validator';
import { ProductImageController } from '../../../application/use-cases/ProductImageController';
import { validate } from '../middleware/validator.middleware';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { globalRateLimiter } from '../middleware/rateLimiter.middleware';

export function createProductImageRoutes(controller: ProductImageController): Router {
  const router = Router({ mergeParams: true });

  // Public routes (read-only)
  router.get('/:id', globalRateLimiter, (req, res, next) => {
    controller.getById(req, res).catch(next);
  });

  router.get('/', globalRateLimiter, (req, res, next) => {
    controller.getByProductId(req, res).catch(next);
  });

  // Protected routes (admin only)
  router.post(
    '/',
    globalRateLimiter,
    authenticate(),
    requireRole('admin'),
    validate([
      body('url').notEmpty().isString().withMessage('URL is required'),
      body('altText').optional().isString(),
      body('sortOrder').optional().isInt(),
      body('isPrimary').optional().isBoolean(),
    ]),
    (req, res, next) => {
      controller.create(req, res).catch(next);
    }
  );

  router.put(
    '/:id',
    globalRateLimiter,
    authenticate(),
    requireRole('admin'),
    validate([
      body('url').optional().isString(),
      body('altText').optional().isString(),
      body('sortOrder').optional().isInt(),
      body('isPrimary').optional().isBoolean(),
    ]),
    (req, res, next) => {
      controller.update(req, res).catch(next);
    }
  );

  router.delete(
    '/:id',
    globalRateLimiter,
    authenticate(),
    requireRole('admin'),
    (req, res, next) => {
      controller.delete(req, res).catch(next);
    }
  );

  router.post(
    '/:id/primary',
    globalRateLimiter,
    authenticate(),
    requireRole('admin'),
    (req, res, next) => {
      controller.setPrimary(req, res).catch(next);
    }
  );

  return router;
}

