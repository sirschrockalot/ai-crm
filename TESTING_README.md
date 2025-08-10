# 🧪 Quick Testing Guide

## 🚀 Quick Start

### 1. **Start Services**
```bash
# Start required services (MongoDB, Redis)
npm run docker:up
# or
docker-compose up -d mongo redis
```

### 2. **Run All Tests**
```bash
# Run complete test suite
npm run test:all

# Or use the quick test menu
npm run test:quick
```

### 3. **Individual Test Commands**

#### Backend Tests
```bash
# Unit tests
npm run test:backend

# With coverage
npm run test:coverage:backend

# Watch mode
cd src/backend && npm run test:watch
```

#### Frontend Tests
```bash
# Unit tests
npm run test:frontend

# With coverage
npm run test:coverage:frontend

# E2E tests
npm run test:e2e
```

#### API Tests
```bash
# Quick API health check
npm run test:api

# Load testing
npm run test:load
```

## 📋 Test Types

### **Unit Tests**
- **Backend**: NestJS services, controllers, guards
- **Frontend**: React components, hooks, utilities
- **Location**: `src/*/__tests__/` and `*.spec.ts` files

### **Integration Tests**
- **Backend**: API endpoints, database operations
- **Frontend**: Component interactions, API calls
- **Location**: `src/backend/test/` and `src/frontend/__tests__/`

### **E2E Tests**
- **Frontend**: Complete user workflows
- **Tool**: Playwright
- **Location**: `src/frontend/e2e/`

### **Performance Tests**
- **Load Testing**: Artillery
- **Location**: `scripts/load-test.yml`

## 🔧 Common Commands

```bash
# Start development environment
npm run dev

# Run specific test file
cd src/backend && npm test -- auth.service.spec.ts
cd src/frontend && npm test -- Button.test.tsx

# Run tests with coverage
npm run test:coverage

# Check services status
docker-compose ps

# View test reports
open src/backend/coverage/lcov-report/index.html
open src/frontend/coverage/lcov-report/index.html
```

## 🐛 Debugging

### **Backend Debug**
```bash
# Debug with Node inspector
cd src/backend && npm run test:debug

# Debug specific test
node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand auth.service.spec.ts
```

### **Frontend Debug**
```bash
# Debug with Chrome DevTools
cd src/frontend && npm test -- --runInBand --detectOpenHandles

# Debug specific component
npm test -- Button.test.tsx --verbose
```

### **E2E Debug**
```bash
# Debug with Playwright
cd src/frontend && npx playwright test --debug

# Debug specific test
npx playwright test auth.spec.ts --debug
```

## 📊 Coverage Reports

After running tests with coverage:
- **Backend**: `src/backend/coverage/lcov-report/index.html`
- **Frontend**: `src/frontend/coverage/lcov-report/index.html`

## 🆘 Troubleshooting

### **Common Issues**

1. **Jest Configuration Issues**
   ```bash
   npx jest --clearCache
   ```

2. **Database Connection Issues**
   ```bash
   docker-compose restart mongo
   ```

3. **Port Conflicts**
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```

4. **Environment Variables**
   ```bash
   cat .env
   ```

### **Service Status**
```bash
# Check if services are running
docker-compose ps

# View service logs
docker-compose logs mongo
docker-compose logs redis
```

## 📚 Additional Resources

- [Full Testing Guide](./TESTING_GUIDE.md)
- [Backend Testing Docs](https://docs.nestjs.com/fundamentals/testing)
- [Frontend Testing Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)

---

**Need help?** Check the full [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed instructions.
