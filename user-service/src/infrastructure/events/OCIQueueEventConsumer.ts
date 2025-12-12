import { IEventConsumer, UserCreatedEvent } from '../../domain/repositories/IEventConsumer';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';
import { OCIQueueHelper, QueueMessage } from './OCIQueueHelper';

const logger = createLogger();

/**
 * OCI Queue Event Consumer for User Service
 * Uses OCI Queue Service for message queuing via REST API
 */
export class OCIQueueEventConsumer implements IEventConsumer {
  private config = getConfig();
  private queueId: string;
  private compartmentId: string;
  private region: string;
  private userCreatedHandlers: Array<(event: UserCreatedEvent) => Promise<void>> = [];
  private isRunning = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private queueHelper: OCIQueueHelper;

  constructor() {
    this.queueId = this.config.eventing?.oci?.queueId || '';
    this.compartmentId = this.config.eventing?.oci?.compartmentId || '';
    this.region = this.config.eventing?.oci?.region || 'us-ashburn-1';
    this.queueHelper = new OCIQueueHelper(this.region);
    
    logger.info('OCI Queue Event Consumer initialized', {
      queueId: this.queueId,
      compartmentId: this.compartmentId,
      region: this.region,
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Event consumer is already running');
      return;
    }

    if (!this.queueId) {
      logger.warn('OCI_QUEUE_ID not configured, event consumer not started (using mock mode)');
      return;
    }

    this.isRunning = true;
    logger.info('OCI Queue event consumer started');
    this.poll();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }
    logger.info('OCI Queue event consumer stopped');
  }

  onUserCreated(handler: (event: UserCreatedEvent) => Promise<void>): void {
    this.userCreatedHandlers.push(handler);
    logger.info('User created handler registered');
  }

  private async poll(): Promise<void> {
    if (!this.isRunning || !this.queueId) {
      return;
    }

    try {
      const messages = await this.queueHelper.getMessages(this.queueId, 10, 60);
      
      if (messages && messages.length > 0) {
        for (const message of messages) {
          await this.processMessage(message);
        }
      }
      
      this.pollingInterval = setTimeout(() => this.poll(), 5000);
    } catch (error) {
      logger.error('Error polling for messages', { error });
      this.pollingInterval = setTimeout(() => this.poll(), 5000);
    }
  }

  private async processMessage(message: QueueMessage): Promise<void> {
    if (!message.content || !message.receiptHandle) {
      return;
    }

    try {
      // Parse message content
      let eventData: any;
      try {
        const decodedContent = Buffer.from(message.content, 'base64').toString('utf-8');
        eventData = JSON.parse(decodedContent);
      } catch (parseError) {
        eventData = typeof message.content === 'string' 
          ? JSON.parse(message.content) 
          : message.content;
      }
      
      const actualEvent = eventData.data || eventData;
      const eventType = actualEvent.eventType || actualEvent.type;

      // Handle user.created event
      if (eventType === 'user.created' && this.userCreatedHandlers.length > 0) {
        const userCreatedEvent: UserCreatedEvent = {
          userId: actualEvent.userId || actualEvent.id,
          email: actualEvent.email,
          timestamp: actualEvent.timestamp || new Date().toISOString(),
          source: actualEvent.source || 'auth-service',
        };

        for (const handler of this.userCreatedHandlers) {
          try {
            await handler(userCreatedEvent);
          } catch (handlerError) {
            logger.error('Error handling user.created event', {
              error: handlerError instanceof Error ? handlerError.message : 'Unknown error',
            });
          }
        }

        // Delete message after successful processing
        await this.queueHelper.deleteMessage(this.queueId, message.receiptHandle);
        logger.info('Event processed successfully', { messageId: message.id, eventType });
      } else {
        logger.warn('No handler found for event type or unsupported event', { eventType });
        // Delete unhandled messages to prevent queue buildup
        await this.queueHelper.deleteMessage(this.queueId, message.receiptHandle);
      }
    } catch (error) {
      logger.error('Error processing message', {
        messageId: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

