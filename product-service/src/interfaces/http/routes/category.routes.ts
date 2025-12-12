import { Router } from 'express';
import { body, query } from 'express-validator';
import { CategoryController } from '../../../application/use-cases/CategoryController';
import { validate } from '../middleware/validator.middleware';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { globalRateLimiter } from '../middleware/rateLimiter.middleware';

export function createCategoryRoutes(controller: CategoryController): Router {
  const router = Router();

  // Public routes (read-only)
  router.get(
    '/',
    globalRateLimiter,
    validate([
      query('parentId').optional().isString(),
      query('isActive').optional().isBoolean(),
      query('level').optional().isInt(),
      query('rootOnly').optional().isBoolean(),
    ]),
    (req, res, next) => {
      controller.list(req, res).catch(next);
    }
  );

  router.get('/:id', globalRateLimiter, (req, res, next) => {
    controller.getById(req, res).catch(next);
  });

  router.get('/slug/:slug', globalRateLimiter, (req, res, next) => {
    controller.getBySlug(req, res).catch(next);
  });

  // Protected routes (admin only)
  router.post(
    '/',
    globalRateLimiter,
    authenticate(),
    requireRole('admin'),
    validate([
      body('name').notEmpty().withMessage('Name is required'),
      body('slug').notEmpty().withMessage('Slug is required'),
      body('description').optional().isString(),
      body('parentId').optional().isString(),
      body('sortOrder').optional().isInt(),
      body('imageUrl').optional().isString(),
      body('isActive').optional().isBoolean(),
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
      body('name').optional().isString(),
      body('slug').optional().isString(),
      body('description').optional().isString(),
      body('parentId').optional().isString(),
      body('sortOrder').optional().isInt(),
      body('imageUrl').optional().isString(),
      body('isActive').optional().isBoolean(),
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

  return router;
}

