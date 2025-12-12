import { Router, Request, Response, NextFunction } from 'express';
import { CouponController } from '../../../application/controllers/CouponController';
import {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponId,
  validateCouponCode,
  handleValidationErrors,
} from '../middleware/validator.middleware';
import { globalRateLimiter } from '../middleware/rateLimiter.middleware';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export function createCouponRoutes(couponController: CouponController): Router {
  const router = Router();

  router.use(globalRateLimiter);

  // Public routes (read-only)
  router.get(
    '/',
    (req: Request, res: Response, next: NextFunction) => {
      couponController.getCoupons(req as any, res).catch(next);
    }
  );

  router.get(
    '/:id',
    validateCouponId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      couponController.getCoupon(req as any, res).catch(next);
    }
  );

  router.get(
    '/code/:code',
    validateCouponCode,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      couponController.getCouponByCode(req as any, res).catch(next);
    }
  );

  // Admin routes (require authentication and admin role)
  router.post(
    '/',
    authenticate(),
    requireRole('admin'),
    validateCreateCoupon,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      couponController.createCoupon(req as any, res).catch(next);
    }
  );

  router.put(
    '/:id',
    authenticate(),
    requireRole('admin'),
    validateCouponId,
    validateUpdateCoupon,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      couponController.updateCoupon(req as any, res).catch(next);
    }
  );

  router.delete(
    '/:id',
    authenticate(),
    requireRole('admin'),
    validateCouponId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      couponController.deleteCoupon(req as any, res).catch(next);
    }
  );

  router.post(
    '/:id/activate',
    authenticate(),
    requireRole('admin'),
    validateCouponId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      couponController.activateCoupon(req as any, res).catch(next);
    }
  );

  router.post(
    '/:id/deactivate',
    authenticate(),
    requireRole('admin'),
    validateCouponId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      couponController.deactivateCoupon(req as any, res).catch(next);
    }
  );

  return router;
}

