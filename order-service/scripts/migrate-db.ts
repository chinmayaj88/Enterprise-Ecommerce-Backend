#!/usr/bin/env ts-node

/**
 * Database migration script
 * Run with: npm run migrate-db
 */

import { execSync } from 'child_process';
import { createLogger } from '../src/infrastructure/logging/logger';

const logger = createLogger();

try {
  logger.info('Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  logger.info('Database migrations completed successfully');
} catch (error) {
  logger.error('Database migration failed', { error });
  process.exit(1);
}

