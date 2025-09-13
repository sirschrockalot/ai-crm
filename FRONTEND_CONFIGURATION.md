# Frontend Configuration Guide

This guide explains how to configure the frontend to work with the user-management-service and other microservices.

## Environment Variables

Create a `.env.local` file in the root of the ai-crm project with the following configuration:

```env
# Frontend Environment Configuration

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=5

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Microservices Configuration

# Auth Service
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_SERVICE_API_URL=http://localhost:3001/api/auth

# Leads Service
NEXT_PUBLIC_LEADS_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_LEADS_SERVICE_API_URL=http://localhost:3002/api/leads

# Transactions Service
NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL=https://transactions-service.example.com
NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL=https://transactions-service.example.com/api/v1

# Timesheet Service
NEXT_PUBLIC_TIMESHEET_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_TIMESHEET_SERVICE_API_URL=http://localhost:3004/api/timesheet

# Lead Import Service
NEXT_PUBLIC_LEAD_IMPORT_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_LEAD_IMPORT_SERVICE_API_URL=http://localhost:3003/api/import

# User Management Service (NEW)
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL=http://localhost:3005
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_API_URL=http://localhost:3005/api/v1

# Environment
NODE_ENV=development
NEXT_PUBLIC_ENV=development

# Authentication
NEXT_PUBLIC_BYPASS_AUTH=false

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Logging
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## Configuration Service Updates

The `configService.ts` has been updated to include the user-management-service:

### New Configuration Properties:
- `userManagement.url` - Base URL for the user management service
- `userManagement.apiUrl` - API endpoint URL for the user management service

### New Getter Methods:
- `getUserManagementServiceConfig()` - Get user management service configuration
- `getUserManagementServiceConfig()` - Fallback getter with error handling

## Settings Service Updates

The `settingsService.ts` has been updated to use the user-management-service for:

### User Management:
- `getUsers()` - List users with filtering and pagination
- `createUser()` - Create new users
- `updateUser()` - Update user information
- `deleteUser()` - Delete users
- `updateUserRoles()` - Update user role assignments
- `activateUser()` / `deactivateUser()` - User activation management
- `getUserStats()` - User statistics and analytics

### Role Management:
- `getRoles()` - List roles with organization filtering
- `createRole()` - Create new roles
- `updateRole()` - Update role information
- `deleteRole()` - Delete roles
- `updateRolePermissions()` - Update role permissions
- `getRoleStats()` - Role statistics

## Service Integration

### How It Works:
1. **Configuration**: The frontend reads service URLs from environment variables
2. **Service Calls**: All user management operations now call the user-management-service directly
3. **Authentication**: JWT tokens are automatically included in API requests
4. **Error Handling**: Comprehensive error handling with fallback configurations

### API Endpoints Used:
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PATCH /api/v1/users/:id/roles` - Update user roles
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create role
- `PATCH /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role

## Development Setup

### 1. Start the User Management Service:
```bash
cd user-management-service
./start.sh
```

### 2. Update Frontend Environment:
Create `.env.local` with the configuration above.

### 3. Start the Frontend:
```bash
cd ai-crm
npm run dev
```

### 4. Test Integration:
- Navigate to `/admin` or `/settings`
- User management features should now work with the microservice
- Check browser network tab to see API calls to port 3005

## Production Configuration

For production, update the environment variables to point to your production service URLs:

```env
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL=https://user-management.yourdomain.com
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_API_URL=https://user-management.yourdomain.com/api/v1
```

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure the user-management-service allows requests from your frontend domain
2. **Authentication Errors**: Verify JWT tokens are being sent correctly
3. **Service Not Found**: Check that the user-management-service is running on port 3005
4. **Environment Variables**: Ensure `.env.local` is created and variables are set correctly

### Debug Steps:
1. Check browser console for errors
2. Verify service is running: `curl http://localhost:3005/health`
3. Check network tab for API calls
4. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL)`

## Next Steps

1. **Test All Features**: Verify all user management features work correctly
2. **Update Components**: Ensure UI components handle the new API responses
3. **Add Error Handling**: Implement proper error handling for service failures
4. **Performance**: Monitor API response times and optimize if needed
5. **Security**: Ensure proper authentication and authorization
