# Ecommerce User Service

User profile management microservice built with **Clean Architecture** principles. This service handles user profiles, addresses, payment methods, wishlists, activity tracking, and notification preferences.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Development Workflow](#development-workflow)
- [Database Management](#database-management)
- [Testing](#testing)
- [Docker Development](#docker-development)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Makefile Commands](#makefile-commands)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture

This service follows **Clean Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Interfaces Layer                      │
│  (HTTP REST API, Event Consumers, Schedulers)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  (Use Cases, DTOs, Controllers)                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                           │
│  (Entities, Value Objects, Domain Services, Events)     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                       │
│  (Database, Messaging, Cache, Logging, External Clients) │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

- **Domain Layer**: Core business logic, entities (UserProfile, Address, PaymentMethod, etc.), repository interfaces
- **Application Layer**: Use cases (GetUserProfile, UpdateUserProfile, CreateAddress, etc.), controllers, DTOs
- **Infrastructure Layer**: External concerns (database, messaging, cache, logging, config, external service clients)
- **Interfaces Layer**: Entry points (HTTP REST API, event consumers)
- **Shared Layer**: Common utilities and error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js 22+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16+ with Prisma ORM
- **Cache**: Redis (optional, falls back to in-memory)
- **Logging**: Winston
- **Metrics**: Prometheus
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier
- **Event Publishing**: OCI Queue (optional)

## 📦 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** 22.0.0 or higher
- **npm** 10.0.0 or higher
- **PostgreSQL** 16.0 or higher (for local development)
- **Redis** (optional, for caching)
- **Docker** and **Docker Compose** (for Docker development)

### Verify Prerequisites

```bash
node --version  # Should be v22.0.0 or higher
npm --version   # Should be 10.0.0 or higher
psql --version  # Should be 16.0 or higher
docker --version
```

## 🚀 Local Development Setup

### Step 1: Navigate to Service

```bash
cd user-service
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using Make
make install
```

### Step 3: Set Up Environment Variables

Configuration is managed through `config/` files. You can override with `.env` if needed:

```bash
# Optional: Create .env file for local overrides
# The service uses config/default.json and config/development.json by default
```

**Configuration Files** (priority order):
1. `config/default.json` - Default configuration
2. `config/development.json` - Development overrides
3. `.env` - Environment variables (highest priority, optional)

**Required Configuration** (in `config/development.json` or `.env`):

```env
# Application
NODE_ENV=development
PORT=3002

# Database
DATABASE_URL=postgresql://user-service_user:user-service_pass@localhost:5432/user-service_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Step 4: Set Up Database

#### Option A: Using Local PostgreSQL

1. **Create Database**:
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE user-service_db;
   \q
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   # Or
   make prisma:generate
   ```

3. **Run Migrations**:
   ```bash
   npm run prisma:migrate
   # Or
   make migrate:dev
   ```

#### Option B: Using Docker Compose

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready (about 10 seconds)
sleep 10

# Generate Prisma Client and run migrations
npm run prisma:generate
npm run prisma:migrate
```

### Step 5: Start Development Server

```bash
# Using npm
npm run dev

# Or using Make
make dev
```

The service will start on `http://localhost:3002`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🐳 Docker Development

### Build and Run

```bash
# Build Docker image
make docker-build

# Start all services (user-service, postgres, redis)
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down
```

### Manual Docker Commands

```bash
# Build
docker build -t user-service:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f user-service

# Stop
docker-compose down
```

## 📚 API Documentation

Once the service is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:3002/api-docs`
- **OpenAPI Spec**: `http://localhost:3002/api-docs/openapi.yaml`

## 📁 Project Structure

```
ecommerce-user-service/
├── src/
│   ├── domain/                    # Domain Layer
│   │   ├── entities/              # Domain entities
│   │   └── repositories/          # Repository interfaces
│   ├── application/               # Application Layer
│   │   ├── use-cases/             # Business use cases
│   │   ├── controllers/           # HTTP controllers
│   │   └── dto/                   # Data Transfer Objects
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── db/                    # Prisma repositories
│   │   ├── cache/                 # Redis cache
│   │   ├── config/                # Configuration
│   │   ├── clients/                # External service clients
│   │   ├── events/                # Event consumers/publishers
│   │   ├── health/                # Health checks
│   │   ├── logging/               # Logging
│   │   └── metrics/              # Prometheus metrics
│   ├── interfaces/                # Interfaces Layer
│   │   └── http/                 # HTTP REST API
│   │       ├── routes/           # API routes
│   │       └── middleware/        # Express middleware
│   ├── shared/                    # Shared Layer
│   │   └── errors/               # Error classes
│   ├── di/                        # Dependency Injection
│   │   └── container.ts          # DI container
│   ├── app.ts                     # Express app factory
│   └── server.ts                  # Server entry point
├── prisma/
│   └── schema.prisma              # Database schema
├── config/                        # Configuration files
│   ├── default.json
│   ├── development.json
│   ├── staging.json
│   └── production.json
├── docker-compose.yml             # Docker Compose config
├── Dockerfile                     # Docker image definition
├── Makefile                       # Make commands
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript config
├── openapi.yaml                   # OpenAPI specification
└── README.md                      # This file
```

## 🔧 Makefile Commands

```bash
make help              # Show all available commands
make install           # Install dependencies
make build             # Build the service
make dev               # Start development server
make test              # Run tests
make lint              # Lint code
make migrate           # Run database migrations
make docker-build      # Build Docker image
make docker-up         # Start services with docker-compose
make docker-down       # Stop docker-compose services
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Change PORT in .env or kill the process using port 3002
   ```

2. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

3. **Prisma Client Not Generated**:
   ```bash
   npm run prisma:generate
   ```

4. **TypeScript Errors**:
   ```bash
   # Clean and rebuild
   rm -rf dist node_modules/.prisma
   npm install
   npm run prisma:generate
   npm run build
   ```

## 📝 Key Features

- ✅ **User Profiles**: Comprehensive user profile management
- ✅ **Address Management**: Multiple addresses per user (shipping, billing, both)
- ✅ **Payment Methods**: Secure storage of payment methods
- ✅ **Wishlists**: Product wishlist management
- ✅ **Activity Tracking**: Track user activity and product views
- ✅ **Profile Completion**: Calculate and track profile completion score
- ✅ **Data Export**: Export user data in JSON format (GDPR)
- ✅ **Data Deletion**: Delete user data on request (GDPR)
- ✅ **Event-Driven**: Consumes events from auth-service (user.created)
- ✅ **Redis Caching**: Fast data retrieval with Redis caching
- ✅ **Prometheus Metrics**: Comprehensive metrics for monitoring

## 🔐 Security

- JWT authentication via auth-service
- Rate limiting on all endpoints
- Input validation with express-validator
- Security headers with Helmet
- CORS configuration
- HTTPS enforcement in production

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Readiness Check**: `GET /ready`
- **Metrics**: `GET /metrics` (Prometheus format)

## 🤝 Contributing

See the main project README for contribution guidelines.

## 📄 License

See the main project LICENSE file.

