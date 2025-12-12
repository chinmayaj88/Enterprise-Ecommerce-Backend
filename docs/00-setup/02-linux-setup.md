<div align="center">

# 🐧 02 - Linux Setup

[![Linux](https://img.shields.io/badge/Platform-Linux-blue?style=for-the-badge&logo=linux&logoColor=white)](.)
[![Ubuntu](https://img.shields.io/badge/Distro-Ubuntu%20%7C%20Debian%20%7C%20Fedora-green?style=flat-square)](.)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-orange?style=flat-square)](.)

**Complete setup instructions for Linux (Ubuntu, Debian, Fedora, etc.)**

</div>

---

## Prerequisites

Ensure you have completed [Prerequisites](./01-prerequisites.md) before starting.

## Important: Monorepo Architecture

**All services are in a single repository.** Clone the monorepo and navigate to the service you want to work on.

## Step 1: Clone the Repository

<div align="center">

**📦 Clone the monorepo repository**

</div>

```bash
# Navigate to your projects directory
cd ~/projects  # or wherever you keep projects

# Clone the monorepo repository
git clone <repository-url>
cd Enterprise-Ecommerce-Backend

# Navigate to the service you want to work on (example: auth-service)
cd auth-service

# Verify you're in the right directory
ls -la
```

## Step 2: Install Dependencies

<div align="center">

**📥 Install service dependencies**

</div>

```bash
# Install dependencies for this service
npm install

# This installs dependencies for the service only
```

**Expected output:**
```
added 234 packages in 1m
```

## Step 3: Start Infrastructure Services

<div align="center">

**🐳 Start required infrastructure (PostgreSQL, Redis)**

</div>

```bash
# Start infrastructure using Docker Compose
docker compose up -d

# This starts:
# - PostgreSQL database for this service
# - Redis (if configured)
```

**⏱️ Wait 10-15 seconds** for services to be ready.

## Step 4: Verify Infrastructure

<div align="center">

**✅ Check that containers are running**

</div>

```bash
docker ps
```

You should see containers for:
- ✅ `postgres` (or `<service-name>-postgres`)
- ✅ `redis` (if configured)

**If containers aren't running:**
```bash
# Check logs
docker compose logs

# Restart if needed
docker compose restart
```

## Step 5: Setup Environment Variables

<div align="center">

**⚙️ Configure environment variables**

</div>

```bash
# Services use config files (config/default.json, config/development.json, etc.)
# You can also create .env file for local overrides if needed
# cp env.example .env  # if env.example exists

# Set NODE_ENV to use the appropriate config
export NODE_ENV=development
```

**Key variables to configure:**

| Variable | Description |
|:---:|:---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection (if used) |
| `PORT` | Service port |
| **Service-specific** | See service README.md |

## Step 6: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (if seed script exists)
npm run prisma:seed
```

**Expected output:**
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database
Migration applied successfully
```

## Step 7: Build Service

```bash
# Build TypeScript
npm run build
```

This compiles TypeScript to JavaScript in `dist/` directory.

## Step 8: Verify Setup

### Test Infrastructure

```bash
# Check PostgreSQL is accessible
psql $DATABASE_URL -c "SELECT version();"

# Or using Docker
docker exec -it <postgres-container> psql -U <user> -d <database> -c "SELECT version();"

# Check Redis is accessible (if used)
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

### Test Service

```bash
# Start in development mode
npm run dev
```

**Expected output:**
```
Service started on port 3001
```

**Test the service:**
```bash
# In another terminal
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Step 9: Access Service

<div align="center">

**🌐 Access your service**

</div>

### Service URL

| Endpoint | URL | Description |
|:---:|:---|:---|
| **🚀 Service** | http://localhost:3001 | Main service (port from `.env`) |
| **📖 API Docs** | http://localhost:3001/api-docs | Swagger UI |
| **🏥 Health** | http://localhost:3001/health | Health check |

### Service Ports Reference

<div align="center">

**All 11 services and their ports**

</div>

| Service | Port | Repository | Documentation |
|:---:|:---:|:---|:---|
| 🌐 **Gateway** | 3000 | `gateway-service` | [README](../../gateway-service/README.md) |
| 🔐 **Auth** | 3001 | `auth-service` | [README](../../auth-service/README.md) |
| 👤 **User** | 3002 | `user-service` | [README](../../user-service/README.md) |
| 📦 **Product** | 3003 | `product-service` | [README](../../product-service/README.md) |
| 🛒 **Cart** | 3006 | `cart-service` | [README](../../cart-service/README.md) |
| 📝 **Order** | 3004 | `order-service` | [README](../../order-service/README.md) |
| 💳 **Payment** | 3005 | `payment-service` | [README](../../payment-service/README.md) |
| 📧 **Notification** | 3007 | `notification-service` | [README](../../notification-service/README.md) |
| 🎟️ **Discount** | 3008 | `discount-service` | [README](../../discount-service/README.md) |
| 🚚 **Shipping** | 3009 | `shipping-service` | [README](../../shipping-service/README.md) |
| ↩️ **Return** | 3010 | `return-service` | [README](../../return-service/README.md) |

## Setting Up Multiple Services

To work with multiple services:

1. **Clone the monorepo repository once**
   ```bash
   git clone <repository-url>
   cd Enterprise-Ecommerce-Backend
   ```

2. **Set up each service independently**
   - Follow steps above for each service
   - Each has its own database
   - Each has its own `.env`

3. **Configure service URLs**
   - In each service's `.env`, configure URLs to other services
   - Example Gateway `.env`:
     ```env
     AUTH_SERVICE_URL=http://localhost:3001
     USER_SERVICE_URL=http://localhost:3002
     ```

4. **Start services in separate terminals**
   ```bash
   # Terminal 1
   cd gateway-service && npm run dev
   
   # Terminal 2
   cd auth-service && npm run dev
   
   # Terminal 3
   cd user-service && npm run dev
   ```

## Common Commands

<div align="center">

**🔧 Quick reference for common commands**

</div>

| Task | Command |
|:---:|:---|
| **🐳 Start infrastructure** | `docker compose up -d` |
| **🛑 Stop infrastructure** | `docker compose down` |
| **🗄️ Setup database** | `npm run prisma:generate && npm run prisma:migrate` |
| **🚀 Start service** | `npm run dev` |
| **📦 Build service** | `npm run build` |
| **🧪 Run tests** | `npm test` |
| **📋 View logs** | `docker compose logs -f` |

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>

# Or change port in .env
PORT=3002
```

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker
```

### Database Connection Errors

```bash
# Check containers are running
docker ps

# Check database logs
docker compose logs postgres

# Restart containers
docker compose restart
```

### Prisma Client Generation Issues

```bash
# Regenerate Prisma client
npm run prisma:generate

# Check Prisma schema
cat prisma/schema.prisma
```

### Service Won't Start

1. Check `.env` file exists and is configured
2. Verify database is running: `docker ps`
3. Check service logs: Look at terminal output
4. Verify port is available: `lsof -i :3001`

## Next Steps

After setup is complete:

1. Read [Environment Configuration](./05-environment-configuration.md) for customizing settings
2. Review [Developer Workflow](../03-developer-workflow.md)
3. Check service README.md for service-specific information
4. Review [Service Collaboration](../04-service-collaboration.md)

## Summary

<div align="center">

**✅ Setup complete!**

</div>

| Step | Status |
|:---:|:---|
| ✅ **Service repository cloned** | Complete |
| ✅ **Dependencies installed** | Complete |
| ✅ **Infrastructure services running** | Complete |
| ✅ **Environment variables configured** | Complete |
| ✅ **Database setup** | Complete |
| ✅ **Service built** | Complete |
| ✅ **Ready to develop!** | 🎉 |

---

<div align="center">

**Navigation:**
- ⬅️ [← Previous: Prerequisites](./01-prerequisites.md)
- 🏠 [← Back to Setup Overview](./README.md)
- ➡️ [Next: macOS Setup →](./03-macos-setup.md)

[Back to Top](#-02---linux-setup)

</div>
