import winston from 'winston';
import { getConfig } from '../config/config-provider';

const config = getConfig();

export function createLogger() {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
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
      winston.format.json()
    ),
    transports,
    defaultMeta: { service: 'gateway-service' },
  });
}

