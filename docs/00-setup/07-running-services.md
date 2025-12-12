<div align="center">

# 🚀 07 - Running Services

[![Running](https://img.shields.io/badge/Running-Services-blue?style=for-the-badge)](.)
[![Development](https://img.shields.io/badge/Mode-Development-green?style=flat-square)](.)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-orange?style=flat-square)](.)

**Guide for starting, testing, and managing services in the monorepo architecture**

</div>

---

## Important: Monorepo Architecture

**Each service is in its own repository.** You need to clone each service separately:

```bash
# Clone each service independently
git clone <repo-url>/gateway-service.git
git clone <repo-url>/auth-service.git
git clone <repo-url>/user-service.git
# ... etc
```

## Starting a Single Service

### Step 1: Clone and Navigate

```bash
# Clone the monorepo (if not already cloned)
git clone <repository-url>
cd Enterprise-Ecommerce-Backend

# Navigate to the service
cd auth-service
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment

```bash
# Services use config files (already present in config/ directory)
# Set NODE_ENV to use the appropriate config
export NODE_ENV=development

# Optional: Create .env file for local overrides
# cp env.example .env  # if env.example exists
```

### Step 4: Start Infrastructure Services

```bash
# Start PostgreSQL and Redis via Docker
docker compose up -d postgres redis

# Or use the service's docker-compose.yml
docker compose up -d
```

### Step 5: Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### Step 6: Start the Service

```bash
# Development mode (with hot reload)
npm run dev

# Service will start on port specified in .env
# Default ports are listed below
```

## Service Ports

| Service | Port | Health Check | Repository |
|---------|------|--------------|------------|
| Gateway | 3000 | http://localhost:3000/health | `gateway-service` |
| Auth | 3001 | http://localhost:3001/health | `auth-service` |
| User | 3002 | http://localhost:3002/health | `user-service` |
| Product | 3003 | http://localhost:3003/health | `product-service` |
| Order | 3004 | http://localhost:3004/health | `order-service` |
| Payment | 3005 | http://localhost:3005/health | `payment-service` |
| Cart | 3006 | http://localhost:3006/health | `cart-service` |
| Notification | 3007 | http://localhost:3007/health | `notification-service` |
| Discount | 3008 | http://localhost:3008/health | `discount-service` |
| Shipping | 3009 | http://localhost:3009/health | `shipping-service` |
| Return | 3010 | http://localhost:3010/health | `return-service` |

## Running Multiple Services

To work with multiple services, you need to:

1. **Clone the monorepo repository once**
2. **Navigate to each service directory**
3. **Set up each service independently**
4. **Start each service in a separate terminal**

### Example: Running Gateway, Auth, and User Services

**Terminal 1 - Gateway Service:**
```bash
cd Enterprise-Ecommerce-Backend/gateway-service
npm install
cp env.example .env  # or use config files
# Edit .env with service URLs
docker compose up -d
npm run prisma:migrate
npm run dev
```

**Terminal 2 - Auth Service:**
```bash
cd Enterprise-Ecommerce-Backend/auth-service
npm install
cp env.example .env  # or use config files
docker compose up -d
npm run prisma:migrate
npm run dev
```

**Terminal 3 - User Service:**
```bash
cd Enterprise-Ecommerce-Backend/user-service
npm install
cp env.example .env  # or use config files
docker compose up -d
npm run prisma:migrate
npm run dev
```

## Testing Services

### Health Check

```bash
# Test service health
curl http://localhost:3001/health

# Expected response
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Readiness Check

```bash
# Check if service is ready
curl http://localhost:3001/ready

# Expected response
{
  "ready": true,
  "checks": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### API Testing

Each service has OpenAPI/Swagger documentation:

- **Auth Service**: http://localhost:3001/api-docs
- **User Service**: http://localhost:3002/api-docs
- **Product Service**: http://localhost:3003/api-docs
- (Similar for other services)

**Example API Call:**
```bash
# Register user via Auth Service
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Viewing Logs

### Service Logs

Logs appear in the terminal where you ran `npm run dev`.

### Docker Logs

```bash
# View database logs
docker logs <service-name>-postgres

# View Redis logs
docker logs redis

# Follow logs
docker logs -f <service-name>-postgres
```

## Stopping Services

### Stop Individual Service

Press `Ctrl+C` in the terminal where the service is running.

### Stop Infrastructure

```bash
# Stop Docker containers
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v
```

## Building Services

### Build Individual Service

```bash
cd <service-name>
npm run build
```

Output is in `dist/` directory.

### Production Build

```bash
# Build
npm run build

# Run production build
npm start
```

**Production mode:**
- No auto-reload
- Optimized builds
- Production logging

## Running Tests

### Run Service Tests

```bash
cd <service-name>
npm test
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run Integration Tests

```bash
npm run test:integration
```

## Service Configuration

### Environment Variables

Each service requires specific environment variables. See service `README.md` for complete list.

**Common variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/service_db

# Service URLs (for inter-service communication)
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
# ... etc

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# Port
PORT=3001
```

### Service URLs Configuration

When running multiple services, configure service URLs in each service's `.env`:

**Gateway Service `.env`:**
```env
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
# ... etc
```

**Order Service `.env`:**
```env
PRODUCT_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3005
SHIPPING_SERVICE_URL=http://localhost:3009
```

## Common Workflows

### Daily Development

```bash
# 1. Navigate to service
cd auth-service

# 2. Pull latest changes
git pull origin main

# 3. Start infrastructure
docker compose up -d

# 4. Start service
npm run dev

# 5. Make changes
# Service auto-reloads on file changes
```

### Testing Changes

```bash
# 1. Run tests
npm test

# 2. Check linting
npm run lint

# 3. Build to verify
npm run build
```

### Database Changes

```bash
# 1. Modify Prisma schema
# prisma/schema.prisma

# 2. Create migration
npm run prisma:migrate

# 3. Generate Prisma client
npm run prisma:generate

# 4. Restart service
npm run dev
```

## Troubleshooting

### Service Won't Start

1. **Check port is available:**
   ```bash
   # Linux/macOS
   lsof -i :3001
   
   # Windows
   netstat -ano | findstr :3001
   ```

2. **Check database is running:**
   ```bash
   docker ps | grep postgres
   ```

3. **Check environment variables:**
   ```bash
   cat .env
   ```

4. **Check service logs:**
   ```bash
   # Look at terminal output where service is running
   ```

### Service Crashes on Start

1. Check logs for errors
2. Verify database connection string in `.env`
3. Verify all required environment variables are set
4. Verify dependencies are installed: `npm install`
5. Check service README.md for specific requirements

### Port Already in Use

Change port in `.env` file:
```env
PORT=3002  # Change to available port
```

**Note:** If you change a service port, update other services' `.env` files that reference it.

### Database Connection Errors

1. **Verify database is running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Check DATABASE_URL in .env:**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/service_db
   ```

3. **Test connection:**
   ```bash
   psql $DATABASE_URL
   ```

### Service Can't Reach Other Services

1. **Verify other services are running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check service URLs in .env:**
   ```env
   AUTH_SERVICE_URL=http://localhost:3001
   ```

3. **Check network connectivity:**
   ```bash
   # Test from service container (if using Docker)
   docker exec -it <service-container> curl http://auth-service:3001/health
   ```

## Next Steps

After services are running:

1. [Troubleshooting](./08-troubleshooting.md) - Common issues
2. [Developer Workflow](../03-developer-workflow.md) - Development guide
3. [Service Collaboration](../04-service-collaboration.md) - How services work together
4. [Architecture](../02-codebase-architecture/README.md) - Understand structure

---

**Navigation:**
- ⬅️ [← Previous: Database Setup](./06-database-setup.md)
- 🏠 [← Back to Setup Overview](./README.md)
- ➡️ [Next: Troubleshooting →](./08-troubleshooting.md)
