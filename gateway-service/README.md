# Ecommerce Gateway Service

API Gateway microservice built with **Clean Architecture** principles. This service acts as the single entry point for all API requests, providing request routing, authentication, rate limiting, circuit breaking, caching, and monitoring capabilities.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Docker Development](#docker-development)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Makefile Commands](#makefile-commands)
- [Production Readiness](#production-readiness)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture

This service follows **Clean Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Interfaces Layer                      │
│  (HTTP REST API, Routes, Middleware)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                       │
│  (Circuit Breakers, Cache, Health, Logging, Metrics)     │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

- **Infrastructure Layer**: External concerns (circuit breakers, cache, health monitoring, logging, metrics, config)
- **Interfaces Layer**: Entry points (HTTP REST API, routes, middleware)

## 🛠️ Tech Stack

- **Runtime**: Node.js 22+
- **Language**: TypeScript
- **Framework**: Express.js
- **Proxy**: http-proxy-middleware
- **Cache**: In-memory (can be extended to Redis)
- **Logging**: Winston
- **Metrics**: Prometheus
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 📦 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** 22.0.0 or higher
- **npm** 10.0.0 or higher
- **Docker** and **Docker Compose** (optional, for Docker development)
- **Backend Services** running (or use mock services for development)

### Verify Prerequisites

```bash
node --version  # Should be v22.0.0 or higher
npm --version   # Should be 10.0.0 or higher
docker --version
```

## 🚀 Local Development Setup

### Step 1: Clone and Navigate

```bash
cd gateway-service
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
```

**Configuration Files** (priority order):
1. `config/default.json` - Default configuration
2. `config/development.json` - Development overrides
3. `.env` - Environment variables (highest priority, optional)

**Required Configuration** (in `config/development.json` or `.env`):

```env
# Application
NODE_ENV=development
PORT=3000

# JWT (for token verification with auth-service)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Backend Service URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
CART_SERVICE_URL=http://localhost:3006
ORDER_SERVICE_URL=http://localhost:3007
PAYMENT_SERVICE_URL=http://localhost:3006
NOTIFICATION_SERVICE_URL=http://localhost:3009
DISCOUNT_SERVICE_URL=http://localhost:3008
SHIPPING_SERVICE_URL=http://localhost:3007
RETURN_SERVICE_URL=http://localhost:3010

# Redis (optional, for distributed rate limiting)
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Step 4: Complete Setup (Automated)

For a complete automated setup:

```bash
# Complete setup (installs dependencies)
make setup

# Or for local development with .env check
make setup:local
```

### Step 5: Start Development Server

```bash
# Start development server with hot reload
npm run dev

# Or using Make
make dev
```

The service will start on `http://localhost:3000`

### Step 6: Verify Setup

```bash
# Check health
curl http://localhost:3000/health

# Check readiness
curl http://localhost:3000/ready

# View API documentation
open http://localhost:3000/api-docs
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

## 🧪 Testing

```bash
# Run all tests
make test

# Watch mode
make test:watch

# With coverage
make test:coverage
```

## 🐳 Docker Development

### Quick Start with Docker

```bash
# Complete Docker setup (build, start)
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

# Clean Docker resources
make docker-clean
```

### Docker Services

- **Gateway Service**: `http://localhost:3000`
- **Redis**: `localhost:6379`

## 📚 API Documentation

Once the service is running:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/api-docs/openapi.yaml`

### Health Checks

- **Health**: `GET /health` - Gateway and backend service health
- **Readiness**: `GET /ready` - Kubernetes readiness probe
- **Service Health**: `GET /health/services` - Detailed service health
- **Metrics**: `GET /metrics` - Prometheus metrics
- **Legacy Metrics**: `GET /metrics/json` - JSON format metrics

### Proxied Routes

All `/api/v1/*` routes are proxied to backend services:

| Route Pattern | Backend Service | Auth Required | Cacheable |
|---------------|----------------|---------------|-----------|
| `/api/v1/auth/*` | Auth Service | Conditional | No |
| `/api/v1/security/*` | Auth Service | Yes | No |
| `/api/v1/users/*` | User Service | Yes | Yes (30s) |
| `/api/v1/products/*` | Product Service | Conditional | Yes (1m) |
| `/api/v1/categories/*` | Product Service | Conditional | Yes (5m) |
| `/api/v1/carts/*` | Cart Service | Conditional | No |
| `/api/v1/orders/*` | Order Service | Yes | No |
| `/api/v1/payments/*` | Payment Service | Conditional | No |
| `/api/v1/payment-methods/*` | Payment Service | Yes | No |
| `/api/v1/webhooks/*` | Payment Service | No | No |
| `/api/v1/notifications/*` | Notification Service | Yes | No |
| `/api/v1/templates/*` | Notification Service | Yes | No |
| `/api/v1/preferences/*` | Notification Service | Yes | No |
| `/api/v1/coupons/*` | Discount Service | Conditional | No |
| `/api/v1/promotions/*` | Discount Service | Conditional | No |
| `/api/v1/discounts/*` | Discount Service | Conditional | No |
| `/api/v1/rates/*` | Shipping Service | No | No |
| `/api/v1/shipments/*` | Shipping Service | Conditional | No |
| `/api/v1/zones/*` | Shipping Service | Conditional | Yes (5m) |
| `/api/v1/methods/*` | Shipping Service | Conditional | Yes (5m) |
| `/api/v1/returns/*` | Return Service | Yes | No |

## 📁 Project Structure

```
gateway-service/
├── src/
│   ├── infrastructure/      # External concerns
│   │   ├── cache/          # Response caching
│   │   ├── circuit-breaker/ # Circuit breaker implementation
│   │   ├── health/          # Service health monitoring
│   │   ├── logging/         # Logging
│   │   ├── metrics/         # Prometheus metrics
│   │   └── config/          # Configuration
│   ├── interfaces/          # Entry points
│   │   └── http/           # REST API
│   │       ├── routes/     # Proxy routes
│   │       └── middleware/  # Express middleware
│   ├── app.ts              # App factory
│   └── server.ts           # Server startup
├── config/                 # Configuration files
│   ├── default.json
│   ├── development.json
│   ├── staging.json
│   └── production.json
├── test/                   # Test files
├── .github/                # CI/CD workflows
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker image definition
├── Makefile                # Development commands
├── openapi.yaml            # OpenAPI specification
├── jest.config.js          # Jest configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## 🔧 Makefile Commands

The Makefile provides convenient commands for development:

### Setup Commands
```bash
make help              # Show all available commands
make install           # Install dependencies
make setup             # Complete setup (install)
make setup:local       # Setup with .env check
```

### Development Commands
```bash
make dev               # Start development server
make build             # Build for production
```

### Testing Commands
```bash
make test              # Run all tests
make test:watch         # Watch mode
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

## 🚀 Production Readiness

### Production Checklist

- [x] **Clean Architecture** - Proper layer separation
- [x] **Configuration Management** - JSON config files with env overrides
- [x] **Error Handling** - Centralized error handling
- [x] **Logging** - Winston logger with proper levels
- [x] **Metrics** - Prometheus metrics endpoint
- [x] **Health Checks** - `/health` and `/ready` endpoints
- [x] **Graceful Shutdown** - Proper resource cleanup
- [x] **Docker Support** - Dockerfile and docker-compose
- [x] **CI/CD** - GitHub Actions workflows (CI and CD)
- [x] **Security** - Helmet, CORS, rate limiting
- [x] **Circuit Breakers** - Resilient service calls
- [x] **Response Caching** - Performance optimization
- [x] **Service Health Monitoring** - Continuous health checks
- [x] **Documentation** - OpenAPI/Swagger documentation

### Environment-Specific Configuration

Configuration is managed through:

1. **Config Files** (priority order):
   - `config/default.json` - Default configuration
   - `config/development.json` - Development overrides
   - `config/staging.json` - Staging overrides
   - `config/production.json` - Production overrides

2. **Environment Variables** - Highest priority (overrides config files)

### Production Deployment

1. **Set Environment Variables**:
   ```bash
   NODE_ENV=production
   JWT_SECRET=<strong-secret>
   AUTH_SERVICE_URL=<auth-service-url>
   USER_SERVICE_URL=<user-service-url>
   # ... (all other service URLs)
   ALLOWED_ORIGINS=<frontend-domain>
   REDIS_URL=<redis-url>
   ```

2. **Build and Deploy**:
   ```bash
   # Build Docker image
   make docker-build

   # Or deploy via CI/CD
   # Push to main branch triggers production deployment
   ```

## 🐛 Troubleshooting

### Common Issues

#### 1. Service Unavailable (503)

**Problem**: Backend services returning 503

**Solutions**:
```bash
# Check service health
curl http://localhost:3000/health/services

# Check circuit breaker status
curl http://localhost:3000/metrics/json

# Verify service URLs in .env
# Ensure backend services are running
```

#### 2. Authentication Failures (401)

**Problem**: JWT validation failing

**Solutions**:
```bash
# Verify JWT_SECRET matches auth-service
# Check token expiration
# Ensure token format: Authorization: Bearer <token>
```

#### 3. Rate Limit Errors (429)

**Problem**: Too many requests

**Solutions**:
```bash
# Check rate limit configuration in .env
# Verify Redis connection (if using distributed rate limiting)
# Review rate limit headers in response
```

#### 4. Port Already in Use

**Problem**: Port 3000 is already in use

**Solutions**:
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change PORT in .env
```

### Getting Help

- Check logs: `make docker-logs` or check application logs
- Verify environment: `make status`
- Review configuration: Check `.env` and `config/` files
- Check metrics: Visit `/metrics/json` for detailed metrics

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

