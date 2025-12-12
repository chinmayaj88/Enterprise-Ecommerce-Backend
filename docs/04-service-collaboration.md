<div align="center">

# 🔗 04 - Service Collaboration

[![Collaboration](https://img.shields.io/badge/Service-Collaboration-blue?style=for-the-badge)](.)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-green?style=flat-square)](.)
[![Communication](https://img.shields.io/badge/Pattern-Communication-orange?style=flat-square)](.)

**How independent services collaborate in the monorepo microservices architecture**

</div>

---

## Monorepo Architecture

**Each service is a directory within this monorepo:**
- `gateway-service/` - Service directory
- `auth-service/` - Service directory
- `user-service/` - Service directory
- ... and so on

**Services communicate via:**
- HTTP APIs (synchronous)
- Events (asynchronous via OCI Queue)
- No shared code or databases

## Service Independence

### What Makes Services Independent?

1. **Separate Directory**
   - Each service has its own directory in the monorepo
   - Own CI/CD pipeline
   - Can be developed and deployed independently

2. **Separate Database**
   - Each service has its own PostgreSQL database
   - No shared database tables
   - Own Prisma schema and migrations

3. **Separate Deployment**
   - Independent CI/CD pipelines
   - Can be deployed separately
   - Own Docker image and Kubernetes deployment

4. **Separate Team Ownership**
   - Teams can own specific services
   - Work independently without blocking others
   - Different release cycles

### Service Boundaries

```
┌─────────────────┐
│  Auth Service   │  ──► Own Directory
│  (auth-service/)│  ──► Own Database
│  Port: 3001     │  ──► Own Deployment
└─────────────────┘
         │
         │ HTTP/Events
         ▼
┌─────────────────┐
│  User Service   │  ──► Own Directory
│  (user-service/)│  ──► Own Database
│  Port: 3002     │  ──► Own Deployment
└─────────────────┘
```

## Service Communication Patterns

### 1. Synchronous Communication (HTTP)

**When to Use:**
- Immediate response required
- Request-response pattern
- Simple queries

**Example:**
```typescript
// Gateway Service calls Auth Service
const response = await fetch('http://auth-service:3001/api/v1/validate-token', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Configuration:**
Each service configures other service URLs in its `.env`:

```env
# Gateway Service .env
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
```

**Services Using HTTP:**
- Gateway → Auth (token validation)
- Gateway → All services (routing)
- Order → Product (check inventory)
- Order → Payment (process payment)

### 2. Asynchronous Communication (Events)

**When to Use:**
- Decoupled operations
- Eventual consistency acceptable
- Multiple subscribers needed

**Example:**
```typescript
// Order Service publishes event
await eventPublisher.publish('OrderCreated', {
  orderId: '123',
  userId: '456',
  total: 99.99
});

// Notification Service subscribes (in its own repo)
eventConsumer.subscribe('OrderCreated', async (event) => {
  await sendOrderConfirmationEmail(event.userId, event.orderId);
});
```

**Event Flow:**
```
Order Service (Repo) → OCI Queue → Notification Service (Repo)
                                    → Shipping Service (Repo)
                                    → Analytics Service (Repo)
```

### 3. Database Per Service Pattern

**Principle:**
- Each service owns its data
- No direct database access between services
- Data sharing via APIs or events

**Example:**
```
❌ BAD: User Service directly queries Order Service database
✅ GOOD: User Service calls Order Service API
✅ GOOD: Order Service publishes events, User Service subscribes
```

## Independent Development

### Working on a Single Service

You can develop a service completely independently:

```bash
# 1. Clone service repository
git clone <repo-url>/auth-service.git
cd auth-service

# 2. Start infrastructure (databases, Redis)
docker compose up -d

# 3. Setup service's database
npm run prisma:migrate

# 4. Start your service
npm run dev

# 5. Develop and test
npm test
```

**No need to:**
- Clone other service repositories
- Start other services
- Wait for other teams
- Coordinate deployments

### Service Dependencies

While services are independent, they may depend on others for functionality:

#### Direct Dependencies (HTTP)

```typescript
// Cart Service depends on Product Service
class CartService {
  async addItem(productId: string) {
    // Call Product Service API
    const product = await productServiceClient.getProduct(productId);
    // Use product data
  }
}
```

**Development Strategy:**
- Use mock/stub services during development
- Use contract testing to verify compatibility
- Document API contracts in OpenAPI specs

#### Event Dependencies

```typescript
// Notification Service listens to Order Service events
eventConsumer.subscribe('OrderCreated', handleOrderCreated);
```

**Development Strategy:**
- Use event mocks during development
- Test with OCI Queue (or local mock)
- Verify event contracts

### Mocking External Services

When developing a service that depends on others:

```typescript
// Create a mock client
class MockProductServiceClient {
  async getProduct(id: string) {
    return { id, name: 'Mock Product', price: 10.99 };
  }
}

// Use in development
const productClient = process.env.NODE_ENV === 'development'
  ? new MockProductServiceClient()
  : new ProductServiceClient();
```

## Independent Deployment

### CI/CD Pipeline

Each service has its own CI/CD pipeline in its repository:

```yaml
# .github/workflows/ci.yml (in auth-service repo)
name: Auth Service CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and test
        run: |
          npm install
          npm test
          npm run build
```

**Pipeline Steps:**
1. Build service
2. Run tests
3. Build Docker image
4. Push to container registry
5. Deploy to staging
6. Run integration tests
7. Deploy to production

### Deployment Strategy

**Blue-Green Deployment:**
- Deploy new version alongside old
- Switch traffic when ready
- Rollback by switching back

**Canary Deployment:**
- Deploy to small percentage
- Monitor metrics
- Gradually increase traffic

### Service Versioning

Services can be versioned independently:

```
Auth Service: v1.2.3
User Service: v2.0.1
Product Service: v1.5.0
```

**API Versioning:**
- Use URL versioning: `/api/v1/`, `/api/v2/`
- Maintain backward compatibility
- Deprecate old versions gradually

## Collaboration Patterns

### 1. API-First Development

**Process:**
1. Define API contract (OpenAPI spec) in service repository
2. Share OpenAPI spec with dependent services
3. Implement service
4. Verify contract compliance

**Example:**
```yaml
# auth-service/openapi.yaml
paths:
  /api/v1/validate-token:
    post:
      summary: Validate JWT token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                token:
                  type: string
      responses:
        '200':
          description: Token is valid
```

### 2. Event-Driven Collaboration

**Process:**
1. Define event schema in service repository
2. Publish event contract (documentation)
3. Implement publisher
4. Dependent services implement subscribers
5. Test event flow

**Example:**
```typescript
// Event Contract (documented in service README)
interface OrderCreatedEvent {
  eventType: 'OrderCreated';
  version: '1.0';
  timestamp: string;
  data: {
    orderId: string;
    userId: string;
    total: number;
    items: OrderItem[];
  };
}
```

### 3. Contract Testing

**Purpose:**
- Verify API contracts between services
- Catch breaking changes early
- Enable independent deployment

**Tools:**
- Pact (contract testing framework)
- Postman/Newman (API contract tests)
- OpenAPI validation

**Example:**
```typescript
// Contract test: Gateway expects Auth Service API
describe('Auth Service Contract', () => {
  it('should validate token', async () => {
    const response = await authService.validateToken({ token: 'valid-token' });
    expect(response).toMatchSchema(authServiceContract);
  });
});
```

## API Contracts

### OpenAPI Specifications

Each service exposes its API contract in its repository:

```yaml
# auth-service/openapi.yaml
openapi: 3.0.0
info:
  title: Auth Service API
  version: 1.0.0
paths:
  /api/v1/login:
    post:
      # ... endpoint definition
```

**Benefits:**
- Auto-generate API documentation
- Generate client SDKs
- Validate requests/responses
- Contract testing

### API Gateway Routing

Gateway Service routes requests to appropriate services:

```typescript
// Gateway routes (in gateway-service repo)
app.post('/api/v1/auth/login', proxyTo('auth-service:3001'));
app.get('/api/v1/users/:id', proxyTo('user-service:3002'));
app.get('/api/v1/products', proxyTo('product-service:3003'));
```

**Gateway Responsibilities:**
- Request routing
- Authentication/authorization
- Rate limiting
- Request/response transformation
- Load balancing

## Event Contracts

### Event Schema

Define event structure (documented in service README):

```typescript
interface BaseEvent {
  eventType: string;
  version: string;
  timestamp: string;
  source: string;
  correlationId: string;
}

interface OrderCreatedEvent extends BaseEvent {
  eventType: 'OrderCreated';
  data: {
    orderId: string;
    userId: string;
    // ... order data
  };
}
```

### Event Publishing

```typescript
// Order Service publishes event (in order-service repo)
await eventPublisher.publish({
  eventType: 'OrderCreated',
  version: '1.0',
  timestamp: new Date().toISOString(),
  source: 'order-service',
  correlationId: requestId,
  data: {
    orderId: order.id,
    userId: order.userId,
    total: order.total
  }
});
```

### Event Consumption

```typescript
// Notification Service consumes event (in notification-service repo)
eventConsumer.subscribe('OrderCreated', async (event: OrderCreatedEvent) => {
  await notificationService.sendOrderConfirmation(
    event.data.userId,
    event.data.orderId
  );
});
```

## Versioning Strategy

### API Versioning

**URL Versioning:**
```
/api/v1/users
/api/v2/users  # New version
```

**Best Practice:**
- Support multiple versions simultaneously
- Deprecate old versions with notice
- Remove after deprecation period

### Event Versioning

**Event Versioning:**
```typescript
interface OrderCreatedEventV1 {
  eventType: 'OrderCreated';
  version: '1.0';
  data: { /* v1 structure */ };
}

interface OrderCreatedEventV2 {
  eventType: 'OrderCreated';
  version: '2.0';
  data: { /* v2 structure */ };
}
```

**Consumer Strategy:**
- Support multiple event versions
- Migrate to new version gradually
- Remove old version support after migration

## Testing Across Services

### Integration Testing

Test service interactions (requires multiple services running):

```typescript
describe('Order Service Integration', () => {
  it('should create order with product validation', async () => {
    // Start test services (or use mocks)
    const productService = await startTestService('product-service');
    const orderService = await startTestService('order-service');
    
    // Create order
    const order = await orderService.createOrder({
      items: [{ productId: '123', quantity: 2 }]
    });
    
    // Verify product service was called
    expect(productService.getProduct).toHaveBeenCalled();
  });
});
```

### Contract Testing

Verify API contracts:

```typescript
describe('Auth Service Contract', () => {
  it('should match OpenAPI spec', async () => {
    const spec = await loadOpenAPISpec('auth-service');
    const response = await authService.validateToken({ token: 'test' });
    
    expect(response).toMatchSchema(spec.paths['/validate-token'].post.responses['200']);
  });
});
```

## Best Practices

### Service Independence ✅

- ✅ Own directory per service in monorepo
- ✅ Own database per service
- ✅ No shared code dependencies
- ✅ Independent deployment
- ✅ Own CI/CD pipeline
- ✅ Version independently

### Collaboration ✅

- ✅ API-first development
- ✅ Event-driven for decoupling
- ✅ Contract testing
- ✅ Document all contracts
- ✅ Version APIs and events

### Communication ✅

- ✅ Use HTTP for synchronous needs
- ✅ Use events for asynchronous needs
- ✅ Mock external services in development
- ✅ Test service interactions
- ✅ Monitor service health

## Common Scenarios

### Scenario 1: Adding a New Feature to Order Service

1. **Clone and Develop Independently**
   ```bash
   git clone <repo-url>/order-service.git
   cd order-service
   npm run dev
   # Make changes, test locally
   ```

2. **Update API Contract**
   - Update `openapi.yaml` in order-service repo
   - Share OpenAPI spec with dependent services
   - Update service README.md

3. **Deploy**
   - CI/CD automatically deploys from order-service repo
   - No impact on other services

### Scenario 2: Multiple Teams Working on Different Services

**Team A: Auth Service (auth-service repo)**
- Works on MFA feature
- Deploys independently
- Updates API contract in auth-service repo

**Team B: User Service (user-service repo)**
- Works on profile features
- Uses Auth Service API (no code dependency)
- Continues working independently

**Team C: Gateway Service (gateway-service repo)**
- Updates routing for new Auth endpoints
- No coordination needed until integration

### Scenario 3: Breaking Change

1. **Create New Version**
   - `/api/v2/users` (new version)
   - Keep `/api/v1/users` (old version)

2. **Migrate Consumers**
   - Update Gateway routing (gateway-service repo)
   - Update dependent services (their repos)

3. **Deprecate Old Version**
   - Add deprecation notice
   - Set removal date

4. **Remove Old Version**
   - After migration period
   - Remove old code

## Resources

- [Developer Workflow Guide](./03-developer-workflow.md)
- [Architecture Overview](./02-codebase-architecture/README.md)
- [Setup Guide](./00-setup/README.md)
- [Service READMEs](../) - Each service has detailed documentation

---

**Remember:** Each service is independent. Clone, develop, and deploy services separately!
