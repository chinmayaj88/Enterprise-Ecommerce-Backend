<div align="center">

# 🍎 03 - macOS Setup

[![macOS](https://img.shields.io/badge/Platform-macOS-blue?style=for-the-badge&logo=apple&logoColor=white)](.)
[![Docker](https://img.shields.io/badge/Docker-Desktop-green?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-orange?style=flat-square)](.)

**Complete setup instructions for macOS**

</div>

---

## Prerequisites

Ensure you have completed [Prerequisites](./01-prerequisites.md) before starting.

## Important: Monorepo Architecture

**All services are in a single repository.** Clone the monorepo and navigate to the service you want to work on.

## Step 1: Clone the Repository

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

```bash
# Install dependencies for this service
npm install
```

**Expected output:**
```
added 234 packages in 1m
```

## Step 3: Start Infrastructure Services

<div align="center">

**🐳 Start required infrastructure**

</div>

**⚠️ Important:** Ensure Docker Desktop is running (check menu bar for Docker icon).

```bash
# Start infrastructure using Docker Compose
docker compose up -d

# This starts:
# - PostgreSQL database for this service
# - Redis (if configured)
```

**⏱️ Wait 10-15 seconds** for services to be ready.

## Step 4: Verify Infrastructure

Check that containers are running:

```bash
docker ps
```

You should see containers for:
- `postgres` (or `<service-name>-postgres`)
- `redis` (if configured)

## Step 5: Setup Environment Variables

```bash
# Services use config files (config/default.json, config/development.json, etc.)
# You can also create .env file for local overrides if needed
# cp env.example .env  # if env.example exists

# Set NODE_ENV to use the appropriate config
export NODE_ENV=development
```

## Step 6: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (if seed script exists)
npm run prisma:seed
```

## Step 7: Build Service

```bash
# Build TypeScript
npm run build
```

## Step 8: Verify Setup

### Test Service

```bash
# Start in development mode
npm run dev
```

**Test the service:**
```bash
# In another terminal
curl http://localhost:3001/health
```

## Step 9: Access Service

<div align="center">

**🌐 Access your service**

</div>

| Endpoint | URL | Description |
|:---:|:---|:---|
| **🚀 Service** | http://localhost:3001 | Main service (port from `.env`) |
| **📖 API Docs** | http://localhost:3001/api-docs | Swagger UI |
| **🏥 Health** | http://localhost:3001/health | Health check |

## Setting Up Multiple Services

To work with multiple services:

1. **Clone the monorepo repository once**
2. **Set up each service independently**
3. **Configure service URLs in each `.env`**
4. **Start services in separate terminals**

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

## Troubleshooting

### Docker Desktop Not Running

- Check menu bar for Docker icon
- Open Docker Desktop application
- Wait for it to start completely

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Errors

```bash
# Check containers
docker ps

# Check logs
docker compose logs
```

## Next Steps

1. [Environment Configuration](./05-environment-configuration.md)
2. [Developer Workflow](../03-developer-workflow.md)
3. Check service README.md

---

<div align="center">

**Navigation:**
- ⬅️ [← Previous: Linux Setup](./02-linux-setup.md)
- 🏠 [← Back to Setup Overview](./README.md)
- ➡️ [Next: Windows Setup →](./04-windows-setup.md)

[Back to Top](#-03---macos-setup)

</div>
