import { createApp } from './app';
import { getConfig } from './infrastructure/config/config-provider';
import { createLogger } from './infrastructure/logging/logger';

const logger = createLogger();
const config = getConfig();
const { app, container } = createApp();

const PORT = config.server.port;

let server: any = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`Cart service started on port ${PORT}`, {
      environment: config.server.env,
      port: PORT,
      productServiceUrl: config.services.product,
    });
  });

  const requestTimeoutMs = config.server.requestTimeout || 30000;
  server.timeout = requestTimeoutMs;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

const shutdownTimeout = config.server.shutdownTimeout || 30000;

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully`);

  if (!server) {
    process.exit(0);
    return;
  }

  const shutdownTimer = setTimeout(() => {
    logger.error('Shutdown timeout reached, forcing exit');
    process.exit(1);
  }, shutdownTimeout);

  try {
    server.close(async () => {
      logger.info('HTTP server closed');

      // Disconnect from database
      await container.disconnect();

      clearTimeout(shutdownTimer);
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });

    // Backup timeout
    setTimeout(() => {
      logger.error('Server close timeout, forcing exit');
      clearTimeout(shutdownTimer);
      process.exit(1);
    }, shutdownTimeout - 1000);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error });
    clearTimeout(shutdownTimer);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled errors
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

export default app;

