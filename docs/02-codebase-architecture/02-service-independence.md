<div align="center">

# 🎯 02 - Service Independence

[![Independence](https://img.shields.io/badge/Service-Independence-blue?style=for-the-badge)](.)
[![Loose Coupling](https://img.shields.io/badge/Coupling-Loose-green?style=flat-square)](.)
[![Examples](https://img.shields.io/badge/Examples-Real%20World-orange?style=flat-square)](.)

**This document demonstrates how services in this project remain independent and loosely coupled**

</div>

---

## 📚 Reading Order

**Recommended path through codebase architecture documentation:**

1. ✅ **[Overview](./README.md)** - Architecture overview
2. ✅ **[01 - Layer Details](./01-layer-details.md)** - Layer details
3. 📖 **This Document (02 - Service Independence)** - You are here

---

## Navigation

- ⬅️ [← Previous: Layer Details](./01-layer-details.md)
- 🏠 [← Back to Overview](./README.md)

## Table of Contents

1. [No Code Dependencies](#no-code-dependencies)
2. [Database Per Service](#database-per-service)
3. [Communication Patterns](#communication-patterns)
4. [Independent Deployment](#independent-deployment)
5. [Real-World Examples](#real-world-examples)

## No Code Dependencies

### ❌ What We DON'T Do

Services **never** import code from other services:

```typescript
// ❌ BAD: Direct code import
import { User } from '../user-service/src/domain/entities/User';
import { ProductService } from '../product-service/src/application/services/ProductService';
```

**Why this is bad:**
- Creates tight coupling
- Services can't be deployed independently
- Changes in one service break others
- Can't scale services separately

### ✅ What We DO Instead

Services communicate via **interfaces** (APIs and events):

```typescript
// ✅ GOOD: HTTP API call
const user = await fetch('http://user-service:3002/api/v1/users/123')
  .then(res => res.json());

// ✅ GOOD: Event subscription
eventConsumer.subscribe('UserCreated', async (event) => {
  // Handle user creation
});
```

## Database Per Service

### Each Service Owns Its Data

```
┌─────────────────┐         ┌─────────────────┐
│  Auth Service   │         │  User Service   │
│                 │         │                 │
│  auth_db        │         │  user_db        │
│  (PostgreSQL)   │         │  (PostgreSQL)   │
└─────────────────┘         └─────────────────┘
        │                            │
        └────────────┬───────────────┘
                     │
              No Shared Tables
```

### Example: Auth Service Database

```prisma
// auth-service/prisma/schema.prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  passwordHash      String
  emailVerified     Boolean  @default(false)
  isActive          Boolean  @default(true)
  // ... auth-specific fields
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  // ... auth-specific fields
}
```

### Example: User Service Database

```prisma
// user-service/prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  userId    String   @unique  // Reference to auth service user ID
  firstName String?
  lastName  String?
  phone     String?
  // ... user profile fields
}

model Address {
  id      String   @id @default(uuid())
  userId  String
  street  String
  city    String
  // ... address fields
}
```

**Key Points:**
- Each service has its own database
- No shared tables
- Services reference each other by ID (not foreign keys)
- Can use different database types if needed

## Communication Patterns

### Pattern 1: Synchronous HTTP

**When to Use:**
- Immediate response required
- Request-response pattern
- Simple queries

**Example: Gateway → Auth Service**

```typescript
// gateway-service/src/interfaces/http/middleware/auth.middleware.ts
export async function validateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Call Auth Service API (not direct code import)
  try {
    const response = await fetch('http://auth-service:3001/api/v1/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const data = await response.json();
    req.user = data.user; // Attach user to request
    next();
  } catch (error) {
    return res.status(503).json({ error: 'Auth service unavailable' });
  }
}
```

**Independence Maintained:**
- ✅ No code imports
- ✅ Communication via HTTP only
- ✅ Services can be deployed separately
- ✅ Can use different technologies

### Pattern 2: Asynchronous Events

**When to Use:**
- Decoupled operations
- Eventual consistency acceptable
- Multiple subscribers needed

**Example: Order Service → Notification Service**

```typescript
// order-service/src/application/use-cases/CreateOrderUseCase.ts
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly eventPublisher: IEventPublisher  // Interface
  ) {}

  async execute(data: CreateOrderData) {
    // 1. Create order
    const order = await this.orderRepository.create({
      userId: data.userId,
      items: data.items,
      total: data.total,
    });

    // 2. Publish event (doesn't know who subscribes)
    await this.eventPublisher.publish('OrderCreated', {
      orderId: order.id,
      userId: order.userId,
      total: order.total,
      items: order.items,
    });

    return order;
  }
}
```

```typescript
// notification-service/src/infrastructure/events/EventConsumer.ts
export class EventConsumer {
  async start() {
    // Subscribe to OrderCreated event
    await this.subscribe('OrderCreated', async (event) => {
      await this.sendOrderConfirmationEmail(
        event.userId,
        event.orderId
      );
    });

    // Subscribe to PaymentProcessed event
    await this.subscribe('PaymentProcessed', async (event) => {
      await this.sendPaymentConfirmationEmail(
        event.userId,
        event.orderId
      );
    });
  }
}
```

**Independence Maintained:**
- ✅ Order Service doesn't know about Notification Service
- ✅ Can add/remove subscribers without changing publisher
- ✅ Services can be deployed independently
- ✅ Event schema is the contract

## Independent Deployment

### Each Service Has Own CI/CD

```yaml
# .github/workflows/auth-service.yml
name: Auth Service CI/CD
on:
  push:
    paths:
      - 'auth-service/**'  # Only triggers on auth-service changes

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Auth Service
        run: |
          cd auth-service
          npm install
          npm run build
      
      - name: Build Docker Image
        run: |
          docker build -t auth-service:latest ./auth-service
      
      - name: Deploy to Staging
        run: |
          # Deploy only auth-service
```

**Benefits:**
- ✅ Changes to one service don't trigger builds for others
- ✅ Can deploy services independently
- ✅ Faster CI/CD pipelines
- ✅ Can use different deployment strategies per service

### Independent Scaling

Each service can scale independently:

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3  # Scale auth service independently
  # ...
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
spec:
  replicas: 5  # Scale product service independently
  # ...
```

## Real-World Examples

### Example 1: User Registration Flow

**Scenario:** User registers, needs to create auth record and user profile.

**Implementation:**

```typescript
// 1. Auth Service: Create authentication record
// auth-service/src/application/use-cases/RegisterUserUseCase.ts
export class RegisterUserUseCase {
  async execute(data: RegisterData) {
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash: await this.passwordHasher.hash(data.password),
    });

    // Publish event (doesn't know about User Service)
    await this.eventPublisher.publish('UserRegistered', {
      userId: user.id,
      email: user.email,
    });

    return user;
  }
}
```

```typescript
// 2. User Service: Subscribe to event
// user-service/src/infrastructure/events/EventConsumer.ts
export class EventConsumer {
  async start() {
    await this.subscribe('UserRegistered', async (event) => {
      // Create user profile (independent operation)
      await this.userRepository.create({
        userId: event.userId,  // Reference by ID
        email: event.email,
        // ... profile fields
      });
    });
  }
}
```

**Independence:**
- ✅ Auth Service doesn't import User Service code
- ✅ User Service doesn't import Auth Service code
- ✅ Communication via events only
- ✅ Can deploy independently
- ✅ If User Service is down, Auth Service still works

### Example 2: Order Creation with Multiple Services

**Scenario:** Create order, validate inventory, process payment, send notifications.

**Implementation:**

```typescript
// Order Service
export class CreateOrderUseCase {
  async execute(data: CreateOrderData) {
    // 1. Validate inventory (HTTP call to Product Service)
    for (const item of data.items) {
      const product = await fetch(
        `http://product-service:3003/api/v1/products/${item.productId}`
      ).then(res => res.json());

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }

    // 2. Create order
    const order = await this.orderRepository.create(data);

    // 3. Publish event (multiple services can subscribe)
    await this.eventPublisher.publish('OrderCreated', {
      orderId: order.id,
      userId: order.userId,
      total: order.total,
      items: order.items,
    });

    return order;
  }
}
```

```typescript
// Payment Service: Subscribe to OrderCreated
eventConsumer.subscribe('OrderCreated', async (event) => {
  // Process payment (independent operation)
  await paymentService.processPayment({
    orderId: event.orderId,
    amount: event.total,
  });
});
```

```typescript
// Notification Service: Subscribe to OrderCreated
eventConsumer.subscribe('OrderCreated', async (event) => {
  // Send notification (independent operation)
  await notificationService.sendEmail({
    userId: event.userId,
    subject: 'Order Confirmation',
    body: `Your order ${event.orderId} has been created`,
  });
});
```

```typescript
// Shipping Service: Subscribe to OrderCreated
eventConsumer.subscribe('OrderCreated', async (event) => {
  // Create shipping label (independent operation)
  await shippingService.createLabel({
    orderId: event.orderId,
    userId: event.userId,
  });
});
```

**Independence:**
- ✅ Order Service doesn't know about Payment, Notification, or Shipping
- ✅ Each service handles its own responsibility
- ✅ Can add new subscribers without changing Order Service
- ✅ Services can be deployed independently
- ✅ If one service fails, others continue working

### Example 3: Swapping Infrastructure

**Scenario:** Want to change from Prisma/PostgreSQL to MongoDB.

**Implementation:**

**Before (Prisma):**

```typescript
// infrastructure/database/PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

**After (MongoDB):**

```typescript
// infrastructure/database/MongoUserRepository.ts
export class MongoUserRepository implements IUserRepository {
  constructor(private readonly mongo: MongoClient) {}
  
  async findById(id: string): Promise<User | null> {
    return this.mongo.db('auth_db').collection('users').findOne({ _id: id });
  }
}
```

**Change in DI Container:**

```typescript
// di/container.ts
constructor() {
  // Only change this line
  this.userRepository = new MongoUserRepository(this.mongo);
  // Use cases remain unchanged!
}
```

**What Doesn't Change:**
- ✅ Use cases (business logic)
- ✅ Controllers
- ✅ Routes
- ✅ Interfaces

**Independence:**
- ✅ Can swap infrastructure without changing business logic
- ✅ Other services unaffected
- ✅ Can use different databases per service

## Benefits Summary

### 1. Independent Development

Teams can work on services independently:
- Team A works on Auth Service
- Team B works on User Service
- No coordination needed
- No merge conflicts

### 2. Independent Deployment

Services can be deployed separately:
- Deploy Auth Service v2.0
- User Service still on v1.5
- No downtime for other services
- Rollback one service without affecting others

### 3. Independent Scaling

Scale services based on load:
- Auth Service: 3 replicas
- Product Service: 10 replicas (high traffic)
- Notification Service: 2 replicas

### 4. Technology Flexibility

Use different technologies per service:
- Auth Service: Node.js + PostgreSQL
- Product Service: Node.js + MongoDB
- Analytics Service: Python + ClickHouse

### 5. Fault Isolation

If one service fails, others continue:
- Payment Service down → Orders still created
- Notification Service down → Orders still processed
- Only affected functionality fails

## Summary

Service independence is achieved through:

✅ **No Code Dependencies**: Services don't import each other's code  
✅ **Database Per Service**: Each service owns its data  
✅ **API Communication**: HTTP APIs for synchronous needs  
✅ **Event Communication**: Events for asynchronous needs  
✅ **Independent Deployment**: Own CI/CD and deployment  
✅ **Interface-Based Design**: Depend on interfaces, not implementations  

This architecture ensures services remain **loosely coupled** and can be developed, tested, and deployed **independently**.

---

## Navigation

- ⬅️ [← Previous: Layer Details](./01-layer-details.md)
- 🏠 [← Back to Overview](./README.md)

