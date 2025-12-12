<div align="center">

# 🔀 05 - Pull Request Process

[![Pull Request](https://img.shields.io/badge/Pull-Request-blue?style=for-the-badge&logo=github&logoColor=white)](.)
[![Process](https://img.shields.io/badge/Process-Guide-green?style=flat-square)](.)
[![Contributing](https://img.shields.io/badge/Contributing-Guide-orange?style=flat-square)](.)

**How to submit pull requests and what to include**

</div>

---

## Before Creating PR

### Checklist

- [ ] Code follows [Code Standards](./03-code-standards.md)
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Branch is up to date with main

### Verify Locally

```bash
# Run tests
npm test

# Check linting
npm run lint

# Build
npm run build

# Test manually
npm run dev
```

## Creating Pull Request

### 1. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 2. Create PR on GitHub

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template

### 3. PR Title

Use conventional commit format:

```
feat(auth-service): add MFA support
fix(cart-service): resolve calculation bug
docs: update setup instructions
```

## PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring
- [ ] Test

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
Fixes #456
```

## PR Review Process

### 1. Automated Checks

- CI/CD pipeline runs
- Tests execute
- Linting checks
- Build verification

### 2. Code Review

- Maintainers review code
- Address review comments
- Make requested changes
- Re-request review when ready

### 3. Approval

- At least one approval required
- All checks must pass
- No merge conflicts

## Addressing Review Comments

### 1. Make Changes

```bash
# Make requested changes
# Commit changes
git add .
git commit -m "fix: address review comments"
```

### 2. Push Changes

```bash
git push origin feature/your-feature-name
```

### 3. Respond to Comments

- Thank reviewers
- Explain changes made
- Ask questions if unclear

## After PR is Merged

### 1. Update Local Repository

```bash
git checkout main
git pull upstream main
```

### 2. Delete Branch

```bash
# Delete local branch
git branch -d feature/your-feature-name

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/your-feature-name
```

## PR Best Practices

### Do's ✅

- ✅ Keep PRs small and focused
- ✅ Write clear descriptions
- ✅ Respond to comments promptly
- ✅ Update PR if requested
- ✅ Test thoroughly before submitting

### Don'ts ❌

- ❌ Don't submit incomplete work
- ❌ Don't ignore review comments
- ❌ Don't force push after review starts
- ❌ Don't mix unrelated changes
- ❌ Don't skip tests

## Next Steps

1. **[Code Review Guidelines →](./06-code-review-guidelines.md)** - Review process

---

**Navigation:**
- ⬅️ [← Previous: Testing Guidelines](./04-testing-guidelines.md)
- 🏠 [← Back to Contributing Overview](./README.md)
- ➡️ [Next: Code Review Guidelines →](./06-code-review-guidelines.md)

