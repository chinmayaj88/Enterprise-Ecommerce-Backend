<div align="center">

# 🔧 08 - Troubleshooting

[![Troubleshooting](https://img.shields.io/badge/Troubleshooting-Guide-blue?style=for-the-badge)](.)
[![Issues](https://img.shields.io/badge/Common-Issues-green?style=flat-square)](.)
[![Solutions](https://img.shields.io/badge/Solutions-Provided-orange?style=flat-square)](.)

**Common issues and solutions when setting up a service**

</div>

---

## Quick Diagnosis

### Check Infrastructure

```bash
# Check containers are running
docker ps

# Should show: postgres, redis (if configured)
```

### Check Service

```bash
# Check if port is in use
# Linux/macOS
lsof -i :3001

# Windows
netstat -ano | findstr :3001
```

### Check Logs

```bash
# Docker logs
docker compose logs

# Service logs (in terminal where service is running)
```

## Common Issues

### Issue: Port Already in Use

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3001`
- Service won't start

**Solution:**

**Linux/macOS:**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

**Windows:**
```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
PORT=3002
```

### Issue: Database Connection Error

**Symptoms:**
- Error: `Can't reach database server`
- `ECONNREFUSED` error

**Solution:**

1. **Check database is running:**
   ```bash
   docker ps | grep postgres
   ```

2. **Check DATABASE_URL in .env:**
   ```bash
   cat .env | grep DATABASE_URL
   ```

3. **Test connection:**
   ```bash
   psql $DATABASE_URL
   ```

4. **Restart database:**
   ```bash
   docker compose restart postgres
   ```

### Issue: Prisma Client Not Generated

**Symptoms:**
- Error: `Cannot find module '@prisma/client'`
- Type errors related to Prisma

**Solution:**

```bash
# Generate Prisma client
npm run prisma:generate

# Verify it was generated
ls node_modules/.prisma/client
```

### Issue: Migration Fails

**Symptoms:**
- Error during `npm run prisma:migrate`
- Database schema mismatch

**Solution:**

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Reset database (⚠️ deletes data):**
   ```bash
   npx prisma migrate reset
   ```

3. **Apply migrations manually:**
   ```bash
   npx prisma migrate deploy
   ```

### Issue: Service Can't Reach Other Services

**Symptoms:**
- Error: `ECONNREFUSED` when calling other services
- Timeout errors

**Solution:**

1. **Verify other services are running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check service URLs in .env:**
   ```bash
   cat .env | grep SERVICE_URL
   ```

3. **Verify network connectivity:**
   ```bash
   # Test from service container (if using Docker)
   docker exec -it <service-container> curl http://auth-service:3001/health
   ```

### Issue: Redis Connection Error

**Symptoms:**
- Error: `Redis connection failed`
- Service works but caching doesn't

**Solution:**

1. **Check Redis is running:**
   ```bash
   docker ps | grep redis
   ```

2. **Check REDIS_URL in .env:**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

3. **Test connection:**
   ```bash
   redis-cli -u $REDIS_URL ping
   # Should return: PONG
   ```

4. **Restart Redis:**
   ```bash
   docker compose restart redis
   ```

### Issue: Environment Variables Not Loading

**Symptoms:**
- Service uses default values
- Configuration not applied

**Solution:**

1. **Check .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Verify .env format:**
   ```bash
   # Should be KEY=VALUE format
   cat .env
   ```

3. **Check for syntax errors:**
   - No spaces around `=`
   - No quotes needed (unless value has spaces)
   - No trailing spaces

### Issue: Service Crashes on Start

**Symptoms:**
- Service starts then immediately exits
- Error in logs

**Solution:**

1. **Check logs:**
   ```bash
   # Look at terminal output where service is running
   # Or check Docker logs if running in container
   docker compose logs <service-name>
   ```

2. **Verify all required environment variables:**
   ```bash
   # Check service README.md for required variables
   cat README.md | grep -A 10 "Environment Variables"
   ```

3. **Check database connection:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

### Issue: TypeScript Compilation Errors

**Symptoms:**
- `npm run build` fails
- Type errors

**Solution:**

1. **Check TypeScript version:**
   ```bash
   npx tsc --version
   ```

2. **Clean and rebuild:**
   ```bash
   rm -rf dist node_modules/.cache
   npm run build
   ```

3. **Check tsconfig.json:**
   ```bash
   cat tsconfig.json
   ```

### Issue: Dependencies Not Installing

**Symptoms:**
- `npm install` fails
- Missing modules

**Solution:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version:**
   ```bash
   node --version
   # Should be >= 22.0.0
   ```

## Service-Specific Issues

### Auth Service

**JWT Secret Issues:**
- Ensure `JWT_SECRET` is at least 32 characters
- Must match `JWT_SECRET` in gateway-service

### Gateway Service

**Service URL Issues:**
- Verify all service URLs in `.env` are correct
- Check services are running on expected ports

### Database-Heavy Services

**Connection Pool Issues:**
- Check `DATABASE_URL` format
- Verify database has enough connections
- Check connection pool settings

## Getting More Help

1. **Check service README.md** - Service-specific documentation
2. **Check service logs** - Look for error messages
3. **Review [Setup Guide](./README.md)** - Complete setup instructions
4. **Check [Developer Workflow](../03-developer-workflow.md)** - Development guide

## Diagnostic Commands

```bash
# Check all services status
docker ps

# Check service health
curl http://localhost:3001/health

# Check database
psql $DATABASE_URL -c "\dt"

# Check Redis
redis-cli -u $REDIS_URL ping

# View service logs
# (Look at terminal where service is running)

# Check environment
env | grep -E "DATABASE|REDIS|PORT"

# Verify Prisma client
ls node_modules/.prisma/client
```

## Next Steps

If you've tried everything:

1. Review service README.md
2. Check [Setup Guide](./README.md)
3. Review [Developer Workflow](../03-developer-workflow.md)
4. Open an issue in the service repository

---

**Navigation:**
- ⬅️ [← Previous: Running Services](./07-running-services.md)
- 🏠 [← Back to Setup Overview](./README.md)
