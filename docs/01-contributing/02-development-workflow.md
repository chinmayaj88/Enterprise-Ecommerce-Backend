<div align="center">

# 🔄 02 - Development Workflow

[![Workflow](https://img.shields.io/badge/Development-Workflow-blue?style=for-the-badge)](.)
[![Process](https://img.shields.io/badge/Process-Guide-green?style=flat-square)](.)
[![Contributing](https://img.shields.io/badge/Contributing-Guide-orange?style=flat-square)](.)

**Development process and workflow for contributing**

</div>

---

## Daily Workflow

### 1. Start Your Day

```bash
# Pull latest changes
git checkout main
git pull upstream main

# Start infrastructure
make dev

# Verify everything is running
docker ps
```

### 2. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Develop Feature

```bash
# Navigate to service
cd auth-service

# Start development server
npm run dev

# Make changes
# Service auto-reloads on file changes
```

### 4. Test Your Changes

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build to verify
npm run build
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(auth-service): add MFA support"
```

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Branch Strategy

### Branch Types

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Refactoring
- `test/` - Tests

### Branch Naming

Use descriptive names:
- ✅ `feature/user-profile-avatar`
- ✅ `fix/cart-calculation-error`
- ❌ `feature/update`
- ❌ `fix/bug`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```
feat(auth-service): add MFA support

Implement multi-factor authentication using TOTP.
Users can enable MFA in security settings.

Closes #123
```

```
fix(cart-service): resolve calculation bug

Fix cart total calculation when applying discounts.
Previously, discounts were applied twice.

Fixes #456
```

## Code Changes

### Making Changes

1. **Understand the Architecture**
   - Review [Codebase Architecture](../codebase-architecture/README.md)
   - Follow Clean Architecture principles

2. **Write Code**
   - Follow [Code Standards](./03-code-standards.md)
   - Write tests
   - Update documentation

3. **Test Locally**
   - Run tests
   - Test manually
   - Verify build works

### Service Independence

- Don't import code from other services
- Use HTTP APIs or events for communication
- Keep services independent

## Testing

### Write Tests

```bash
# Create test file
touch src/core/use-cases/__tests__/LoginUseCase.test.ts
```

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

See [Testing Guidelines](./04-testing-guidelines.md) for details.

## Code Quality

### Linting

```bash
# Check linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Formatting

```bash
# Format code
npm run format
```

## Pull Request

### Before Submitting

- [ ] Code follows standards
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Build succeeds

### PR Description

Include:
- What changed and why
- How to test
- Screenshots (if UI changes)
- Related issues

## Next Steps

1. **[Code Standards →](./03-code-standards.md)** - Coding conventions
2. **[Testing Guidelines →](./04-testing-guidelines.md)** - Write tests
3. **[Pull Request Process →](./05-pull-request-process.md)** - Submit PR

---

**Navigation:**
- ⬅️ [← Previous: Getting Started](./01-getting-started.md)
- 🏠 [← Back to Contributing Overview](./README.md)
- ➡️ [Next: Code Standards →](./03-code-standards.md)

