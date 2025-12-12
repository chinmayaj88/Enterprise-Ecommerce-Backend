import { Router, Request, Response, NextFunction } from 'express';
import { DiscountController } from '../../../application/controllers/DiscountController';
import {
  validateValidateCoupon,
  validateCalculateDiscount,
  validateApplyCoupon,
  validateEvaluatePromotions,
  handleValidationErrors,
} from '../middleware/validator.middleware';
import { globalRateLimiter } from '../middleware/rateLimiter.middleware';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';

export function createDiscountRoutes(discountController: DiscountController): Router {
  const router = Router();

  router.use(globalRateLimiter);

  // Public routes (validation and calculation can be done without auth)
  router.post(
    '/validate',
    optionalAuth,
    validateValidateCoupon,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      discountController.validateCoupon(req as any, res).catch(next);
    }
  );

  router.post(
    '/calculate',
    optionalAuth,
    validateCalculateDiscount,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      discountController.calculateDiscount(req as any, res).catch(next);
    }
  );

  router.post(
    '/evaluate-promotions',
    optionalAuth,
    validateEvaluatePromotions,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      discountController.evaluatePromotions(req as any, res).catch(next);
    }
  );

  // Apply coupon requires authentication (to track user usage)
  router.post(
    '/apply',
    authenticate(),
    validateApplyCoupon,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      discountController.applyCoupon(req as any, res).catch(next);
    }
  );

  return router;
}

