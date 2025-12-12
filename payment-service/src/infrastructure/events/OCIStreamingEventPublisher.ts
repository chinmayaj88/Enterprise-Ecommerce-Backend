import { IEventPublisher } from '../../domain/repositories/IEventPublisher';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';
import * as common from 'oci-common';
import * as streaming from 'oci-streaming';

const logger = createLogger();

/**
 * OCI Streaming Event Publisher
 * Uses OCI Streaming Service for pub/sub messaging
 */
export class OCIStreamingEventPublisher implements IEventPublisher {
  private config = getConfig();
  private streamId: string;
  private compartmentId: string;
  private streamingClient: streaming.StreamClient | null = null;

  constructor() {
    this.streamId = this.config.events?.oci?.streamId || '';
    this.compartmentId = this.config.events?.oci?.compartmentId || '';

    if (this.streamId && this.config.events?.oci?.region) {
      try {
        const provider = new common.ConfigFileAuthenticationDetailsProvider();
        this.streamingClient = new streaming.StreamClient({
          authenticationDetailsProvider: provider,
        });
        logger.info('OCI Streaming Event Publisher initialized', {
          streamId: this.streamId,
          compartmentId: this.compartmentId,
          region: this.config.events?.oci?.region,
        });
      } catch (error) {
        logger.warn('Failed to initialize OCI Streaming client', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.streamingClient = null;
      }
    } else {
      logger.warn('OCI Streaming not fully configured, will operate in mock mode');
    }
  }

  async publish(topic: string, event: Record<string, unknown>): Promise<void> {
    try {
      if (!this.streamId) {
        logger.warn('OCI_STREAM_ID not configured, skipping event publish', { topic });
        return;
      }

      if (!this.streamingClient) {
        logger.debug('OCI Streaming client not initialized, skipping event publish', { topic });
        return;
      }

      const eventPayload = {
        eventType: topic,
        source: (event.source as string) || 'payment-service',
        timestamp: new Date().toISOString(),
        data: event,
      };

      const message: streaming.models.PutMessagesDetailsEntry = {
        key: Buffer.from(topic).toString('base64'),
        value: Buffer.from(JSON.stringify(eventPayload)).toString('base64'),
      };

      const putMessagesRequest: streaming.requests.PutMessagesRequest = {
        streamId: this.streamId,
        putMessagesDetails: {
          messages: [message],
        },
      };

      await this.streamingClient.putMessages(putMessagesRequest);
      
      logger.debug('Event published successfully to OCI Streaming', {
        topic,
        streamId: this.streamId,
        paymentId: (event as any).paymentId || event.id,
      });
    } catch (error) {
      logger.error('Failed to publish event to OCI Streaming', {
        topic,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

