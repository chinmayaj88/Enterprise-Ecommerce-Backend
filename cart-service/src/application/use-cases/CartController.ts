import { Response } from 'express';
import { CreateCartUseCase } from './CreateCartUseCase';
import { GetCartUseCase } from './GetCartUseCase';
import { AddItemToCartUseCase } from './AddItemToCartUseCase';
import { UpdateCartItemUseCase } from './UpdateCartItemUseCase';
import { RemoveCartItemUseCase } from './RemoveCartItemUseCase';
import { ClearCartUseCase } from './ClearCartUseCase';
import { MergeCartsUseCase } from './MergeCartsUseCase';
import { RequestWithId } from '../../interfaces/http/middleware/requestId.middleware';
import { AuthenticatedRequest } from '../../interfaces/http/middleware/auth.middleware';
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../dto/response.util';

export class CartController {
  constructor(
    private readonly createCartUseCase: CreateCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addItemToCartUseCase: AddItemToCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
    private readonly mergeCartsUseCase: MergeCartsUseCase
  ) {}

  async createCart(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || null;
      const sessionId = req.sessionId || null;

      // For authenticated users, use userId; for guests, use sessionId
      const cart = await this.createCartUseCase.execute({
        userId: userId || undefined,
        sessionId: sessionId || undefined,
        currency: req.body.currency || 'USD',
      });

      sendCreated(res, 'Cart created successfully', cart);
    } catch (error: any) {
      sendError(res, 400, error.message || 'Failed to create cart');
    }
  }

  async getCart(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const cartId = req.params.cartId;
      const userId = req.user?.userId || null;
      const sessionId = req.sessionId || null;

      const result = await this.getCartUseCase.execute({
        cartId: cartId || undefined,
        userId: userId || undefined,
        sessionId: sessionId || undefined,
      });

      if (!result) {
        sendNotFound(res, 'Cart not found');
        return;
      }

      sendSuccess(res, 'Cart retrieved successfully', {
        cart: result.cart,
        items: result.items,
      });
    } catch (error: any) {
      sendError(res, 500, error.message || 'Failed to get cart');
    }
  }

  async addItem(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const cartId = req.params.cartId;
      const { productId, variantId, quantity, metadata } = req.body;

      if (!productId || !quantity) {
        sendError(res, 400, 'productId and quantity are required');
        return;
      }

      const item = await this.addItemToCartUseCase.execute({
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
        metadata,
      });

      sendCreated(res, 'Item added to cart successfully', item);
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, statusCode, error.message || 'Failed to add item to cart');
    }
  }

  async updateItem(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const cartId = req.params.cartId;
      const itemId = req.params.itemId;
      const { quantity } = req.body;

      if (!quantity) {
        sendError(res, 400, 'quantity is required');
        return;
      }

      const item = await this.updateCartItemUseCase.execute({
        cartId,
        itemId,
        quantity,
      });

      sendSuccess(res, 'Cart item updated successfully', item);
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, statusCode, error.message || 'Failed to update cart item');
    }
  }

  async removeItem(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const cartId = req.params.cartId;
      const itemId = req.params.itemId;

      await this.removeCartItemUseCase.execute({
        cartId,
        itemId,
      });

      sendSuccess(res, 'Item removed from cart successfully');
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, statusCode, error.message || 'Failed to remove cart item');
    }
  }

  async clearCart(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const cartId = req.params.cartId;

      await this.clearCartUseCase.execute({
        cartId,
      });

      sendSuccess(res, 'Cart cleared successfully');
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, statusCode, error.message || 'Failed to clear cart');
    }
  }

  async mergeCarts(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendError(res, 401, 'Authentication required');
        return;
      }

      const { guestSessionId } = req.body;
      if (!guestSessionId) {
        sendError(res, 400, 'guestSessionId is required');
        return;
      }

      const cart = await this.mergeCartsUseCase.execute({
        guestSessionId,
        userId,
      });

      sendSuccess(res, 'Carts merged successfully', cart);
    } catch (error: any) {
      sendError(res, 400, error.message || 'Failed to merge carts');
    }
  }
}

