// import { IEventPublisher } from '../../domain/repositories/IEventPublisher';
import { OCIStreamingEventPublisher } from './OCIStreamingEventPublisher';
import { createLogger } from '../logging/logger';

const logger = createLogger();

/**
 * SNSEventPublisher - Legacy class name for backward compatibility
 * Now uses OCI Streaming exclusively
 * Note: This is a compatibility alias only - the service uses OCI Streaming
 */
export class SNSEventPublisher extends OCIStreamingEventPublisher {
  constructor() {
    super();
    logger.info('SNSEventPublisher is using OCI Streaming (backward compatibility alias)');
  }
}
