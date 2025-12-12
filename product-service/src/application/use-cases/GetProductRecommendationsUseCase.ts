/**
 * Get Product Recommendations Use Case
 */

import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

export class GetProductRecommendationsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(productId: string, limit = 10): Promise<Product[]> {
    return this.productRepository.getRecommendations(productId, limit);
  }
}

