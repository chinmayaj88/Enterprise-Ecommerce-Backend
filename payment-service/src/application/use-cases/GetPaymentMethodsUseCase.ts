import { IPaymentMethodRepository } from '../../domain/repositories/IPaymentMethodRepository';
import { PaymentMethod } from '../../domain/entities/PaymentMethod';

export class GetPaymentMethodsUseCase {
  constructor(private readonly paymentMethodRepository: IPaymentMethodRepository) {}

  async execute(userId: string): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.findByUserId(userId);
  }

  async executeDefault(userId: string): Promise<PaymentMethod | null> {
    return await this.paymentMethodRepository.findDefaultByUserId(userId);
  }
}

