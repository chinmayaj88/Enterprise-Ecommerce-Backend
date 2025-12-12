import { Response } from 'express';
import { RequestWithId } from '../../interfaces/http/middleware/requestId.middleware';
import { CreateReturnRequestUseCase } from '../use-cases/CreateReturnRequestUseCase';
import { GetReturnRequestUseCase } from '../use-cases/GetReturnRequestUseCase';
import { ApproveReturnRequestUseCase } from '../use-cases/ApproveReturnRequestUseCase';
import { UpdateReturnStatusUseCase } from '../use-cases/UpdateReturnStatusUseCase';
import { ProcessReturnRefundUseCase } from '../use-cases/ProcessReturnRefundUseCase';
import { IReturnRequestRepository } from '../../domain/repositories/IReturnRequestRepository';
import { sendSuccess, sendError, sendCreated } from '../dto/response.util';
import { ReturnStatus } from '../../domain/entities/ReturnRequest';

export class ReturnRequestController {
  constructor(
    private readonly createReturnRequestUseCase: CreateReturnRequestUseCase,
    private readonly getReturnRequestUseCase: GetReturnRequestUseCase,
    private readonly approveReturnRequestUseCase: ApproveReturnRequestUseCase,
    private readonly updateReturnStatusUseCase: UpdateReturnStatusUseCase,
    private readonly processReturnRefundUseCase: ProcessReturnRefundUseCase,
    private readonly returnRequestRepository: IReturnRequestRepository
  ) {}

  async createReturnRequest(req: RequestWithId, res: Response): Promise<void> {
    try {
      const { orderId, returnReason, returnNotes, refundMethod, items } = req.body;
      const userId = (req as any).user?.userId || (req as any).user?.id || req.body.userId;

      if (!orderId || !returnReason || !refundMethod || !items || !Array.isArray(items) || items.length === 0) {
        sendError(res, 400, 'Missing required fields');
        return;
      }

      if (!userId) {
        sendError(res, 401, 'User ID is required');
        return;
      }

      const returnRequest = await this.createReturnRequestUseCase.execute({
        orderId,
        userId,
        returnReason,
        returnNotes,
        refundMethod,
        items,
      });

      sendCreated(res, 'Return request created successfully', returnRequest);
    } catch (error) {
      sendError(
        res,
        500,
        'Failed to create return request',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async getReturnRequest(req: RequestWithId, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const returnRequest = await this.getReturnRequestUseCase.execute({
        returnRequestId: id,
        includeItems: true,
        includeAuthorization: true,
        includeHistory: true,
      });

      if (!returnRequest) {
        sendError(res, 404, 'Return request not found');
        return;
      }

      sendSuccess(res, 'Return request retrieved successfully', returnRequest);
    } catch (error) {
      sendError(
        res,
        500,
        'Failed to get return request',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async getReturnRequestsByUser(req: RequestWithId, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id || (req.query.userId as string);
      if (!userId) {
        sendError(res, 400, 'User ID is required');
        return;
      }

      const { status, limit, offset } = req.query;
      const requests = await this.returnRequestRepository.findByUserId(userId, {
        status: status as ReturnStatus | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      sendSuccess(res, 'Return requests retrieved successfully', requests);
    } catch (error) {
      sendError(
        res,
        500,
        'Failed to get return requests',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async approveReturnRequest(req: RequestWithId, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { returnAddress, returnInstructions, expiresInDays } = req.body;
      const changedBy = (req as any).user?.userId || (req as any).user?.id || 'system';

      if (!returnAddress) {
        sendError(res, 400, 'Return address is required');
        return;
      }

      const returnRequest = await this.approveReturnRequestUseCase.execute({
        returnRequestId: id,
        changedBy,
        returnAddress,
        returnInstructions,
        expiresInDays,
      });

      sendSuccess(res, 'Return request approved successfully', returnRequest);
    } catch (error) {
      sendError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to approve return request',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async updateReturnStatus(req: RequestWithId, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const changedBy = (req as any).user?.userId || (req as any).user?.id || 'system';

      if (!status) {
        sendError(res, 400, 'Status is required');
        return;
      }

      const returnRequest = await this.updateReturnStatusUseCase.execute({
        returnRequestId: id,
        status: status as ReturnStatus,
        changedBy,
        notes,
      });

      sendSuccess(res, 'Return status updated successfully', returnRequest);
    } catch (error) {
      sendError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to update return status',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async processRefund(req: RequestWithId, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentId } = req.body;
      const changedBy = (req as any).user?.userId || (req as any).user?.id || 'system';

      const refund = await this.processReturnRefundUseCase.execute({
        returnRequestId: id,
        paymentId,
        changedBy,
      });

      sendSuccess(res, 'Refund processing initiated successfully', refund);
    } catch (error) {
      sendError(
        res,
        500,
        error instanceof Error ? error.message : 'Failed to process refund',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

