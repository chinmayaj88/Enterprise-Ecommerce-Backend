<div align="center">

# 📝 03 - Code Standards

[![Standards](https://img.shields.io/badge/Code-Standards-blue?style=for-the-badge)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-green?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-orange?style=flat-square)](.)

**Coding conventions and standards for the project**

</div>

---

## TypeScript Standards

### Use TypeScript Strict Mode

- Enable strict mode in `tsconfig.json`
- Avoid `any` types
- Use proper type annotations

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase` or `PascalCase`

### Example

```typescript
// ✅ Good
export class UserRepository implements IUserRepository {
  private readonly cache: ICache;
  
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
}

// ❌ Bad
export class userRepository {
  async findById(id: any): Promise<any> {
    // Implementation
  }
}
```

## Clean Architecture

### Layer Structure

Follow Clean Architecture principles:

```
core/           # Domain logic (no dependencies)
application/    # Use cases (depends on core)
infrastructure/ # External concerns (depends on core/application)
routes/         # HTTP layer (depends on application)
```

### Dependencies

- Core layer has **zero dependencies**
- Dependencies point **inward**
- Use interfaces (ports) for dependencies

## Code Style

### Formatting

- Use Prettier (configured in project)
- Run `npm run format` before committing
- Follow existing code style

### ESLint

- Follow ESLint rules
- Run `npm run lint` before committing
- Fix all linting errors

### Imports

```typescript
// ✅ Good: Grouped imports
import express from 'express';
import { Request, Response } from 'express';

import { IUserRepository } from '../ports/interfaces/IUserRepository';
import { User } from '../core/entities/User';

// ❌ Bad: Unorganized imports
import { User } from '../core/entities/User';
import express from 'express';
import { IUserRepository } from '../ports/interfaces/IUserRepository';
```

## Functions

### Keep Functions Small

```typescript
// ✅ Good: Small, focused function
async function validateEmail(email: string): Promise<boolean> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ❌ Bad: Too many responsibilities
async function processUser(userData: any) {
  // Validation
  // Database operations
  // Email sending
  // Logging
  // etc.
}
```

### Single Responsibility

Each function should do one thing:

```typescript
// ✅ Good
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function createUser(data: CreateUserData): Promise<User> {
  const hashedPassword = await hashPassword(data.password);
  return userRepository.create({ ...data, passwordHash: hashedPassword });
}

// ❌ Bad
async function createUser(data: CreateUserData): Promise<User> {
  // Hashing, validation, creation all in one
}
```

## Error Handling

### Use Proper Error Types

```typescript
// ✅ Good
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

// ❌ Bad
throw new Error('User not found');
```

### Handle Errors Properly

```typescript
// ✅ Good
try {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
} catch (error) {
  if (error instanceof UserNotFoundError) {
    // Handle specific error
  }
  throw error;
}

// ❌ Bad
const user = await userRepository.findById(id);
return user; // What if user is null?
```

## Comments

### When to Comment

- Complex business logic
- Non-obvious code
- Workarounds
- TODO items

### Comment Style

```typescript
// ✅ Good: Explains why, not what
// Lock account after 5 failed login attempts to prevent brute force attacks
if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
  await lockAccount(userId);
}

// ❌ Bad: States the obvious
// Increment failed attempts
failedAttempts++;
```

## Testing

### Test Coverage

- Aim for high test coverage
- Test edge cases
- Test error scenarios

### Test Structure

```typescript
describe('LoginUseCase', () => {
  describe('execute', () => {
    it('should login user with valid credentials', async () => {
      // Test implementation
    });

    it('should throw error for invalid password', async () => {
      // Test implementation
    });
  });
});
```

## Documentation

### Code Documentation

- Document public APIs
- Use JSDoc for functions
- Keep documentation up to date

### Example

```typescript
/**
 * Validates JWT token and returns user information
 * @param token - JWT token to validate
 * @returns User information if token is valid
 * @throws {InvalidTokenError} If token is invalid or expired
 */
async function validateToken(token: string): Promise<User> {
  // Implementation
}
```

## Best Practices

### Do's ✅

- ✅ Follow Clean Architecture
- ✅ Write tests
- ✅ Use TypeScript types
- ✅ Handle errors properly
- ✅ Keep functions small
- ✅ Use meaningful names
- ✅ Update documentation

### Don'ts ❌

- ❌ Don't use `any` type
- ❌ Don't skip tests
- ❌ Don't ignore linting errors
- ❌ Don't commit commented code
- ❌ Don't break existing APIs
- ❌ Don't create circular dependencies

## Next Steps

1. **[Testing Guidelines →](./04-testing-guidelines.md)** - Write tests
2. **[Pull Request Process →](./05-pull-request-process.md)** - Submit PR

---

**Navigation:**
- ⬅️ [← Previous: Development Workflow](./02-development-workflow.md)
- 🏠 [← Back to Contributing Overview](./README.md)
- ➡️ [Next: Testing Guidelines →](./04-testing-guidelines.md)

