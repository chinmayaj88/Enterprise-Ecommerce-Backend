import { IEventConsumer } from '../../domain/repositories/IEventConsumer';
import { getConfig } from '../config/config-provider';
import { OCIQueueEventConsumer } from './OCIQueueEventConsumer';
import { MockEventConsumer } from './MockEventConsumer';

export function createEventConsumer(): IEventConsumer {
  const config = getConfig();
  const consumerType = config.eventing?.consumerType || 'mock';

  if (consumerType === 'oci' || consumerType === 'oci-queue') {
    return new OCIQueueEventConsumer();
  }

  return new MockEventConsumer();
}

