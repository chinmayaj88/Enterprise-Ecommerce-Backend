import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { ICartItemRepository } from '../../domain/repositories/ICartItemRepository';
import { IProductServiceClient } from '../../infrastructure/clients/IProductServiceClient';
import { CartItem } from '../../domain/entities/CartItem';
import { CartCalculationService } from '../../domain/services/CartCalculationService';
import { getConfig } from '../../infrastructure/config/config-provider';
import { createLogger } from '../../infrastructure/logging/logger';

const logger = createLogger();
const config = getConfig();

export interface AddItemToCartInput {
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  metadata?: Record<string, any>;
}

export class AddItemToCartUseCase {
  private cartCalculationService: CartCalculationService;

  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly cartItemRepository: ICartItemRepository,
    private readonly productServiceClient: IProductServiceClient
  ) {
    this.cartCalculationService = new CartCalculationService();
  }

  async execute(input: AddItemToCartInput): Promise<CartItem> {
    // Get cart
    const cart = await this.cartRepository.findById(input.cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    if (!cart.canBeModified()) {
      throw new Error('Cart cannot be modified');
    }

    // Validate quantity
    const maxQuantity = (config.cart?.maxItemQuantity as number) || 99;
    if (input.quantity < 1 || input.quantity > maxQuantity) {
      throw new Error(`Quantity must be between 1 and ${maxQuantity}`);
    }

    // Check cart item count
    const itemCount = await this.cartItemRepository.countByCartId(cart.id);
    const maxItems = (config.cart?.maxItems as number) || 100;
    if (itemCount >= maxItems) {
      throw new Error(`Cart cannot have more than ${maxItems} items`);
    }

    // Get product information
    let productInfo;
    if (input.variantId) {
      const variant = await this.productServiceClient.getProductVariant(input.variantId);
      if (!variant) {
        throw new Error('Product variant not found');
      }
      const product = await this.productServiceClient.getProduct(variant.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      productInfo = {
        id: product.id,
        name: product.name,
        sku: variant.sku,
        price: variant.price,
        imageUrl: product.imageUrl || null,
      };
    } else {
      const product = await this.productServiceClient.getProduct(input.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      productInfo = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        imageUrl: product.imageUrl || null,
      };
    }

    // Validate availability
    const isAvailable = await this.productServiceClient.validateProductAvailability(
      input.productId,
      input.variantId || null,
      input.quantity
    );
    if (!isAvailable) {
      throw new Error('Product not available in requested quantity');
    }

    // Check if item already exists in cart
    const existingItem = await this.cartItemRepository.findByCartIdAndProductId(
      cart.id,
      input.productId,
      input.variantId || null
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + input.quantity;
      if (newQuantity > maxQuantity) {
        throw new Error(`Quantity cannot exceed ${maxQuantity}`);
      }

      existingItem.updateQuantity(newQuantity);
      const updatedItem = await this.cartItemRepository.update(existingItem.id, {
        quantity: newQuantity,
        totalPrice: existingItem.totalPrice,
      });

      // Recalculate cart totals
      await this.recalculateCartTotals(cart.id);

      logger.info('Cart item quantity updated', {
        cartId: cart.id,
        itemId: updatedItem.id,
        quantity: newQuantity,
      });

      return updatedItem;
    }

    // Create new cart item
    const unitPrice = productInfo.price;
    const totalPrice = unitPrice * input.quantity;

    const cartItem = await this.cartItemRepository.create({
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId || null,
      productName: productInfo.name,
      productSku: productInfo.sku,
      productImageUrl: productInfo.imageUrl,
      unitPrice,
      quantity: input.quantity,
      totalPrice,
      metadata: input.metadata || null,
    });

    // Recalculate cart totals
    await this.recalculateCartTotals(cart.id);

    logger.info('Item added to cart', {
      cartId: cart.id,
      itemId: cartItem.id,
      productId: input.productId,
      quantity: input.quantity,
    });

    return cartItem;
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

