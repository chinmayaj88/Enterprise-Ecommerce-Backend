/**
 * Delete Payment Method Use Case
 */

import { IPaymentMethodRepository } from '../../domain/repositories/IPaymentMethodRepository';

export class DeletePaymentMethodUseCase {
  constructor(
    private readonly paymentMethodRepository: IPaymentMethodRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.paymentMethodRepository.delete(id);
  }
}

