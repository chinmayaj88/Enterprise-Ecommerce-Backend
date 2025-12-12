# Architecture Documentation

## Overview

This service follows **Clean Architecture** principles, ensuring separation of concerns and maintainability.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)
The core business logic, completely independent of frameworks and external concerns.

- **Entities**: Business objects (Order, OrderItem, etc.)
- **Value Objects**: Immutable values (Money, Address)
- **Services**: Domain services (OrderNumberGenerator)
- **Events**: Domain events (OrderCreatedEvent, etc.)
- **Repositories**: Repository interfaces (contracts only, no implementation)

### 2. Application Layer (`src/application/`)
Orchestrates use cases and coordinates between domain and infrastructure.

- **Use Cases**: Business workflows (CreateOrderUseCase, GetOrderUseCase, etc.)
- **DTOs**: Data transfer objects for API requests/responses
- **Services**: Application-level services

### 3. Infrastructure Layer (`src/infrastructure/`)
Handles external concerns and framework-specific implementations.

- **db**: Database implementations (Prisma repositories)
- **messaging**: Event publishers (OCI Streaming, Mock)
- **cache**: Caching (Redis)
- **logging**: Logging (Winston)
- **config**: Configuration management
- **clients**: External service clients (Cart, Product, User services)

### 4. Interfaces Layer (`src/interfaces/`)
Entry points to the application.

- **http**: REST API (Express routes, middleware)
- **scheduler**: Cron jobs
- **events**: Event consumers

### 5. Shared Layer (`src/shared/`)
Shared utilities and common code.

- **errors**: Common error classes
- **utils**: Helper functions

## Dependency Flow

```
Interfaces → Application → Domain
     ↓            ↓
Infrastructure ← ─ ─ ─ ─ ─ ┘
```

- Domain has no dependencies
- Application depends only on Domain
- Infrastructure implements Domain interfaces
- Interfaces depend on Application and Infrastructure

## Key Principles

1. **Dependency Inversion**: High-level modules don't depend on low-level modules
2. **Single Responsibility**: Each class has one reason to change
3. **Open/Closed**: Open for extension, closed for modification
4. **Interface Segregation**: Clients depend only on interfaces they use

## Technology Stack

- **Runtime**: Node.js 22+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (optional, falls back to in-memory)
- **Logging**: Winston
- **Metrics**: Prometheus
- **Testing**: Jest

## Data Flow

1. **Request** → HTTP Interface → Controller
2. **Controller** → Use Case
3. **Use Case** → Domain Services & Repositories
4. **Repository** → Infrastructure (Prisma)
5. **Response** ← Controller ← Use Case

## Event-Driven Architecture

Domain events are published when significant business events occur:
- `order.created`
- `order.status.changed`
- `order.cancelled`

Events are published asynchronously and don't block the main flow.

