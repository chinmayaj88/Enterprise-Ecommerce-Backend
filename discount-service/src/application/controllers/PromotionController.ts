import { Response } from 'express';
import { IPromotionRepository } from '../../domain/repositories/IPromotionRepository';
import { IPromotionRuleRepository } from '../../domain/repositories/IPromotionRuleRepository';
import { RequestWithId } from '../../interfaces/http/middleware/requestId.middleware';
import { AppError } from '../../shared/errors/AppError';
import { sendSuccess, sendCreated } from '../dto/response.util';

export class PromotionController {
  constructor(
    private readonly promotionRepository: IPromotionRepository,
    private readonly promotionRuleRepository: IPromotionRuleRepository
  ) {}

  /**
   * Create a promotion
   * POST /api/v1/promotions
   */
  async createPromotion(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotion = await this.promotionRepository.create({
        name: req.body.name,
        description: req.body.description || null,
        type: req.body.type,
        status: req.body.status || 'DRAFT',
        startsAt: req.body.startsAt ? new Date(req.body.startsAt) : null,
        endsAt: req.body.endsAt ? new Date(req.body.endsAt) : null,
        isActive: req.body.isActive !== undefined ? req.body.isActive : false,
        configuration: req.body.configuration,
        metadata: req.body.metadata || null,
      });

      sendCreated(res, 'Promotion created successfully', promotion, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to create promotion');
    }
  }

  /**
   * Get all promotions
   * GET /api/v1/promotions
   */
  async getPromotions(req: RequestWithId, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const type = req.query.type as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const promotions = await this.promotionRepository.findAll({
        status,
        isActive,
        type,
        limit,
        offset,
      });

      sendSuccess(res, 'Promotions retrieved successfully', promotions, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to get promotions');
    }
  }

  /**
   * Get promotion by ID
   * GET /api/v1/promotions/:id
   */
  async getPromotion(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const promotion = await this.promotionRepository.findById(promotionId);

      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      // Get promotion rules
      const rules = await this.promotionRuleRepository.findByPromotionId(promotionId);

      sendSuccess(res, 'Promotion retrieved successfully', {
        ...promotion,
        rules,
      }, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to get promotion');
    }
  }

  /**
   * Update promotion
   * PUT /api/v1/promotions/:id
   */
  async updatePromotion(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const promotion = await this.promotionRepository.findById(promotionId);

      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      const updatedPromotion = await this.promotionRepository.update(promotionId, {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        status: req.body.status,
        startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined,
        endsAt: req.body.endsAt ? new Date(req.body.endsAt) : undefined,
        isActive: req.body.isActive,
        configuration: req.body.configuration,
        metadata: req.body.metadata,
      });

      sendSuccess(res, 'Promotion updated successfully', updatedPromotion, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to update promotion');
    }
  }

  /**
   * Delete promotion
   * DELETE /api/v1/promotions/:id
   */
  async deletePromotion(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const promotion = await this.promotionRepository.findById(promotionId);

      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      await this.promotionRepository.delete(promotionId);
      sendSuccess(res, 'Promotion deleted successfully', null, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to delete promotion');
    }
  }

  /**
   * Activate promotion
   * POST /api/v1/promotions/:id/activate
   */
  async activatePromotion(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const promotion = await this.promotionRepository.findById(promotionId);

      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      const activatedPromotion = await this.promotionRepository.activate(promotionId);
      sendSuccess(res, 'Promotion activated successfully', activatedPromotion, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to activate promotion');
    }
  }

  /**
   * Deactivate promotion
   * POST /api/v1/promotions/:id/deactivate
   */
  async deactivatePromotion(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const promotion = await this.promotionRepository.findById(promotionId);

      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      const deactivatedPromotion = await this.promotionRepository.deactivate(promotionId);
      sendSuccess(res, 'Promotion deactivated successfully', deactivatedPromotion, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to deactivate promotion');
    }
  }

  /**
   * Add promotion rule
   * POST /api/v1/promotions/:id/rules
   */
  async addPromotionRule(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const promotion = await this.promotionRepository.findById(promotionId);

      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      const rule = await this.promotionRuleRepository.create({
        promotionId,
        ruleType: req.body.ruleType,
        conditions: req.body.conditions,
        actions: req.body.actions,
        priority: req.body.priority || 0,
      });

      sendCreated(res, 'Promotion rule added successfully', rule, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to add promotion rule');
    }
  }

  /**
   * Update promotion rule
   * PUT /api/v1/promotions/:id/rules/:ruleId
   */
  async updatePromotionRule(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const ruleId = req.params.ruleId;

      const promotion = await this.promotionRepository.findById(promotionId);
      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      const rule = await this.promotionRuleRepository.findById(ruleId);
      if (!rule) {
        throw new AppError(404, 'Promotion rule not found');
      }

      const updatedRule = await this.promotionRuleRepository.update(ruleId, {
        ruleType: req.body.ruleType,
        conditions: req.body.conditions,
        actions: req.body.actions,
        priority: req.body.priority,
      });

      sendSuccess(res, 'Promotion rule updated successfully', updatedRule, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to update promotion rule');
    }
  }

  /**
   * Delete promotion rule
   * DELETE /api/v1/promotions/:id/rules/:ruleId
   */
  async deletePromotionRule(req: RequestWithId, res: Response): Promise<void> {
    try {
      const promotionId = req.params.id;
      const ruleId = req.params.ruleId;

      const promotion = await this.promotionRepository.findById(promotionId);
      if (!promotion) {
        throw new AppError(404, 'Promotion not found');
      }

      const rule = await this.promotionRuleRepository.findById(ruleId);
      if (!rule) {
        throw new AppError(404, 'Promotion rule not found');
      }

      await this.promotionRuleRepository.delete(ruleId);
      sendSuccess(res, 'Promotion rule deleted successfully', null, 200, req.id);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, error instanceof Error ? error.message : 'Failed to delete promotion rule');
    }
  }
}

