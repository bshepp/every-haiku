# CI/CD Setup

The GitHub Actions workflow file exists at `.github/workflows/test.yml`.

## To Enable CI

1. Go to your GitHub repo Settings → Secrets and variables → Actions
2. Add these secrets:
   - `CLAUDE_API_KEY` - Your Anthropic API key
   - `FIREBASE_TOKEN` - Optional, from `firebase login:ci`

Tests will run automatically on:
- Push to `main`
- Pull requests to `main`

## What It Tests

- Unit tests (Jest)
- Integration tests (Firebase Emulator)
- E2E tests (Cypress)
- Linting

## Note

Tests are configured but not yet verified as passing. You may need to debug them before enabling CI/CD.
- Require status checks to pass:
  - `unit-tests`
  - `integration-tests`
  - `e2e-tests`
  - `lint`
- Require branches to be up to date

## Local CI Testing

Test the CI pipeline locally before pushing:

```bash
# Run all tests
./test-all.sh

# Check for issues
npm audit
npm run lint
```

## Deployment Pipeline

### Manual Deployment

After tests pass:

```bash
# Deploy everything
firebase deploy

# Deploy specific components
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Automated Deployment (Optional)

Add to `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
  workflow_run:
    workflows: ["Tests"]
    types: [completed]

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: |
        npm install -g firebase-tools
        cd functions && npm ci
    
    - name: Deploy to Firebase
      run: firebase deploy
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Monitoring CI/CD

### Build Status Badge

Add to README.md:

```markdown
![Tests](https://github.com/yourusername/every-haiku/workflows/Tests/badge.svg)
```

### Failed Build Notifications

GitHub automatically sends email notifications for failed builds to repository watchers.

### Test Reports

View test results in:
- GitHub Actions tab
- Pull request checks
- Artifact downloads (coverage reports, screenshots)

## Troubleshooting

### Common Issues

1. **Emulator Connection Failed**
   - Increase sleep time in workflow
   - Check emulator ports aren't blocked

2. **Cypress Tests Timeout**
   - Increase `wait-on-timeout`
   - Check application startup logs

3. **Rate Limit Errors**
   - Use test-specific rate limits
   - Mock external APIs in tests

4. **Permission Denied**
   - Check Firebase service account permissions
   - Verify GitHub secrets are set

### Debug Mode

Enable debug logging:

```yaml
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
```

## Best Practices

1. **Fast Feedback**
   - Run quick tests first (lint, unit)
   - Parallelize where possible

2. **Reliable Tests**
   - Avoid flaky tests
   - Use proper timeouts
   - Clean state between tests

3. **Security**
   - Never log secrets
   - Use GitHub secrets for sensitive data
   - Scan for vulnerabilities regularly

4. **Cost Management**
   - Use GitHub's free tier efficiently
   - Cache dependencies
   - Minimize artifact storage

## Advanced Features

### Matrix Testing

Test across multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

### Scheduled Tests

Run tests nightly:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'
```

### Performance Testing

Add performance benchmarks:

```yaml
- name: Run performance tests
  run: npm run test:performance
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase CI/CD Guide](https://firebase.google.com/docs/hosting/github-integration)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Jest Coverage Reports](https://jestjs.io/docs/configuration#coveragereporters-arraystring--string-options)