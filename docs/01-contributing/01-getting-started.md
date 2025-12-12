<div align="center">

# 🚀 01.1 - Getting Started

[![Getting Started](https://img.shields.io/badge/Getting-Started-blue?style=for-the-badge)](.)
[![Contributing](https://img.shields.io/badge/Contributing-Guide-green?style=flat-square)](.)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-orange?style=flat-square)](.)

**How to start contributing to a service in the E-Commerce Microservices Platform**

</div>

---

## Prerequisites

Before contributing, ensure you have:

1. ✅ Completed [Setup Guide](../00-setup/README.md)
2. ✅ Service running locally
3. ✅ Familiar with [Developer Workflow](../03-developer-workflow.md)
4. ✅ Understanding of [Service Architecture](../02-codebase-architecture/README.md)

## Choose a Service

<div align="center">

**All services are in a single monorepo.** Pick the service directory you want to contribute to:

</div>

| Service | Purpose | Port | Directory |
|:---:|:---|:---:|:---|
| 🌐 **Gateway** | API gateway, routing | 3000 | `gateway-service/` |
| 🔐 **Auth** | Authentication, authorization | 3001 | `auth-service/` |
| 👤 **User** | User management | 3002 | `user-service/` |
| 📦 **Product** | Product catalog | 3003 | `product-service/` |
| 🛒 **Cart** | Shopping cart | 3006 | `cart-service/` |
| 📝 **Order** | Order processing | 3004 | `order-service/` |
| 💳 **Payment** | Payment processing | 3005 | `payment-service/` |
| 📧 **Notification** | Notifications | 3007 | `notification-service/` |
| 🎟️ **Discount** | Coupons, promotions | 3008 | `discount-service/` |
| 🚚 **Shipping** | Shipping, tracking | 3009 | `shipping-service/` |
| ↩️ **Return** | Returns, refunds | 3010 | `return-service/` |

## Fork and Clone

### 1. Fork the Monorepo Repository

1. Go to the monorepo repository on GitHub
2. Click "Fork" button
3. Choose your account/organization

### 2. Clone Your Fork

```bash
# Clone your fork of the monorepo
git clone https://github.com/YOUR_USERNAME/Enterprise-Ecommerce-Backend.git
cd Enterprise-Ecommerce-Backend

# Navigate to the service you want to work on (example: auth-service)
cd auth-service

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/Enterprise-Ecommerce-Backend.git

# Verify remotes
git remote -v
```

## Setup Development Environment

### 1. Install Dependencies

```bash
cd <service-name>
npm install
```

### 2. Set Up Environment

```bash
# Copy environment template
cp env.txt .env

# Edit .env with your configuration
# See service README.md for required variables
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis via Docker
docker compose up -d
```

### 4. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 5. Verify Setup

```bash
# Start service
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3001/health
```

## Choose What to Work On

### Good First Issues

Look for issues in the service repository labeled:
- `good first issue`
- `help wanted`
- `documentation`

### Finding Issues

1. Go to the service repository on GitHub
2. Check Issues tab
3. Look for unassigned issues
4. Comment on issue to claim it
5. Start working on it

### Suggesting Changes

If you have an idea:
1. Open an issue in the service repository
2. Discuss the approach
3. Get feedback before coding
4. Then implement

## Development Workflow

### 1. Create Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write code following [Code Standards](./03-code-standards.md)
- Write tests following [Testing Guidelines](./04-testing-guidelines.md)
- Update documentation if needed
- Update `openapi.yaml` if API changes

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build to verify
npm run build
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add feature description"
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat: add user profile endpoint
fix: resolve cart calculation bug
docs: update API documentation
refactor: improve error handling
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template
5. Submit PR in the service repository

## Branch Naming

Use descriptive branch names:

- `feature/user-authentication` - New feature
- `fix/cart-calculation-bug` - Bug fix
- `docs/update-setup-guide` - Documentation
- `refactor/improve-error-handling` - Refactoring

## Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main
git checkout main
git merge upstream/main

# Update your feature branch
git checkout feature/your-feature-name
git merge main
```

## Working on Multiple Services

If you need to work on multiple services:

1. **Clone the monorepo repository once**
   ```bash
   git clone <repository-url>
   cd Enterprise-Ecommerce-Backend
   ```

2. **Set up each service independently**
   - Follow setup steps for each service
   - Each has its own database and `.env`

3. **Work on one service at a time**
   - Focus on one service per PR
   - Test integration if needed

## Next Steps

1. **[Development Workflow →](./02-development-workflow.md)** - Learn the development process
2. **[Code Standards →](./03-code-standards.md)** - Understand coding conventions
3. **[Testing Guidelines →](./04-testing-guidelines.md)** - Write tests

---

**Navigation:**
- ⬅️ [← Back to Contributing Overview](./README.md)
- ➡️ [Next: Development Workflow →](./02-development-workflow.md)
