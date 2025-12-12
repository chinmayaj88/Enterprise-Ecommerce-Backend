import { Router, Request, Response, NextFunction } from 'express';
import { PromotionController } from '../../../application/controllers/PromotionController';
import {
  validateCreatePromotion,
  validatePromotionId,
  validatePromotionRule,
  validatePromotionRuleId,
  handleValidationErrors,
} from '../middleware/validator.middleware';
import { globalRateLimiter } from '../middleware/rateLimiter.middleware';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export function createPromotionRoutes(promotionController: PromotionController): Router {
  const router = Router();

  router.use(globalRateLimiter);

  // Public routes (read-only)
  router.get(
    '/',
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.getPromotions(req as any, res).catch(next);
    }
  );

  router.get(
    '/:id',
    validatePromotionId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.getPromotion(req as any, res).catch(next);
    }
  );

  // Admin routes (require authentication and admin role)
  router.post(
    '/',
    authenticate(),
    requireRole('admin'),
    validateCreatePromotion,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.createPromotion(req as any, res).catch(next);
    }
  );

  router.put(
    '/:id',
    authenticate(),
    requireRole('admin'),
    validatePromotionId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.updatePromotion(req as any, res).catch(next);
    }
  );

  router.delete(
    '/:id',
    authenticate(),
    requireRole('admin'),
    validatePromotionId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.deletePromotion(req as any, res).catch(next);
    }
  );

  router.post(
    '/:id/activate',
    authenticate(),
    requireRole('admin'),
    validatePromotionId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.activatePromotion(req as any, res).catch(next);
    }
  );

  router.post(
    '/:id/deactivate',
    authenticate(),
    requireRole('admin'),
    validatePromotionId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.deactivatePromotion(req as any, res).catch(next);
    }
  );

  router.post(
    '/:id/rules',
    authenticate(),
    requireRole('admin'),
    validatePromotionId,
    validatePromotionRule,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.addPromotionRule(req as any, res).catch(next);
    }
  );

  router.put(
    '/:id/rules/:ruleId',
    authenticate(),
    requireRole('admin'),
    validatePromotionRuleId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.updatePromotionRule(req as any, res).catch(next);
    }
  );

  router.delete(
    '/:id/rules/:ruleId',
    authenticate(),
    requireRole('admin'),
    validatePromotionRuleId,
    handleValidationErrors,
    (req: Request, res: Response, next: NextFunction) => {
      promotionController.deletePromotionRule(req as any, res).catch(next);
    }
  );

  return router;
}

