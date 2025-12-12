/**
 * User Controller
 * Handles HTTP requests for user profile operations
 */

import { Response } from 'express';
import { GetUserProfileUseCase } from '../use-cases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../use-cases/UpdateUserProfileUseCase';
import { CreateAddressUseCase } from '../use-cases/CreateAddressUseCase';
import { GetAddressesUseCase } from '../use-cases/GetAddressesUseCase';
import { UpdateAddressUseCase } from '../use-cases/UpdateAddressUseCase';
import { DeleteAddressUseCase } from '../use-cases/DeleteAddressUseCase';
import { CreatePaymentMethodUseCase } from '../use-cases/CreatePaymentMethodUseCase';
import { UpdatePaymentMethodUseCase } from '../use-cases/UpdatePaymentMethodUseCase';
import { DeletePaymentMethodUseCase } from '../use-cases/DeletePaymentMethodUseCase';
import { AddToWishlistUseCase } from '../use-cases/AddToWishlistUseCase';
import { GetWishlistUseCase } from '../use-cases/GetWishlistUseCase';
import { TrackProductViewUseCase } from '../use-cases/TrackProductViewUseCase';
import { GetRecentlyViewedProductsUseCase } from '../use-cases/GetRecentlyViewedProductsUseCase';
import { TrackUserActivityUseCase } from '../use-cases/TrackUserActivityUseCase';
import { GetUserActivityUseCase } from '../use-cases/GetUserActivityUseCase';
import { GetUserActivityStatsUseCase } from '../use-cases/GetUserActivityStatsUseCase';
import { CalculateProfileCompletionScoreUseCase } from '../use-cases/CalculateProfileCompletionScoreUseCase';
import { UpdateNotificationPreferenceUseCase } from '../use-cases/UpdateNotificationPreferenceUseCase';
import { GetNotificationPreferencesUseCase } from '../use-cases/GetNotificationPreferencesUseCase';
import { ExportUserDataUseCase } from '../use-cases/ExportUserDataUseCase';
import { DeleteUserDataUseCase } from '../use-cases/DeleteUserDataUseCase';
import { AuthenticatedRequest } from '../../interfaces/http/middleware/auth.middleware';
import { RequestWithId } from '../../interfaces/http/middleware/requestId.middleware';
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
} from '../dto/response.util';
import { IPaymentMethodRepository } from '../../domain/repositories/IPaymentMethodRepository';
import { IWishlistItemRepository } from '../../domain/repositories/IWishlistItemRepository';
import { AppError } from '../../shared/errors/AppError';

export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly getAddressesUseCase: GetAddressesUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly createPaymentMethodUseCase: CreatePaymentMethodUseCase,
    private readonly updatePaymentMethodUseCase: UpdatePaymentMethodUseCase,
    private readonly deletePaymentMethodUseCase: DeletePaymentMethodUseCase,
    private readonly addToWishlistUseCase: AddToWishlistUseCase,
    private readonly getWishlistUseCase: GetWishlistUseCase,
    private readonly trackProductViewUseCase: TrackProductViewUseCase,
    private readonly getRecentlyViewedProductsUseCase: GetRecentlyViewedProductsUseCase,
    private readonly trackUserActivityUseCase: TrackUserActivityUseCase,
    private readonly getUserActivityUseCase: GetUserActivityUseCase,
    private readonly getUserActivityStatsUseCase: GetUserActivityStatsUseCase,
    private readonly calculateProfileCompletionScoreUseCase: CalculateProfileCompletionScoreUseCase,
    private readonly updateNotificationPreferenceUseCase: UpdateNotificationPreferenceUseCase,
    private readonly getNotificationPreferencesUseCase: GetNotificationPreferencesUseCase,
    private readonly exportUserDataUseCase: ExportUserDataUseCase,
    private readonly deleteUserDataUseCase: DeleteUserDataUseCase,
    private readonly paymentMethodRepository: IPaymentMethodRepository,
    private readonly wishlistItemRepository: IWishlistItemRepository
  ) {}

  async getProfile(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const profile = await this.getUserProfileUseCase.execute(userId);
      if (!profile) {
        sendNotFound(res, 'User profile not found', undefined, req.id);
        return;
      }

      sendSuccess(res, 200, 'User profile retrieved successfully', profile, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get user profile';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async updateProfile(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const profile = await this.updateUserProfileUseCase.execute(userId, req.body);
      sendSuccess(res, 200, 'Profile updated successfully', profile, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async createAddress(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const address = await this.createAddressUseCase.execute({
        ...req.body,
        userId,
      });

      sendCreated(res, 201, 'Address created successfully', address, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to create address';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async getAddresses(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const type = req.query.type as 'shipping' | 'billing' | 'both' | undefined;
      const addresses = await this.getAddressesUseCase.execute(userId, type);

      sendSuccess(res, 200, 'Addresses retrieved successfully', addresses, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get addresses';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async createPaymentMethod(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const paymentMethod = await this.createPaymentMethodUseCase.execute({
        ...req.body,
        userId,
      });

      sendCreated(res, 201, 'Payment method added successfully', paymentMethod, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to create payment method';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async getPaymentMethods(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const paymentMethods = await this.paymentMethodRepository.findByUserId(userId);
      sendSuccess(res, 200, 'Payment methods retrieved successfully', paymentMethods, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get payment methods';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async addToWishlist(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const wishlistItem = await this.addToWishlistUseCase.execute({
        ...req.body,
        userId,
      });

      sendCreated(res, 201, 'Item added to wishlist successfully', wishlistItem, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to add to wishlist';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async getWishlist(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const wishlist = await this.getWishlistUseCase.execute(userId);
      sendSuccess(res, 200, 'Wishlist retrieved successfully', wishlist, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get wishlist';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async updateAddress(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const addressId = req.params.addressId;
      if (!addressId) {
        sendBadRequest(res, 'Address ID is required', undefined, req.id);
        return;
      }

      const address = await this.updateAddressUseCase.execute(addressId, req.body);
      sendSuccess(res, 200, 'Address updated successfully', address, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to update address';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async deleteAddress(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const addressId = req.params.addressId;
      if (!addressId) {
        sendBadRequest(res, 'Address ID is required', undefined, req.id);
        return;
      }

      await this.deleteAddressUseCase.execute(addressId);
      sendSuccess(res, 200, 'Address deleted successfully', undefined, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to delete address';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async updatePaymentMethod(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const paymentMethodId = req.params.paymentMethodId;
      if (!paymentMethodId) {
        sendBadRequest(res, 'Payment method ID is required', undefined, req.id);
        return;
      }

      const paymentMethod = await this.updatePaymentMethodUseCase.execute(paymentMethodId, req.body);
      sendSuccess(res, 200, 'Payment method updated successfully', paymentMethod, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to update payment method';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async deletePaymentMethod(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const paymentMethodId = req.params.paymentMethodId;
      if (!paymentMethodId) {
        sendBadRequest(res, 'Payment method ID is required', undefined, req.id);
        return;
      }

      await this.deletePaymentMethodUseCase.execute(paymentMethodId);
      sendSuccess(res, 200, 'Payment method deleted successfully', undefined, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to delete payment method';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async removeFromWishlist(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const itemId = req.params.itemId;
      if (!itemId) {
        sendBadRequest(res, 'Item ID is required', undefined, req.id);
        return;
      }

      await this.wishlistItemRepository.delete(itemId);
      sendSuccess(res, 200, 'Item removed from wishlist successfully', undefined, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to remove from wishlist';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async trackProductView(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const { productId, productName, productImageUrl, productPrice } = req.body;
      if (!productId) {
        sendBadRequest(res, 'Product ID is required', undefined, req.id);
        return;
      }

      const viewed = await this.trackProductViewUseCase.execute(
        userId,
        productId,
        { productName, productImageUrl, productPrice },
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );

      sendSuccess(res, 200, 'Product view tracked successfully', viewed, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to track product view';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async getRecentlyViewedProducts(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const products = await this.getRecentlyViewedProductsUseCase.execute(userId, limit);

      sendSuccess(res, 200, 'Recently viewed products retrieved successfully', products, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get recently viewed products';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async trackActivity(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const { activityType, entityType, entityId, metadata } = req.body;
      if (!activityType) {
        sendBadRequest(res, 'Activity type is required', undefined, req.id);
        return;
      }

      const activity = await this.trackUserActivityUseCase.execute({
        userId,
        activityType,
        entityType,
        entityId,
        metadata,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      sendCreated(res, 201, 'Activity tracked successfully', activity, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to track activity';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async getActivity(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const activityType = req.query.activityType as string | undefined;
      const entityType = req.query.entityType as string | undefined;

      const result = await this.getUserActivityUseCase.execute(userId, {
        limit,
        offset,
        activityType,
        entityType,
      });

      sendSuccess(res, 200, 'Activity retrieved successfully', result, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get activity';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async getActivityStats(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const stats = await this.getUserActivityStatsUseCase.execute(userId, days);

      sendSuccess(res, 200, 'Activity stats retrieved successfully', stats, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get activity stats';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async calculateProfileCompletionScore(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const result = await this.calculateProfileCompletionScoreUseCase.execute(userId);
      sendSuccess(res, 200, 'Profile completion score calculated successfully', result, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to calculate profile completion score';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async getNotificationPreferences(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const channel = req.query.channel as string | undefined;
      const preferences = await this.getNotificationPreferencesUseCase.execute(userId, channel);

      sendSuccess(res, 200, 'Notification preferences retrieved successfully', { preferences }, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to get notification preferences';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async updateNotificationPreference(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      const { channel, category, enabled, frequency } = req.body;
      if (!channel || !category) {
        sendBadRequest(res, 'Channel and category are required', undefined, req.id);
        return;
      }

      const preference = await this.updateNotificationPreferenceUseCase.execute(userId, {
        userId,
        channel,
        category,
        enabled,
        frequency,
      });

      sendSuccess(res, 200, 'Notification preference updated successfully', preference, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to update notification preference';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async exportUserData(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      // Verify ownership or admin role
      if (req.user?.userId !== userId && !req.user?.roles?.includes('admin')) {
        sendForbidden(res, 'Unauthorized', undefined, req.id);
        return;
      }

      const data = await this.exportUserDataUseCase.execute(userId);

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}-${Date.now()}.json"`);

      sendSuccess(res, 200, 'User data exported successfully', data, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to export user data';
      sendBadRequest(res, message, undefined, req.id);
    }
  }

  async deleteUserData(req: AuthenticatedRequest & RequestWithId, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.userId;
      if (!userId) {
        sendBadRequest(res, 'User ID is required', undefined, req.id);
        return;
      }

      // Verify ownership or admin role
      if (req.user?.userId !== userId && !req.user?.roles?.includes('admin')) {
        sendForbidden(res, 'Unauthorized', undefined, req.id);
        return;
      }

      // Require confirmation
      const { confirm } = req.body;
      if (confirm !== 'DELETE') {
        sendBadRequest(res, 'Confirmation required. Send { "confirm": "DELETE" } to proceed.', undefined, req.id);
        return;
      }

      await this.deleteUserDataUseCase.execute(userId);

      sendSuccess(res, 200, 'User data deleted successfully', undefined, req.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to delete user data';
      sendBadRequest(res, message, undefined, req.id);
    }
  }
}

