/**
 * Migration script to copy files from old structure to new clean architecture structure
 * Run with: ts-node scripts/migrate-files.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const OLD_SERVICE_PATH = path.join(__dirname, '../../order-service/src');
const NEW_SERVICE_PATH = path.join(__dirname, '../src');

// File mapping: old path -> new path
const FILE_MAPPINGS: Array<{ from: string; to: string; updateImports?: boolean }> = [
  // Application layer
  {
    from: 'application/controllers/OrderController.ts',
    to: 'application/use-cases/OrderController.ts',
    updateImports: true,
  },
  {
    from: 'application/utils/response.util.ts',
    to: 'application/dto/response.util.ts',
    updateImports: true,
  },
  
  // Infrastructure - DB
  {
    from: 'infrastructure/database/PrismaOrderRepository.ts',
    to: 'infrastructure/db/PrismaOrderRepository.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/database/PrismaOrderItemRepository.ts',
    to: 'infrastructure/db/PrismaOrderItemRepository.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/database/PrismaOrderNoteRepository.ts',
    to: 'infrastructure/db/PrismaOrderNoteRepository.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/database/PrismaOrderShippingAddressRepository.ts',
    to: 'infrastructure/db/PrismaOrderShippingAddressRepository.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/database/PrismaOrderStatusHistoryRepository.ts',
    to: 'infrastructure/db/PrismaOrderStatusHistoryRepository.ts',
    updateImports: true,
  },
  
  // Infrastructure - Clients (these should be in a clients folder or similar)
  {
    from: 'infrastructure/clients/CartServiceClient.ts',
    to: 'infrastructure/clients/CartServiceClient.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/clients/ProductServiceClient.ts',
    to: 'infrastructure/clients/ProductServiceClient.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/clients/UserServiceClient.ts',
    to: 'infrastructure/clients/UserServiceClient.ts',
    updateImports: true,
  },
  
  // Infrastructure - Other
  {
    from: 'infrastructure/cache/RedisCache.ts',
    to: 'infrastructure/cache/RedisCache.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/logging/logger.ts',
    to: 'infrastructure/logging/logger.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/metrics/PrometheusMetrics.ts',
    to: 'infrastructure/metrics/PrometheusMetrics.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/health/healthCheck.ts',
    to: 'infrastructure/health/healthCheck.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/events/EventPublisherFactory.ts',
    to: 'infrastructure/messaging/EventPublisherFactory.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/events/MockEventPublisher.ts',
    to: 'infrastructure/messaging/MockEventPublisher.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/events/SNSEventPublisher.ts',
    to: 'infrastructure/messaging/SNSEventPublisher.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/events/OCIStreamingEventPublisher.ts',
    to: 'infrastructure/messaging/OCIStreamingEventPublisher.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/utils/circuitBreaker.util.ts',
    to: 'infrastructure/utils/circuitBreaker.util.ts',
    updateImports: true,
  },
  {
    from: 'infrastructure/utils/retry.util.ts',
    to: 'infrastructure/utils/retry.util.ts',
    updateImports: true,
  },
  {
    from: 'config/env.ts',
    to: 'infrastructure/config/env.ts',
    updateImports: true,
  },
  
  // Interfaces - HTTP
  {
    from: 'routes/order.routes.ts',
    to: 'interfaces/http/routes/order.routes.ts',
    updateImports: true,
  },
  {
    from: 'middleware/auth.middleware.ts',
    to: 'interfaces/http/middleware/auth.middleware.ts',
    updateImports: true,
  },
  {
    from: 'middleware/errorHandler.middleware.ts',
    to: 'interfaces/http/middleware/errorHandler.middleware.ts',
    updateImports: true,
  },
  {
    from: 'middleware/prometheus.middleware.ts',
    to: 'interfaces/http/middleware/prometheus.middleware.ts',
    updateImports: true,
  },
  {
    from: 'middleware/rateLimiter.middleware.ts',
    to: 'interfaces/http/middleware/rateLimiter.middleware.ts',
    updateImports: true,
  },
  {
    from: 'middleware/requestId.middleware.ts',
    to: 'interfaces/http/middleware/requestId.middleware.ts',
    updateImports: true,
  },
  {
    from: 'middleware/validator.middleware.ts',
    to: 'interfaces/http/middleware/validator.middleware.ts',
    updateImports: true,
  },
  
  // DI
  {
    from: 'di/container.ts',
    to: 'di/container.ts',
    updateImports: true,
  },
];

// Import path replacements
const IMPORT_REPLACEMENTS: Array<{ from: RegExp; to: string }> = [
  // Domain layer
  { from: /from ['"]\.\.\/\.\.\/core\/entities\//g, to: "from '../../domain/entities/" },
  { from: /from ['"]\.\.\/core\/entities\//g, to: "from '../domain/entities/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/core\/entities\//g, to: "from '../../../domain/entities/" },
  
  // Repositories
  { from: /from ['"]\.\.\/\.\.\/ports\/interfaces\/IOrderRepository['"]/g, to: "from '../../domain/repositories/IOrderRepository'" },
  { from: /from ['"]\.\.\/ports\/interfaces\/IOrderRepository['"]/g, to: "from '../domain/repositories/IOrderRepository'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/ports\/interfaces\/IOrderRepository['"]/g, to: "from '../../../domain/repositories/IOrderRepository'" },
  
  { from: /from ['"]\.\.\/\.\.\/ports\/interfaces\/IOrderItemRepository['"]/g, to: "from '../../domain/repositories/IOrderItemRepository'" },
  { from: /from ['"]\.\.\/ports\/interfaces\/IOrderItemRepository['"]/g, to: "from '../domain/repositories/IOrderItemRepository'" },
  
  { from: /from ['"]\.\.\/\.\.\/ports\/interfaces\/IOrderNoteRepository['"]/g, to: "from '../../domain/repositories/IOrderNoteRepository'" },
  { from: /from ['"]\.\.\/ports\/interfaces\/IOrderNoteRepository['"]/g, to: "from '../domain/repositories/IOrderNoteRepository'" },
  
  { from: /from ['"]\.\.\/\.\.\/ports\/interfaces\/IOrderShippingAddressRepository['"]/g, to: "from '../../domain/repositories/IOrderShippingAddressRepository'" },
  { from: /from ['"]\.\.\/ports\/interfaces\/IOrderShippingAddressRepository['"]/g, to: "from '../domain/repositories/IOrderShippingAddressRepository'" },
  
  { from: /from ['"]\.\.\/\.\.\/ports\/interfaces\/IOrderStatusHistoryRepository['"]/g, to: "from '../../domain/repositories/IOrderStatusHistoryRepository'" },
  { from: /from ['"]\.\.\/ports\/interfaces\/IOrderStatusHistoryRepository['"]/g, to: "from '../domain/repositories/IOrderStatusHistoryRepository'" },
  
  // Use cases
  { from: /from ['"]\.\.\/\.\.\/core\/use-cases\//g, to: "from '../../application/use-cases/" },
  { from: /from ['"]\.\.\/core\/use-cases\//g, to: "from '../application/use-cases/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/core\/use-cases\//g, to: "from '../../../application/use-cases/" },
  
  // Services
  { from: /from ['"]\.\.\/\.\.\/core\/services\//g, to: "from '../../domain/services/" },
  { from: /from ['"]\.\.\/core\/services\//g, to: "from '../domain/services/" },
  
  // Config
  { from: /from ['"]\.\.\/\.\.\/config\/env['"]/g, to: "from '../../infrastructure/config/env'" },
  { from: /from ['"]\.\.\/config\/env['"]/g, to: "from '../infrastructure/config/env'" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/config\/env['"]/g, to: "from '../../../infrastructure/config/env'" },
  
  // Infrastructure
  { from: /from ['"]\.\.\/\.\.\/infrastructure\/database\//g, to: "from '../../infrastructure/db/" },
  { from: /from ['"]\.\.\/infrastructure\/database\//g, to: "from '../infrastructure/db/" },
  
  { from: /from ['"]\.\.\/\.\.\/infrastructure\/events\//g, to: "from '../../infrastructure/messaging/" },
  { from: /from ['"]\.\.\/infrastructure\/events\//g, to: "from '../infrastructure/messaging/" },
  
  // Middleware
  { from: /from ['"]\.\.\/\.\.\/middleware\//g, to: "from '../../interfaces/http/middleware/" },
  { from: /from ['"]\.\.\/middleware\//g, to: "from '../interfaces/http/middleware/" },
  { from: /from ['"]\.\.\/\.\.\/\.\.\/middleware\//g, to: "from '../../../interfaces/http/middleware/" },
  
  // Routes
  { from: /from ['"]\.\.\/routes\//g, to: "from '../interfaces/http/routes/" },
  { from: /from ['"]\.\.\/\.\.\/routes\//g, to: "from '../../interfaces/http/routes/" },
  
  // Application
  { from: /from ['"]\.\.\/\.\.\/application\/controllers\//g, to: "from '../../application/use-cases/" },
  { from: /from ['"]\.\.\/application\/controllers\//g, to: "from '../application/use-cases/" },
  { from: /from ['"]\.\.\/\.\.\/application\/utils\//g, to: "from '../../application/dto/" },
  { from: /from ['"]\.\.\/application\/utils\//g, to: "from '../application/dto/" },
];

function updateImports(content: string): string {
  let updated = content;
  for (const replacement of IMPORT_REPLACEMENTS) {
    updated = updated.replace(replacement.from, replacement.to);
  }
  return updated;
}

function copyFile(from: string, to: string, updateImports: boolean = false): void {
  const fullFrom = path.join(OLD_SERVICE_PATH, from);
  const fullTo = path.join(NEW_SERVICE_PATH, to);
  
  if (!fs.existsSync(fullFrom)) {
    console.warn(`⚠️  Source file not found: ${fullFrom}`);
    return;
  }
  
  // Ensure destination directory exists
  const destDir = path.dirname(fullTo);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  let content = fs.readFileSync(fullFrom, 'utf-8');
  
  if (updateImports) {
    content = updateImports(content);
  }
  
  fs.writeFileSync(fullTo, content, 'utf-8');
  console.log(`✅ Copied: ${from} → ${to}`);
}

function main() {
  console.log('🚀 Starting file migration...\n');
  
  for (const mapping of FILE_MAPPINGS) {
    copyFile(mapping.from, mapping.to, mapping.updateImports);
  }
  
  console.log('\n✨ Migration complete!');
  console.log('\n⚠️  Note: You still need to manually:');
  console.log('   1. Create use-case files in application/use-cases/');
  console.log('   2. Create app.ts and server.ts');
  console.log('   3. Update DI container');
  console.log('   4. Create config files');
  console.log('   5. Create scripts');
  console.log('   6. Create tests');
  console.log('   7. Create CI/CD');
  console.log('   8. Create documentation');
}

if (require.main === module) {
  main();
}

export { copyFile, updateImports };

