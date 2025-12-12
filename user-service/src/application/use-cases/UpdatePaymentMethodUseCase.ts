/**
 * Update Payment Method Use Case
 */

import { IPaymentMethodRepository } from '../../domain/repositories/IPaymentMethodRepository';
import { UpdatePaymentMethodData, PaymentMethod } from '../../domain/entities/PaymentMethod';

export class UpdatePaymentMethodUseCase {
  constructor(
    private readonly paymentMethodRepository: IPaymentMethodRepository
  ) {}

  async execute(id: string, data: UpdatePaymentMethodData): Promise<PaymentMethod> {
    return await this.paymentMethodRepository.update(id, data);
  }
}

