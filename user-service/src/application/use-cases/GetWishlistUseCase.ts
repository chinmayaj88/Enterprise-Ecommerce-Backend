/**
 * Get Wishlist Use Case
 */

import { IWishlistItemRepository } from '../../domain/repositories/IWishlistItemRepository';
import { WishlistItem } from '../../domain/entities/WishlistItem';

export class GetWishlistUseCase {
  constructor(
    private readonly wishlistItemRepository: IWishlistItemRepository
  ) {}

  async execute(userId: string): Promise<WishlistItem[]> {
    return await this.wishlistItemRepository.findByUserId(userId);
  }
}

