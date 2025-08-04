# Test Mode Usage Guide

## Overview

Test mode allows you to run the application without authentication and authorization while providing predefined test users with different roles. This is useful for development, testing, and demonstration purposes.

## Enabling Test Mode

### 1. Environment Configuration

Set the following environment variables:

```bash
# Enable test mode
TEST_MODE=true

# Set default test role (optional, defaults to 'admin')
TEST_DEFAULT_ROLE=admin

# Other required configurations
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=24h
```

### 2. Using the Example Configuration

Copy the example environment file:

```bash
cp env.test-mode.example .env
```

## Available Test Users

The following test users are automatically available when test mode is enabled:

### Admin User
- **Email**: admin@test.dealcycle.com
- **Role**: admin
- **ID**: test-admin-001
- **Name**: Test Admin

### Acquisitions User
- **Email**: acquisitions@test.dealcycle.com
- **Role**: acquisitions
- **ID**: test-acquisitions-001
- **Name**: Test Acquisitions

### Dispositions User
- **Email**: dispositions@test.dealcycle.com
- **Role**: dispositions
- **ID**: test-dispositions-001
- **Name**: Test Dispositions

## Usage Methods

### Method 1: Test Mode Login Endpoint

Use the dedicated test login endpoint:

```bash
# Login as admin (default)
curl -X POST "http://localhost:3000/auth/test-mode/login"

# Login as specific role
curl -X POST "http://localhost:3000/auth/test-mode/login?role=acquisitions"

# Login as specific user
curl -X POST "http://localhost:3000/auth/test-mode/login?email=dispositions@test.dealcycle.com"
```

### Method 2: Query Parameters

Add test parameters to any API request:

```bash
# Use test role
curl -H "Authorization: Bearer any-token" "http://localhost:3000/users?testRole=admin"

# Use test email
curl -H "Authorization: Bearer any-token" "http://localhost:3000/users?testEmail=acquisitions@test.dealcycle.com"
```

### Method 3: Headers

Use headers for test authentication:

```bash
# Use test role header
curl -H "Authorization: Bearer any-token" -H "X-Test-Role: dispositions" "http://localhost:3000/users"

# Use test email header
curl -H "Authorization: Bearer any-token" -H "X-Test-Email: admin@test.dealcycle.com" "http://localhost:3000/users"
```

## API Endpoints

### Test Mode Status
```bash
GET /auth/test-mode/status
```
Returns the current test mode status and available test users.

### Test Mode Login
```bash
POST /auth/test-mode/login?role=admin
POST /auth/test-mode/login?email=acquisitions@test.dealcycle.com
```
Authenticates a test user and returns a JWT token.

## Security Considerations

⚠️ **Important**: Test mode should **NEVER** be enabled in production environments.

### Security Features
- Test mode is clearly logged with warnings
- All test mode usage is tracked in activity logs
- Test users are clearly marked with `isTestUser: true`
- Test mode can be easily disabled by setting `TEST_MODE=false`

### Best Practices
1. Only enable test mode in development/testing environments
2. Use different JWT secrets for test and production
3. Monitor test mode usage logs
4. Disable test mode before deploying to production

## Example Usage Scenarios

### Frontend Development
```javascript
// In your frontend code, you can use test mode like this:
const response = await fetch('/api/users?testRole=admin', {
  headers: {
    'Authorization': 'Bearer any-token' // Token is ignored in test mode
  }
});
```

### API Testing
```bash
# Test admin functionality
curl -X GET "http://localhost:3000/users?testRole=admin"

# Test acquisitions functionality
curl -X GET "http://localhost:3000/users?testRole=acquisitions"

# Test dispositions functionality
curl -X GET "http://localhost:3000/users?testRole=dispositions"
```

### Postman/Insomnia
1. Add query parameter: `testRole=admin`
2. Or add header: `X-Test-Role: acquisitions`
3. Any Authorization header will work (or none at all)

## Troubleshooting

### Test Mode Not Working
1. Check that `TEST_MODE=true` is set in your environment
2. Verify the application has been restarted after changing environment variables
3. Check the logs for test mode warnings

### No Test Users Available
1. Verify the test mode configuration is loaded correctly
2. Check the `/auth/test-mode/status` endpoint
3. Ensure the TestModeService is properly injected

### Authentication Still Required
1. Make sure you're using the updated JwtAuthGuard
2. Verify the TestModeService is available in the auth module
3. Check that test mode is actually enabled

## Logging

Test mode usage is logged with warnings:

```
[TestModeService] TEST MODE: Request authenticated by admin@test.dealcycle.com (admin)
[TestModeService] TEST MODE: Authentication bypassed
```

These logs help you identify when test mode is being used and by which test user. 