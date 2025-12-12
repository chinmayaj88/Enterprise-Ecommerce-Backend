import { IEventConsumer } from './IEventConsumer';
import { getConfig } from '../config/config-provider';
import { createLogger } from '../logging/logger';
import { OCIQueueHelper, QueueMessage } from './OCIQueueHelper';

const logger = createLogger();

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
    this.queueId = process.env.OCI_QUEUE_ID || (this.config as any).oci?.queueId || '';
    this.compartmentId = process.env.OCI_COMPARTMENT_ID || (this.config as any).oci?.compartmentId || '';
    this.region = process.env.OCI_REGION || (this.config as any).oci?.region || 'us-ashburn-1';
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

    const eventConsumerType = process.env.EVENT_CONSUMER_TYPE || (this.config as any).eventConsumer?.type || 'mock';
    if (eventConsumerType === 'mock') {
      logger.info('Event consumer in mock mode, not starting OCI Queue polling');
      return;
    }

    this._isRunning = true;
    logger.info('Starting OCI Queue event consumer', { queueId: this.queueId });
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
    if (!this._isRunning || !this.queueId) return;
    try {
      const messages = await this.queueHelper.getMessages(this.queueId, 10, 60);
      if (messages && messages.length > 0) {
        for (const message of messages) {
          await this.processMessage(message);
        }
      }
      setTimeout(() => this.pollMessages(), 5000);
    } catch (error) {
      logger.error('Error polling OCI Queue messages', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setTimeout(() => this.pollMessages(), 5000);
    }
  }

  private async processMessage(message: QueueMessage): Promise<void> {
    if (!message.content || !message.receiptHandle) return;
    try {
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
          }
        }
        await this.queueHelper.deleteMessage(this.queueId, message.receiptHandle);
        logger.info('Event processed successfully', { messageId: message.id, eventType });
      } else {
        logger.warn('No handler found for event type', { eventType });
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

