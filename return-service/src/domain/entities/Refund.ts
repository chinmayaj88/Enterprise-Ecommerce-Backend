export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class Refund {
  constructor(
    public id: string,
    public returnRequestId: string,
    public paymentId: string | null,
    public orderId: string,
    public userId: string,
    public refundMethod: string,
    public amount: number,
    public currency: string,
    public status: RefundStatus,
    public reason: string | null,
    public processedAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static fromPrisma(data: any): Refund {
    return new Refund(
      data.id,
      data.returnRequestId,
      data.paymentId,
      data.orderId,
      data.userId,
      data.refundMethod,
      Number(data.amount),
      data.currency,
      data.status as RefundStatus,
      data.reason,
      data.processedAt,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Check if refund can transition to the given status
   */
  canTransitionTo(newStatus: RefundStatus): boolean {
    const validTransitions: Record<RefundStatus, RefundStatus[]> = {
      [RefundStatus.PENDING]: [RefundStatus.PROCESSING, RefundStatus.FAILED],
      [RefundStatus.PROCESSING]: [RefundStatus.COMPLETED, RefundStatus.FAILED],
      [RefundStatus.COMPLETED]: [], // Final state
      [RefundStatus.FAILED]: [RefundStatus.PROCESSING], // Can retry
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }

  /**
   * Update refund status
   */
  updateStatus(newStatus: RefundStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;

    if (newStatus === RefundStatus.COMPLETED && !this.processedAt) {
      this.processedAt = new Date();
    }
  }
}

