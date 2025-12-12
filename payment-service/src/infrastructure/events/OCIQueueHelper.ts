import axios, { AxiosInstance } from 'axios';
import * as common from 'oci-common';
import { createLogger } from '../logging/logger';

const logger = createLogger();

export interface QueueMessage {
  id: string;
  content: string;
  receiptHandle: string;
  visibleAfter?: Date;
}

/**
 * Helper class for OCI Queue REST API operations
 */
export class OCIQueueHelper {
  private authProvider: common.ConfigFileAuthenticationDetailsProvider | null = null;
  private axiosInstance: AxiosInstance;
  private region: string;

  constructor(region: string = 'us-ashburn-1') {
    this.region = region;
    
    try {
      this.authProvider = new common.ConfigFileAuthenticationDetailsProvider();
    } catch (error) {
      logger.warn('Failed to initialize OCI auth provider', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    this.axiosInstance = axios.create({
      baseURL: `https://queue.${this.region}.oci.oraclecloud.com`,
      timeout: 30000,
    });
  }

  async getMessages(queueId: string, limit: number = 10, visibilityInSeconds: number = 60): Promise<QueueMessage[]> {
    if (!this.authProvider || !queueId) {
      return [];
    }

    try {
      const url = `/20210201/queues/${queueId}/messages`;
      const queryParams = `?limit=${limit}&visibilityInSeconds=${visibilityInSeconds}`;
      
      const requestSigner = new common.DefaultRequestSigner(this.authProvider);
      const httpRequest: common.HttpRequest = {
        method: 'GET' as common.Method,
        uri: `https://queue.${this.region}.oci.oraclecloud.com${url}${queryParams}`,
        headers: {
          'Content-Type': 'application/json',
        } as any,
        body: '',
      };

      await requestSigner.signHttpRequest(httpRequest);

      // Convert headers to plain object for axios
      const axiosHeaders: Record<string, string> = {};
      if (httpRequest.headers) {
        if (httpRequest.headers instanceof Map) {
          httpRequest.headers.forEach((value, key) => {
            axiosHeaders[key] = value;
          });
        } else if (typeof httpRequest.headers === 'object') {
          Object.assign(axiosHeaders, httpRequest.headers);
        }
      }

      const response = await this.axiosInstance.get(url + queryParams, {
        headers: axiosHeaders,
      });

      if (response.data && response.data.items) {
        return response.data.items.map((item: any) => ({
          id: item.id,
          content: item.content,
          receiptHandle: item.receiptHandle,
          visibleAfter: item.visibleAfter ? new Date(item.visibleAfter) : undefined,
        }));
      }

      return [];
    } catch (error) {
      logger.error('Error getting messages from OCI Queue', {
        queueId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  async deleteMessage(queueId: string, receiptHandle: string): Promise<void> {
    if (!this.authProvider || !queueId || !receiptHandle) {
      return;
    }

    try {
      const url = `/20210201/queues/${queueId}/messages/${encodeURIComponent(receiptHandle)}`;
      
      const requestSigner = new common.DefaultRequestSigner(this.authProvider);
      const httpRequest: common.HttpRequest = {
        method: 'DELETE' as common.Method,
        uri: `https://queue.${this.region}.oci.oraclecloud.com${url}`,
        headers: {
          'Content-Type': 'application/json',
        } as any,
        body: '',
      };

      await requestSigner.signHttpRequest(httpRequest);

      // Convert headers to plain object for axios
      const axiosHeaders: Record<string, string> = {};
      if (httpRequest.headers) {
        if (httpRequest.headers instanceof Map) {
          httpRequest.headers.forEach((value, key) => {
            axiosHeaders[key] = value;
          });
        } else if (typeof httpRequest.headers === 'object') {
          Object.assign(axiosHeaders, httpRequest.headers);
        }
      }

      await this.axiosInstance.delete(url, {
        headers: axiosHeaders,
      });

      logger.debug('Message deleted from OCI Queue', { receiptHandle });
    } catch (error) {
      logger.error('Error deleting message from OCI Queue', {
        queueId,
        receiptHandle,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

