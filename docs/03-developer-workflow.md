<div align="center">

# 💻 03 - Developer Workflow

[![Workflow](https://img.shields.io/badge/Developer-Workflow-blue?style=for-the-badge)](.)
[![Monorepo](https://img.shields.io/badge/Architecture-Monorepo-green?style=flat-square)](.)
[![Development](https://img.shields.io/badge/Mode-Development-orange?style=flat-square)](.)

**How developers work on services in the monorepo microservices architecture**

</div>

---

## Important: Monorepo Architecture

**Each service is a directory within this monorepo.** Work on one service at a time by navigating to its directory.

## Project Structure

### Service Repository Structure

Each service repository follows this structure:

```
<service-name>/
├── src/
│   ├── domain/            # Domain entities and business logic (no dependencies)
│   ├── application/       # Use cases and application services
│   ├── infrastructure/    # External integrations (DB, HTTP, etc.)
│   ├── interfaces/        # HTTP routes, middleware, entry points
│   ├── shared/            # Shared utilities and errors
│   └── di/                # Dependency injection container
├── config/                # Environment configurations
│   ├── default.json
│   ├── development.json
│   ├── staging.json
│   └── production.json
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── openapi.yaml           # API specification
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml     # Local development
├── README.md              # Service documentation
└── .env                   # Environment variables (not in git)
```

### Infrastructure Repository

Shared infrastructure code:

```
infrastructure-service/
├── 01-terraform/          # Terraform infrastructure
│   ├── foundation/        # Shared infrastructure
│   └── services/          # Service-specific infrastructure
└── 02-kubernetes/         # Kubernetes Helm charts
    └── services/          # Service Helm charts
```

## Daily Development Cycle

### 1. Start Your Day

```bash
# Navigate to service repository
cd <service-name>

# Pull latest changes
git pull origin main

# Start infrastructure (database, Redis)
docker compose up -d

# Verify infrastructure is running
docker ps
```

### 2. Work on a Feature

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev

# Service will:
# - Watch for file changes and auto-reload
# - Show detailed error messages
# - Run on the port specified in .env
```

### 3. Make Changes

- Write code following Clean Architecture
- Write tests
- Update documentation if needed
- Update `openapi.yaml` if API changes

### 4. Test Your Changes

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Check code quality
npm run lint

# Build to verify
npm run build
```

### 5. Commit and Push

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Create PR in the service repository
- Link related issues
- Ensure CI passes
- Address review comments

## Service Development

### Starting a Service

```bash
cd <service-name>

# Install dependencies (if needed)
npm install

# Start in development mode
npm run dev
```

**Development mode features:**
- Auto-reload on file changes
- Detailed error messages
- Hot reload
- Source maps for debugging

### Making Changes

#### Add a New Feature

1. **Create Domain Entity** (if needed)
   ```typescript
   // src/domain/entities/YourEntity.ts
   export class YourEntity {
     // Domain logic
   }
   ```

2. **Create Repository Interface** (if needed)
   ```typescript
   // src/domain/repositories/IYourRepository.ts
   export interface IYourRepository {
     findById(id: string): Promise<YourEntity | null>;
     // ... other methods
   }
   ```

3. **Create Use Case**
   ```typescript
   // src/application/use-cases/YourUseCase.ts
   export class YourUseCase {
     constructor(
       private readonly repository: IYourRepository
     ) {}
     
     async execute(input: Input): Promise<Output> {
       // Business logic
     }
   }
   ```

4. **Add Infrastructure Implementation**
   ```typescript
   // src/infrastructure/db/PrismaYourRepository.ts
   export class PrismaYourRepository implements IYourRepository {
     // Database implementation
   }
   ```

5. **Create Route**
   ```typescript
   // src/interfaces/http/routes/your.routes.ts
   router.post('/your-endpoint', controller.yourMethod);
   ```

#### Modify Database Schema

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

#### Update API

1. **Update OpenAPI Spec**
   ```yaml
   # openapi.yaml
   paths:
     /api/v1/your-endpoint:
       post:
         # ... endpoint definition
   ```

2. **Update Route Handler**
   ```typescript
   // src/routes/your.routes.ts
   router.post('/your-endpoint', handler);
   ```

3. **Add Validation**
   ```typescript
   // src/middleware/validator.middleware.ts
   export const validateYourEndpoint = [
     // Validation rules
   ];
   ```

### Building a Service

```bash
cd <service-name>

# Build TypeScript
npm run build

# Output will be in dist/
```

## Working with Multiple Services

### Setting Up Multiple Services

1. **Clone the monorepo repository**
   ```bash
   git clone <repository-url>
   cd Enterprise-Ecommerce-Backend
   ```

2. **Set up each service independently**
   - Navigate to each service directory
   - Follow setup steps for each service
   - Each has its own database
   - Each has its own `.env` or uses `config/` files

3. **Configure service URLs**
   - In each service's `.env` or `config/` files, configure URLs to other services
   - Example Gateway `config/default.json`:
     ```json
     {
       "services": {
         "authServiceUrl": "http://localhost:3001",
         "userServiceUrl": "http://localhost:3002"
       }
     }
     ```

4. **Start services in separate terminals**
   ```bash
   # Terminal 1: Gateway
   cd gateway-service && npm run dev
   
   # Terminal 2: Auth
   cd auth-service && npm run dev
   
   # Terminal 3: User
   cd user-service && npm run dev
   ```

### Testing Service Integration

When testing integration between services:

1. **Start required services**
   ```bash
   # Start Auth service
   cd Enterprise-Ecommerce-Backend/auth-service && npm run dev
   
   # Start User service (depends on Auth)
   cd Enterprise-Ecommerce-Backend/user-service && npm run dev
   ```

2. **Test integration**
   ```bash
   # Test User service calling Auth service
   curl http://localhost:3002/api/v1/users/me \
     -H "Authorization: Bearer <token>"
   ```

## Git Workflow

### Branching Strategy

We use **Git Flow** with feature branches:

- `main` - Production-ready code
- `develop` - Integration branch (optional)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add user profile endpoint
fix: resolve cart calculation bug
docs: update API documentation
refactor: improve error handling
```

### Pull Request Process

1. **Create PR**
   - Push your feature branch
   - Create PR in the service repository
   - Link related issues

2. **PR Description**
   - What changed and why
   - How to test
   - Screenshots (if UI changes)
   - Breaking changes (if any)

3. **Code Review**
   - Address review comments
   - Ensure CI passes
   - Update documentation

4. **Merge**
   - Squash and merge (recommended)
   - Delete feature branch after merge

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Avoid `any` types
- Use interfaces for contracts
- Prefer composition over inheritance

### Clean Architecture

Follow the layered architecture:

1. **Domain Layer** (`src/domain/`)
   - Domain entities
   - Repository interfaces (contracts)
   - Domain services
   - No dependencies on other layers

2. **Application Layer** (`src/application/`)
   - Use cases
   - Controllers
   - DTOs
   - Depends only on Domain

3. **Infrastructure Layer** (`src/infrastructure/`)
   - Database implementations (Prisma)
   - External API clients
   - Event publishers/consumers
   - Depends on Domain and Application

4. **Interfaces Layer** (`src/interfaces/http/`)
   - HTTP routes
   - Middleware
   - Request/response mapping
   - Depends on Application

### Code Style

- Use ESLint and Prettier (configured in service)
- Run `npm run lint` before committing
- Run `npm run lint:fix` to auto-fix

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase` or `PascalCase`

## Testing

### Test Structure

```
<service-name>/
├── src/
└── __tests__/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Writing Tests

1. **Unit Tests**
   - Test individual functions/classes
   - Mock external dependencies
   - Fast execution

2. **Integration Tests**
   - Test service interactions
   - Use test database
   - Test API endpoints

3. **E2E Tests**
   - Test complete user flows
   - Use staging environment
   - Test multiple services together

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

### Test Best Practices

- Write tests before or alongside code (TDD)
- Test edge cases and error scenarios
- Keep tests independent and isolated
- Use descriptive test names
- Mock external services

## Debugging

### Local Debugging

1. **VS Code Debugging**
   - Create `.vscode/launch.json`:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug Service",
     "runtimeExecutable": "npm",
     "runtimeArgs": ["run", "dev"],
     "skipFiles": ["<node_internals>/**"]
   }
   ```

2. **Console Logging**
   - Use Winston logger (configured in services)
   - Log levels: `error`, `warn`, `info`, `debug`

3. **Database Debugging**
   - Use Prisma Studio: `npm run prisma:studio`
   - Use Adminer: http://localhost:8080

### Production Debugging

- Check service logs in Kubernetes
- Use distributed tracing (if configured)
- Monitor error tracking (Sentry, etc.)

## Collaboration Guidelines

### Communication

- Use GitHub Issues for bugs and features
- Use Pull Requests for code changes
- Document decisions in service README

### Code Reviews

**As a Reviewer:**
- Be constructive and respectful
- Focus on code quality, not personal style
- Approve when ready, request changes when needed

**As an Author:**
- Keep PRs small and focused
- Respond to all comments
- Update PR based on feedback

### Knowledge Sharing

- Document complex logic
- Write clear commit messages
- Share learnings in team meetings
- Update documentation when needed

### Onboarding New Developers

1. Read [Setup Guide](./00-setup/README.md)
2. Clone a service repository
3. Follow service README.md
4. Review [Service Collaboration](./04-service-collaboration.md)
5. Explore a simple service (e.g., cart-service)
6. Make a small contribution
7. Ask questions in team channels

## Best Practices

### Do's ✅

- ✅ Work on one service at a time
- ✅ Write tests for new features
- ✅ Update documentation
- ✅ Follow code standards
- ✅ Use meaningful variable names
- ✅ Keep functions small and focused
- ✅ Handle errors properly
- ✅ Use environment variables for config

### Don'ts ❌

- ❌ Don't commit `.env` files
- ❌ Don't break existing APIs without versioning
- ❌ Don't skip tests
- ❌ Don't ignore linter warnings
- ❌ Don't create circular dependencies
- ❌ Don't hardcode values
- ❌ Don't commit directly to `main`
- ❌ Don't work on multiple services simultaneously unless testing integration

## Resources

- [Service Collaboration Guide](./04-service-collaboration.md)
- [Architecture Overview](./02-codebase-architecture/README.md)
- [Setup Guide](./00-setup/README.md)
- [Contributing Guide](./01-contributing/README.md)
- [Service READMEs](../) - Each service has detailed documentation

---

**Remember:** Each service is independent. Navigate to the service directory, develop, and deploy services independently!
