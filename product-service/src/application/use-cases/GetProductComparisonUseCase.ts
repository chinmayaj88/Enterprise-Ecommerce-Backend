/**
 * Get Product Comparison Use Case
 */

import { IProductComparisonRepository } from '../../domain/repositories/IProductComparisonRepository';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ProductComparison } from '../../domain/entities/ProductComparison';

export class GetProductComparisonUseCase {
  constructor(
    private readonly productComparisonRepository: IProductComparisonRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(comparisonId: string): Promise<{ comparison: ProductComparison; products: Product[] }> {
    const comparison = await this.productComparisonRepository.findById(comparisonId);
    if (!comparison) {
      throw new Error('Comparison not found');
    }

    // Fetch all products
    const products = await Promise.all(
      comparison.productIds.map((id) => this.productRepository.findById(id))
    );

    const validProducts = products.filter((p): p is Product => p !== null);

    return {
      comparison,
      products: validProducts,
    };
  }

  async executeByUserId(userId: string): Promise<ProductComparison[]> {
    return this.productComparisonRepository.findByUserId(userId);
  }
}

