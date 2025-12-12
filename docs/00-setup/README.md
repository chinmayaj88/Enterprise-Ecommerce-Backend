<div align="center">

# ⚙️ 00 - Setup Guide

[![Setup](https://img.shields.io/badge/Setup-Guide-blue?style=for-the-badge)](.)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-green?style=flat-square)](.)
[![Services](https://img.shields.io/badge/Services-11-orange?style=flat-square)](.)

**Complete setup instructions for the E-Commerce Microservices Platform**

</div>

---

## ⚠️ Important: Monorepo Architecture

<div align="center">

**Each service is in its own repository.** You need to clone each service separately:

</div>

```bash
# Clone each service independently
git clone <repo-url>/gateway-service.git
git clone <repo-url>/auth-service.git
git clone <repo-url>/user-service.git
# ... etc
```

## 📚 Quick Navigation

<div align="center">

| Document | Description | Platform |
|:---:|:---|:---:|
| **[README.md](./README.md)** | This overview (start here) | All |
| **[01 - Prerequisites](./01-prerequisites.md)** | Required software and tools | All |
| **[02 - Linux Setup](./02-linux-setup.md)** | Step-by-step Linux instructions | 🐧 Linux |
| **[03 - macOS Setup](./03-macos-setup.md)** | Step-by-step macOS instructions | 🍎 macOS |
| **[04 - Windows Setup](./04-windows-setup.md)** | Step-by-step Windows instructions | 🪟 Windows |
| **[05 - Environment Configuration](./05-environment-configuration.md)** | Setting up environment variables | All |
| **[06 - Database Setup](./06-database-setup.md)** | Database initialization and migrations | All |
| **[07 - Running Services](./07-running-services.md)** | Starting and testing services | All |
| **[08 - Troubleshooting](./08-troubleshooting.md)** | Common issues and solutions | All |

</div>

## Overview

This guide will help you set up **a single service** on your local machine. The setup process includes:

1. Installing prerequisites (Node.js, Docker, etc.)
2. Cloning the monorepo repository
3. Navigating to the service directory
4. Installing dependencies
5. Starting infrastructure services (database, Redis)
6. Setting up database
7. Configuring environment variables
8. Running the service

## Platform-Specific Guides

Choose your operating system:

- 🐧 **[Linux Setup](./02-linux-setup.md)** - For Ubuntu, Debian, Fedora, etc.
- 🍎 **[macOS Setup](./03-macos-setup.md)** - For Mac computers
- 🪟 **[Windows Setup](./04-windows-setup.md)** - For Windows 10/11

## Quick Start (All Platforms)

If you already have the prerequisites installed:

```bash
# 1. Clone monorepo repository
git clone <repository-url>
cd Enterprise-Ecommerce-Backend

# 2. Navigate to service
cd <service-name>

# 3. Install dependencies
npm install

# 4. Set up environment
cp env.txt .env
# Edit .env with your configuration

# 5. Start infrastructure (PostgreSQL, Redis)
docker compose up -d

# 6. Set up database
npm run prisma:generate
npm run prisma:migrate

# 7. Start service
npm run dev
```

For detailed platform-specific instructions, see the guides above.

## Setting Up Multiple Services

To work with multiple services:

1. **Clone the monorepo repository once**
   ```bash
   git clone <repository-url>
   cd Enterprise-Ecommerce-Backend
   ```

2. **Set up each service independently**
   - Navigate to each service directory
   - Follow the setup steps for each service
   - Each service has its own database
   - Each service has its own `.env` file

3. **Configure service URLs**
   - In each service's `.env`, configure URLs to other services
   - Example: Gateway service needs URLs for all other services

4. **Start services in separate terminals**
   ```bash
   # Terminal 1
   cd gateway-service && npm run dev
   
   # Terminal 2
   cd auth-service && npm run dev
   
   # Terminal 3
   cd user-service && npm run dev
   ```

## What Gets Installed

### Infrastructure Services (via Docker)

Each service typically needs:
- PostgreSQL database (one per service)
- Redis (shared or per-service, depending on setup)

### Service

- One microservice (the one you cloned)

## Service-Specific Setup

**Each service has detailed setup instructions in its `README.md`:**

- Check the service's `README.md` for:
  - Service-specific requirements
  - Required environment variables
  - Database schema information
  - API documentation
  - Service-specific setup steps

## Next Steps

After setup is complete:

1. Read [Developer Workflow](../03-developer-workflow.md) to learn how to work on the project
2. Review [Service README](../) for service-specific documentation
3. Check [Service Collaboration](../04-service-collaboration.md) for how services work together
4. Review [Architecture](../02-codebase-architecture/README.md) to understand the structure

## Getting Help

If you encounter issues:

1. Check [Troubleshooting Guide](./08-troubleshooting.md)
2. Review platform-specific setup guide
3. Check service `README.md` for service-specific help
4. Check service logs: `docker logs <container-name>`
5. Verify prerequisites are installed correctly

## Service Ports Reference

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

---

<div align="center">

## 🚀 Ready to Start?

**Choose your platform:**

[🐧 Linux Setup →](./02-linux-setup.md) | [🍎 macOS Setup →](./03-macos-setup.md) | [🪟 Windows Setup →](./04-windows-setup.md)

---

[Back to Top](#-00---setup-guide)

</div>
