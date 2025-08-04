# RBAC Integration Testing Guide

## Overview

This guide provides comprehensive instructions for running integration tests for the Role-Based Access Control (RBAC) system. The integration tests verify that the RBAC system works correctly with other modules including authentication, user management, and database operations.

## Test Architecture

### Test Structure

```
src/backend/test/
├── integration-test.config.ts          # Test configuration and utilities
├── run-integration-tests.sh            # Test runner script
└── modules/rbac/
    ├── rbac.integration.spec.ts        # Main integration tests
    ├── rbac.performance.spec.ts        # Performance tests
    └── rbac.service.spec.ts            # Unit tests
```

### Test Categories

1. **Unit Tests**: Test individual RBAC service methods in isolation
2. **Integration Tests**: Test RBAC system with other modules (auth, users, database)
3. **Performance Tests**: Test system performance under load
4. **End-to-End Tests**: Test complete user workflows

## Prerequisites

### Required Software

- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **MongoDB**: For database testing (or MongoDB Memory Server)

### Required Dependencies

```bash
npm install --save-dev @nestjs/testing supertest mongodb-memory-server jest @types/jest
```

### Environment Setup

Create a `.env.test` file for test environment variables:

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/test
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h
```

## Running Tests

### Quick Start

Run all RBAC tests:

```bash
./src/backend/test/run-integration-tests.sh
```

### Specific Test Types

#### Unit Tests Only
```bash
./src/backend/test/run-integration-tests.sh --unit
```

#### Integration Tests Only
```bash
./src/backend/test/run-integration-tests.sh --integration
```

#### Performance Tests Only
```bash
./src/backend/test/run-integration-tests.sh --performance
```

#### All Tests with Report
```bash
./src/backend/test/run-integration-tests.sh --all --report
```

### Manual Test Execution

#### Using npm scripts
```bash
# Unit tests
npm run test:unit src/backend/modules/rbac/rbac.service.spec.ts

# Integration tests
npm run test:integration src/backend/modules/rbac/rbac.integration.spec.ts

# Performance tests
npm run test:performance src/backend/modules/rbac/rbac.performance.spec.ts
```

#### Using Jest directly
```bash
# Run specific test file
npx jest src/backend/modules/rbac/rbac.integration.spec.ts

# Run with coverage
npx jest src/backend/modules/rbac/rbac.integration.spec.ts --coverage

# Run with verbose output
npx jest src/backend/modules/rbac/rbac.integration.spec.ts --verbose
```

## Test Coverage

### Integration Test Coverage

The integration tests cover the following areas:

#### 1. RBAC System Initialization
- System role creation and validation
- Permission assignment to system roles
- Duplicate initialization handling

#### 2. Role Management API
- **Create Role**: POST `/rbac/roles`
- **Get Roles**: GET `/rbac/roles`
- **Update Role**: PUT `/rbac/roles/:id`
- **Delete Role**: DELETE `/rbac/roles/:id`
- **Role Search**: GET `/rbac/roles?search=&type=&isActive=`

#### 3. User-Role Assignment API
- **Assign Role**: POST `/rbac/users/:userId/roles`
- **Revoke Role**: DELETE `/rbac/users/:userId/roles/:roleId`
- **Get User Roles**: GET `/rbac/users/:userId/roles`
- **Duplicate Assignment Prevention**

#### 4. Permission Checking API
- **Get User Permissions**: GET `/rbac/users/:userId/permissions`
- **Check Single Permission**: GET `/rbac/users/:userId/permissions/check/:permission`
- **Check Multiple Permissions (Any)**: POST `/rbac/users/:userId/permissions/check`
- **Check Multiple Permissions (All)**: POST `/rbac/users/:userId/permissions/check-all`

#### 5. Integration with User Management
- **User Role Updates**: PUT `/users/:id/roles`
- **User Search by Role**: GET `/users?role=`
- **User Profile Management**

#### 6. Permission Inheritance
- **Role Inheritance**: Custom roles inheriting from system roles
- **Permission Aggregation**: Combining permissions from multiple roles
- **Inheritance Validation**: Ensuring inherited roles exist

#### 7. Tenant Isolation
- **Multi-Tenant Role Management**: Roles scoped to specific tenants
- **Cross-Tenant Isolation**: Preventing cross-tenant access
- **Tenant-Specific Permissions**

#### 8. Error Handling
- **Invalid Role/User IDs**: Proper 404 responses
- **Invalid Permissions**: Validation and error messages
- **Unauthorized Access**: 403 responses for insufficient permissions

### Performance Test Coverage

#### 1. Bulk Operations
- **Bulk Role Creation**: Creating 100+ roles simultaneously
- **Bulk Role Assignment**: Assigning roles to multiple users
- **Concurrent Permission Checks**: 200+ simultaneous permission checks

#### 2. Database Performance
- **Large Dataset Queries**: Testing with 1000+ users and 5000+ assignments
- **Query Optimization**: Testing database indexes and query performance
- **Memory Usage**: Monitoring memory consumption under load

#### 3. Permission Resolution
- **Complex Inheritance**: Testing deep role inheritance chains
- **Multiple Role Assignments**: Users with 5+ roles
- **Permission Aggregation**: Efficient permission calculation

## Test Data Management

### Test Users

The integration tests create the following test users:

```typescript
const testUsers = {
  superAdmin: {
    email: 'superadmin@test.com',
    roles: ['SUPER_ADMIN'],
    permissions: ['*'] // All permissions
  },
  tenantAdmin: {
    email: 'tenantadmin@test.com',
    roles: ['TENANT_ADMIN'],
    permissions: ['leads:*', 'users:*', 'analytics:*']
  },
  manager: {
    email: 'manager@test.com',
    roles: ['MANAGER'],
    permissions: ['leads:read', 'leads:update', 'users:read']
  },
  agent: {
    email: 'agent@test.com',
    roles: ['AGENT'],
    permissions: ['leads:read', 'leads:update']
  },
  viewer: {
    email: 'viewer@test.com',
    roles: ['VIEWER'],
    permissions: ['leads:read', 'buyers:read']
  }
};
```

### Test Roles

```typescript
const testRoles = [
  {
    name: 'TEST_ROLE_1',
    permissions: ['leads:read', 'leads:update']
  },
  {
    name: 'TEST_ROLE_2',
    permissions: ['buyers:read', 'buyers:update']
  },
  {
    name: 'TEST_ROLE_3',
    permissions: ['analytics:read'],
    inheritedRoles: ['TEST_ROLE_1']
  }
];
```

## Test Utilities

### Test Configuration

The `integration-test.config.ts` file provides:

```typescript
// Test app creation
const testApp = await createTestApp();

// Database cleanup
await clearTestDatabase(testApp);

// Test utilities
const user = await TestUtils.createTestUser(usersService, {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  roles: ['AGENT']
});

const token = TestUtils.createTestToken(jwtService, user);
```

### Common Test Patterns

#### 1. API Testing Pattern
```typescript
it('should create role via API', async () => {
  const response = await request(app.getHttpServer())
    .post('/rbac/roles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(createRoleDto)
    .expect(201);

  expect(response.body.name).toBe('TEST_ROLE');
  expect(response.body.permissions).toContain('leads:read');
});
```

#### 2. Service Testing Pattern
```typescript
it('should assign role to user', async () => {
  const userRole = await rbacService.assignRoleToUser({
    userId: user._id.toString(),
    roleId: role._id.toString()
  }, undefined, adminUser._id);

  expect(userRole.userId.toString()).toBe(user._id.toString());
  expect(userRole.roleId.toString()).toBe(role._id.toString());
});
```

#### 3. Permission Testing Pattern
```typescript
it('should check user permissions', async () => {
  const hasPermission = await rbacService.hasPermission(
    user._id.toString(),
    'leads:create'
  );

  expect(hasPermission).toBe(true);
});
```

## Performance Benchmarks

### Expected Performance Metrics

| Test Type | Metric | Expected Value |
|-----------|--------|----------------|
| Role Creation | 100 roles | < 10 seconds |
| Role Assignment | 500 assignments | < 15 seconds |
| Permission Check | 200 checks | < 10 seconds |
| User Search | 1000 users | < 3 seconds |
| Memory Usage | Under load | < 100MB increase |

### Performance Test Scenarios

#### 1. Bulk Role Creation
```typescript
// Creates 100 roles simultaneously
const startTime = Date.now();
const createPromises = [];
for (let i = 0; i < 100; i++) {
  createPromises.push(createRole(`ROLE_${i}`));
}
await Promise.all(createPromises);
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(10000); // 10 seconds
```

#### 2. Concurrent Permission Checks
```typescript
// Performs 200 concurrent permission checks
const checkPromises = [];
for (let i = 0; i < 200; i++) {
  checkPromises.push(
    rbacService.hasPermission(userId, 'leads:read')
  );
}
const results = await Promise.all(checkPromises);
expect(results.every(r => r === true)).toBe(true);
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues
```bash
# Error: MongoDB connection failed
# Solution: Ensure MongoDB is running or use MongoDB Memory Server
export MONGODB_URI=mongodb://localhost:27017/test
```

#### 2. JWT Token Issues
```bash
# Error: JWT token invalid
# Solution: Check JWT_SECRET in .env.test
export JWT_SECRET=test-secret-key
```

#### 3. Test Timeout Issues
```bash
# Error: Test timeout exceeded
# Solution: Increase timeout in test configuration
export TEST_TIMEOUT=300000
```

#### 4. Memory Issues
```bash
# Error: JavaScript heap out of memory
# Solution: Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Debug Mode

Run tests in debug mode for detailed output:

```bash
# Enable debug logging
export DEBUG=rbac:*

# Run tests with verbose output
npx jest --verbose --detectOpenHandles
```

### Test Isolation

Ensure tests are properly isolated:

```typescript
beforeEach(async () => {
  // Clear all test data
  await clearTestDatabase(testApp);
  
  // Re-initialize system roles
  await rbacService.initializeSystemRoles();
  
  // Create fresh test users
  await createTestUsers();
});
```

## Continuous Integration

### GitHub Actions Integration

Add to `.github/workflows/test.yml`:

```yaml
name: RBAC Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run RBAC integration tests
      run: ./src/backend/test/run-integration-tests.sh --all --report
      
    - name: Upload test results
      uses: actions/upload-artifact@v2
      with:
        name: test-results
        path: test-reports/
```

### Test Reports

The test runner generates comprehensive reports:

- **Coverage Report**: `coverage/lcov-report/index.html`
- **Test Summary**: `test-reports/rbac-test-summary.txt`
- **Performance Metrics**: Console output with timing information

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Keep tests focused and atomic

### 2. Test Data Management
- Use factories for creating test data
- Clean up after each test
- Use realistic test data

### 3. Performance Testing
- Run performance tests separately
- Monitor memory usage
- Set realistic performance expectations

### 4. Error Testing
- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions

### 5. Security Testing
- Test permission boundaries
- Verify tenant isolation
- Test unauthorized access scenarios

## Conclusion

The RBAC integration testing suite provides comprehensive coverage of the role-based access control system. By following this guide, you can ensure that the RBAC system works correctly with all other modules and performs well under various load conditions.

For additional support or questions, refer to the main RBAC documentation or contact the development team. 