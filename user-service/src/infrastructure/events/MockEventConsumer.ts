import { IEventConsumer, UserCreatedEvent } from '../../domain/repositories/IEventConsumer';
import { createLogger } from '../logging/logger';

const logger = createLogger();

export class MockEventConsumer implements IEventConsumer {
  private userCreatedHandlers: Array<(event: UserCreatedEvent) => Promise<void>> = [];
  private _isRunning = false;

  get isRunning(): boolean {
    return this._isRunning;
  }

  async start(): Promise<void> {
    this._isRunning = true;
    logger.info('Mock event consumer started (no-op in development)');
  }

  async stop(): Promise<void> {
    this._isRunning = false;
    logger.info('Mock event consumer stopped');
  }

  onUserCreated(handler: (event: UserCreatedEvent) => Promise<void>): void {
    this.userCreatedHandlers.push(handler);
    logger.info('User created handler registered');
  }

  // Manual trigger for testing
  async triggerUserCreated(event: UserCreatedEvent): Promise<void> {
    logger.info('Triggering user.created event (mock)', { userId: event.userId });
    for (const handler of this.userCreatedHandlers) {
      try {
        await handler(event);
      } catch (error) {
        logger.error('Error handling user.created event', { error });
      }
    }
  }
}

