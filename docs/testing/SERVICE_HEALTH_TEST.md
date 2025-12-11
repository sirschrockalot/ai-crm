# Service Health Status Component - Testing Guide

This guide explains how to test the ServiceHealthStatus component to verify backend services are running correctly.

## Component Location

The ServiceHealthStatus component is located at:
- **Component**: `src/frontend/components/admin/ServiceHealthStatus.tsx`
- **Utility**: `src/frontend/utils/serviceHealthCheck.ts`
- **Integration**: `src/frontend/pages/admin.tsx` (System Monitoring tab)

## Accessing the Component

1. **Log in as an admin user** (or use test mode if enabled)
2. Navigate to **Admin** page (`/admin`)
3. Click on the **System Monitoring** tab
4. The Service Health Status component will be displayed at the top

## What It Checks

The component checks the health endpoints of these services:

1. **Auth Service** - `http://localhost:3001/health` (or configured URL)
2. **Leads Service** - `http://localhost:3008/health` (or configured URL)
3. **User Management Service** - `http://localhost:3005/health` (or configured URL)
4. **Timesheet Service** - `http://localhost:3007/health` (or configured URL)

## Expected Behavior

### All Services Healthy ✅

When all services are running:
- **Overall Status**: Green "All services are healthy" alert
- **Service Status**: All services show green "Healthy" badge
- **Response Times**: Displayed in milliseconds
- **Errors**: None shown

### Some Services Unhealthy ⚠️

When some services are down:
- **Overall Status**: Yellow "Some services are experiencing issues" alert
- **Service Status**: Mix of green "Healthy" and red "Unhealthy" badges
- **Errors**: Error messages shown for unhealthy services

### All Services Unhealthy ❌

When all services are down:
- **Overall Status**: Red "Multiple services are unavailable" alert
- **Service Status**: All services show red "Unhealthy" badge
- **Errors**: Error messages for all services

## Testing Steps

### 1. Verify Services Are Running

Before testing the component, ensure backend services are running:

```bash
# Check Auth Service
curl http://localhost:3001/health

# Check Leads Service
curl http://localhost:3008/health

# Check User Management Service
curl http://localhost:3005/health

# Check Timesheet Service
curl http://localhost:3007/health
```

Each should return a successful HTTP response (200 OK).

### 2. Test Component in Browser

1. Start the frontend development server:
   ```bash
   cd src/frontend
   npm run dev
   ```

2. Open browser to `http://localhost:3001` (or your frontend URL)

3. Log in as admin user

4. Navigate to `/admin`

5. Click **System Monitoring** tab

6. Observe the Service Health Status component:
   - Should show "Checking service health..." initially
   - Then display status of all services
   - Response times should be reasonable (< 1000ms typically)

### 3. Test Refresh Functionality

1. Click the **Refresh** button
2. Component should show "Checking..." state
3. Status should update with latest health check results
4. "Last checked" timestamp should update

### 4. Test Error Handling

To test error handling:

1. **Stop one service** (e.g., stop Leads Service):
   ```bash
   # Find and kill the process
   lsof -ti:3008 | xargs kill
   ```

2. **Refresh the component** in the browser

3. **Verify**:
   - Leads Service shows "Unhealthy" status
   - Error message is displayed
   - Overall status shows "partial" (yellow alert)

4. **Restart the service** and refresh again

5. **Verify** service returns to "Healthy" status

## Troubleshooting

### Component Shows "Loading" Forever

**Possible Causes:**
- Services are not responding (timeout after 5 seconds)
- CORS issues preventing fetch requests
- Network connectivity problems

**Solutions:**
1. Check browser console for errors
2. Verify services are running
3. Check service URLs in environment configuration
4. Verify CORS is configured on backend services

### All Services Show "Unhealthy"

**Possible Causes:**
- Services are not running
- Wrong URLs configured
- Network/firewall blocking requests
- Services are on different ports

**Solutions:**
1. Verify all services are running:
   ```bash
   # Check if ports are in use
   lsof -i :3001
   lsof -i :3008
   lsof -i :3005
   lsof -i :3007
   ```

2. Check environment variables:
   ```bash
   # In frontend directory
   cat .env.local | grep SERVICE_URL
   ```

3. Verify service health endpoints manually:
   ```bash
   curl http://localhost:3001/health
   ```

### Component Not Appearing

**Possible Causes:**
- Not logged in as admin
- Component not imported correctly
- JavaScript errors preventing render

**Solutions:**
1. Check browser console for errors
2. Verify you're logged in as admin user
3. Check that component is imported in admin.tsx
4. Verify admin page is accessible

### CORS Errors

If you see CORS errors in the browser console:

**Solution:** Backend services need to allow CORS from the frontend origin:

```javascript
// Example for NestJS
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

## Expected Response Times

Typical response times for healthy services:
- **Local development**: 10-100ms
- **Same network**: 50-200ms
- **Different network**: 100-500ms
- **Timeout**: 5000ms (5 seconds)

If response times are consistently high (> 1000ms), investigate:
- Network latency
- Service performance
- Database query performance

## Service Health Endpoint Requirements

Each service should have a `/health` endpoint that:
- Returns HTTP 200 OK when healthy
- Responds quickly (< 1 second)
- Does not require authentication
- Returns JSON or plain text

Example health endpoint response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Integration with Monitoring

The ServiceHealthStatus component can be used for:
- **Development**: Quick verification that services are running
- **Staging**: Pre-deployment health checks
- **Production**: Admin dashboard monitoring (with auto-refresh enabled)

## Auto-Refresh Feature

To enable auto-refresh (checks every 30 seconds):

```tsx
<ServiceHealthStatus autoRefresh={true} refreshInterval={30000} />
```

**Note:** Auto-refresh should be used carefully in production to avoid excessive load.

## Next Steps

After verifying services are healthy:
1. Test API integrations end-to-end
2. Verify data can be fetched from services
3. Test authentication flows
4. Proceed with initial setup and data import

---

## Quick Test Checklist

- [ ] All backend services are running
- [ ] Frontend is accessible
- [ ] Logged in as admin user
- [ ] Can access `/admin` page
- [ ] System Monitoring tab is visible
- [ ] Service Health Status component appears
- [ ] All services show "Healthy" status
- [ ] Response times are reasonable
- [ ] Refresh button works
- [ ] Error handling works (test by stopping a service)

---

**Last Updated:** January 2024

