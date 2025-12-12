import winston from 'winston';
import { getConfig } from '../config/config-provider';

const config = getConfig();

const logFormat = winston.format.printf(({ level, message, timestamp, stack, requestId, ...metadata }: any) => {
  let logMessage = `${timestamp} [${level.toUpperCase()}]`;
  if (requestId) {
    logMessage += ` [Request-ID: ${requestId}]`;
  }
  logMessage += `: ${message}`;
  if (stack) {
    logMessage += `\n${stack}`;
  }
  if (Object.keys(metadata).length > 0) {
    logMessage += ` ${JSON.stringify(metadata)}`;
  }
  return logMessage;
});

export function createLogger() {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
  ];

  // Add file transports in production if LOG_DIR is set
  if (process.env.LOG_DIR && config.server.env === 'production') {
    const logDir = process.env.LOG_DIR;
    transports.push(
      new winston.transports.File({
        filename: `${logDir}/error.log`,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      new winston.transports.File({
        filename: `${logDir}/combined.log`,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  return winston.createLogger({
    level: config.logging?.level || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      logFormat
    ),
    transports,
    // Handle exceptions and rejections
    exceptionHandlers: transports,
    rejectionHandlers: transports,
    defaultMeta: { service: 'return-service' },
  });
}

