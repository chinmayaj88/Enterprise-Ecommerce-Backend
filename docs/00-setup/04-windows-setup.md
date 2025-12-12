<div align="center">

# 🪟 04 - Windows Setup

[![Windows](https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge&logo=windows&logoColor=white)](.)
[![WSL2](https://img.shields.io/badge/WSL2-Required-green?style=flat-square&logo=linux&logoColor=white)](https://docs.microsoft.com/en-us/windows/wsl/)
[![Docker](https://img.shields.io/badge/Docker-Desktop-orange?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

**Complete setup instructions for Windows 10/11**

</div>

---

## Prerequisites

Ensure you have completed [Prerequisites](./01-prerequisites.md) before starting.

**Important:** Windows requires WSL2 and Docker Desktop.

## Important: Monorepo Architecture

**All services are in a single repository.** Clone the monorepo and navigate to the service you want to work on.

## Step 1: Clone the Repository

### Using Git Bash or PowerShell

```powershell
# Navigate to your projects directory
cd C:\Users\YourName\projects

# Clone the monorepo repository
git clone <repository-url>
cd Enterprise-Ecommerce-Backend

# Navigate to the service you want to work on (example: auth-service)
cd auth-service

# Verify you're in the right directory
dir
```

### Using WSL

```bash
# Open WSL terminal
wsl

# Navigate to Windows directory
cd /mnt/c/Users/YourName/projects

# Clone the monorepo repository
git clone <repository-url>
cd Enterprise-Ecommerce-Backend

# Navigate to the service you want to work on
cd auth-service
```

## Step 2: Install Dependencies

### Using PowerShell or Command Prompt

```powershell
# Install dependencies for this service
npm install
```

### Using WSL

```bash
npm install
```

## Step 3: Start Infrastructure Services

**Important:** Ensure Docker Desktop is running.

### Using PowerShell

```powershell
# Start infrastructure
docker compose up -d
```

### Using WSL

```bash
docker compose up -d
```

## Step 4: Setup Environment Variables

### Using PowerShell

```powershell
# Copy environment template
# Services use config files (config/default.json, config/development.json, etc.)
# You can also create .env file for local overrides if needed
# Copy-Item env.example .env  # if env.example exists

# Set NODE_ENV to use the appropriate config
$env:NODE_ENV="development"
```

### Using WSL

```bash
# Services use config files (config/default.json, config/development.json, etc.)
# You can also create .env file for local overrides if needed
# cp env.example .env  # if env.example exists

# Set NODE_ENV to use the appropriate config
export NODE_ENV=development
```

## Step 5: Setup Database

```powershell
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (if seed script exists)
npm run prisma:seed
```

## Step 6: Build Service

```powershell
npm run build
```

## Step 7: Verify Setup

### Test Service

```powershell
# Start in development mode
npm run dev
```

**Test the service:**
```powershell
# In another terminal
curl http://localhost:3001/health
```

## Step 8: Access Service

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

| Task | PowerShell Command | WSL Command |
|:---:|:---|:---|
| **🐳 Start infrastructure** | `docker compose up -d` | `docker compose up -d` |
| **🛑 Stop infrastructure** | `docker compose down` | `docker compose down` |
| **🗄️ Setup database** | `npm run prisma:generate && npm run prisma:migrate` | `npm run prisma:generate && npm run prisma:migrate` |
| **🚀 Start service** | `npm run dev` | `npm run dev` |
| **📦 Build service** | `npm run build` | `npm run build` |

## Troubleshooting

### Docker Desktop Not Running

- Open Docker Desktop application
- Wait for it to start completely
- Check system tray for Docker icon

### WSL2 Issues

```powershell
# Check WSL version
wsl --list --verbose

# Update to WSL2 if needed
wsl --set-version <distro> 2
```

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

### Database Connection Errors

```powershell
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
- ⬅️ [← Previous: macOS Setup](./03-macos-setup.md)
- 🏠 [← Back to Setup Overview](./README.md)
- ➡️ [Next: Environment Configuration →](./05-environment-configuration.md)

[Back to Top](#-04---windows-setup)

</div>
