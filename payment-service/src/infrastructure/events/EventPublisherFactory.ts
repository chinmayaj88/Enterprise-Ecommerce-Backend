import { IEventPublisher } from '../../domain/repositories/IEventPublisher';
import { MockEventPublisher } from './MockEventPublisher';
import { OCIStreamingEventPublisher } from './OCIStreamingEventPublisher';
import { getConfig } from '../config/config-provider';

export function createEventPublisher(): IEventPublisher {
  const config = getConfig();
  const publisherType: string = config.events?.publisherType || 'mock';

  if (publisherType === 'oci-streaming' || publisherType === 'sns') {
    // Support 'sns' as alias for 'oci-streaming' for backward compatibility
    // Note: 'sns' is just an alias - the service uses OCI Streaming exclusively
    return new OCIStreamingEventPublisher();
  }

  return new MockEventPublisher();
}

