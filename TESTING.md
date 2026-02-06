# Testing Guide

This project uses **Jest** - a JavaScript testing framework - to ensure code quality and reliability.

## What are Tests?

Tests are automated code that verify your application works correctly. Think of them as a safety net:

- They catch bugs before users do
- They document how your code should behave
- They make refactoring safer
- They give you confidence when making changes

## Types of Tests in This Project

### 1. **Unit Tests** (Testing individual functions)

We test each function in isolation, like testing if `createUser()` properly creates a user.

### 2. **Integration Tests** (Testing how parts work together)

We test if different parts of the application work together correctly.

## Test Structure (AAA Pattern)

Every test follows this pattern:

```typescript
it("should do something specific", async () => {
  // 1. ARRANGE: Set up test data
  const userData = { name: "John", email: "john@example.com" };

  // 2. ACT: Execute the function being tested
  const result = await createUser(userData);

  // 3. ASSERT: Verify the result is correct
  expect(result.name).toBe("John");
});
```

## What is Mocking?

**Mocking** means creating fake versions of external dependencies (like databases) so tests:

- Run fast (no real database calls)
- Are reliable (don't depend on network/database)
- Are isolated (test one thing at a time)

Example:

```typescript
// Instead of calling the real database, we mock it:
jest.mock("../config/db");
(pool.query as jest.Mock).mockResolvedValue({
  rows: [{ id: 1, name: "John" }],
});
```

## Running Tests

### Run all tests:

```bash
npm test
```

### Run tests in watch mode (re-runs on file changes):

```bash
npm run test:watch
```

### What you'll see:

```
PASS  src/__tests__/auth.service.test.ts
  Auth Service
    createUser
      ✓ should create a new user successfully (5ms)
      ✓ should throw error if email already exists (3ms)
    loginUser
      ✓ should login user with correct credentials (4ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Coverage:    85% (functions), 80% (lines)
```

## Understanding Test Output

- **✓ (checkmark)** = Test passed ✅
- **✗ (x)** = Test failed ❌
- **Coverage** = % of your code that's tested (aim for 70%+)

## Test Files Explained

### `auth.service.test.ts`

Tests authentication logic:

- Creating new users
- Logging in users
- Password validation
- JWT token generation

### `vehicle.service.test.ts`

Tests vehicle management:

- Adding vehicles
- Getting vehicle lists
- Updating vehicles
- Deleting vehicles (with business rules)

### `auth.middleware.test.ts`

Tests security middleware:

- Token validation
- Role-based access control
- Error handling for invalid tokens

## Key Testing Concepts

### `describe()` - Groups related tests

```typescript
describe("Auth Service", () => {
  // Multiple related tests here
});
```

### `it()` or `test()` - Individual test case

```typescript
it("should create a user", () => {
  // Test code
});
```

### `expect()` - Assertion (checking results)

```typescript
expect(result).toBe(5); // Exact match
expect(user.email).toEqual("john@example.com");
expect(users).toHaveLength(3); // Array length
expect(result).toBeNull(); // Check null
expect(fn).toHaveBeenCalled(); // Function was called
```

### `beforeEach()` - Runs before each test

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Reset mocks for clean slate
});
```

## Coverage Report

After running `npm test`, open `coverage/lcov-report/index.html` in a browser to see:

- Which lines of code are tested (green)
- Which lines aren't tested (red)
- Overall coverage percentage

## Why This Matters for Clients

When showcasing to clients, tests demonstrate:

1. **Professional code quality** - You test your work
2. **Reliability** - Features work as expected
3. **Maintainability** - Easy to add features without breaking things
4. **Documentation** - Tests show how code should be used

## Common Test Commands

```bash
# Run all tests
npm test

# Run tests with detailed output
npm test -- --verbose

# Run specific test file
npm test auth.service.test.ts

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

## Next Steps

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Check coverage report in `coverage/` folder
4. Add more tests as you add features

Remember: **Good tests = Fewer bugs = Happy clients!** 🎉
