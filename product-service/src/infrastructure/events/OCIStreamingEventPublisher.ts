import { IEventPublisher } from './IEventPublisher';
import { createLogger } from '../logging/logger';
import * as common from 'oci-common';
import * as streaming from 'oci-streaming';

const logger = createLogger();

/**
 * OCI Streaming Event Publisher
 * Uses OCI Streaming Service for pub/sub messaging
 */
export class OCIStreamingEventPublisher implements IEventPublisher {
  private streamId: string;
  private compartmentId: string;
  private streamingClient: streaming.StreamClient | null = null;

  constructor() {
    this.streamId = process.env.OCI_STREAM_ID || '';
    this.compartmentId = process.env.OCI_COMPARTMENT_ID || '';
    
    if (this.streamId && process.env.OCI_REGION) {
      try {
        const provider = new common.ConfigFileAuthenticationDetailsProvider();
        this.streamingClient = new streaming.StreamClient({
          authenticationDetailsProvider: provider,
        });
        logger.info('OCI Streaming Event Publisher initialized', {
          streamId: this.streamId,
          compartmentId: this.compartmentId,
          region: process.env.OCI_REGION,
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
        logger.warn('OCI Streaming client not initialized, skipping event publish', { topic });
        return;
      }

      const message: streaming.models.PutMessagesDetailsEntry = {
        key: Buffer.from(topic).toString('base64'),
        value: Buffer.from(JSON.stringify({ topic, ...event })).toString('base64'),
      };

      const putMessagesRequest: streaming.models.PutMessagesDetails = {
        messages: [message],
      };

      await this.streamingClient.putMessages({
        streamId: this.streamId,
        putMessagesDetails: putMessagesRequest,
      });

      logger.info('Event published to OCI Streaming', { topic, streamId: this.streamId });
    } catch (error) {
      logger.error('Failed to publish event to OCI Streaming', {
        topic,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - event publishing is fire and forget
    }
  }
}

