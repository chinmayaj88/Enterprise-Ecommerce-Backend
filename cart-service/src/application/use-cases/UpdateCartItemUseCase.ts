import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { ICartItemRepository } from '../../domain/repositories/ICartItemRepository';
import { CartItem } from '../../domain/entities/CartItem';
import { CartCalculationService } from '../../domain/services/CartCalculationService';
import { getConfig } from '../../infrastructure/config/config-provider';
import { createLogger } from '../../infrastructure/logging/logger';

const logger = createLogger();
const config = getConfig();

export interface UpdateCartItemInput {
  cartId: string;
  itemId: string;
  quantity: number;
}

export class UpdateCartItemUseCase {
  private cartCalculationService: CartCalculationService;

  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly cartItemRepository: ICartItemRepository
  ) {
    this.cartCalculationService = new CartCalculationService();
  }

  async execute(input: UpdateCartItemInput): Promise<CartItem> {
    // Get cart
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    if (!cart.canBeModified()) {
      throw new Error('Cart cannot be modified');
    }

    // Get cart item
    const item = await this.cartItemRepository.findById(input.itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }

    if (item.cartId !== input.cartId) {
      throw new Error('Cart item does not belong to this cart');
    }

    // Validate quantity
    if (input.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const maxQuantity = (config.cart?.maxItemQuantity as number) || 99;
    if (input.quantity > maxQuantity) {
      throw new Error(`Quantity cannot exceed ${maxQuantity}`);
    }

    // Update item
    item.updateQuantity(input.quantity);
    const updatedItem = await this.cartItemRepository.update(item.id, {
      quantity: input.quantity,
      totalPrice: item.totalPrice,
    });

    // Recalculate cart totals
    await this.recalculateCartTotals(cart.id);

    logger.info('Cart item updated', {
      cartId: cart.id,
      itemId: updatedItem.id,
      quantity: input.quantity,
    });

    return updatedItem;
  }

  private async recalculateCartTotals(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      return;
    }

    const items = await this.cartItemRepository.findByCartId(cartId);
    const totals = this.cartCalculationService.recalculateCart(
      items,
      cart.couponCode,
      Number(cart.discountAmount)
    );

    await this.cartRepository.update(cartId, {
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      shippingAmount: totals.shippingAmount,
      discountAmount: totals.discountAmount,
      totalAmount: totals.totalAmount,
    });
  }
}

