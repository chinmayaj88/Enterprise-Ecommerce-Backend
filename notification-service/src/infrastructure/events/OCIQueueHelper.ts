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
 * Since OCI Queue doesn't have a Node.js SDK, we use REST APIs directly
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

  /**
   * Get messages from OCI Queue
   */
  async getMessages(queueId: string, limit: number = 10, visibilityInSeconds: number = 60): Promise<QueueMessage[]> {
    if (!this.authProvider || !queueId) {
      return [];
    }

    try {
      const url = `/20210201/queues/${queueId}/messages`;
      const queryParams = `?limit=${limit}&visibilityInSeconds=${visibilityInSeconds}`;
      
      const requestSigner = new common.DefaultRequestSigner(this.authProvider);
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      
      const httpRequest = {
        method: 'GET' as const,
        uri: url + queryParams,
        path: url + queryParams,
        headers: headers,
        body: '',
      };

      await requestSigner.signHttpRequest(httpRequest);

      const responseHeaders: Record<string, string> = {};
      headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const response = await this.axiosInstance.get(url + queryParams, {
        headers: responseHeaders,
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

  /**
   * Delete message from OCI Queue
   */
  async deleteMessage(queueId: string, receiptHandle: string): Promise<void> {
    if (!this.authProvider || !queueId || !receiptHandle) {
      return;
    }

    try {
      const url = `/20210201/queues/${queueId}/messages/${encodeURIComponent(receiptHandle)}`;
      
      const requestSigner = new common.DefaultRequestSigner(this.authProvider);
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      
      const httpRequest = {
        method: 'DELETE' as const,
        uri: url,
        path: url,
        headers: headers,
        body: '',
      };

      await requestSigner.signHttpRequest(httpRequest);

      const responseHeaders: Record<string, string> = {};
      headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      await this.axiosInstance.delete(url, {
        headers: responseHeaders,
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

