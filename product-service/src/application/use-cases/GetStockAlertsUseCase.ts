/**
 * Get Stock Alerts Use Case
 */

import { IStockAlertRepository } from '../../domain/repositories/IStockAlertRepository';
import { StockAlert } from '../../domain/entities/StockAlert';

export class GetStockAlertsUseCase {
  constructor(private readonly stockAlertRepository: IStockAlertRepository) {}

  async execute(userId: string): Promise<StockAlert[]> {
    return this.stockAlertRepository.findByUserId(userId);
  }
}

