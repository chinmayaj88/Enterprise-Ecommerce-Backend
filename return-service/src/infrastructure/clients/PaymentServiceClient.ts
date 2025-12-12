import axios, { AxiosInstance, AxiosError } from 'axios';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';
import { retry } from '../utils/retry.util';
import { getCircuitBreaker } from '../utils/circuitBreaker.util';

const logger = createLogger();
const config = getConfig();
const circuitBreaker = getCircuitBreaker('payment-service', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 10000,
  resetTimeout: 60000,
});

export interface ProcessRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RefundResponse {
  id: string;
  status: string;
}

export interface IPaymentServiceClient {
  processRefund(request: ProcessRefundRequest): Promise<RefundResponse | null>;
}

export class PaymentServiceClient implements IPaymentServiceClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.services?.paymentServiceUrl || 'http://localhost:3005',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.services?.paymentServiceApiKey && {
          'X-API-Key': config.services.paymentServiceApiKey,
        }),
        ...(config.services?.paymentServiceInternalToken && {
          'X-Internal-Token': config.services.paymentServiceInternalToken,
        }),
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response && error.response.status === 404) {
          logger.warn('Payment not found', { paymentId: error.config?.url });
        } else if (error.response && error.response.status >= 500) {
          logger.error('Payment service error', {
            status: error.response.status,
            url: error.config?.url,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  async processRefund(request: ProcessRefundRequest): Promise<RefundResponse | null> {
    try {
      const response = await circuitBreaker.execute(() =>
        retry(
          async () => {
            return await this.axiosInstance.post('/api/v1/refunds', request, {
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
        return response.data.data as RefundResponse;
      }

      return null;
    } catch (error: any) {
      if (error.message?.includes('Circuit breaker')) {
        logger.warn('Payment service circuit breaker is open', { paymentId: request.paymentId });
        return null;
      }

      logger.error('Failed to process refund via payment service', {
        paymentId: request.paymentId,
        error: error.message,
        status: error.response?.status,
      });

      return null;
    }
  }
}

