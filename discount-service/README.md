# Ecommerce Discount Service

Discount and promotion management microservice built with **Clean Architecture** principles. This service handles coupon management, promotion rules, discount calculations, and validation.

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

- **Domain Layer**: Core business logic, entities (Coupon, Promotion, etc.), repository interfaces
- **Application Layer**: Use cases (ValidateCoupon, ApplyCoupon, etc.), controllers, DTOs
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
- **Event Publishing**: OCI Streaming (optional)

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

### Step 1: Clone and Navigate

```bash
cd discount-service
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using Make
make install
```

### Step 3: Set Up Environment Variables

```bash
# Optional: Create .env file for local overrides
# The service uses config/default.json and config/development.json by default

**Configuration Files** (priority order):
1. `config/default.json` - Default configuration
2. `config/development.json` - Development overrides
3. `.env` - Environment variables (highest priority, optional)
```

**Required Configuration** (in `config/development.json` or `.env`):

```env
# Application
NODE_ENV=development
PORT=3008

# Database
DATABASE_URL=postgresql://discount_user:discount_pass@localhost:5433/discount_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Redis (optional)
REDIS_URL=redis://localhost:6380
```

### Step 4: Set Up Database

#### Option A: Using Local PostgreSQL

1. **Create Database**:
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE discount_db;
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

The service will start on `http://localhost:3008`

### Step 7: Verify Setup

```bash
# Check health
curl http://localhost:3008/health

# Check readiness
curl http://localhost:3008/ready

# View API documentation
open http://localhost:3008/api-docs
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

- **Discount Service**: `http://localhost:3008`
- **PostgreSQL**: `localhost:5433`
- **Redis**: `localhost:6380`

## 📚 API Documentation

Once the service is running:

- **Swagger UI**: `http://localhost:3008/api-docs`
- **OpenAPI Spec**: `http://localhost:3008/api-docs/openapi.yaml`

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

#### Coupon Endpoints
- `POST /api/v1/coupons` - Create coupon (Admin)
- `GET /api/v1/coupons` - List coupons
- `GET /api/v1/coupons/:id` - Get coupon by ID
- `GET /api/v1/coupons/code/:code` - Get coupon by code
- `PUT /api/v1/coupons/:id` - Update coupon (Admin)
- `DELETE /api/v1/coupons/:id` - Delete coupon (Admin)
- `POST /api/v1/coupons/:id/activate` - Activate coupon (Admin)
- `POST /api/v1/coupons/:id/deactivate` - Deactivate coupon (Admin)

#### Promotion Endpoints
- `POST /api/v1/promotions` - Create promotion (Admin)
- `GET /api/v1/promotions` - List promotions
- `GET /api/v1/promotions/:id` - Get promotion by ID
- `PUT /api/v1/promotions/:id` - Update promotion (Admin)
- `DELETE /api/v1/promotions/:id` - Delete promotion (Admin)
- `POST /api/v1/promotions/:id/activate` - Activate promotion (Admin)
- `POST /api/v1/promotions/:id/deactivate` - Deactivate promotion (Admin)
- `POST /api/v1/promotions/:id/rules` - Add promotion rule (Admin)
- `PUT /api/v1/promotions/:id/rules/:ruleId` - Update promotion rule (Admin)
- `DELETE /api/v1/promotions/:id/rules/:ruleId` - Delete promotion rule (Admin)

#### Discount Endpoints
- `POST /api/v1/discounts/validate` - Validate coupon code
- `POST /api/v1/discounts/calculate` - Calculate discount amount
- `POST /api/v1/discounts/apply` - Apply coupon to cart (Auth required)
- `POST /api/v1/discounts/evaluate-promotions` - Evaluate applicable promotions

## 📁 Project Structure

```
ecommerce-discount-service/
├── src/
│   ├── domain/              # Business logic
│   │   ├── entities/        # Domain entities (Coupon, Promotion, etc.)
│   │   └── repositories/    # Repository interfaces
│   ├── application/         # Application layer
│   │   ├── use-cases/       # Business use cases
│   │   ├── controllers/     # HTTP controllers
│   │   └── dto/             # Data transfer objects
│   ├── infrastructure/      # External concerns
│   │   ├── db/             # Database implementations
│   │   ├── cache/          # Caching
│   │   ├── logging/        # Logging
│   │   ├── config/         # Configuration
│   │   ├── events/         # Event publishing/consuming
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
├── .env.example            # Environment variables template
├── openapi.yaml            # OpenAPI specification
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
createdb discount_db

# Check connection
psql $DATABASE_URL
```

#### 2. Prisma Client Not Generated

**Problem**: `@prisma/client` not found

**Solution**:
```bash
make prisma:generate
```

#### 3. Port Already in Use

**Problem**: Port 3008 is already in use

**Solutions**:
```bash
# Find process using port
lsof -i :3008  # macOS/Linux
netstat -ano | findstr :3008  # Windows

# Kill process or change PORT in .env
```

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

