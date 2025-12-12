# Payment Service

**Payment Processing Service for E-commerce Platform**

The Payment Service handles payment processing, payment methods, refunds, and webhooks. It integrates with Stripe and PayPal payment providers, processes webhooks, and manages payment lifecycle.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

The Payment Service is responsible for:

- **Payment Processing**: Process payments via Stripe, PayPal, or mock provider
- **Payment Methods**: Manage payment methods (credit cards, etc.)
- **Refunds**: Process refunds for payments
- **Webhooks**: Process webhooks from payment providers (Stripe, PayPal)
- **Event Consumption**: Consume order events (order.created, order.cancelled)
- **Idempotency**: Ensure payment operations are idempotent
- **Encryption**: Encrypt sensitive payment data
- **Audit Logging**: Log all payment operations for compliance

### Key Features

- ✅ **Multiple Payment Providers**: Stripe, PayPal, and Mock provider support
- ✅ **Payment Processing**: Secure payment processing with retry logic
- ✅ **Payment Methods**: Store and manage payment methods
- ✅ **Refunds**: Full and partial refund support
- ✅ **Webhooks**: Secure webhook processing with signature verification
- ✅ **Event-Driven**: Consumes order events from OCI Queue
- ✅ **Idempotency**: Prevents duplicate payments
- ✅ **Encryption**: Encrypts sensitive payment data at rest
- ✅ **Audit Logging**: Comprehensive audit trail for compliance
- ✅ **Circuit Breakers**: Resilient payment provider communication
- ✅ **Retry Logic**: Automatic retry for failed operations
- ✅ **Redis Caching**: Fast payment retrieval with Redis
- ✅ **Prometheus Metrics**: Comprehensive metrics for monitoring

## Architecture

### High-Level Architecture

```
Client Request
    ↓
Payment Service (Port 3005)
    ├── Authentication Middleware (JWT validation)
    ├── Rate Limiting Middleware
    ├── Request Validation Middleware
    ├── Metrics Middleware
    ├── HTTPS Enforcement (Production)
    └── Route Handler
         └── Payment Controller
             ├── Create Payment Use Case
             ├── Process Payment Use Case
             ├── Refund Payment Use Case
             ├── Get Payment Use Case
             ├── Create Payment Method Use Case
             └── Process Webhook Use Case
    ↓
Infrastructure Layer
    ├── Prisma (Database)
    ├── Redis (Cache)
    ├── Payment Providers (Stripe, PayPal, Mock)
    ├── Order Service Client (HTTP client)
    ├── Event Consumer (OCI Queue)
    └── Event Publisher (OCI Streaming)
```

### Code Structure

```
payment-service/
├── src/
│   ├── index.ts                    # Application entry point
│   ├── config/
│   │   └── env.ts                  # Environment configuration with Zod validation
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication middleware
│   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   ├── requestId.middleware.ts # Request ID generation
│   │   ├── validator.middleware.ts # Request validation
│   │   ├── prometheus.middleware.ts # Prometheus metrics
│   │   ├── errorHandler.middleware.ts # Error handling
│   │   ├── httpsEnforcement.middleware.ts # HTTPS enforcement
│   │   └── webhookSecurity.middleware.ts # Webhook security
│   ├── routes/
│   │   └── payment.routes.ts       # Payment routes
│   ├── application/
│   │   ├── controllers/
│   │   │   └── PaymentController.ts # Payment endpoints controller
│   │   └── utils/
│   │       └── response.util.ts    # Response utilities
│   ├── core/
│   │   ├── entities/               # Domain entities
│   │   │   ├── Payment.ts
│   │   │   ├── PaymentMethod.ts
│   │   │   ├── PaymentTransaction.ts
│   │   │   ├── Refund.ts
│   │   │   └── PaymentWebhook.ts
│   │   └── use-cases/              # Business logic
│   │       ├── CreatePaymentUseCase.ts
│   │       ├── ProcessPaymentUseCase.ts
│   │       ├── RefundPaymentUseCase.ts
│   │       ├── GetPaymentUseCase.ts
│   │       ├── CreatePaymentMethodUseCase.ts
│   │       ├── GetPaymentMethodsUseCase.ts
│   │       ├── ProcessWebhookUseCase.ts
│   │       ├── HandleOrderCreatedEventUseCase.ts
│   │       └── HandleOrderCancelledEventUseCase.ts
│   ├── infrastructure/
│   │   ├── database/                # Prisma repositories
│   │   │   ├── PrismaPaymentRepository.ts
│   │   │   ├── PrismaPaymentMethodRepository.ts
│   │   │   ├── PrismaPaymentTransactionRepository.ts
│   │   │   ├── PrismaRefundRepository.ts
│   │   │   ├── PrismaPaymentWebhookRepository.ts
│   │   │   └── PrismaIdempotencyRepository.ts
│   │   ├── cache/
│   │   │   └── RedisCache.ts       # Redis cache implementation
│   │   ├── clients/
│   │   │   └── OrderServiceClient.ts # Order service HTTP client
│   │   ├── providers/
│   │   │   ├── PaymentProviderFactory.ts
│   │   │   ├── StripePaymentProvider.ts
│   │   │   ├── PayPalPaymentProvider.ts
│   │   │   └── MockPaymentProvider.ts
│   │   ├── events/
│   │   │   ├── OCIStreamingEventPublisher.ts # Event publishing
│   │   │   ├── SNSEventPublisher.ts # Legacy alias
│   │   │   ├── OCIQueueEventConsumer.ts # Event consumption
│   │   │   ├── SQSEventConsumer.ts # Legacy alias
│   │   │   ├── MockEventPublisher.ts
│   │   │   ├── MockEventConsumer.ts
│   │   │   ├── EventPublisherFactory.ts
│   │   │   └── EventConsumerFactory.ts
│   │   ├── encryption/
│   │   │   └── EncryptionService.ts # Data encryption
│   │   ├── audit/
│   │   │   └── AuditLogger.ts      # Audit logging
│   │   ├── utils/
│   │   │   ├── circuitBreaker.util.ts # Circuit breaker
│   │   │   └── retry.util.ts       # Retry logic
│   │   ├── logging/
│   │   │   └── logger.ts           # Winston logger
│   │   ├── metrics/
│   │   │   └── PrometheusMetrics.ts # Prometheus metrics
│   │   └── health/
│   │       └── healthCheck.ts      # Health check implementation
│   ├── ports/
│   │   └── interfaces/             # Port interfaces (dependency inversion)
│   │       ├── IPaymentRepository.ts
│   │       ├── IPaymentMethodRepository.ts
│   │       ├── IPaymentTransactionRepository.ts
│   │       ├── IRefundRepository.ts
│   │       ├── IPaymentWebhookRepository.ts
│   │       ├── IPaymentProvider.ts
│   │       ├── IOrderServiceClient.ts
│   │       ├── IEventPublisher.ts
│   │       └── IEventConsumer.ts
│   └── di/
│       └── container.ts            # Dependency injection container
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seed script (if exists)
├── openapi.yaml                     # OpenAPI 3.0 specification
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── Dockerfile                       # Docker build configuration
├── docker-compose.yml               # Local development environment
└── README.md                        # This file
```

### Design Patterns

#### 1. Clean Architecture / Hexagonal Architecture

The codebase follows Clean Architecture principles:

- **Core Layer**: Business logic (entities, use cases) - no dependencies on infrastructure
- **Application Layer**: Controllers and application-specific logic
- **Infrastructure Layer**: External dependencies (database, cache, payment providers)
- **Ports**: Interfaces that define contracts between layers

#### 2. Dependency Injection

The `Container` class manages all dependencies:
- Creates and manages singleton instances
- Resolves dependencies automatically
- Provides lifecycle management (dispose on shutdown)

#### 3. Repository Pattern

Data access is abstracted through repository interfaces:
- `IPaymentRepository` - Payment data access
- `IPaymentMethodRepository` - Payment method storage
- And more...

#### 4. Use Case Pattern

Business logic is encapsulated in use cases:
- Each use case handles one specific operation
- Use cases are testable in isolation
- Clear separation of concerns

#### 5. Strategy Pattern

Payment providers use the Strategy pattern:
- `IPaymentProvider` interface
- Multiple implementations (Stripe, PayPal, Mock)
- Factory pattern for provider selection

#### 6. Circuit Breaker Pattern

Service calls use circuit breakers for resilience:
- Prevents cascading failures
- Automatic retry with exponential backoff
- Graceful degradation

## Getting Started

### Prerequisites

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 16 (or Docker for local development)
- **Redis** (optional, for caching)
- **Stripe Account** (for Stripe payments)
- **PayPal Account** (for PayPal payments)
- **Order Service** (for order information)
- **Docker** (optional, for containerized development)

### Installation

```bash
# Clone the repository
cd payment-service

# Install dependencies
npm install

# Or use Make
make install
```

### Database Setup

1. **Create database**:
   ```bash
   # Using PostgreSQL CLI
   createdb payment_service_db

   # Or using Docker
   docker run --name payment-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=payment_service_db -p 5432:5432 -d postgres:16-alpine
   ```

2. **Configure environment**:
   ```bash
   cp env.txt .env
   # Edit .env with your database URL
   ```

3. **Run migrations**:
   ```bash
   npm run prisma:migrate
   # Or
   make migrate
   ```

### Configuration

1. **Copy environment template**:
   ```bash
   cp env.txt .env
   ```

2. **Edit `.env` file** with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/payment_service_db

   # Service URLs
   ORDER_SERVICE_URL=http://localhost:3004

   # Payment Providers
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=sandbox  # or 'live'
   PAYPAL_WEBHOOK_ID=...

   # Encryption
   ENCRYPTION_KEY=your-32-character-encryption-key

   # Redis (optional)
   REDIS_URL=redis://localhost:6379

   # OCI Streaming (for event publishing)
   OCI_STREAM_ID=ocid1.stream.oc1...
   OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
   OCI_REGION=IN-HYDERABAD-1

   # OCI Queue (for event consumption)
   OCI_QUEUE_ID=ocid1.queue.oc1...

   # Environment
   NODE_ENV=development
   PORT=3005
   LOG_LEVEL=info
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   ```

3. **Verify configuration**:
   ```bash
   npm run build
   ```

### Development

```bash
# Start development server with hot reload
npm run dev

# Or use Make
make dev
```

The service will start on `http://localhost:3005` (or the port specified in `.env`).

### Docker Development

```bash
# Start with Docker Compose (includes PostgreSQL and Redis)
docker-compose up -d

# View logs
docker-compose logs -f payment-service

# Stop
docker-compose down
```

## Project Structure

### Core Domain Entities

- **Payment**: Payment information (amount, status, provider, etc.)
- **PaymentMethod**: Stored payment methods (credit cards, etc.)
- **PaymentTransaction**: Individual payment transactions
- **Refund**: Refund information
- **PaymentWebhook**: Webhook events from payment providers

### Use Cases

#### Payment Management

- **CreatePaymentUseCase**: Create payment record
- **ProcessPaymentUseCase**: Process payment via provider
- **RefundPaymentUseCase**: Process refund (full or partial)
- **GetPaymentUseCase**: Get payment by ID or order ID

#### Payment Methods

- **CreatePaymentMethodUseCase**: Add payment method
- **GetPaymentMethodsUseCase**: Get user's payment methods

#### Webhooks

- **ProcessWebhookUseCase**: Process webhook from payment provider

#### Event Handling

- **HandleOrderCreatedEventUseCase**: Handle order.created event
- **HandleOrderCancelledEventUseCase**: Handle order.cancelled event

### Payment Providers

- **StripePaymentProvider**: Stripe integration
- **PayPalPaymentProvider**: PayPal integration
- **MockPaymentProvider**: Mock provider for testing

## Configuration

### Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `ORDER_SERVICE_URL` | Order service URL | `http://localhost:3004` |
| `JWT_SECRET` | JWT secret for authentication | `your-super-secret-key-32-chars-min` |
| `ENCRYPTION_KEY` | Encryption key (32 characters) | `your-32-character-encryption-key` |

#### Payment Provider Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `PAYPAL_CLIENT_ID` | PayPal client ID | `...` |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | `...` |
| `PAYPAL_MODE` | PayPal mode (sandbox/live) | `sandbox` |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID | `...` |

#### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment (development, staging, production, test) |
| `PORT` | `3005` | Port to listen on |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `REDIS_URL` | - | Redis connection URL for caching |
| `OCI_STREAM_ID` | - | OCI Streaming ID for event publishing |
| `OCI_QUEUE_ID` | - | OCI Queue ID for event consumption |
| `OCI_COMPARTMENT_ID` | - | OCI Compartment ID |
| `OCI_REGION` | `IN-HYDERABAD-1` | OCI region |
| `EVENT_PUBLISHER_TYPE` | `mock` | Event publisher type (mock, oci-streaming) |
| `EVENT_CONSUMER_TYPE` | `mock` | Event consumer type (mock, oci-queue) |
| `ALLOWED_ORIGINS` | `*` (dev) | Comma-separated CORS origins |

See `env.txt` for all available options.

## Development

### Available Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:migrate:deploy # Deploy migrations (production)
npm run prisma:studio    # Open Prisma Studio

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
```

### Using Make

```bash
make help          # Show all available commands
make install       # Install dependencies
make build         # Build the service
make dev           # Start development server
make test          # Run tests
make lint          # Lint code
make migrate       # Run database migrations
make clean         # Clean build artifacts
make docker-up     # Start with docker-compose
make docker-down   # Stop docker-compose
```

### Development Workflow

1. **Start database and Redis** (if using Docker):
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Start order-service** (required for order information):
   ```bash
   # In order-service directory
   npm run dev
   ```

3. **Run migrations**:
   ```bash
   npm run prisma:migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Test endpoints**: Use Swagger UI at `http://localhost:3005/api-docs`

### Hot Reload

The development server uses `ts-node-dev` which automatically restarts on file changes.

## API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3005/api-docs`
- **OpenAPI Spec**: `http://localhost:3005/api-docs/openapi.yaml`

### Payment Endpoints

#### `POST /api/v1/payments`

Create a new payment.

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "orderId": "order-123",
  "paymentMethodId": "pm_123",
  "amount": 99.99,
  "currency": "USD",
  "description": "Payment for order #12345"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "pay_123",
    "orderId": "order-123",
    "userId": "user-123",
    "status": "PENDING",
    "paymentProvider": "STRIPE",
    "amount": 99.99,
    "currency": "USD",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `POST /api/v1/payments/:paymentId/process`

Process payment.

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "paymentIntentId": "pi_123"  // For Stripe
}
```

#### `POST /api/v1/payments/:paymentId/refund`

Refund payment (full or partial).

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "amount": 50.00,  // Optional, for partial refund
  "reason": "Customer requested refund"
}
```

#### `GET /api/v1/payments/:paymentId`

Get payment by ID.

**Headers**: `Authorization: Bearer <accessToken>`

#### `GET /api/v1/orders/:orderId/payment`

Get payment by order ID.

**Headers**: `Authorization: Bearer <accessToken>`

#### `GET /api/v1/payments`

Get payments by user ID with filtering and pagination.

**Headers**: `Authorization: Bearer <accessToken>`

**Query Parameters**:
- `status` (optional): Filter by payment status
- `limit` (optional): Number of payments per page
- `offset` (optional): Offset for pagination

### Payment Method Endpoints

#### `POST /api/v1/payment-methods`

Create payment method.

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "type": "credit_card",
  "provider": "stripe",
  "token": "tok_visa"  // Payment method token from provider
}
```

#### `GET /api/v1/payment-methods`

Get user's payment methods.

**Headers**: `Authorization: Bearer <accessToken>`

### Webhook Endpoints

#### `POST /api/v1/webhooks`

Process webhook from payment provider.

**Note**: This endpoint does not require authentication. It is secured by:
- IP whitelist verification
- Signature verification (Stripe, PayPal)
- Rate limiting

**Request Headers**:
- `stripe-signature` (for Stripe webhooks)
- `paypal-transmission-id`, `paypal-cert-url`, `paypal-auth-algo`, `paypal-transmission-sig`, `paypal-transmission-time` (for PayPal webhooks)

See `openapi.yaml` for complete API documentation.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Tests are located in `src/__tests__/`:

- `routes/` - Route tests
- `middleware/` - Middleware tests
- `use-cases/` - Use case tests
- `providers/` - Payment provider tests

### Writing Tests

Tests use Jest and Supertest. Example:

```typescript
import request from 'supertest';
import app from '../../index';

describe('Payment Endpoints', () => {
  it('should create payment', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', 'Bearer valid-token')
      .send({
        orderId: 'order-123',
        amount: 99.99,
        currency: 'USD'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('data');
  });
});
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters, randomly generated)
- [ ] Use strong `ENCRYPTION_KEY` (exactly 32 characters, randomly generated)
- [ ] Configure production database URL
- [ ] Set up Redis for caching
- [ ] Configure Stripe live keys
- [ ] Configure PayPal live credentials
- [ ] Configure webhook secrets
- [ ] Configure HTTPS enforcement
- [ ] Configure proper logging level
- [ ] Set up monitoring and alerting (Prometheus)
- [ ] Configure health check endpoints for Kubernetes
- [ ] Set up SSL/TLS certificates
- [ ] Configure OCI Streaming for event publishing
- [ ] Configure OCI Queue for event consumption
- [ ] Review and adjust rate limits
- [ ] Configure webhook IP whitelist

### Docker Deployment

```bash
# Build Docker image
docker build -t payment-service:latest .

# Run container
docker run -p 3005:3005 --env-file .env payment-service:latest
```

### Kubernetes Deployment

The payment service is deployed via Helm charts. See the infrastructure repository for deployment configurations.

### Environment-Specific Configuration

- **Development**: Local database, mock payment provider, mock event publisher/consumer, verbose logging
- **Staging**: Production-like database, Stripe/PayPal sandbox, OCI Streaming/Queue, moderate logging
- **Production**: Production database, Stripe/PayPal live, OCI Streaming/Queue, error-level logging, Redis caching, HTTPS enforcement

## How the Code is Architected

### Clean Architecture Principles

The codebase follows Clean Architecture:

1. **Independence**: Business logic is independent of frameworks, UI, and infrastructure
2. **Testability**: Business logic can be tested without external dependencies
3. **Independence of UI**: Business logic doesn't depend on Express or HTTP
4. **Independence of Database**: Business logic doesn't depend on Prisma or PostgreSQL
5. **Independence of External Services**: Business logic doesn't depend on Stripe, PayPal, Redis, etc.

### Dependency Rule

Dependencies point inward:
- Infrastructure depends on Application
- Application depends on Core
- Core depends on nothing

### Layers

1. **Core Layer** (`src/core/`):
   - Entities: Domain objects
   - Use Cases: Business logic
   - No dependencies on external frameworks

2. **Application Layer** (`src/application/`):
   - Controllers: Handle HTTP requests
   - DTOs: Data transfer objects
   - Depends on Core

3. **Infrastructure Layer** (`src/infrastructure/`):
   - Database: Prisma repositories
   - Cache: Redis implementation
   - External Services: Payment providers, HTTP clients, event publishers/consumers
   - Security: Encryption, audit logging
   - Utilities: Circuit breakers, retry logic
   - Depends on Core (implements interfaces)

4. **Ports** (`src/ports/`):
   - Interfaces: Define contracts
   - Used by Core and implemented by Infrastructure

### Dependency Injection

The `Container` class:
- Manages all dependencies
- Creates singleton instances
- Resolves dependencies automatically
- Provides lifecycle management

### Repository Pattern

Data access is abstracted:
- Interfaces in `ports/interfaces/`
- Implementations in `infrastructure/database/`
- Use cases depend on interfaces, not implementations

### Strategy Pattern

Payment providers use the Strategy pattern:
- `IPaymentProvider` interface
- Multiple implementations (Stripe, PayPal, Mock)
- Factory pattern for provider selection

### Circuit Breaker Pattern

Service calls use circuit breakers:
- Prevents cascading failures
- Automatic retry with exponential backoff
- Graceful degradation when services are down

### Event-Driven Architecture

The service:
- **Publishes events** to OCI Streaming:
  - `payment.created`
  - `payment.processed`
  - `payment.failed`
  - `payment.refunded`
- **Consumes events** from OCI Queue:
  - `order.created` - Create payment for order
  - `order.cancelled` - Cancel payment if not processed

### Security Features

- **HTTPS Enforcement**: Enforces HTTPS in production
- **Webhook Security**: IP whitelist and signature verification
- **Data Encryption**: Encrypts sensitive payment data at rest
- **Audit Logging**: Logs all payment operations for compliance
- **Idempotency**: Prevents duplicate payments

## Troubleshooting

### Common Issues

#### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Verify database exists
- Check network connectivity

#### Payment Provider Errors

- Verify provider credentials are correct
- Check provider API status
- Verify webhook secrets are correct
- Check network connectivity to provider

#### Encryption Errors

- Verify `ENCRYPTION_KEY` is exactly 32 characters
- Ensure encryption key is consistent across deployments
- Check encryption service initialization

#### Webhook Errors

- Verify webhook IP whitelist is configured
- Check webhook signature verification
- Verify webhook endpoint is accessible
- Check webhook rate limiting

### Debugging

1. **Enable debug logging**: Set `LOG_LEVEL=debug` in `.env`
2. **Check database**: Use Prisma Studio (`npm run prisma:studio`)
3. **Check Redis**: Use Redis CLI to inspect cache
4. **Review logs**: Check application logs for errors
5. **Check audit logs**: Review audit logs for payment operations
6. **Test webhooks**: Use Stripe CLI or PayPal webhook simulator

## Related Services

This service integrates with:

- **Gateway Service** (3000) - API gateway for routing
- **Order Service** (3004) - Order information for payments
- **Notification Service** (3007) - Payment notifications
- **Stripe** - Payment processing
- **PayPal** - Payment processing

## License

MIT
