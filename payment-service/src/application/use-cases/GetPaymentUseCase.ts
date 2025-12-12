import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { IRefundRepository } from '../../domain/repositories/IRefundRepository';
import { Payment } from '../../domain/entities/Payment';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';
import { Refund } from '../../domain/entities/Refund';
import { AppError } from '../../shared/errors/AppError';

export interface PaymentDetails {
  payment: Payment;
  transactions: PaymentTransaction[];
  refunds: Refund[];
}

export class GetPaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentTransactionRepository: IPaymentTransactionRepository,
    private readonly refundRepository: IRefundRepository
  ) {}

  async execute(paymentId: string, userId?: string): Promise<PaymentDetails | null> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      return null;
    }

    // Check if user has permission to view this payment
    if (userId && payment.userId !== userId) {
      throw new AppError(403, 'Unauthorized to view this payment');
    }

    const transactions = await this.paymentTransactionRepository.findByPaymentId(paymentId);
    const refunds = await this.refundRepository.findByPaymentId(paymentId);

    return {
      payment,
      transactions,
      refunds,
    };
  }

  async executeByOrderId(orderId: string, userId?: string): Promise<PaymentDetails | null> {
    const payment = await this.paymentRepository.findByOrderId(orderId);

    if (!payment) {
      return null;
    }

    // Check if user has permission to view this payment
    if (userId && payment.userId !== userId) {
      throw new AppError(403, 'Unauthorized to view this payment');
    }

    const transactions = await this.paymentTransactionRepository.findByPaymentId(payment.id);
    const refunds = await this.refundRepository.findByPaymentId(payment.id);

    return {
      payment,
      transactions,
      refunds,
    };
  }

  async executeByUserId(userId: string, status?: string): Promise<Payment[]> {
    return await this.paymentRepository.findByUserId(userId, status as any);
  }

  async executeByUserIdPaginated(
    userId: string,
    options?: {
      status?: string;
      paymentProvider?: string;
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'amount' | 'status';
      sortOrder?: 'asc' | 'desc';
      startDate?: Date;
      endDate?: Date;
      minAmount?: number;
      maxAmount?: number;
    }
  ) {
    return await this.paymentRepository.findByUserIdPaginated(userId, options as any);
  }
}

