import axios, { AxiosInstance } from 'axios';
import { IProductServiceClient, ProductInfo, ProductVariantInfo } from './IProductServiceClient';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';
import { retry } from '../utils/retry.util';
import { getCircuitBreaker } from '../utils/circuitBreaker.util';

const logger = createLogger();
const config = getConfig();
const circuitBreaker = getCircuitBreaker('product-service', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 10000,
  resetTimeout: 60000,
});

export class ProductServiceClient implements IProductServiceClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.services.product,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getProduct(productId: string): Promise<ProductInfo | null> {
    try {
      const response = await circuitBreaker.execute(() =>
        retry(
          () => this.axiosInstance.get(`/api/v1/products/${productId}`),
          { maxRetries: 3, retryDelay: 1000 }
        )
      ) as any;

      if (response.data.success && response.data.data) {
        const product = response.data.data;
        return {
          id: product.id,
          name: product.name,
          sku: product.sku || productId,
          price: Number(product.price),
          stock: product.stockQuantity || 0,
          status: product.status || 'active',
          imageUrl: product.imageUrl || null,
        };
      }

      return null;
    } catch (error: any) {
      logger.warn(`Failed to fetch product ${productId}`, {
        error: error.message,
        status: error.response?.status,
      });
      return null;
    }
  }

  async getProductVariant(variantId: string): Promise<ProductVariantInfo | null> {
    try {
      const response = await circuitBreaker.execute(() =>
        retry(
          () => this.axiosInstance.get(`/api/v1/products/variants/${variantId}`),
          { maxRetries: 3, retryDelay: 1000 }
        )
      ) as any;

      if (response.data.success && response.data.data) {
        const variant = response.data.data;
        return {
          id: variant.id,
          productId: variant.productId,
          name: variant.name || null,
          sku: variant.sku || variantId,
          price: variant.price ? Number(variant.price) : 0,
          stock: variant.stockQuantity || 0,
        };
      }

      return null;
    } catch (error: any) {
      logger.warn(`Failed to fetch product variant ${variantId}`, {
        error: error.message,
        status: error.response?.status,
      });
      return null;
    }
  }

  async validateProductAvailability(productId: string, variantId: string | null, quantity: number): Promise<boolean> {
    try {
      if (variantId) {
        const variant = await this.getProductVariant(variantId);
        if (!variant || variant.productId !== productId) {
          return false;
        }
        return variant.stock >= quantity && variant.stock > 0;
      } else {
        const product = await this.getProduct(productId);
        if (!product || product.status !== 'active') {
          return false;
        }
        return product.stock >= quantity && product.stock > 0;
      }
    } catch (error: any) {
      logger.error(`Failed to validate product availability`, {
        error: error.message,
        productId,
        variantId,
        quantity,
      });
      return false;
    }
  }
}

