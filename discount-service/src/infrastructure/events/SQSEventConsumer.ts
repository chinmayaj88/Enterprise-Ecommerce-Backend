import { IEventConsumer } from './IEventConsumer';
import { createLogger } from '../logging/logger';
import { OCIQueueEventConsumer } from './OCIQueueEventConsumer';

const logger = createLogger();

// Re-export OCI Queue Event Consumer as SQSEventConsumer for backward compatibility
// Note: This is a compatibility alias only - the service uses OCI Queue exclusively
export class SQSEventConsumer extends OCIQueueEventConsumer {
  constructor() {
    super();
    logger.info('SQSEventConsumer is using OCI Queue (backward compatibility alias)');
  }
}

