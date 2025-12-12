import { IEventConsumer } from '../../domain/repositories/IEventConsumer';
import { MockEventConsumer } from './MockEventConsumer';
import { SQSEventConsumer } from './SQSEventConsumer';
import { getConfig } from '../config/config-provider';

export function createEventConsumer(): IEventConsumer {
  const config = getConfig();
  const consumerType: string = config.events?.consumerType || 'mock';

  if (consumerType === 'oci-queue' || consumerType === 'sqs') {
    // Support 'sqs' as alias for 'oci-queue' for backward compatibility
    // Note: 'sqs' is just an alias - the service uses OCI Queue exclusively
    return new SQSEventConsumer();
  }

  return new MockEventConsumer();
}

