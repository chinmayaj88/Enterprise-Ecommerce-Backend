/**
 * Event Publisher Interface
 * Defines the contract for event publishing implementations
 */
export interface IEventPublisher {
  /**
   * Publish an event to a topic
   * @param topic - The topic/channel to publish to
   * @param event - The event data to publish
   */
  publish(topic: string, event: Record<string, unknown>): Promise<void>;
}

