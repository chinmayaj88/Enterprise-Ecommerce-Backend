import axios, { AxiosInstance, AxiosError } from 'axios';
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

export interface Product {
  id: string;
  name: string;
  categoryIds: string[];
  isActive: boolean;
}

export interface IProductServiceClient {
  getProduct(productId: string): Promise<Product | null>;
  getProductCategories(productId: string): Promise<string[]>;
  validateProducts(productIds: string[]): Promise<boolean>;
}

export class ProductServiceClient implements IProductServiceClient {
  private axiosInstance: AxiosInstance;
  private cache: Map<string, { data: Product; expiresAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const productServiceUrl = (config as any).productService?.url || process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003';
    const productServiceApiKey = (config as any).productService?.apiKey || process.env.PRODUCT_SERVICE_API_KEY;
    const productServiceInternalToken = (config as any).productService?.internalToken || process.env.PRODUCT_SERVICE_INTERNAL_TOKEN;

    this.axiosInstance = axios.create({
      baseURL: productServiceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(productServiceApiKey && {
          'X-API-Key': productServiceApiKey,
        }),
        ...(productServiceInternalToken && {
          'X-Internal-Token': productServiceInternalToken,
        }),
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response && error.response.status === 404) {
          logger.warn('Product not found', { productId: error.config?.url });
        } else if (error.response && error.response.status >= 500) {
          logger.error('Product service error', {
            status: error.response.status,
            url: error.config?.url,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  async getProduct(productId: string): Promise<Product | null> {
    try {
      // Check cache first
      const cached = this.cache.get(productId);
      if (cached && cached.expiresAt > Date.now()) {
        logger.debug('Product info retrieved from cache', { productId });
        return cached.data;
      }

      const response = await circuitBreaker.execute(() =>
        retry(
          async () => {
            return await this.axiosInstance.get(`/api/v1/products/${productId}`, {
              timeout: 5000,
            });
          },
          {
            maxRetries: 2,
            retryDelay: 500,
            retryableErrors: [500, 502, 503, 504, 'ECONNRESET', 'ETIMEDOUT'],
          }
        )
      );

      if (response.data && response.data.data) {
        const productData = response.data.data;
        const product: Product = {
          id: productData.id || productId,
          name: productData.name,
          categoryIds: productData.categoryIds || productData.categories?.map((c: any) => c.id) || [],
          isActive: productData.isActive !== false,
        };

        // Cache the result
        this.cache.set(productId, {
          data: product,
          expiresAt: Date.now() + this.CACHE_TTL_MS,
        });

        return product;
      }

      return null;
    } catch (error: any) {
      if (error.message?.includes('Circuit breaker')) {
        logger.warn('Product service circuit breaker is open', { productId });
        // Return cached data if available
        const cached = this.cache.get(productId);
        if (cached) {
          return cached.data;
        }
        return null;
      }

      if (error.response && error.response.status === 404) {
        logger.warn('Product not found in product service', { productId });
        return null;
      }

      logger.error('Failed to fetch product from product service', {
        productId,
        error: error.message,
        status: error.response?.status,
      });

      // Return cached data if available
      const cached = this.cache.get(productId);
      if (cached) {
        return cached.data;
      }

      return null;
    }
  }

  async getProductCategories(productId: string): Promise<string[]> {
    const product = await this.getProduct(productId);
    return product?.categoryIds || [];
  }

  async validateProducts(productIds: string[]): Promise<boolean> {
    try {
      // Validate multiple products
      const validationPromises = productIds.map(id => this.getProduct(id));
      const results = await Promise.allSettled(validationPromises);
      
      // All products must exist and be active
      return results.every(result => 
        result.status === 'fulfilled' && result.value !== null && result.value.isActive
      );
    } catch (error) {
      logger.error('Error validating products', {
        productIds,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  clearCache(productId?: string): void {
    if (productId) {
      this.cache.delete(productId);
    } else {
      this.cache.clear();
    }
  }
}

