import { IReturnRequestRepository } from '../../domain/repositories/IReturnRequestRepository';
import { IReturnItemRepository } from '../../domain/repositories/IReturnItemRepository';
import { IReturnAuthorizationRepository } from '../../domain/repositories/IReturnAuthorizationRepository';
import { IReturnStatusHistoryRepository } from '../../domain/repositories/IReturnStatusHistoryRepository';
import { ReturnRequest } from '../../domain/entities/ReturnRequest';

export interface GetReturnRequestInput {
  returnRequestId: string;
  includeItems?: boolean;
  includeAuthorization?: boolean;
  includeHistory?: boolean;
}

export interface ReturnRequestWithDetails extends ReturnRequest {
  items?: any[];
  authorization?: any;
  history?: any[];
}

export class GetReturnRequestUseCase {
  constructor(
    private readonly returnRequestRepository: IReturnRequestRepository,
    private readonly returnItemRepository: IReturnItemRepository,
    private readonly authorizationRepository: IReturnAuthorizationRepository,
    private readonly statusHistoryRepository: IReturnStatusHistoryRepository
  ) {}

  async execute(input: GetReturnRequestInput): Promise<ReturnRequestWithDetails | null> {
    const returnRequest = await this.returnRequestRepository.findById(input.returnRequestId);
    if (!returnRequest) {
      return null;
    }

    const result: ReturnRequestWithDetails = { ...returnRequest };

    if (input.includeItems) {
      result.items = await this.returnItemRepository.findByReturnRequestId(returnRequest.id);
    }

    if (input.includeAuthorization) {
      result.authorization = await this.authorizationRepository.findByReturnRequestId(returnRequest.id) || undefined;
    }

    if (input.includeHistory) {
      result.history = await this.statusHistoryRepository.findByReturnRequestId(returnRequest.id);
    }

    return result;
  }
}

