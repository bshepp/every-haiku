# Every Haiku Testing Documentation

This document provides comprehensive information about the testing framework and procedures for the Every Haiku application.

## Overview

The Every Haiku project uses a multi-layered testing approach:

1. **Unit Tests** - Jest for Cloud Functions
2. **Integration Tests** - Firebase Emulator + Jest for Firestore rules
3. **End-to-End Tests** - Cypress for user flows
4. **Manual Testing** - Developer testing procedures

## Test Structure

```
every-haiku/
├── functions/
│   ├── __tests__/
│   │   ├── generateAIHaiku.test.js
│   │   ├── toggleLike.test.js
│   │   ├── updateProfile.test.js
│   │   └── integration/
│   │       └── firestore.test.js
│   └── jest.config.js
├── cypress/
│   ├── e2e/
│   │   ├── auth.cy.js
│   │   ├── haiku-generation.cy.js
│   │   ├── social-features.cy.js
│   │   └── gallery.cy.js
│   ├── support/
│   │   ├── commands.js
│   │   └── e2e.js
│   └── plugins/
│       └── index.js
└── cypress.config.js
```

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
# Root directory
npm install

# Functions directory
cd functions
npm install
```

2. Set up environment variables:
```bash
# Create .env file in functions directory
CLAUDE_API_KEY=your-api-key-here
```

3. Install Firebase Emulator Suite:
```bash
npm install -g firebase-tools
firebase init emulators
```

### Unit Tests

Run unit tests for Cloud Functions:

```bash
cd functions

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test generateAIHaiku.test.js
```

### Integration Tests

Run Firestore security rules tests:

```bash
cd functions

# Start Firebase emulators
firebase emulators:start --only firestore

# In another terminal, run integration tests
npm test integration/firestore.test.js
```

### End-to-End Tests

Run Cypress tests:

```bash
# Start the application and emulators
firebase emulators:start
# or for production testing
firebase serve

# Run Cypress in interactive mode
npx cypress open

# Run Cypress in headless mode
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

## Test Coverage

### Unit Test Coverage

The unit tests cover:

1. **Authentication**
   - User authentication checks
   - Permission validation

2. **AI Haiku Generation**
   - Claude API integration
   - Rate limiting
   - Input sanitization
   - Error handling

3. **Social Features**
   - Like/unlike functionality
   - Profile updates
   - Username validation
   - Follow system

4. **Data Validation**
   - Input sanitization
   - Length limits
   - XSS prevention

### Integration Test Coverage

The integration tests verify:

1. **Firestore Security Rules**
   - User profile access control
   - Haiku visibility rules
   - Username uniqueness
   - Collection permissions

2. **Data Consistency**
   - Transaction integrity
   - Counter updates
   - Reference validation

### E2E Test Coverage

The E2E tests validate:

1. **Authentication Flows**
   - Registration
   - Login/logout
   - Session persistence

2. **Haiku Creation**
   - Manual creation
   - AI generation
   - Validation

3. **Social Features**
   - User profiles
   - Following system
   - Collections
   - Likes

4. **Gallery Management**
   - Viewing saved haikus
   - Filtering and sorting
   - Batch operations
   - Export functionality

## Writing Tests

### Unit Test Guidelines

```javascript
describe('Function Name', () => {
  beforeEach(() => {
    // Setup mocks
    jest.clearAllMocks();
  });

  it('should describe expected behavior', async () => {
    // Arrange
    const request = { auth: { uid: 'user123' }, data: {} };
    
    // Act
    const result = await functionName.run(request);
    
    // Assert
    expect(result).toEqual(expectedValue);
  });
});
```

### E2E Test Guidelines

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForFirebase();
  });

  it('should perform user action', () => {
    // Interact with UI
    cy.get('#element').click();
    
    // Assert results
    cy.contains('Expected text').should('be.visible');
  });
});
```

## Debugging Tests

### Debug Unit Tests

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Add console.logs in tests
console.log('Debug info:', variable);
```

### Debug E2E Tests

1. Use Cypress interactive mode: `npx cypress open`
2. Add debug commands:
```javascript
cy.debug(); // Pause execution
cy.pause(); // Pause and inspect
cy.screenshot(); // Take screenshot
```

3. Check browser console for errors
4. Use Cypress time-travel debugging

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: cd functions && npm ci
      - run: cd functions && npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npx cypress run
```

## Test Data Management

### Seed Data

Create consistent test data:

```javascript
// cypress/fixtures/testData.json
{
  "users": {
    "testUser": {
      "email": "test@example.com",
      "password": "testPassword123!",
      "displayName": "Test User"
    }
  },
  "haikus": {
    "testHaiku": {
      "line1": "Test haiku line one",
      "line2": "Second line of test haiku",
      "line3": "Final test line here"
    }
  }
}
```

### Clean Up

Always clean up test data:

```javascript
afterEach(() => {
  cy.task('clearFirestore');
});
```

## Performance Testing

Monitor test performance:

1. **Unit Test Performance**
   - Keep tests under 100ms each
   - Mock external dependencies
   - Use test doubles for Firebase

2. **E2E Test Performance**
   - Set appropriate timeouts
   - Use cy.intercept() for API mocking
   - Parallelize test runs

## Known Issues and Limitations

1. **Firebase Emulator Limitations**
   - Some Firebase features not fully emulated
   - Emulator data persists between runs
   - Need manual cleanup

2. **Cypress Limitations**
   - File upload testing requires plugins
   - Cross-origin testing restricted
   - Mobile testing requires additional setup

3. **Test Flakiness**
   - Network-dependent tests may fail
   - Timing issues with animations
   - Race conditions in async operations

## Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Clean state between tests
   - No test order dependencies

2. **Test Naming**
   - Use descriptive test names
   - Follow "should" convention
   - Group related tests

3. **Assertions**
   - One logical assertion per test
   - Use specific matchers
   - Test both success and failure

4. **Mocking**
   - Mock external services
   - Use consistent test data
   - Avoid over-mocking

5. **Maintenance**
   - Update tests with code changes
   - Remove obsolete tests
   - Refactor duplicated test code

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout values
   - Check for missing awaits
   - Verify emulator connection

2. **Authentication errors**
   - Clear emulator data
   - Check auth token generation
   - Verify Firebase config

3. **Flaky tests**
   - Add explicit waits
   - Use retry mechanisms
   - Check for race conditions

### Debug Commands

```bash
# View Firebase emulator logs
firebase emulators:start --debug

# Clear Cypress cache
npx cypress cache clear

# Run tests with verbose output
npm test -- --verbose
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io)
- [Firebase Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

## Contributing

When adding new features:

1. Write unit tests for new functions
2. Add integration tests for security rules
3. Create E2E tests for user flows
4. Update this documentation
5. Ensure all tests pass before PR