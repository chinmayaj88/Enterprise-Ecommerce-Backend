import { IEventConsumer, OrderCreatedEvent, OrderCancelledEvent } from '../../domain/repositories/IEventConsumer';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';
import { OCIQueueHelper, QueueMessage } from './OCIQueueHelper';

const logger = createLogger();

/**
 * OCI Queue Event Consumer for Payment Service
 * Uses OCI Queue Service for message queuing via REST API
 */
export class OCIQueueEventConsumer implements IEventConsumer {
  private config = getConfig();
  private queueId: string;
  private compartmentId: string;
  private region: string;
  private orderCreatedHandlers: Array<(event: OrderCreatedEvent) => Promise<void>> = [];
  private orderCancelledHandlers: Array<(event: OrderCancelledEvent) => Promise<void>> = [];
  private isRunning = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private queueHelper: OCIQueueHelper;

  constructor() {
    this.queueId = this.config.events?.oci?.queueId || '';
    this.compartmentId = this.config.events?.oci?.compartmentId || '';
    this.region = this.config.events?.oci?.region || 'us-ashburn-1';
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

  onOrderCreated(handler: (event: OrderCreatedEvent) => Promise<void>): void {
    this.orderCreatedHandlers.push(handler);
    logger.info('Order created handler registered');
  }

  onOrderCancelled(handler: (event: OrderCancelledEvent) => Promise<void>): void {
    this.orderCancelledHandlers.push(handler);
    logger.info('Order cancelled handler registered');
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

      // Extract data if wrapped
      const actualEvent = eventData.data || eventData;
      const eventType = actualEvent.eventType || actualEvent.type || actualEvent['detail-type'];

      if (eventType === 'order.created') {
        const orderCreatedEvent: OrderCreatedEvent = {
          orderId: actualEvent.orderId,
          orderNumber: actualEvent.orderNumber,
          userId: actualEvent.userId,
          totalAmount: actualEvent.totalAmount,
          currency: actualEvent.currency,
          paymentMethodId: actualEvent.paymentMethodId,
          timestamp: actualEvent.timestamp,
          source: actualEvent.source,
        };

        for (const handler of this.orderCreatedHandlers) {
          try {
            await handler(orderCreatedEvent);
          } catch (error) {
            logger.error('Error handling order.created event', { error });
          }
        }

        // Delete message after successful processing
        await this.queueHelper.deleteMessage(this.queueId, message.receiptHandle);
      } else if (eventType === 'order.cancelled') {
        const orderCancelledEvent: OrderCancelledEvent = {
          orderId: actualEvent.orderId,
          orderNumber: actualEvent.orderNumber,
          userId: actualEvent.userId,
          timestamp: actualEvent.timestamp,
          source: actualEvent.source,
        };

        for (const handler of this.orderCancelledHandlers) {
          try {
            await handler(orderCancelledEvent);
          } catch (error) {
            logger.error('Error handling order.cancelled event', { error });
          }
        }

        // Delete message after successful processing
        await this.queueHelper.deleteMessage(this.queueId, message.receiptHandle);
      } else {
        logger.warn('Unknown event type', { eventType });
        // Delete unknown messages to prevent queue buildup
        await this.queueHelper.deleteMessage(this.queueId, message.receiptHandle);
      }
    } catch (error) {
      logger.error('Error processing message', { 
        messageId: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Message will become visible again after visibility timeout
    }
  }
}

