<div align="center">

# 📚 E-Commerce Microservices Platform - Documentation

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Enterprise-Grade Monorepo Architecture**

[![Services](https://img.shields.io/badge/Services-11-blue?style=flat-square)](#services)
[![Microservices](https://img.shields.io/badge/Architecture-Microservices-green?style=flat-square)](#architecture)
[![Documentation](https://img.shields.io/badge/Docs-Comprehensive-orange?style=flat-square)](#-documentation-sections)

</div>

---

This platform consists of **11 independent microservices** in a monorepo structure. This documentation provides a complete guide for developers to understand, contribute, set up locally, and deploy using industry best practices.

## 🎯 Start Here - Quick Navigation

**New to the project?** Follow these steps in order:

1. **[00 - Project Overview](#00-project-overview)** - Understand the architecture
2. **[01 - Prerequisites](#01-prerequisites)** - Install required tools
3. **[02 - Local Setup](#02-local-setup)** - Set up a service locally
4. **[03 - Development Workflow](#03-development-workflow)** - Learn how to develop
5. **[04 - Contributing](#04-contributing)** - Contribute to the project
6. **[05 - Deployment](#05-deployment)** - Deploy to production

---

## 00. Project Overview

### Architecture

This is a **monorepo microservices architecture** where all services are in a single repository:

```
┌─────────────────────────────────────────────────────────┐
│              E-Commerce Platform                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Gateway  │  │   Auth   │  │   User   │  ...        │
│  │ Service  │  │ Service  │  │ Service │             │
│  │ (Repo)   │  │ (Repo)   │  │ (Repo)  │             │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  Each service:                                          │
│  • Own directory in monorepo                           │
│  • Own CI/CD pipeline                                   │
│  • Own database                                         │
│  • Independent deployment                               │
└─────────────────────────────────────────────────────────┘
```

### Services

<div align="center">

**11 Microservices | Each Independently Deployable**

</div>

| # | Service | Port | Repository | Purpose |
|---|---------|------|------------|---------|
| 🌐 | **Gateway Service** | 3000 | `gateway-service` | API Gateway, routing, rate limiting |
| 🔐 | **Auth Service** | 3001 | `auth-service` | Authentication, authorization, JWT |
| 👤 | **User Service** | 3002 | `user-service` | User management, profiles |
| 📦 | **Product Service** | 3003 | `product-service` | Product catalog, inventory |
| 🛒 | **Cart Service** | 3006 | `cart-service` | Shopping cart management |
| 📝 | **Order Service** | 3004 | `order-service` | Order processing, fulfillment |
| 💳 | **Payment Service** | 3005 | `payment-service` | Payment processing |
| 📧 | **Notification Service** | 3007 | `notification-service` | Email, SMS, push notifications |
| 🎟️ | **Discount Service** | 3008 | `discount-service` | Coupons, promotions |
| 🚚 | **Shipping Service** | 3009 | `shipping-service` | Shipping rates, tracking |
| ↩️ | **Return Service** | 3010 | `return-service` | Returns, refunds |

### Technology Stack

<div align="center">

| Category | Technologies |
|:---:|:---|
| **🟢 Runtime** | Node.js 22+ |
| **📘 Language** | TypeScript |
| **🌐 Framework** | Express.js |
| **🗄️ Database** | PostgreSQL (via Prisma ORM) |
| **⚡ Cache** | Redis |
| **🐳 Container** | Docker |
| **☸️ Orchestration** | Kubernetes (Helm) |
| **🏗️ Infrastructure** | Terraform (OCI) |
| **🔄 CI/CD** | GitHub Actions (per service) |
| **📊 Monitoring** | Prometheus, Grafana |
| **📝 Logging** | Winston |

</div>

### Key Principles

<div align="center">

| Principle | Description |
|:---:|:---|
| **🎯 Service Independence** | Each service is completely independent |
| **🏗️ Clean Architecture** | Layered architecture (Core, Application, Infrastructure) |
| **📖 API-First** | OpenAPI/Swagger specifications |
| **📨 Event-Driven** | Asynchronous communication via OCI Queue |
| **☁️ Infrastructure as Code** | Terraform for infrastructure, Helm for Kubernetes |
| **🔄 DevOps** | Each service has its own CI/CD pipeline |

</div>

---

## 01. Prerequisites

### Required Software

Before setting up any service, install:

1. **Node.js** >= 22.0.0
   ```bash
   # Check version
   node --version
   ```

2. **npm** >= 10.0.0
   ```bash
   # Check version
   npm --version
   ```

3. **Docker** & Docker Compose
   ```bash
   # Check version
   docker --version
   docker compose version
   ```

4. **Git**
   ```bash
   # Check version
   git --version
   ```

5. **PostgreSQL** (optional, Docker recommended)
   ```bash
   # Check version
   psql --version
   ```

6. **Redis** (optional, Docker recommended)
   ```bash
   # Check version
   redis-cli --version
   ```

### Platform-Specific Setup

- **[Linux Setup Guide](./00-setup/02-linux-setup.md)**
- **[macOS Setup Guide](./00-setup/03-macos-setup.md)**
- **[Windows Setup Guide](./00-setup/04-windows-setup.md)**

---

## 02. Local Setup

### Step-by-Step: Setting Up a Service

Each service follows the same setup pattern. Here's how to set up any service:

#### Step 1: Clone the Service Repository

```bash
# Example: Clone auth-service
git clone <repository-url>/auth-service.git
cd auth-service
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Set Up Environment

```bash
# Copy environment template
cp env.txt .env

# Edit .env with your configuration
# See service README.md for required variables
```

#### Step 4: Start Infrastructure Services

```bash
# Start PostgreSQL and Redis via Docker
docker compose up -d postgres redis

# Or use the service's docker-compose.yml
docker compose up -d
```

#### Step 5: Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

#### Step 6: Start the Service

```bash
# Development mode (with hot reload)
npm run dev

# Or production mode
npm run build
npm start
```

#### Step 7: Verify Service is Running

```bash
# Check health endpoint
curl http://localhost:3001/health

# Or open in browser
open http://localhost:3001/api-docs  # Swagger UI
```

### Service-Specific Setup

Each service has a detailed `README.md` with:
- Service-specific setup instructions
- Required environment variables
- Database schema information
- API documentation

**See service README for complete setup details.**

### Setting Up Multiple Services

To work with multiple services:

1. Clone each service repository separately
2. Set up each service independently (follow steps above)
3. Configure service URLs in each service's `.env` file
4. Start services in order (dependencies first)

**Example:**
```bash
# Terminal 1: Start auth-service
cd auth-service
npm run dev

# Terminal 2: Start user-service
cd user-service
npm run dev

# Terminal 3: Start gateway-service
cd gateway-service
npm run dev
```

---

## 03. Development Workflow

### Daily Development Cycle

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Make Changes**
   - Write code following Clean Architecture
   - Write tests
   - Update documentation

5. **Test Changes**
   ```bash
   npm test
   npm run lint
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   git push origin feature/your-feature-name
   ```

### Service Development

Each service is developed independently:

- **No shared code**: Services communicate via HTTP/Events
- **Independent testing**: Test each service in isolation
- **Independent deployment**: Deploy services separately
- **Own CI/CD**: Each service has its own pipeline

### Code Structure

Each service follows Clean Architecture:

```
service-name/
├── src/
│   ├── core/              # Domain entities, business logic
│   ├── application/      # Use cases
│   ├── infrastructure/    # Database, external services
│   ├── ports/            # Interfaces
│   ├── routes/           # API routes
│   └── middleware/       # Express middleware
├── prisma/               # Database schema
├── openapi.yaml          # API specification
└── README.md            # Service documentation
```

**See [Developer Workflow Guide](./03-developer-workflow.md) for details.**

---

## 04. Contributing

### How to Contribute

1. **Fork the Service Repository**
   - Each service is in its own directory in the monorepo
   - Fork the specific service you want to contribute to

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Changes**
   - Follow code standards
   - Write tests
   - Update documentation

4. **Submit Pull Request**
   - Create PR in the service repository
   - Link related issues
   - Ensure CI passes

### Code Standards

- **TypeScript**: Strict mode, no `any`
- **Clean Architecture**: Follow layered structure
- **Testing**: Write unit and integration tests
- **Documentation**: Update README and OpenAPI specs
- **Commits**: Follow Conventional Commits

**See [Contributing Guide](./01-contributing/README.md) for details.**

---

## 05. Deployment

### Deployment Strategy

Each service has its own:
- **CI/CD Pipeline**: GitHub Actions workflow
- **Docker Image**: Built and pushed to container registry
- **Kubernetes Deployment**: Helm chart for deployment
- **Infrastructure**: Terraform configuration

### Deployment Process

1. **Infrastructure Setup** (One-time)
   ```bash
   cd infrastructure-service/01-terraform/foundation
   terraform init
   terraform plan
   terraform apply
   ```

2. **Service Deployment**
   - Each service deploys independently
   - CI/CD pipeline handles:
     - Build Docker image
     - Push to registry
     - Deploy to Kubernetes
     - Run health checks

3. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Log aggregation

**See [Deployment Guide](./07-deployment/README.md) for details.**

---

## 📚 Documentation Sections

<div align="center">

**Comprehensive documentation organized by topic**

</div>

### 📘 00 - Setup

<div align="center">

| Document | Description |
|:---:|:---|
| **[00.1 - Prerequisites](./00-setup/01-prerequisites.md)** | Required software and tools |
| **[00.2 - Linux Setup](./00-setup/02-linux-setup.md)** | Step-by-step Linux instructions |
| **[00.3 - macOS Setup](./00-setup/03-macos-setup.md)** | Step-by-step macOS instructions |
| **[00.4 - Windows Setup](./00-setup/04-windows-setup.md)** | Step-by-step Windows instructions |
| **[00.5 - Environment Configuration](./00-setup/05-environment-configuration.md)** | Setting up environment variables |
| **[00.6 - Database Setup](./00-setup/06-database-setup.md)** | Database initialization and migrations |
| **[00.7 - Running Services](./00-setup/07-running-services.md)** | Starting and testing services |
| **[00.8 - Troubleshooting](./00-setup/08-troubleshooting.md)** | Common issues and solutions |

</div>

### 🤝 01 - Contributing

<div align="center">

| Document | Description |
|:---:|:---|
| **[01.1 - Getting Started](./01-contributing/01-getting-started.md)** | How to start contributing |
| **[01.2 - Development Workflow](./01-contributing/02-development-workflow.md)** | Development process |
| **[01.3 - Code Standards](./01-contributing/03-code-standards.md)** | Coding conventions and standards |
| **[01.4 - Testing Guidelines](./01-contributing/04-testing-guidelines.md)** | How to write and run tests |
| **[01.5 - Pull Request Process](./01-contributing/05-pull-request-process.md)** | Submitting changes |
| **[01.6 - Code Review Guidelines](./01-contributing/06-code-review-guidelines.md)** | Review process |

</div>

### 🏗️ 02 - Architecture

<div align="center">

| Document | Description |
|:---:|:---|
| **[02.1 - Architecture Overview](./02-codebase-architecture/README.md)** | Architecture deep dive |
| **[02.2 - Layer Details](./02-codebase-architecture/01-layer-details.md)** | Detailed layer explanations |
| **[02.3 - Service Independence](./02-codebase-architecture/02-service-independence.md)** | Service independence examples |

</div>

### 💻 03 - Development

<div align="center">

| Document | Description |
|:---:|:---|
| **[03.1 - Developer Workflow](./03-developer-workflow.md)** | Development practices |
| **[03.2 - Service Collaboration](./04-service-collaboration.md)** | How services work together |

</div>

### 🗄️ 05 - Database

<div align="center">

| Document | Description |
|:---:|:---|
| **[05.1 - Database Overview](./05-database/README.md)** | Database architecture and design |
| **[05.2 - Service Schemas](./05-database/02-service-schemas/)** | Individual service database schemas |

</div>

### 🏛️ 06 - Infrastructure

<div align="center">

| Document | Description |
|:---:|:---|
| **[06.1 - Architecture Diagrams](./06-diagrams/README.md)** | Visual architecture diagrams |
| **[06.2 - Terraform Infrastructure](./infrastructure-service/01-terraform/)** | Infrastructure as Code |
| **[06.3 - Kubernetes Deployment](./infrastructure-service/02-kubernetes/)** | Kubernetes configurations |

</div>

### 🚢 07 - Deployment

<div align="center">

| Document | Description |
|:---:|:---|
| **[07.1 - Deployment Overview](./07-deployment/README.md)** | Deployment strategies and process |
| **[07.2 - CI/CD Pipelines](./07-deployment/02-cicd.md)** | Continuous integration and deployment |
| **[07.3 - Kubernetes Deployment](./07-deployment/03-kubernetes.md)** | Kubernetes deployment guide |
| **[07.4 - Production Checklist](./07-deployment/04-production-checklist.md)** | Production deployment checklist |

</div>

---

## 🚀 Quick Start Checklist

For new developers:

- [ ] Read [Project Overview](#00-project-overview)
- [ ] Install [Prerequisites](#01-prerequisites)
- [ ] Clone a service repository
- [ ] Follow [Local Setup](#02-local-setup) for that service
- [ ] Read service `README.md`
- [ ] Review [Developer Workflow](./03-developer-workflow.md)
- [ ] Make your first contribution

---

## 📖 Service Documentation

<div align="center">

**Each service has comprehensive documentation in its repository**

</div>

Each service repository includes:

| Document | Description |
|:---:|:---|
| **📄 README.md** | Setup, architecture, API documentation, getting started |
| **📋 openapi.yaml** | Complete API specification (OpenAPI 3.0) |
| **🐳 Dockerfile** | Container build configuration |
| **☸️ Helm Charts** | Kubernetes deployment configurations |

<div align="center">

**💡 Always check the service's README.md first for service-specific information.**

</div>

### Service READMEs

| Service | Documentation Link | Port | Key Features |
|:---:|:---|:---:|:---|
| 🌐 **Gateway** | [gateway-service/README.md](../gateway-service/README.md) | 3000 | Routing, Auth, Rate Limiting, Circuit Breakers |
| 🔐 **Auth** | [auth-service/README.md](../auth-service/README.md) | 3001 | JWT, MFA, Sessions, Device Management |
| 👤 **User** | [user-service/README.md](../user-service/README.md) | 3002 | Profiles, Addresses, Wishlist, Preferences |
| 📦 **Product** | [product-service/README.md](../product-service/README.md) | 3003 | Catalog, Inventory, Reviews, Search |
| 🛒 **Cart** | [cart-service/README.md](../cart-service/README.md) | 3006 | Cart Management, Guest Carts, Merging |
| 📝 **Order** | [order-service/README.md](../order-service/README.md) | 3004 | Order Processing, Status Tracking, History |
| 💳 **Payment** | [payment-service/README.md](../payment-service/README.md) | 3005 | Stripe, PayPal, Refunds, Webhooks |
| 📧 **Notification** | [notification-service/README.md](../notification-service/README.md) | 3007 | Email, SMS, Push, Templates |
| 🎟️ **Discount** | [discount-service/README.md](../discount-service/README.md) | 3008 | Coupons, Promotions, Discount Calculation |
| 🚚 **Shipping** | [shipping-service/README.md](../shipping-service/README.md) | 3009 | Rate Calculation, Tracking, Carriers |
| ↩️ **Return** | [return-service/README.md](../return-service/README.md) | 3010 | Return Requests, RMA, Refunds |

---

## 🆘 Getting Help

1. **Service Issues**: Check service README.md
2. **Setup Issues**: See [Troubleshooting](./00-setup/08-troubleshooting.md)
3. **Architecture Questions**: See [Architecture Docs](./02-codebase-architecture/)
4. **Deployment Issues**: See [Deployment Guide](./07-deployment/)

---

## 📝 Documentation Standards

- **Numbered sections** for clear navigation
- **Service-specific docs** in each service repository
- **Clear examples** with code snippets
- **Troubleshooting** sections for common issues
- **Enterprise-grade** practices and patterns

---

<div align="center">

## 🚀 Ready to Start?

**Begin your journey:**

**[Prerequisites](./00-setup/01-prerequisites.md)** → **[Local Setup](#02-local-setup)** → **[Developer Workflow](./03-developer-workflow.md)**

---

**Made with ❤️ for enterprise-level software development**

[Back to Top](#-e-commerce-microservices-platform---documentation)

</div>
