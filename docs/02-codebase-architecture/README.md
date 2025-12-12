<div align="center">

# 🏗️ Codebase Architecture

[![Architecture](https://img.shields.io/badge/Architecture-Clean-blue?style=for-the-badge)](.)
[![Microservices](https://img.shields.io/badge/Pattern-Microservices-green?style=flat-square)](.)
[![Clean Architecture](https://img.shields.io/badge/Design-Clean%20Architecture-orange?style=flat-square)](.)

**Clean Architecture, Service Independence, and Loose Coupling**

</div>

---

This document explains how the E-Commerce Microservices Platform is architected, focusing on Clean Architecture principles, service independence, and loose coupling.

## 📚 Reading Guide

<div align="center">

**Recommended reading order:**

</div>

| Step | Document | Description |
|:---:|:---|:---|
| **1️⃣** | **[This Document (Overview)](./README.md)** | Start here for architecture overview |
| **2️⃣** | **[01 - Layer Details](./01-layer-details.md)** | Deep dive into each architecture layer |
| **3️⃣** | **[02 - Service Independence](./02-service-independence.md)** | Real-world examples of independent services |

<div align="center">

</div>

## Table of Contents

1. [Overview](#overview)
2. [Clean Architecture Implementation](#clean-architecture-implementation)
3. [Service Independence](#service-independence)
4. [Loose Coupling Mechanisms](#loose-coupling-mechanisms)
5. [Layer Structure](#layer-structure)
6. [Dependency Flow](#dependency-flow)
7. [Service Communication](#service-communication)
8. [Examples](#examples)

## Overview

This project follows **Clean Architecture** principles, ensuring that:

- **Business logic is independent** of frameworks, databases, and external services
- **Services are decoupled** from each other
- **Dependencies point inward** toward the core business logic
- **Infrastructure details** are abstracted behind interfaces
- **Each service owns its data** and can be developed/deployed independently

## Clean Architecture Implementation

### Architecture Layers

Each service follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Routes, Controllers, Middleware, HTTP Handlers)        │
└────────────────────┬────────────────────────────────────┘
                     │ Depends on
┌────────────────────▼────────────────────────────────────┐
│                  Application Layer                       │
│  (Use Cases, Application Services, DTOs)                  │
└────────────────────┬────────────────────────────────────┘
                     │ Depends on
┌────────────────────▼────────────────────────────────────┐
│                    Core Layer                           │
│  (Domain Entities, Business Logic, Domain Services)     │
└────────────────────┬────────────────────────────────────┘
                     │ Depends on
┌────────────────────▼────────────────────────────────────┐
│                Infrastructure Layer                     │
│  (Database, External APIs, Event Publishers, Cache)      │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rule

**The fundamental rule**: Dependencies point **inward** only.

- **Core Layer** has **zero dependencies** on other layers
- **Application Layer** depends only on **Core**
- **Infrastructure Layer** depends on **Core** and **Application**
- **Presentation Layer** depends on **Application** and **Core**

This ensures business logic remains pure and testable.

## Service Independence

### What Makes Services Independent?

Each service is a **self-contained unit** with:

1. **Own Codebase**
   - Separate directory: `<service-name>/`
   - Own `package.json` and dependencies
   - Own build process

2. **Own Database**
   - Separate PostgreSQL database
   - Own Prisma schema
   - Own migrations
   - No shared tables

3. **Own Deployment**
   - Independent Docker image
   - Own CI/CD pipeline
   - Can be deployed separately

4. **No Direct Code Dependencies**
   - Services don't import code from other services
   - Communication via HTTP APIs or events only
   - No shared libraries between services

### Service Structure Example

```
auth-service/
├── src/
│   ├── domain/                  # Domain layer (no dependencies)
│   │   ├── entities/           # Domain entities
│   │   ├── repositories/       # Repository interfaces (contracts)
│   │   └── services/           # Domain services
│   ├── application/            # Application layer
│   │   ├── controllers/        # HTTP controllers
│   │   ├── use-cases/          # Use cases
│   │   └── dto/                # Data transfer objects
│   ├── infrastructure/         # Infrastructure layer
│   │   ├── db/                 # Prisma repositories (implementations)
│   │   ├── events/             # Event publishers
│   │   ├── cache/              # Redis cache
│   │   ├── config/             # Configuration provider
│   │   ├── health/             # Health checks
│   │   ├── logging/            # Logging
│   │   └── metrics/            # Prometheus metrics
│   ├── interfaces/             # Presentation layer
│   │   └── http/               # HTTP routes and middleware
│   ├── shared/                 # Shared utilities
│   │   └── errors/             # Common error classes
│   └── di/                     # Dependency injection container
├── config/                      # Environment configurations
│   ├── default.json
│   ├── development.json
│   ├── staging.json
│   └── production.json
├── prisma/
│   └── schema.prisma           # Own database schema
├── Dockerfile                   # Production Docker image
├── docker-compose.yml          # Local development
└── package.json                # Own dependencies
```

## Loose Coupling Mechanisms

### 1. Interface-Based Design (Ports & Adapters)

Services define **interfaces (ports)** that infrastructure implements (**adapters**).

**Example: User Repository Interface**

```typescript
// domain/repositories/IUserRepository.ts (Port)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  // ... other methods
}
```

**Implementation (Adapter)**

```typescript
// infrastructure/db/PrismaUserRepository.ts (Adapter)
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    // Prisma-specific implementation
  }
}
```

**Benefits:**
- Can swap Prisma for MongoDB, MySQL, etc. without changing business logic
- Easy to mock for testing
- Clear contracts between layers

### 2. Dependency Injection

Services use **Dependency Injection (DI)** to wire dependencies:

```typescript
// di/container.ts
export class Container {
  private userRepository: IUserRepository;
  private passwordHasher: IPasswordHasher;
  
  constructor() {
    // Wire dependencies
    this.userRepository = new PrismaUserRepository(this.prisma);
    this.passwordHasher = new BcryptPasswordHasher();
    
    // Use cases depend on interfaces, not implementations
    this.loginUseCase = new LoginUseCase(
      this.userRepository,      // Interface
      this.passwordHasher,        // Interface
      this.tokenService           // Interface
    );
  }
}
```

**Benefits:**
- Dependencies are explicit
- Easy to swap implementations
- Testable (can inject mocks)

### 3. Event-Driven Communication

Services communicate via **events** rather than direct calls:

```typescript
// Order Service publishes event
await eventPublisher.publish('OrderCreated', {
  orderId: '123',
  userId: '456',
  total: 99.99
});

// Notification Service subscribes (no direct dependency)
eventConsumer.subscribe('OrderCreated', async (event) => {
  await sendNotification(event.userId, event.orderId);
});
```

**Benefits:**
- Services don't know about each other
- Can add new subscribers without changing publisher
- Decoupled and scalable

### 4. API Contracts (OpenAPI)

Services define **API contracts** that other services can depend on:

```yaml
# openapi.yaml
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
```

**Benefits:**
- Clear contracts between services
- Can generate client SDKs
- Version independently

## Layer Structure

### Domain Layer (`src/domain/`)

**Purpose**: Pure business logic with zero dependencies.

**Contains:**
- **Entities**: Domain models (e.g., `User`, `Order`, `Product`)
- **Use Cases**: Business logic operations (e.g., `LoginUseCase`, `CreateOrderUseCase`)
- **Domain Services**: Complex business logic that doesn't fit in entities

**Example:**

```typescript
// domain/entities/User.ts
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  // ... domain properties
}

// core/use-cases/LoginUseCase.ts
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,  // Interface
    private readonly passwordHasher: IPasswordHasher,  // Interface
    private readonly tokenService: ITokenService        // Interface
  ) {}
  
  async execute(request: LoginRequest) {
    // Pure business logic
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) throw new Error('User not found');
    
    const isValid = await this.passwordHasher.compare(
      request.password, 
      user.passwordHash
    );
    
    if (!isValid) throw new Error('Invalid password');
    
    return await this.tokenService.generateTokens({ userId: user.id });
  }
}
```

**Key Points:**
- No imports from `infrastructure/` or `application/`
- Depends only on interfaces (ports)
- Framework-agnostic
- Testable without mocks (can use in-memory implementations)

### Application Layer (`src/application/`)

**Purpose**: Orchestrates use cases and handles application-specific concerns.

**Contains:**
- **Controllers**: HTTP request/response handling
- **DTOs**: Data transfer objects for API boundaries
- **Application Services**: Coordinate multiple use cases

**Example:**

```typescript
// application/controllers/AuthController.ts
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUserUseCase
  ) {}
  
  async login(req: Request, res: Response) {
    try {
      const result = await this.loginUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, error: error.message });
    }
  }
}
```

**Key Points:**
- Depends on Core (use cases)
- Handles HTTP concerns (request/response)
- Maps between HTTP and domain models

### Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Implements external concerns (database, HTTP clients, events).

**Contains:**
- **Database**: Prisma repositories implementing interfaces
- **Events**: Event publishers (OCI Streaming, SNS, Mock)
- **Cache**: Redis cache implementation
- **External APIs**: HTTP clients for other services

**Example:**

```typescript
// infrastructure/database/PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToEntity(user) : null;
  }
  
  private mapToEntity(user: PrismaUser): User {
    // Map Prisma model to domain entity
    return {
      id: user.id,
      email: user.email,
      // ... mapping
    };
  }
}
```

**Key Points:**
- Implements interfaces from `ports/`
- Contains framework-specific code (Prisma, Express, etc.)
- Can be swapped without changing business logic

### Interfaces Layer (`src/interfaces/http/`)

**Purpose**: HTTP-specific concerns (routing, middleware, validation).

**Example:**

```typescript
// interfaces/http/routes/auth.routes.ts
export function createAuthRoutes(controller: AuthController) {
  const router = express.Router();
  
  router.post('/login', 
    validateLoginRequest,  // Middleware
    async (req, res) => controller.login(req, res)
  );
  
  return router;
}
```

**Key Points:**
- Thin layer that delegates to controllers
- Handles HTTP routing and middleware
- Depends on Application layer

## Dependency Flow

### Correct Dependency Direction

```
┌──────────────┐
│   Routes     │ ──► Depends on
└──────┬───────┘
       │
┌──────▼───────┐
│ Controllers  │ ──► Depends on
└──────┬───────┘
       │
┌──────▼───────┐
│  Use Cases   │ ──► Depends on
└──────┬───────┘
       │
┌──────▼───────┐
│  Interfaces  │ ◄─── Implemented by
└──────┬───────┘
       │
┌──────▼───────┐
│ Repositories │
└──────────────┘
```

### Dependency Injection Container

The DI container wires everything together:

```typescript
// di/container.ts
export class Container {
  constructor() {
    // 1. Infrastructure (concrete implementations)
    this.prisma = new PrismaClient();
    this.userRepository = new PrismaUserRepository(this.prisma);
    this.passwordHasher = new BcryptPasswordHasher();
    this.tokenService = new JwtTokenService();
    
    // 2. Use Cases (depend on interfaces)
    this.loginUseCase = new LoginUseCase(
      this.userRepository,    // IUserRepository interface
      this.passwordHasher,     // IPasswordHasher interface
      this.tokenService        // ITokenService interface
    );
    
    // 3. Controllers (depend on use cases)
    this.authController = new AuthController(
      this.loginUseCase,
      this.registerUseCase
    );
  }
}
```

## Service Communication

### How Services Stay Independent

Services communicate in two ways, both maintaining independence:

#### 1. Synchronous (HTTP)

```typescript
// Gateway Service calls Auth Service
const response = await fetch('http://auth-service:3001/api/v1/validate-token', {
  method: 'POST',
  body: JSON.stringify({ token })
});
```

**Independence Maintained:**
- No code imports between services
- Communication via HTTP only
- Services can be deployed separately
- API contracts defined in OpenAPI specs

#### 2. Asynchronous (Events)

```typescript
// Order Service publishes event
await eventPublisher.publish('OrderCreated', orderData);

// Notification Service subscribes (no direct dependency)
eventConsumer.subscribe('OrderCreated', handleOrderCreated);
```

**Independence Maintained:**
- Services don't know about each other
- Event schema is the contract
- Can add/remove subscribers without affecting publisher

### No Shared Code

**❌ BAD: Shared Code**
```typescript
// ❌ DON'T DO THIS
import { User } from '../user-service/src/domain/entities/User';
```

**✅ GOOD: API Communication**
```typescript
// ✅ DO THIS
const user = await userServiceClient.getUser(userId);
```

**✅ GOOD: Event Communication**
```typescript
// ✅ DO THIS
eventConsumer.subscribe('UserCreated', handleUserCreated);
```

## Examples

### Example 1: Login Flow

```
1. HTTP Request → Routes
   POST /api/v1/auth/login

2. Routes → Controller
   authController.login(req, res)

3. Controller → Use Case
   loginUseCase.execute({ email, password })

4. Use Case → Repository (Interface)
   userRepository.findByEmail(email)

5. Repository (Implementation) → Database
   prisma.user.findUnique({ where: { email } })

6. Use Case → Password Hasher (Interface)
   passwordHasher.compare(password, hash)

7. Use Case → Token Service (Interface)
   tokenService.generateTokens({ userId })

8. Response flows back up
   Use Case → Controller → Routes → HTTP Response
```

**Key Points:**
- Each layer depends only on interfaces
- Business logic (Use Case) has no framework dependencies
- Infrastructure can be swapped (Prisma → MongoDB, JWT → OAuth)

### Example 2: Order Creation with Events

```
Order Service:
1. CreateOrderUseCase.execute()
2. Save order to database
3. eventPublisher.publish('OrderCreated', orderData)

Notification Service (Independent):
1. eventConsumer.subscribe('OrderCreated')
2. Receive event
3. Send notification email

Shipping Service (Independent):
1. eventConsumer.subscribe('OrderCreated')
2. Receive event
3. Create shipping label
```

**Key Points:**
- Order Service doesn't know about Notification or Shipping
- Services are completely decoupled
- Can add new subscribers without changing Order Service

### Example 3: Swapping Infrastructure

**Current: Prisma + PostgreSQL**

```typescript
// infrastructure/database/PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

**Swap to: MongoDB**

```typescript
// infrastructure/database/MongoUserRepository.ts
export class MongoUserRepository implements IUserRepository {
  async findById(id: string) {
    return this.mongo.collection('users').findOne({ _id: id });
  }
}
```

**Change in DI Container:**

```typescript
// Only change this line in container.ts
this.userRepository = new MongoUserRepository(this.mongo);
// Use cases remain unchanged!
```

**Key Points:**
- Business logic (Use Cases) unchanged
- Only infrastructure layer changes
- Interfaces remain the same

## Benefits of This Architecture

### 1. Testability

```typescript
// Test use case with mock repository
const mockUserRepository = {
  findByEmail: jest.fn().mockResolvedValue(mockUser)
};

const loginUseCase = new LoginUseCase(
  mockUserRepository,
  mockPasswordHasher,
  mockTokenService
);
```

### 2. Maintainability

- Clear separation of concerns
- Easy to locate code
- Changes are isolated to specific layers

### 3. Flexibility

- Swap databases without changing business logic
- Add new features without breaking existing code
- Deploy services independently

### 4. Scalability

- Services can scale independently
- Can optimize each service's database
- Can use different technologies per service

## Summary

<div align="center">

**This codebase architecture ensures:**

</div>

| Principle | Description |
|:---:|:---|
| ✅ **Clean Architecture** | Business logic is independent of frameworks |
| ✅ **Service Independence** | Services don't depend on each other's code |
| ✅ **Loose Coupling** | Communication via interfaces, APIs, and events |
| ✅ **Testability** | Easy to test with mocks and in-memory implementations |
| ✅ **Maintainability** | Clear structure and separation of concerns |
| ✅ **Flexibility** | Can swap implementations without changing business logic |

<div align="center">

Each service is a **self-contained unit** that can be developed, tested, and deployed independently while maintaining clear contracts for collaboration.

</div>

## 📖 Next Steps

Continue reading in order:

1. ✅ **This Document (Overview)** - You are here
2. ➡️ **[01 - Layer Details](./01-layer-details.md)** - Next: Learn about each architecture layer in detail
3. ➡️ **[02 - Service Independence](./02-service-independence.md)** - Then: See real-world examples of service independence

## Related Documentation

- [Developer Workflow](../03-developer-workflow.md) - How to work on the project
- [Service Collaboration](../04-service-collaboration.md) - Service collaboration patterns
- [Setup Guide](../00-setup/README.md) - Project setup

---

<div align="center">

## 📁 Documentation Files

```
docs/codebase-architecture/
├── README.md                      # Overview (start here)
├── 01-layer-details.md            # Detailed layer explanations
└── 02-service-independence.md     # Service independence examples
```

**Reading Path:**
```
README.md → 01-layer-details.md → 02-service-independence.md
```

---

[Back to Top](#-codebase-architecture)

</div>

