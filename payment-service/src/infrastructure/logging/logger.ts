import winston from 'winston';
import { getConfig } from '../config/config-provider';

const config = getConfig();

const logFormat = winston.format.printf(({ level, message, timestamp, stack, requestId, ...metadata }) => {
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
  return winston.createLogger({
    level: config.logging?.level || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      logFormat
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        ),
      }),
    ],
  });
}

