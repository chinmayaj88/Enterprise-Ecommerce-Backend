/**
 * Add to Wishlist Use Case
 */

import { IWishlistItemRepository } from '../../domain/repositories/IWishlistItemRepository';
import { CreateWishlistItemData, WishlistItem } from '../../domain/entities/WishlistItem';

export class AddToWishlistUseCase {
  constructor(
    private readonly wishlistItemRepository: IWishlistItemRepository
  ) {}

  async execute(data: CreateWishlistItemData): Promise<WishlistItem> {
    return await this.wishlistItemRepository.create(data);
  }
}

