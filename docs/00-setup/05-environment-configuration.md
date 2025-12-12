<div align="center">

# ⚙️ 05 - Environment Configuration

[![Configuration](https://img.shields.io/badge/Configuration-Environment-blue?style=for-the-badge)](.)
[![Variables](https://img.shields.io/badge/Variables-Required-green?style=flat-square)](.)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-orange?style=flat-square)](.)

**Detailed guide for configuring environment variables for a service**

</div>

---

## Important: Monorepo Architecture

**Each service is in its own repository.** Configure environment variables in the service you're working on.

## Quick Setup

### Single Service Setup

Services use **config files** for environment-specific settings. You can also use `.env` files for local overrides.

**Option 1: Using Config Files (Recommended)**
```bash
# Navigate to service directory
cd <service-name>

# Config files are already present:
# - config/default.json (base configuration)
# - config/development.json (development overrides)
# - config/staging.json (staging overrides)
# - config/production.json (production overrides)

# Set NODE_ENV to use the appropriate config
export NODE_ENV=development
```

**Option 2: Using .env File (for local overrides)**
```bash
# Copy environment template if available
cp env.example .env  # or env.txt if available

# Edit .env with your configuration
# Environment variables override config file values
# See service README.md for required variables
```

## Common Environment Variables

### Server Configuration

```env
NODE_ENV=development          # development, staging, production
PORT=3001                      # Service port number
LOG_LEVEL=info                 # debug, info, warn, error
```

### Database Configuration

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`

**Example:**
```env
DATABASE_URL=postgresql://auth_user:auth_pass@localhost:5432/auth_db
```

### Redis Configuration

```env
REDIS_URL=redis://localhost:6379
```

## Service-Specific Configuration

### Auth Service

**Location:** `auth-service/config/default.json` or `auth-service/.env`

**Key Variables:**
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database
DATABASE_URL=postgresql://auth_user:auth_pass@localhost:5432/auth_db

# Redis
REDIS_URL=redis://localhost:6379
```

### Gateway Service

**Location:** `gateway-service/config/default.json` or `gateway-service/.env`

**Key Variables:**
```env
# Service URLs (configure URLs to other services)
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
CART_SERVICE_URL=http://localhost:3006
ORDER_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3007
DISCOUNT_SERVICE_URL=http://localhost:3008
SHIPPING_SERVICE_URL=http://localhost:3009
RETURN_SERVICE_URL=http://localhost:3010

# JWT (must match auth-service)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Redis
REDIS_URL=redis://localhost:6379
```

### User Service

**Location:** `user-service/config/default.json` or `user-service/.env`

**Key Variables:**
```env
# Database
DATABASE_URL=postgresql://user_user:user_pass@localhost:5432/user_db

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3004

# Redis
REDIS_URL=redis://localhost:6379

# OCI Queue (for events)
OCI_QUEUE_ID=ocid1.queue.oc1...
OCI_COMPARTMENT_ID=ocid1.compartment.oc1...
OCI_REGION=IN-HYDERABAD-1
```

### Other Services

Each service has similar structure:
- Database URL
- Redis URL (if used)
- Service URLs (for inter-service communication)
- Service-specific configuration

**See each service's README.md for complete list of environment variables.**

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
EVENT_CONSUMER_TYPE=mock
COOKIE_SECURE=false
```

### Staging/Production

```env
NODE_ENV=production
LOG_LEVEL=info
EVENT_CONSUMER_TYPE=oci-queue
COOKIE_SECURE=true
ALLOWED_ORIGINS=https://yourdomain.com
```

## Security Best Practices

### 1. Never Commit .env Files

`.env` files are already in `.gitignore`. Never commit them to version control.

### 2. Use Strong Secrets

Generate strong secrets for production:

```bash
# Generate random secret (Linux/macOS)
openssl rand -base64 32

# Generate random secret (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Use Environment Variables in Production

In production, use:
- Environment variables set in your deployment platform
- Secret management services (OCI Vault, AWS Secrets Manager, etc.)
- Never hardcode secrets

## Verifying Configuration

### Check Environment Variables

```bash
# Navigate to service
cd <service-name>

# Check if .env file exists
ls .env

# View .env file (be careful with secrets)
cat .env
```

### Test Service with Configuration

```bash
cd <service-name>
npm run dev
```

If configuration is wrong, you'll see errors in the console.

## Service URL Configuration

When running multiple services, configure service URLs in each service's `.env`:

**Example: Gateway Service `.env`:**
```env
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
```

**Example: Order Service `.env`:**
```env
PRODUCT_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3005
SHIPPING_SERVICE_URL=http://localhost:3009
```

## Troubleshooting

### Service Can't Connect to Database

1. Check `DATABASE_URL` format
2. Verify database container is running: `docker ps | grep postgres`
3. Test connection: `psql $DATABASE_URL`

### Service Can't Connect to Redis

1. Check `REDIS_URL`
2. Verify Redis is running: `docker ps | grep redis`
3. Test connection: `redis-cli -u $REDIS_URL ping`

### Service Can't Reach Other Services

1. Verify other services are running
2. Check service URLs in `.env` are correct
3. Test connectivity: `curl http://localhost:3001/health`

### Port Already in Use

Change `PORT` in `.env` file to an available port.

**Note:** If you change a service port, update other services' `.env` files that reference it.

## Next Steps

After configuring environment variables:

1. [Database Setup](./06-database-setup.md) - Initialize database
2. [Running Services](./07-running-services.md) - Start service

---

**Navigation:**
- ⬅️ [← Previous: Windows Setup](./04-windows-setup.md)
- 🏠 [← Back to Setup Overview](./README.md)
- ➡️ [Next: Database Setup →](./06-database-setup.md)
