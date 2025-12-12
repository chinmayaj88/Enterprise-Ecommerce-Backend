<div align="center">

# 🧪 04 - Testing Guidelines

[![Testing](https://img.shields.io/badge/Testing-Guidelines-blue?style=for-the-badge)](.)
[![Jest](https://img.shields.io/badge/Framework-Jest-green?style=flat-square&logo=jest&logoColor=white)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/Coverage-80%25%2B-orange?style=flat-square)](.)

**How to write and run tests for the project**

</div>

---

## Test Structure

### Test Organization

```
service-name/
├── src/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Unit Tests

### What to Test

- Individual functions
- Use cases
- Domain logic
- Utility functions

### Example

```typescript
// tests/unit/LoginUseCase.test.ts
import { LoginUseCase } from '../../src/core/use-cases/LoginUseCase';
import { IUserRepository } from '../../src/ports/interfaces/IUserRepository';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      // ... other methods
    } as any;

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenService
    );
  });

  it('should login user with valid credentials', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    // Act
    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    // Assert
    expect(result).toHaveProperty('accessToken');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
```

## Integration Tests

### What to Test

- Service interactions
- Database operations
- API endpoints

### Example

```typescript
// tests/integration/auth.routes.test.ts
import request from 'supertest';
import app from '../../src/index';

describe('POST /api/v1/auth/login', () => {
  it('should login user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- LoginUseCase.test.ts
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

## Test Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('should do something', async () => {
  // Arrange: Set up test data
  const user = { id: '1', email: 'test@example.com' };
  mockRepository.findById.mockResolvedValue(user);

  // Act: Execute the code
  const result = await useCase.execute('1');

  // Assert: Verify results
  expect(result).toEqual(user);
});
```

### 2. Test Edge Cases

```typescript
it('should handle null user', async () => {
  mockRepository.findById.mockResolvedValue(null);
  
  await expect(useCase.execute('1')).rejects.toThrow('User not found');
});
```

### 3. Use Descriptive Test Names

```typescript
// ✅ Good
it('should throw error when user account is locked', async () => {
  // Test
});

// ❌ Bad
it('should work', async () => {
  // Test
});
```

### 4. Mock External Dependencies

```typescript
// Mock repository
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
} as jest.Mocked<IUserRepository>;
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths
- **E2E Tests**: Main user flows

## Next Steps

1. **[Pull Request Process →](./05-pull-request-process.md)** - Submit PR
2. **[Code Review Guidelines →](./06-code-review-guidelines.md)** - Review process

---

**Navigation:**
- ⬅️ [← Previous: Code Standards](./03-code-standards.md)
- 🏠 [← Back to Contributing Overview](./README.md)
- ➡️ [Next: Pull Request Process →](./05-pull-request-process.md)

