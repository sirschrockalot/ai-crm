# 🧪 AI CRM Testing Guide

This guide provides comprehensive instructions for testing both the backend and frontend of the AI CRM application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Performance Testing](#performance-testing)
7. [Docker Testing](#docker-testing)
8. [Manual Testing](#manual-testing)

## 🚀 Prerequisites

### Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd ai_crm

# Install dependencies
npm install
cd src/backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp env.example .env
cp src/backend/env.example src/backend/.env
cp src/frontend/env.example src/frontend/.env
```

### Database Setup
```bash
# Start required services
docker-compose up -d mongo redis

# Verify services are running
docker-compose ps
```

## 🔧 Backend Testing

### 1. Unit Tests

```bash
cd src/backend

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- auth.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="AuthService"
```

### 2. Integration Tests

```bash
# Run integration tests
npm run test:e2e

# Run integration tests with coverage
npm run test:e2e -- --coverage
```

### 3. API Testing with Supertest

```bash
# Test specific endpoint
curl -X GET http://localhost:3000/api/health

# Test with authentication
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Database Testing

```bash
# Run database migrations
npm run migrate

# Seed test data
npm run seed

# Reset database
npm run migrate:revert
```

## 🎨 Frontend Testing

### 1. Unit Tests

```bash
cd src/frontend

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Button"
```

### 2. Component Testing

```bash
# Test specific component
npm test -- --testPathPattern="components/ui/Button"

# Test with specific environment
NODE_ENV=test npm test
```

### 3. Storybook Testing

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook

# Test stories
npm run storybook -- --ci
```

## 🔗 Integration Testing

### 1. Full Stack Testing

```bash
# Start all services
docker-compose up -d

# Run backend tests
cd src/backend && npm test

# Run frontend tests
cd ../frontend && npm test

# Run integration tests
cd ../backend && npm run test:e2e
```

### 2. API Integration Tests

```bash
# Test complete user flow
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoints
curl -X GET http://localhost:3000/api/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🌐 E2E Testing

### 1. Playwright Tests

```bash
cd src/frontend

# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific E2E test
npx playwright test auth.spec.ts

# Run tests in headed mode
npx playwright test --headed
```

### 2. E2E Test Scenarios

```bash
# Test user registration flow
npx playwright test registration.spec.ts

# Test lead management flow
npx playwright test leads.spec.ts

# Test dashboard functionality
npx playwright test dashboard.spec.ts
```

## ⚡ Performance Testing

### 1. Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml

# Run stress test
artillery run stress-test.yml
```

### 2. Frontend Performance

```bash
# Build and analyze bundle
npm run analyze

# Run Lighthouse CI
npm run lighthouse

# Performance monitoring
npm run perf
```

## 🐳 Docker Testing

### 1. Container Testing

```bash
# Build and test containers
docker-compose build
docker-compose up -d

# Test backend container
docker-compose exec backend npm test

# Test frontend container
docker-compose exec frontend npm test

# Test database connection
docker-compose exec backend npm run migrate
```

### 2. Multi-environment Testing

```bash
# Test development environment
docker-compose -f docker-compose.dev.yml up -d

# Test staging environment
docker-compose -f docker-compose.staging.yml up -d

# Test production environment
docker-compose -f docker-compose.prod.yml up -d
```

## 🖱️ Manual Testing

### 1. User Interface Testing

```bash
# Start development servers
cd src/backend && npm run start:dev
cd ../frontend && npm run dev

# Open in browser
open http://localhost:3001
```

### 2. Feature Testing Checklist

- [ ] User Registration/Login
- [ ] Lead Management
- [ ] Dashboard Analytics
- [ ] Communication Center
- [ ] Pipeline Management
- [ ] User Management
- [ ] Settings & Preferences

### 3. Cross-browser Testing

```bash
# Test in different browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=safari
```

## 📊 Test Coverage

### 1. Coverage Reports

```bash
# Backend coverage
cd src/backend && npm run test:cov
open coverage/lcov-report/index.html

# Frontend coverage
cd ../frontend && npm run test:coverage
open coverage/lcov-report/index.html
```

### 2. Coverage Thresholds

- **Backend**: 80% minimum coverage
- **Frontend**: 70% minimum coverage
- **Critical Paths**: 90% minimum coverage

## 🚨 Debugging Tests

### 1. Debug Backend Tests

```bash
# Debug with Node inspector
npm run test:debug

# Debug specific test
node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand auth.service.spec.ts
```

### 2. Debug Frontend Tests

```bash
# Debug with Chrome DevTools
npm test -- --runInBand --detectOpenHandles

# Debug specific component
npm test -- Button.test.tsx --verbose
```

### 3. Debug E2E Tests

```bash
# Debug with Playwright
npx playwright test --debug

# Debug specific test
npx playwright test auth.spec.ts --debug
```

## 📝 Test Writing Guidelines

### 1. Backend Test Structure

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: MockType;

  beforeEach(async () => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should perform expected behavior', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 2. Frontend Test Structure

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const mockHandler = jest.fn();
    render(<Component onClick={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

## 🔄 Continuous Integration

### 1. GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

### 2. Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## 📈 Monitoring & Reporting

### 1. Test Results

```bash
# Generate test report
npm run test:report

# Upload coverage to Codecov
npm run coverage:upload
```

### 2. Performance Monitoring

```bash
# Monitor API performance
npm run monitor:api

# Monitor frontend performance
npm run monitor:frontend
```

## 🆘 Troubleshooting

### Common Issues

1. **Jest Configuration Issues**
   ```bash
   # Clear Jest cache
   npx jest --clearCache
   ```

2. **Database Connection Issues**
   ```bash
   # Restart database
   docker-compose restart mongo
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :3000
   lsof -i :3001
   ```

4. **Environment Variables**
   ```bash
   # Verify environment setup
   cat .env
   ```

## 📚 Additional Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Happy Testing! 🎉**
