import { Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { sendValidationError } from '../../../application/dto/response.util';
import { RequestWithId } from './requestId.middleware';

export const validateCreateCart = [
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('currency must be a 3-letter code'),
];

export const validateAddItemToCart = [
  param('cartId').isString().notEmpty().withMessage('cartId is required'),
  body('productId').isString().notEmpty().withMessage('productId is required'),
  body('variantId').optional().isString().withMessage('variantId must be a string'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('metadata').optional().isObject().withMessage('metadata must be an object'),
];

export const validateUpdateCartItem = [
  param('cartId').isString().notEmpty().withMessage('cartId is required'),
  param('itemId').isString().notEmpty().withMessage('itemId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
];

export const validateRemoveCartItem = [
  param('cartId').isString().notEmpty().withMessage('cartId is required'),
  param('itemId').isString().notEmpty().withMessage('itemId is required'),
];

export const validateClearCart = [
  param('cartId').isString().notEmpty().withMessage('cartId is required'),
];

export const validateMergeCarts = [
  body('guestSessionId').isString().notEmpty().withMessage('guestSessionId is required'),
];

export function handleValidationErrors(req: RequestWithId, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap: Record<string, string[]> = {};
    errors.array().forEach((error: any) => {
      const field = error.param || error.path || 'unknown';
      if (!errorMap[field]) {
        errorMap[field] = [];
      }
      errorMap[field].push(error.msg);
    });
    sendValidationError(res, 'Validation failed', errorMap, req.id);
    return;
  }
  next();
}

