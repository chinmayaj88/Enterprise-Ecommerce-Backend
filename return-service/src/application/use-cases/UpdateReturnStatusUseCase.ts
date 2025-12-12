import { IReturnRequestRepository } from '../../domain/repositories/IReturnRequestRepository';
import { IReturnStatusHistoryRepository } from '../../domain/repositories/IReturnStatusHistoryRepository';
import { ReturnRequest, ReturnStatus } from '../../domain/entities/ReturnRequest';

export interface UpdateReturnStatusInput {
  returnRequestId: string;
  status: ReturnStatus;
  changedBy: string;
  notes?: string | null;
}

export class UpdateReturnStatusUseCase {
  constructor(
    private readonly returnRequestRepository: IReturnRequestRepository,
    private readonly statusHistoryRepository: IReturnStatusHistoryRepository
  ) {}

  async execute(input: UpdateReturnStatusInput): Promise<ReturnRequest> {
    const returnRequest = await this.returnRequestRepository.findById(input.returnRequestId);
    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    const previousStatus = returnRequest.status;

    // Validate status transition using entity method
    if (!returnRequest.canTransitionTo(input.status)) {
      throw new Error(`Invalid status transition from ${previousStatus} to ${input.status}`);
    }

    // Prepare update data based on status
    const updateData: any = {
      status: input.status,
    };

    const now = new Date();
    switch (input.status) {
      case ReturnStatus.APPROVED:
        updateData.approvedAt = now;
        break;
      case ReturnStatus.REJECTED:
        updateData.rejectedAt = now;
        break;
      case ReturnStatus.RECEIVED:
        updateData.receivedAt = now;
        break;
      case ReturnStatus.PROCESSED:
        updateData.processedAt = now;
        break;
      case ReturnStatus.CLOSED:
        updateData.closedAt = now;
        break;
    }

    // Update return request
    const updated = await this.returnRequestRepository.update(input.returnRequestId, updateData);

    // Add status history
    await this.statusHistoryRepository.create({
      returnRequestId: input.returnRequestId,
      status: input.status,
      previousStatus,
      changedBy: input.changedBy,
      notes: input.notes || null,
    });

    return updated;
  }
}

