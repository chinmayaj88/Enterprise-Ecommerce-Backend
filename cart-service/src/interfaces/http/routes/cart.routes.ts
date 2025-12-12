import { Router } from 'express';
import { CartController } from '../../../application/use-cases/CartController';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';
import {
  validateCreateCart,
  validateAddItemToCart,
  validateUpdateCartItem,
  validateRemoveCartItem,
  validateClearCart,
  validateMergeCarts,
  handleValidationErrors,
} from '../middleware/validator.middleware';

export function createCartRoutes(cartController: CartController): Router {
  const router = Router();

  // All cart routes support optional auth (for guest carts)
  router.use(optionalAuth);

  // Create cart
  router.post(
    '/',
    validateCreateCart,
    handleValidationErrors,
    cartController.createCart.bind(cartController)
  );

  // Get cart (by userId or sessionId - no cartId) - must come before /:cartId
  router.get('/', cartController.getCart.bind(cartController));
  
  // Get cart (by ID)
  router.get('/:cartId', cartController.getCart.bind(cartController));

  // Add item to cart
  router.post(
    '/:cartId/items',
    validateAddItemToCart,
    handleValidationErrors,
    cartController.addItem.bind(cartController)
  );

  // Update cart item
  router.put(
    '/:cartId/items/:itemId',
    validateUpdateCartItem,
    handleValidationErrors,
    cartController.updateItem.bind(cartController)
  );

  // Remove item from cart
  router.delete(
    '/:cartId/items/:itemId',
    validateRemoveCartItem,
    handleValidationErrors,
    cartController.removeItem.bind(cartController)
  );

  // Clear cart
  router.delete(
    '/:cartId',
    validateClearCart,
    handleValidationErrors,
    cartController.clearCart.bind(cartController)
  );

  // Merge carts (requires authentication)
  router.post(
    '/merge',
    authenticate,
    validateMergeCarts,
    handleValidationErrors,
    cartController.mergeCarts.bind(cartController)
  );

  return router;
}

