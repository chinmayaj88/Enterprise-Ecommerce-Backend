/**
 * Get Recently Viewed Products Use Case
 */

import { IRecentlyViewedProductRepository } from '../../domain/repositories/IRecentlyViewedProductRepository';
import { RecentlyViewedProduct } from '../../domain/entities/RecentlyViewedProduct';

export class GetRecentlyViewedProductsUseCase {
  constructor(private readonly recentlyViewedRepository: IRecentlyViewedProductRepository) {}

  async execute(userId: string, limit = 20): Promise<RecentlyViewedProduct[]> {
    return this.recentlyViewedRepository.findByUserId(userId, limit);
  }
}

