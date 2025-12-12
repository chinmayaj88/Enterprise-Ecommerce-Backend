# Ecommerce Cart Service

Shopping cart management microservice built with **Clean Architecture** principles. This service handles cart creation, item management, cart merging, and cart lifecycle management.

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

- **Domain Layer**: Core business logic, entities, value objects, domain services, events, repository interfaces
- **Application Layer**: Use cases, DTOs, controllers
- **Infrastructure Layer**: External concerns (database, messaging, cache, logging, config, external service clients)
- **Interfaces Layer**: Entry points (HTTP REST API, event consumers, schedulers)
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
cd cart-service
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

**Required Environment Variables** (see `.env.example` for full list):

```env
# Application
NODE_ENV=development
PORT=3004

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cart_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# External Services
PRODUCT_SERVICE_URL=http://localhost:3003

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Step 4: Set Up Database

#### Option A: Using Local PostgreSQL

1. **Create Database**:
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE cart_db;
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
   npm run prisma:migrate:deploy
   # Or
   make migrate
   ```

#### Option B: Using Docker (Recommended for Local Development)

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Wait for services to be ready (10-15 seconds)
# Then run migrations
make migrate
```

### Step 5: Complete Setup (Automated)

For a complete automated setup:

```bash
# Complete setup (installs, generates, migrates)
make setup

# Or for local development with .env check
make setup:local
```

### Step 6: Start Development Server

```bash
# Start development server with hot reload
npm run dev

# Or using Make
make dev
```

The service will start on `http://localhost:3004`

### Step 7: Verify Setup

```bash
# Check health
curl http://localhost:3004/health

# Check readiness
curl http://localhost:3004/ready

# View API documentation
open http://localhost:3004/api-docs
```

## 💻 Development Workflow

### Daily Development

1. **Start Development Server**:
   ```bash
   make dev
   ```

2. **Make Code Changes**: Files are automatically reloaded

3. **Run Tests**:
   ```bash
   make test
   ```

4. **Check Code Quality**:
   ```bash
   make lint
   make format
   ```

### Database Changes

When you modify the Prisma schema:

1. **Create Migration**:
   ```bash
   make migrate:dev
   # Enter migration name when prompted
   ```

2. **Apply Migration**:
   ```bash
   make migrate
   ```

3. **Check Migration Status**:
   ```bash
   make migrate:status
   ```

### Code Quality

```bash
# Lint code
make lint

# Fix linting issues
make lint:fix

# Format code
make format
```

## 🗄️ Database Management

### Migrations

```bash
# Create new migration (development)
make migrate:dev

# Apply migrations (production)
make migrate

# Check migration status
make migrate:status

# Reset database (WARNING: Deletes all data)
make migrate:reset
```

### Database GUI

```bash
# Open Prisma Studio
make studio
# Or
npm run prisma:studio
```

### Seed Database

```bash
# Seed with sample data
make seed
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test types
make test:unit          # Unit tests only
make test:integration    # Integration tests only
make test:e2e           # End-to-end tests only

# Watch mode
make test:watch

# With coverage
make test:coverage
```

## 🐳 Docker Development

### Quick Start with Docker

```bash
# Complete Docker setup (build, start, migrate)
make docker:setup
```

### Manual Docker Commands

```bash
# Build Docker image
make docker-build

# Start services
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down

# Restart services
make docker-restart

# Clean Docker resources (WARNING: Deletes data)
make docker-clean
```

### Docker Services

- **Cart Service**: `http://localhost:3004`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

### Accessing Docker Services

```bash
# Run migrations in container
docker-compose exec cart-service npm run prisma:migrate:deploy

# Access PostgreSQL
docker-compose exec postgres psql -U cart_user -d cart_db

# Access Redis CLI
docker-compose exec redis redis-cli
```

## 📚 API Documentation

Once the service is running:

- **Swagger UI**: `http://localhost:3004/api-docs`
- **OpenAPI Spec**: `http://localhost:3004/api-docs/openapi.yaml`

### Health Checks

- **Health**: `GET /health`
- **Readiness**: `GET /ready`
- **Metrics**: `GET /metrics` (Prometheus format)

### API Endpoints

#### System Endpoints (No Auth)
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `GET /metrics` - Prometheus metrics
- `GET /api-docs` - API documentation

#### Cart Endpoints (Optional Auth - Guest Carts Supported)
- `POST /api/v1/carts` - Create cart
- `GET /api/v1/carts` - Get cart (by userId or sessionId)
- `GET /api/v1/carts/:cartId` - Get cart by ID
- `DELETE /api/v1/carts/:cartId` - Clear cart

#### Cart Item Endpoints (Optional Auth)
- `POST /api/v1/carts/:cartId/items` - Add item to cart
- `PUT /api/v1/carts/:cartId/items/:itemId` - Update cart item
- `DELETE /api/v1/carts/:cartId/items/:itemId` - Remove item from cart

#### Cart Merge Endpoint (Auth Required)
- `POST /api/v1/carts/merge` - Merge guest cart with user cart

## 📁 Project Structure

```
ecommerce-cart-service/
├── src/
│   ├── domain/              # Business logic
│   │   ├── entities/        # Domain entities
│   │   ├── value-objects/   # Value objects
│   │   ├── services/        # Domain services
│   │   ├── events/          # Domain events
│   │   └── repositories/    # Repository interfaces
│   ├── application/         # Application layer
│   │   ├── use-cases/       # Business use cases
│   │   └── dto/             # Data transfer objects
│   ├── infrastructure/      # External concerns
│   │   ├── db/             # Database implementations
│   │   ├── cache/          # Caching
│   │   ├── logging/        # Logging
│   │   ├── config/         # Configuration
│   │   └── clients/        # External service clients
│   ├── interfaces/          # Entry points
│   │   └── http/           # REST API
│   ├── shared/             # Shared utilities
│   │   └── errors/         # Error classes
│   ├── di/                 # Dependency injection
│   ├── app.ts              # App factory
│   └── server.ts           # Server startup
├── config/                 # Configuration files
├── prisma/                 # Prisma schema and migrations
├── test/                   # Test files
├── scripts/                # Utility scripts
├── docs/                   # Documentation
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker image definition
├── Makefile                # Development commands
└── README.md              # This file
```

## 🔧 Makefile Commands

The Makefile provides convenient commands for development:

### Setup Commands
```bash
make help              # Show all available commands
make install           # Install dependencies
make setup             # Complete setup (install, generate, migrate)
make setup:local       # Setup with .env check
```

### Development Commands
```bash
make dev               # Start development server
make build             # Build for production
```

### Database Commands
```bash
make migrate           # Run migrations (deploy)
make migrate:dev       # Create new migration
make migrate:reset     # Reset database (WARNING: Deletes data)
make migrate:status   # Check migration status
make seed              # Seed database
make studio            # Open Prisma Studio
```

### Testing Commands
```bash
make test              # Run all tests
make test:unit         # Unit tests only
make test:integration  # Integration tests only
make test:e2e          # E2E tests only
make test:watch        # Watch mode
make test:coverage     # With coverage
```

### Code Quality Commands
```bash
make lint              # Lint code
make lint:fix          # Fix linting issues
make format            # Format code
```

### Cleaning Commands
```bash
make clean             # Clean build artifacts
make clean:all         # Clean everything including node_modules
make clean:docker     # Clean Docker resources
make clean:logs        # Clean log files
```

### Docker Commands
```bash
make docker-build      # Build Docker image
make docker-up         # Start services
make docker-down       # Stop services
make docker-logs       # View logs
make docker-restart    # Restart services
make docker-clean      # Clean Docker resources
make docker:setup      # Complete Docker setup
```

### Utility Commands
```bash
make prisma:generate   # Generate Prisma Client
make prisma:studio     # Open Prisma Studio
make status            # Show project status
```

## ⚙️ Configuration

Configuration is managed through:

1. **Config Files** (priority order):
   - `config/default.json` - Default configuration
   - `config/development.json` - Development overrides
   - `config/staging.json` - Staging overrides
   - `config/production.json` - Production overrides

2. **Environment Variables** - Highest priority (overrides config files)

See `.env.example` for all available environment variables.

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL in .env
# Ensure database exists
createdb cart_db

# Check connection
psql $DATABASE_URL
```

#### 2. Prisma Client Not Generated

**Problem**: `@prisma/client` not found

**Solution**:
```bash
make prisma:generate
```

#### 3. Migration Errors

**Problem**: Migrations fail

**Solutions**:
```bash
# Check migration status
make migrate:status

# Reset database (WARNING: Deletes data)
make migrate:reset

# Re-run migrations
make migrate
```

#### 4. Port Already in Use

**Problem**: Port 3004 is already in use

**Solutions**:
```bash
# Find process using port
lsof -i :3004  # macOS/Linux
netstat -ano | findstr :3004  # Windows

# Kill process or change PORT in .env
```

#### 5. Docker Build Fails

**Problem**: Docker build errors

**Solutions**:
```bash
# Clean and rebuild
make clean:docker
make docker-build

# Check Docker is running
docker ps
```

#### 6. Module Not Found Errors

**Problem**: Cannot find modules

**Solutions**:
```bash
# Reinstall dependencies
make clean:all
make install
```

### Getting Help

- Check logs: `make docker-logs` or check application logs
- Verify environment: `make status`
- Check database: `make studio`
- Review configuration: Check `.env` and `config/` files

## 📝 License

MIT

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `make test`
4. Check code quality: `make lint && make format`
5. Submit a pull request

---

**Happy Coding! 🚀**

