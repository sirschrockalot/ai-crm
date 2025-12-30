# Enabling Authentication on Heroku

## Overview

This guide explains how to enable user authentication for your Heroku-hosted application. Currently, authentication bypass is enabled, which allows access without login. This guide will help you disable the bypass and enable proper authentication.

## Current Status

- ✅ `app.json` has been updated to set `NEXT_PUBLIC_BYPASS_AUTH=false` by default
- ⚠️ You still need to update the Heroku config vars to ensure authentication is enabled

## Steps to Enable Authentication

### 1. Update Heroku Config Vars

You need to set `NEXT_PUBLIC_BYPASS_AUTH=false` in your Heroku app's environment variables.

#### Option A: Using Heroku CLI (Recommended)

```bash
# Set the config var
heroku config:set NEXT_PUBLIC_BYPASS_AUTH=false --app your-app-name

# Verify it was set correctly
heroku config:get NEXT_PUBLIC_BYPASS_AUTH --app your-app-name
```

#### Option B: Using Heroku Dashboard

1. Go to your Heroku Dashboard: https://dashboard.heroku.com
2. Select your application
3. Navigate to **Settings** tab
4. Scroll down to **Config Vars** section
5. Click **Reveal Config Vars**
6. Find `NEXT_PUBLIC_BYPASS_AUTH` or click **Add** if it doesn't exist
7. Set the value to `false`
8. Click **Save**

### 2. Verify Auth Service Configuration

Ensure your authentication service URLs are correctly configured in Heroku:

```bash
# Check current auth service configuration
heroku config --app your-app-name | grep AUTH_SERVICE

# Set auth service URL if not already set
heroku config:set NEXT_PUBLIC_AUTH_SERVICE_URL=https://your-auth-service.herokuapp.com --app your-app-name
heroku config:set NEXT_PUBLIC_AUTH_SERVICE_API_URL=https://your-auth-service.herokuapp.com/api/auth --app your-app-name
```

### 3. Restart Your Application

After updating config vars, restart your application:

```bash
heroku restart --app your-app-name
```

Or trigger a new deployment:

```bash
git commit --allow-empty -m "Enable authentication"
git push heroku main
```

### 4. Verify Authentication is Working

1. **Clear Browser Cache**: Clear your browser cache and cookies for the Heroku app
2. **Visit Your App**: Navigate to your Heroku app URL
3. **Expected Behavior**:
   - You should be redirected to `/auth/login`
   - You should see the login page
   - You should NOT be automatically logged in

### 5. Test Login Flow

1. Navigate to your app (should redirect to login)
2. Enter valid credentials
3. Verify you can log in successfully
4. Verify you can access protected routes after login
5. Test logout functionality

## Required Environment Variables

Make sure these are set in Heroku:

```bash
# Authentication (REQUIRED)
NEXT_PUBLIC_BYPASS_AUTH=false

# Auth Service URLs (REQUIRED - update with your actual URLs)
NEXT_PUBLIC_AUTH_SERVICE_URL=https://your-auth-service.herokuapp.com
NEXT_PUBLIC_AUTH_SERVICE_API_URL=https://your-auth-service.herokuapp.com/api/auth

# Other Service URLs (REQUIRED - update with your actual URLs)
NEXT_PUBLIC_LEADS_SERVICE_URL=https://your-leads-service.herokuapp.com
NEXT_PUBLIC_LEADS_SERVICE_API_URL=https://your-leads-service.herokuapp.com/api/v1/leads

NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL=https://your-transactions-service.herokuapp.com
NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL=https://your-transactions-service.herokuapp.com/api/v1

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

## Quick Setup Script

You can use this script to set all required config vars at once:

```bash
#!/bin/bash
APP_NAME="your-app-name"

# Disable auth bypass
heroku config:set NEXT_PUBLIC_BYPASS_AUTH=false --app $APP_NAME

# Set auth service URLs (update these with your actual URLs)
heroku config:set NEXT_PUBLIC_AUTH_SERVICE_URL=https://your-auth-service.herokuapp.com --app $APP_NAME
heroku config:set NEXT_PUBLIC_AUTH_SERVICE_API_URL=https://your-auth-service.herokuapp.com/api/auth --app $APP_NAME

# Set other service URLs (update these with your actual URLs)
heroku config:set NEXT_PUBLIC_LEADS_SERVICE_URL=https://your-leads-service.herokuapp.com --app $APP_NAME
heroku config:set NEXT_PUBLIC_LEADS_SERVICE_API_URL=https://your-leads-service.herokuapp.com/api/v1/leads --app $APP_NAME

heroku config:set NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL=https://your-transactions-service.herokuapp.com --app $APP_NAME
heroku config:set NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL=https://your-transactions-service.herokuapp.com/api/v1 --app $APP_NAME

# Restart the app
heroku restart --app $APP_NAME

echo "✅ Authentication enabled! Please verify the app is working correctly."
```

## Troubleshooting

### Issue: Still seeing bypass mode after update

**Solution:**
1. Clear browser cache and cookies
2. Verify config var is set: `heroku config:get NEXT_PUBLIC_BYPASS_AUTH`
3. Restart the app: `heroku restart`
4. Check browser console for any errors

### Issue: Redirect loop on login page

**Solution:**
1. Verify `NEXT_PUBLIC_AUTH_SERVICE_API_URL` is correct
2. Check that auth service is running and accessible
3. Verify CORS is configured correctly on auth service
4. Check browser console and network tab for errors

### Issue: Cannot log in

**Solution:**
1. Verify auth service is running: `heroku ps --app your-auth-service`
2. Check auth service logs: `heroku logs --tail --app your-auth-service`
3. Verify database connection for auth service
4. Check that user accounts exist in the database

### Issue: 401 Unauthorized errors

**Solution:**
1. Verify JWT tokens are being generated correctly
2. Check that `JWT_SECRET` is set in auth service
3. Verify token expiration settings
4. Check that tokens are being stored in localStorage

## Security Checklist

Before rolling out to users, verify:

- [ ] `NEXT_PUBLIC_BYPASS_AUTH=false` is set in production
- [ ] All service URLs are correctly configured
- [ ] Auth service is running and accessible
- [ ] Database connections are secure
- [ ] JWT secrets are strong and unique
- [ ] HTTPS is enabled (Heroku does this automatically)
- [ ] CORS is properly configured
- [ ] Session timeout is configured appropriately
- [ ] Password requirements are enforced
- [ ] Rate limiting is enabled on auth endpoints

## Next Steps

After enabling authentication:

1. **Create Admin Account**: Ensure you have at least one admin account created
2. **Test User Creation**: Test the user registration flow
3. **Test Password Reset**: Verify password reset functionality works
4. **Monitor Logs**: Watch for authentication errors in logs
5. **Set Up Monitoring**: Configure alerts for failed login attempts
6. **Document User Onboarding**: Create user guides for your team

## Support

If you encounter issues:

1. Check Heroku logs: `heroku logs --tail --app your-app-name`
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Test auth service endpoints directly
5. Review the authentication implementation in `src/frontend/contexts/AuthContext.tsx`

## Related Documentation

- [Frontend Configuration Guide](../configuration/frontend-environment-setup-guide.md)
- [Authentication Implementation](../CRM_READINESS_SUMMARY.md)
- [Local Development Setup](../LOCAL_DEVELOPMENT.md)

