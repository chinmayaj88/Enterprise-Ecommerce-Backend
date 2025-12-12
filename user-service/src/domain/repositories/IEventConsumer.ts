/**
 * Event Consumer Interface - Port
 * Defines the contract for consuming events from other services
 */

export interface UserCreatedEvent {
  userId: string;
  email: string;
  timestamp: string;
  source: string;
}

export interface IEventConsumer {
  /**
   * Start consuming events
   */
  start(): Promise<void>;
  
  /**
   * Stop consuming events
   */
  stop(): Promise<void>;
  
  /**
   * Subscribe to user.created event
   */
  onUserCreated(handler: (event: UserCreatedEvent) => Promise<void>): void;
}

