import { IEventPublisher } from './IEventPublisher';
import { MockEventPublisher } from './MockEventPublisher';
import { OCIStreamingEventPublisher } from './OCIStreamingEventPublisher';

export function createEventPublisher(): IEventPublisher {
  const publisherType: string = process.env.EVENT_PUBLISHER_TYPE || 'mock';

  if (publisherType === 'oci-streaming' || publisherType === 'sns') {
    // Support 'sns' as alias for 'oci-streaming' for backward compatibility
    // Note: 'sns' is just an alias - the service uses OCI Streaming exclusively
    return new OCIStreamingEventPublisher();
  }

  return new MockEventPublisher();
}

