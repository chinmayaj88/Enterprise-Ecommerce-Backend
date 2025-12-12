import { IEventConsumer } from '../../domain/repositories/IEventConsumer';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';
import { OCIQueueHelper, QueueMessage } from './OCIQueueHelper';

const logger = createLogger();

/**
 * OCI Queue Event Consumer
 * Uses OCI Queue Service for message queuing via REST API
 * Note: OCI Queue doesn't have a Node.js SDK, so we use REST APIs directly
 */
type EventHandler = (event: Record<string, unknown>) => Promise<void>;

export class OCIQueueEventConsumer implements IEventConsumer {
  private config = getConfig();
  private queueId: string;
  private compartmentId: string;
  private region: string;
  private handlers: Map<string, EventHandler[]> = new Map();
  private _isRunning: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private queueHelper: OCIQueueHelper;

  constructor() {
    this.queueId = this.config.events?.ociQueueId || '';
    this.compartmentId = this.config.events?.ociCompartmentId || '';
    this.region = this.config.events?.ociRegion || 'us-ashburn-1';
    this.queueHelper = new OCIQueueHelper(this.region);
    
    logger.info('OCI Queue Event Consumer initialized', {
      queueId: this.queueId,
      compartmentId: this.compartmentId,
      region: this.region,
    });
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    logger.info('Subscribed to event topic', { eventType });
  }

  async start(): Promise<void> {
    if (this._isRunning) {
      logger.warn('Event consumer is already running');
      return;
    }

    if (!this.queueId) {
      logger.warn('OCI_QUEUE_ID not configured, event consumer not started (using mock mode)');
      return;
    }

    if (this.config.events?.consumerType === 'mock') {
      logger.info('Event consumer in mock mode, not starting OCI Queue polling');
      return;
    }

    this._isRunning = true;
    logger.info('Starting OCI Queue event consumer', { queueId: this.queueId });

    // Start polling for messages
    this.pollMessages();
  }

  async stop(): Promise<void> {
    this._isRunning = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    logger.info('OCI Queue event consumer stopped');
  }

  isRunning(): boolean {
    return this._isRunning;
  }

  private async pollMessages(): Promise<void> {
    if (!this._isRunning || !this.queueId) {
      return;
    }

    try {
      // Get messages from OCI Queue using REST API
      const messages = await this.queueHelper.getMessages(this.queueId, 10, 60);
      
      if (messages && messages.length > 0) {
        for (const message of messages) {
          await this.processMessage(message);
        }
      }

      // Continue polling after delay
      setTimeout(() => this.pollMessages(), 5000);
    } catch (error) {
      logger.error('Error polling OCI Queue messages', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Retry after delay
      setTimeout(() => this.pollMessages(), 5000);
    }
  }

  private async processMessage(message: QueueMessage): Promise<void> {
    if (!message.content || !message.receiptHandle) {
      return;
    }

    try {
      // Parse message content (OCI Queue stores content as base64 encoded JSON)
      let eventData: any;
      try {
        const decodedContent = Buffer.from(message.content, 'base64').toString('utf-8');
        eventData = JSON.parse(decodedContent);
      } catch (parseError) {
        // Try parsing as direct JSON if not base64
        eventData = typeof message.content === 'string' 
          ? JSON.parse(message.content) 
          : message.content;
      }
      
      const actualEvent = eventData.data || eventData;
      const eventType = actualEvent.eventType || actualEvent.type;

      if (eventType && this.handlers.has(eventType)) {
        const handlers = this.handlers.get(eventType)!;
        for (const handler of handlers) {
          try {
            await handler(actualEvent);
          } catch (handlerError) {
            logger.error('Error in event handler', {
              eventType,
              error: handlerError instanceof Error ? handlerError.message : 'Unknown error',
            });
            // Continue processing other handlers even if one fails
          }
        }
      } else {
        logger.warn('No handler found for event type', { eventType });
      }

      // Delete message from queue after successful processing
      await this.queueHelper.deleteMessage(this.queueId, message.receiptHandle);

      logger.info('Event processed successfully', {
        messageId: message.id,
        eventType,
      });
    } catch (error) {
      logger.error('Error processing message', {
        messageId: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // In production, you might want to send to dead letter queue
      // For now, message will become visible again after visibility timeout
    }
  }
}

