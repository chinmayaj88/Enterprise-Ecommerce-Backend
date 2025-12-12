<div align="center">

# 🗄️ 06 - Database Setup

[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-green?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-orange?style=flat-square)](.)

**Complete guide for setting up a service's database**

</div>

---

## Important: Monorepo Architecture

**Each service is in its own repository.** Set up the database for the service you're working on.

## Quick Setup

### Single Service Database Setup

```bash
# Navigate to service directory
cd <service-name>

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (if seed script exists)
npm run prisma:seed
```

## Manual Setup Steps

### Step 1: Start Database

```bash
# Start PostgreSQL via Docker
docker compose up -d postgres

# Or use service's docker-compose.yml
docker compose up -d
```

### Step 2: Configure Environment

```bash
# Services use config files (config/default.json, etc.)
# Database URL can be set via:
# 1. Config file: config/default.json or config/development.json
# 2. Environment variable: DATABASE_URL (overrides config)
# 3. .env file: Create .env if you prefer (overrides config)
# DATABASE_URL=postgresql://user:password@localhost:5432/database
```

### Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma client based on `prisma/schema.prisma`.

### Step 4: Run Migrations

```bash
# Development (creates migration files)
npm run prisma:migrate

# Production (applies existing migrations)
npm run prisma:migrate:deploy
```

### Step 5: Seed Database (Optional)

If the service has a seed script:

```bash
npm run prisma:seed
```

## Database Structure

### Service Database

Each service has its own PostgreSQL database:

| Service | Default Database Name | Port |
|---------|---------------------|------|
| Gateway | gateway_db | 5432 |
| Auth | auth_db | 5432 |
| User | user_db | 5432 |
| Product | product_db | 5432 |
| Cart | cart_db | 5432 |
| Order | order_db | 5432 |
| Payment | payment_db | 5432 |
| Notification | notification_db | 5432 |
| Discount | discount_db | 5432 |
| Shipping | shipping_db | 5432 |
| Return | return_db | 5432 |

**Note:** Ports may vary based on your Docker setup. Check `docker-compose.yml` in the service directory.

## Verifying Database Setup

### Check Database Connection

```bash
# Test connection using Prisma Studio
npm run prisma:studio

# Or using psql
psql $DATABASE_URL
```

### Verify Tables

```bash
# Using Prisma Studio (recommended)
npm run prisma:studio

# Or using psql
psql $DATABASE_URL -c "\dt"
```

### Check Migrations

```bash
# View migration status
npx prisma migrate status
```

## Database Management

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Opens at http://localhost:5555

### Adminer (if using Docker Compose)

Database management UI:
- URL: http://localhost:8080
- System: PostgreSQL
- Server: `postgres` (container name)
- Username: From `DATABASE_URL`
- Password: From `DATABASE_URL`
- Database: From `DATABASE_URL`

### Direct psql Access

```bash
# Connect to database
psql $DATABASE_URL

# Or using Docker
docker exec -it <postgres-container> psql -U <user> -d <database>
```

## Creating Migrations

### Create New Migration

```bash
# After modifying prisma/schema.prisma
npm run prisma:migrate

# This will:
# 1. Create migration file
# 2. Apply migration
# 3. Generate Prisma client
```

### Migration File Structure

```
prisma/
├── schema.prisma
└── migrations/
    └── YYYYMMDDHHMMSS_migration_name/
        └── migration.sql
```

## Resetting Database

### Reset Database (⚠️ Deletes All Data)

```bash
# Reset database and reapply all migrations
npx prisma migrate reset

# This will:
# 1. Drop database
# 2. Create database
# 3. Apply all migrations
# 4. Run seed script (if exists)
```

## Troubleshooting

### Migration Fails

1. **Check database is running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Verify DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   # Or check .env file
   ```

3. **Check migration files:**
   ```bash
   ls prisma/migrations/
   ```

4. **View migration status:**
   ```bash
   npx prisma migrate status
   ```

### Database Connection Errors

1. **Verify database is accessible:**
   ```bash
   psql $DATABASE_URL
   ```

2. **Check Docker container:**
   ```bash
   docker logs <postgres-container>
   ```

3. **Verify DATABASE_URL format:**
   ```
   postgresql://user:password@host:port/database
   ```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
npm run prisma:generate
```

### Migration Conflicts

If migrations conflict:

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Resolve conflicts manually:**
   - Review migration files
   - Merge changes
   - Create new migration if needed

3. **Reset if needed (⚠️ deletes data):**
   ```bash
   npx prisma migrate reset
   ```

## Best Practices

### Database Management ✅

- ✅ Run migrations in development before committing
- ✅ Test migrations on staging before production
- ✅ Backup database before major migrations
- ✅ Use transactions for data migrations
- ✅ Document breaking changes

### Development ✅

- ✅ Use separate databases for development/staging/production
- ✅ Use migrations, not direct SQL changes
- ✅ Keep migrations small and focused
- ✅ Test migrations on sample data

## Next Steps

After database setup:

1. [Running Services](./07-running-services.md) - Start service
2. [Developer Workflow](../03-developer-workflow.md) - Development guide

---

**Navigation:**
- ⬅️ [← Previous: Environment Configuration](./05-environment-configuration.md)
- 🏠 [← Back to Setup Overview](./README.md)
- ➡️ [Next: Running Services →](./07-running-services.md)
