/**
 * Validation Middleware
 * Validates request data using express-validator
 */

import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendValidationError } from '../../../application/dto/response.util';
import { RequestWithId } from './requestId.middleware';

export function handleValidationErrors(req: RequestWithId, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMap: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        const field = error.path;
        if (!errorMap[field]) {
          errorMap[field] = [];
        }
        errorMap[field].push(error.msg);
      }
    });

    sendValidationError(res, 'Validation failed', errorMap, req.id);
    return;
  }

  next();
}

