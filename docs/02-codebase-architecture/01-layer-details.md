<div align="center">

# 🏗️ 01 - Layer Details

[![Architecture](https://img.shields.io/badge/Architecture-Layers-blue?style=for-the-badge)](.)
[![Clean Architecture](https://img.shields.io/badge/Design-Clean%20Architecture-green?style=flat-square)](.)
[![Layers](https://img.shields.io/badge/Layers-Detailed-orange?style=flat-square)](.)

**Detailed explanation of each layer in Clean Architecture implementation**

</div>

---

## 📚 Reading Order

**Recommended path through codebase architecture documentation:**

1. ✅ **[Overview](./README.md)** - Start here for architecture overview
2. 📖 **This Document (01 - Layer Details)** - You are here
3. ➡️ **[02 - Service Independence](./02-service-independence.md)** - Next: Service independence examples

---

## Navigation

- ⬅️ [← Back to Overview](./README.md)
- ➡️ [Next: Service Independence →](./02-service-independence.md)

## Domain Layer

### Purpose
The **Domain Layer** contains the most important business logic. It has **zero dependencies** on external frameworks, databases, or other services.

### Structure

```
domain/
├── entities/           # Domain entities (pure data structures)
├── repositories/       # Repository interfaces (contracts only)
├── services/           # Domain services (complex business logic)
└── value-objects/      # Value objects (immutable domain concepts)
```

### Entities

**Definition**: Pure domain models representing business concepts.

**Characteristics:**
- No dependencies on frameworks
- No database annotations
- Pure TypeScript interfaces/classes
- Contain business rules and validations

**Example:**

```typescript
// domain/entities/User.ts
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  isActive: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  mfaEnabled?: boolean;
  mfaSecret?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRoles extends User {
  roles: string[];
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  emailVerified?: boolean;
  isActive?: boolean;
}
```

**Key Points:**
- No Prisma types
- No Express types
- No external library dependencies
- Pure domain representation

### Use Cases

**Definition**: Encapsulate application-specific business rules.

**Characteristics:**
- Depend only on interfaces (ports)
- Contain orchestration logic
- Handle business rules and validations
- Return domain entities or DTOs

**Example:**

```typescript
// application/use-cases/LoginUseCase.ts
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,      // Interface
    private readonly passwordHasher: IPasswordHasher,      // Interface
    private readonly tokenService: ITokenService,          // Interface
    private readonly refreshTokenRepository: IRefreshTokenRepository, // Interface
    private readonly securityAuditLogRepository: ISecurityAuditLogRepository // Interface
  ) {}

  async execute(request: LoginRequest & { ipAddress?: string; userAgent?: string }) {
    // 1. Find user
    const user = await this.userRepository.findByEmailWithRoles(request.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Check account status
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is locked');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // 3. Verify password
    const isValid = await this.passwordHasher.compare(
      request.password, 
      user.passwordHash
    );
    
    if (!isValid) {
      await this.userRepository.incrementFailedLoginAttempts(user.id);
      throw new Error('Invalid email or password');
    }

    // 4. Generate tokens
    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    // 5. Store refresh token
    await this.refreshTokenRepository.create({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: calculateExpiry(),
    });

    // 6. Return result
    return {
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
      ...tokens,
    };
  }
}
```

**Key Points:**
- All dependencies are interfaces
- No knowledge of Prisma, Express, etc.
- Pure business logic
- Testable without infrastructure

### Domain Services

**Definition**: Complex business logic that doesn't belong in entities or use cases.

**Example:**

```typescript
// domain/services/OrderNumberGenerator.ts
export class OrderNumberGenerator {
  generate(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  }
}
```

## Application Layer

### Purpose
The **Application Layer** orchestrates use cases and handles application-specific concerns like HTTP request/response mapping.

### Structure

```
application/
├── controllers/        # HTTP request handlers
└── utils/             # Application utilities
```

### Controllers

**Definition**: Handle HTTP requests and delegate to use cases.

**Characteristics:**
- Depend on use cases
- Handle HTTP concerns (request/response)
- Map between HTTP and domain models
- Handle errors and return appropriate HTTP status codes

**Example:**

```typescript
// application/controllers/AuthController.ts
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.loginUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const statusCode = this.getStatusCode(error);
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private getStatusCode(error: unknown): number {
    if (error instanceof Error) {
      if (error.message.includes('locked')) return 423;
      if (error.message.includes('Invalid')) return 401;
      if (error.message.includes('not found')) return 404;
    }
    return 500;
  }
}
```

**Key Points:**
- Thin layer that delegates to use cases
- Handles HTTP-specific concerns
- Maps domain errors to HTTP status codes

## Infrastructure Layer

### Purpose
The **Infrastructure Layer** implements external concerns like database access, HTTP clients, event publishing, and caching.

### Structure

```
infrastructure/
├── db/                 # Repository implementations (Prisma)
├── events/             # Event publishers (OCI Streaming, SNS, Mock)
├── cache/              # Cache implementations (Redis)
├── config/             # Configuration provider
├── password/           # Password hashing (bcrypt)
├── token/              # JWT token service
├── logging/            # Logging (Winston)
├── metrics/            # Prometheus metrics
└── health/             # Health check implementations
```

### Database Repositories

**Definition**: Implement repository interfaces using Prisma.

**Example:**

```typescript
// infrastructure/db/PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  private cache = getCache();

  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    // Check cache first
    const cacheKey = `user:id:${id}`;
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) return cached;

    // Query database
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    // Map Prisma model to domain entity
    const entity = this.mapToEntity(user);
    
    // Cache result
    await this.cache.set(cacheKey, entity, 3600);
    
    return entity;
  }

  private mapToEntity(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      failedLoginAttempts: user.failedLoginAttempts ?? 0,
      lockedUntil: user.lockedUntil ?? undefined,
      mfaEnabled: user.mfaEnabled ?? false,
      mfaSecret: user.mfaSecret ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
```

**Key Points:**
- Implements interface from `domain/repositories/`
- Contains Prisma-specific code
- Maps between Prisma models and domain entities
- Can include caching, logging, etc.

### Event Publishers

**Definition**: Implement event publishing using different providers.

**Example:**

```typescript
// domain/repositories/IEventPublisher.ts
export interface IEventPublisher {
  publish(eventType: string, data: unknown): Promise<void>;
}

// infrastructure/events/OCIStreamingEventPublisher.ts
export class OCIStreamingEventPublisher implements IEventPublisher {
  async publish(eventType: string, data: unknown): Promise<void> {
    // OCI Streaming implementation
  }
}

// infrastructure/events/MockEventPublisher.ts
export class MockEventPublisher implements IEventPublisher {
  async publish(eventType: string, data: unknown): Promise<void> {
    // Mock implementation for development
    console.log(`[MOCK] Event: ${eventType}`, data);
  }
}
```

**Key Points:**
- Multiple implementations of same interface
- Can swap implementations via configuration
- Use cases depend on interface, not implementation

## Presentation Layer

### Purpose
The **Presentation Layer** handles HTTP-specific concerns like routing, middleware, and request validation.

### Structure

```
interfaces/
└── http/              # HTTP routes and middleware
    ├── routes/        # Route definitions
    └── middleware/    # Express middleware
```

### Routes

**Definition**: Define HTTP endpoints and wire them to controllers.

**Example:**

```typescript
// interfaces/http/routes/auth.routes.ts
export function createAuthRoutes(controller: AuthController) {
  const router = express.Router();

  router.post(
    '/login',
    validateLoginRequest,  // Middleware
    async (req, res) => controller.login(req, res)
  );

  router.post(
    '/register',
    validateRegisterRequest,
    async (req, res) => controller.register(req, res)
  );

  return router;
}
```

**Key Points:**
- Thin routing layer
- Delegates to controllers
- Applies middleware (validation, auth, etc.)

### Middleware

**Definition**: Handle cross-cutting concerns like validation, authentication, rate limiting.

**Example:**

```typescript
// interfaces/http/middleware/validator.middleware.ts
export function validateLoginRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
    });
  }

  next();
}
```

## Ports (Interfaces)

### Purpose
**Ports** define contracts that infrastructure implements. They enable dependency inversion.

### Structure

```
ports/
├── interfaces/         # Repository and service interfaces
└── dtos/              # Data transfer objects
```

### Repository Interfaces

**Example:**

```typescript
// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithRoles(email: string): Promise<UserWithRoles | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  incrementFailedLoginAttempts(userId: string): Promise<void>;
  resetFailedLoginAttempts(userId: string): Promise<void>;
  lockAccount(userId: string, lockedUntil: Date): Promise<void>;
}
```

**Key Points:**
- Define contracts, not implementations
- Used by use cases
- Implemented by infrastructure layer
- Enable dependency inversion

## Dependency Injection

### Purpose
**Dependency Injection (DI)** wires all layers together while maintaining dependency inversion.

### Container

**Example:**

```typescript
// di/container.ts
export class Container {
  private prisma: PrismaClient;
  private userRepository: IUserRepository;
  private loginUseCase: LoginUseCase;
  private authController: AuthController;

  constructor() {
    // 1. Infrastructure (concrete implementations)
    this.prisma = new PrismaClient();
    this.userRepository = new PrismaUserRepository(this.prisma);
    this.passwordHasher = new BcryptPasswordHasher();
    this.tokenService = new JwtTokenService();
    this.eventPublisher = this.createEventPublisher();

    // 2. Use Cases (depend on interfaces)
    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.passwordHasher,
      this.tokenService,
      this.refreshTokenRepository,
      this.securityAuditLogRepository
    );

    // 3. Controllers (depend on use cases)
    this.authController = new AuthController(
      this.loginUseCase,
      this.registerUseCase,
      // ... other use cases
    );
  }

  public getAuthController(): AuthController {
    return this.authController;
  }
}
```

**Key Points:**
- Single place to wire dependencies
- Easy to swap implementations
- Use cases receive interfaces, not concrete classes
- Enables testing with mocks

## Summary

Each layer has a clear responsibility:

- **Core**: Business logic, zero dependencies
- **Application**: Orchestrates use cases, handles HTTP concerns
- **Infrastructure**: Implements external concerns (database, events, cache)
- **Presentation**: HTTP routing and middleware
- **Ports**: Define contracts for dependency inversion

This structure ensures:
- ✅ Business logic is independent of frameworks
- ✅ Easy to test (mock interfaces)
- ✅ Easy to swap implementations
- ✅ Clear separation of concerns
- ✅ Services remain independent

---

## Navigation

- ⬅️ [← Back to Overview](./README.md)
- ➡️ [Next: Service Independence →](./02-service-independence.md)

