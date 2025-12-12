import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
  requestId?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  requestId?: string
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  };

  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  error?: string,
  requestId?: string
): void {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(error && { error }),
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  };

  res.status(statusCode).json(response);
}

export function sendCreated<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  requestId?: string
): void {
  sendSuccess(res, statusCode, message, data, requestId);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendBadRequest(res: Response, message: string, error?: string, requestId?: string): void {
  sendError(res, 400, message, error, requestId);
}

export function sendUnauthorized(res: Response, message: string = 'Unauthorized', error?: string, requestId?: string): void {
  sendError(res, 401, message, error, requestId);
}

export function sendForbidden(res: Response, message: string = 'Forbidden', error?: string, requestId?: string): void {
  sendError(res, 403, message, error, requestId);
}

export function sendNotFound(res: Response, message: string = 'Resource not found', error?: string, requestId?: string): void {
  sendError(res, 404, message, error, requestId);
}

export function sendConflict(res: Response, message: string, error?: string, requestId?: string): void {
  sendError(res, 409, message, error, requestId);
}

export function sendInternalError(
  res: Response,
  message: string = 'Internal server error',
  error?: string,
  requestId?: string
): void {
  sendError(res, 500, message, error, requestId);
}

export function sendValidationError(res: Response, message: string, errors?: Record<string, string[]>, requestId?: string): void {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  };

  res.status(422).json(response);
}
