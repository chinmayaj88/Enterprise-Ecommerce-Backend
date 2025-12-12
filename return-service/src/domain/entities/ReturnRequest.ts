export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  PROCESSED = 'processed',
  CLOSED = 'closed',
}

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  CHANGED_MIND = 'changed_mind',
  OTHER = 'other',
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  STORE_CREDIT = 'store_credit',
  EXCHANGE = 'exchange',
}

export class ReturnRequest {
  constructor(
    public id: string,
    public orderId: string,
    public userId: string,
    public rmaNumber: string,
    public status: ReturnStatus,
    public returnReason: ReturnReason,
    public returnNotes: string | null,
    public refundMethod: RefundMethod,
    public refundAmount: number,
    public currency: string,
    public requestedAt: Date,
    public approvedAt: Date | null,
    public rejectedAt: Date | null,
    public receivedAt: Date | null,
    public processedAt: Date | null,
    public closedAt: Date | null,
    public metadata: Record<string, any> | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(data: any): ReturnRequest {
    return new ReturnRequest(
      data.id,
      data.orderId,
      data.userId,
      data.rmaNumber,
      data.status as ReturnStatus,
      data.returnReason as ReturnReason,
      data.returnNotes,
      data.refundMethod as RefundMethod,
      Number(data.refundAmount),
      data.currency,
      data.requestedAt,
      data.approvedAt,
      data.rejectedAt,
      data.receivedAt,
      data.processedAt,
      data.closedAt,
      data.metadata,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Check if return can transition to the given status
   */
  canTransitionTo(newStatus: ReturnStatus): boolean {
    const validTransitions: Record<ReturnStatus, ReturnStatus[]> = {
      [ReturnStatus.PENDING]: [ReturnStatus.APPROVED, ReturnStatus.REJECTED],
      [ReturnStatus.APPROVED]: [ReturnStatus.IN_TRANSIT, ReturnStatus.REJECTED],
      [ReturnStatus.REJECTED]: [ReturnStatus.CLOSED],
      [ReturnStatus.IN_TRANSIT]: [ReturnStatus.RECEIVED, ReturnStatus.REJECTED],
      [ReturnStatus.RECEIVED]: [ReturnStatus.PROCESSED, ReturnStatus.REJECTED],
      [ReturnStatus.PROCESSED]: [ReturnStatus.CLOSED],
      [ReturnStatus.CLOSED]: [], // Final state
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }

  /**
   * Update return status
   */
  updateStatus(newStatus: ReturnStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;

    if (newStatus === ReturnStatus.APPROVED && !this.approvedAt) {
      this.approvedAt = new Date();
    }
    if (newStatus === ReturnStatus.REJECTED && !this.rejectedAt) {
      this.rejectedAt = new Date();
    }
    if (newStatus === ReturnStatus.RECEIVED && !this.receivedAt) {
      this.receivedAt = new Date();
    }
    if (newStatus === ReturnStatus.PROCESSED && !this.processedAt) {
      this.processedAt = new Date();
    }
    if (newStatus === ReturnStatus.CLOSED && !this.closedAt) {
      this.closedAt = new Date();
    }
  }
}

