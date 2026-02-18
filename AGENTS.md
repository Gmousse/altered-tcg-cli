# Development Practices Guide - Altered TCG CLI

This document defines the standards and practices expected for all contributors to the Altered TCG CLI project.

## 📋 Table of Contents

1. [Project Philosophy](#-project-philosophy)
2. [Code Standards](#-code-standards)
3. [TypeScript Typing](#-typescript-typing)
4. [Dependency Management](#-dependency-management)
5. [Security](#-security)
6. [Documentation](#-documentation)
7. [Testing](#-testing)
8. [Git Workflow](#-git-workflow)
9. [Code Review](#-code-review)
10. [Deployment](#-deployment)
11. [Contribution](#-contribution)

## 🎯 Project Philosophy

**Guiding Principle**: "Less is more - but not at the expense of quality"

- **Intelligent Minimalism**: Prefer simple, lightweight solutions
- **Quality > Quantity**: Better to have less well-written code than lots of mediocre code
- **Maintainability**: Code should be readable by other developers in 6 months
- **Security by Default**: Always consider security implications

## 💻 Code Standards

### Formatting

- **Prettier**: Existing configuration must be respected
- **ESLint**: All rules must pass
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_CASE` for constants
  - `kebab-case` for files and directories
- **Comments**: Only when necessary - code should be self-documenting

### File Structure

```typescript
// 1. Imports (grouped and sorted)
import { fs } from "node:fs";
import path from "node:path";
import { LocalType } from "./local";
import { ExternalType } from "external-package";

// 2. Types and Interfaces
type LocalType = {
  // ...
};

// 3. Constants
const DEFAULT_VALUE = "value";

// 4. Utility Functions
function helperFunction() {
  // ...
}

// 5. Main Class / Export
class MainClass {
  // ...
}

export default MainClass;
```

## 🆔 TypeScript Typing

### Strict Rules

- **Absolute prohibition of `any`** - Always type explicitly
- **Generics**: Use judiciously for reusability
- **Types vs Interfaces**:
  - `type` for unions, intersections, mapped types
  - `interface` for objects and contracts

### Best Practices

```typescript
// ✅ Good - Explicit typing
type User = {
  id: string;
  name: string;
  email: string;
};

// ❌ Bad - any forbidden
const user: any = getUser();

// ✅ Good - Constrained generics
function processCard<U extends Card>(card: U) {
  // ...
}

// ✅ Good - Conditional types
type CardPrice = Card["price"]; // number | undefined
```

### Project Types

- Always extend existing types rather than duplicating
- See `src/types/` for base types (Card, Transaction, etc.)
- Create module-specific types if needed

## 📦 Dependency Management

### Principles

- **Zero unnecessary dependencies**: Each dependency must justify its existence
- **Prefer native**: Use Node.js/JS APIs before adding a package
- **Size matters**: Prefer lightweight packages (< 50KB)

### Addition Process

1. **Justification**: Explain why the dependency is needed
2. **Research**: Check if there's a native alternative
3. **Evaluation**:
   - Package size
   - Maintenance (last commit, open issues)
   - Security (known CVEs)
   - Popularity (weekly downloads)
4. **Documentation**: Add to `package.json` with comment

### Approved Dependencies

- `mustache` - Lightweight templating with automatic escaping
- `commander` - CLI argument parsing
- `ky` - Lightweight HTTP client
- `pino` - Performant logging

## 🔒 Security

### Mandatory Rules

- **HTML Escaping**: Always escape user data
- **Input Validation**: Always validate external data
- **No `eval()`**: Forbidden without exception
- **Secrets**: Never in code, always in environment variables

### Best Practices

```typescript
// ✅ Good - Automatic escaping with Mustache
const html = Mustache.render("<p>{{userInput}}</p>", { userInput });

// ✅ Good - Validation with Zod (if added)
const validatedData = cardSchema.parse(rawData);

// ❌ Bad - Unsafe concatenation
const html = `<p>${userInput}</p>`;
```

## 📚 Documentation

### Rules

- **JSDoc mandatory** for all exported functions
- **Explanatory comments** for complex logic ONLY
- **README.md** up to date for each module
- **Usage examples** in documentation
- **No unnecessary comments** - Code should be self-documenting

### JSDoc Format

````typescript
/**
 * Calculates the total price of cards in inventory
 * @param cards - Array of cards to calculate price for
 * @param currency - Target currency (default: EUR)
 * @returns Total price formatted as string
 * @example
 * ```typescript
 * const total = calculateTotalPrice(cards, 'USD');
 * // returns "$125.50"
 * ```
 */
function calculateTotalPrice(cards: Card[], currency: string = "EUR"): string {
  // implementation
}
````

## 🧪 Testing

### Standards

- **100% coverage** for critical code (connectors, repositories)
- **80% minimum** for the rest of the code
- **Unit tests** for pure logic
- **Integration tests** for complete flows
- **No test-specific code in source files** - Tests should be completely separate
- Never use dynamic imports inside tests functions. Import at the top.

### Structure

```bash
src/
  module/
    file.ts          # Source code
    file.test.ts     # Corresponding tests
```

### Best Practices

```typescript
// ✅ Good - Isolated and descriptive tests
describe("CardRepository", () => {
  describe("getCardByReference", () => {
    it("should return card when reference exists", async () => {
      // Arrange
      const repo = new CardRepository();

      // Act
      const result = await repo.getCardByReference("card-123");

      // Assert
      expect(result).toMatchObject(expectedCard);
    });

    it("should throw error when reference invalid", async () => {
      await expect(repo.getCardByReference("invalid")).rejects.toThrow();
    });
  });
});
```

## 🌱 Git Workflow

### Branches

- `main` - Production (protected)
- `develop` - Integration (protected)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation

### Commit Messages

```bash
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, perf, test, chore

feat(card): add HTML report generation
fix(api): handle 429 rate limiting
docs: update README with installation instructions
refactor(report): replace Vue with Mustache
```

### Pull Requests

- **Clear and descriptive title**
- **Description** with:
  - Problem solved
  - Solution implemented
  - Screenshots if UI
  - Related issues
- **Mandatory review** by at least 1 other developer
- **Green build** (CI/CD must pass)

## 🔍 Code Review

### Review Checklist

- [ ] Code follows project standards
- [ ] No `any` in code
- [ ] All edge cases are handled
- [ ] Documentation is up to date
- [ ] Tests cover new cases
- [ ] Performance is acceptable
- [ ] Security is respected
- [ ] Code is maintainable

### Review Best Practices

```markdown
**Constructive feedback**:
✅ "Have you considered the case where `card.price` is undefined?"
❌ "This code is bad"

**Concrete suggestions**:
✅ "Maybe use Optional Chaining here: `card?.price ?? 0`"
❌ "Do better"
```

## 🚀 Deployment

### Process

1. **Create a release** on GitHub with detailed notes
2. **Tag version** following semver (v1.2.3)
3. **Update CHANGELOG.md**
4. **Publish to npm** (if applicable)
5. **Announce** in the dedicated channel

### Versioning

- **MAJOR**: Breaking changes
- **MINOR**: Backward-compatible new features
- **PATCH**: Backward-compatible bug fixes

## 🤝 Contribution

We welcome contributions! To contribute:

1. Fork the project
2. Create a branch `feature/your-feature`
3. Follow the standards in this guide
4. Open a Pull Request
5. Wait for review and merge

**Thank you for respecting these standards to maintain project quality!** 🙏
