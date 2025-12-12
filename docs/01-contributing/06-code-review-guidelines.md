<div align="center">

# 👀 06 - Code Review Guidelines

[![Code Review](https://img.shields.io/badge/Code-Review-blue?style=for-the-badge)](.)
[![Guidelines](https://img.shields.io/badge/Guidelines-Best%20Practices-green?style=flat-square)](.)
[![Quality](https://img.shields.io/badge/Quality-Assurance-orange?style=flat-square)](.)

**Guidelines for reviewing code in pull requests**

</div>

---

## As a Reviewer

### Review Checklist

- [ ] Code follows standards
- [ ] Tests are adequate
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance considerations
- [ ] Error handling proper

### Review Focus Areas

1. **Functionality**
   - Does it work as intended?
   - Are edge cases handled?
   - Are error cases handled?

2. **Code Quality**
   - Follows Clean Architecture
   - Follows coding standards
   - Is it maintainable?

3. **Tests**
   - Adequate test coverage?
   - Tests are meaningful?
   - Edge cases tested?

4. **Documentation**
   - Code is self-documenting?
   - Complex logic explained?
   - API documentation updated?

## Review Comments

### Be Constructive

```markdown
✅ Good:
"Consider extracting this logic into a separate function for better testability."

❌ Bad:
"This is wrong."
```

### Be Specific

```markdown
✅ Good:
"The error message on line 45 should include the user ID for better debugging."

❌ Bad:
"Fix the error handling."
```

### Suggest Improvements

```markdown
✅ Good:
"Instead of using `any`, we could create a proper type for this. Here's an example: ..."

❌ Bad:
"Don't use any."
```

## Approval Criteria

### Approve When

- ✅ Code is correct and follows standards
- ✅ Tests are adequate
- ✅ Documentation is updated
- ✅ No security concerns
- ✅ Performance is acceptable

### Request Changes When

- ❌ Code has bugs
- ❌ Doesn't follow standards
- ❌ Missing tests
- ❌ Security concerns
- ❌ Performance issues

## As an Author

### Responding to Reviews

1. **Thank reviewers**
   - Appreciate their time
   - Acknowledge feedback

2. **Address comments**
   - Make requested changes
   - Explain if you disagree

3. **Ask questions**
   - If something is unclear
   - Request clarification

### Handling Feedback

```markdown
✅ Good response:
"Thanks for the feedback! I've updated the error handling as suggested. 
The new implementation includes proper error types and logging."

❌ Bad response:
"Fixed."
```

## Review Best Practices

### Do's ✅

- ✅ Be respectful and constructive
- ✅ Focus on code, not person
- ✅ Explain reasoning
- ✅ Suggest improvements
- ✅ Approve when ready

### Don'ts ❌

- ❌ Don't be harsh or personal
- ❌ Don't nitpick unnecessarily
- ❌ Don't block on style preferences
- ❌ Don't approve without review

## Summary

Code reviews are about:
- ✅ Improving code quality
- ✅ Sharing knowledge
- ✅ Catching bugs early
- ✅ Maintaining standards
- ✅ Learning together

---

**Navigation:**
- ⬅️ [← Previous: Pull Request Process](./05-pull-request-process.md)
- 🏠 [← Back to Contributing Overview](./README.md)

