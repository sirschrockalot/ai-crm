# Heroku Deployment Guide

This guide will help you deploy the Presidential Digs CRM application to Heroku with authentication bypassed for demo purposes.

## Prerequisites

1. Heroku CLI installed
2. Git repository access
3. Heroku account

## Deployment Steps

### 1. Create Heroku App

```bash
# Create a new Heroku app
heroku create your-crm-app-name

# Or use the Heroku dashboard to create the app
```

### 2. Set Environment Variables

Set the following environment variables in your Heroku app:

```bash
# Authentication bypass (for demo)
heroku config:set NEXT_PUBLIC_BYPASS_AUTH=true

# Service URLs (update with your actual service URLs)
heroku config:set NEXT_PUBLIC_TRANSACTIONS_API_URL=https://your-transactions-service.herokuapp.com/api/v1
heroku config:set NEXT_PUBLIC_BUYERS_API_URL=https://your-buyers-service.herokuapp.com/api/v1
heroku config:set NEXT_PUBLIC_AUTH_API_URL=https://your-auth-service.herokuapp.com/api/v1

# Optional: Custom domain
heroku config:set NEXT_PUBLIC_APP_URL=https://your-crm-app.herokuapp.com
```

### 3. Deploy to Heroku

```bash
# Add Heroku remote
heroku git:remote -a your-crm-app-name

# Deploy
git push heroku main
```

### 4. Open the Application

```bash
# Open the deployed app
heroku open
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BYPASS_AUTH` | Bypass authentication for demo | `true` |
| `NEXT_PUBLIC_TRANSACTIONS_API_URL` | Transactions service URL | `https://your-transactions-service.herokuapp.com/api/v1` |
| `NEXT_PUBLIC_BUYERS_API_URL` | Buyers service URL | `https://your-buyers-service.herokuapp.com/api/v1` |
| `NEXT_PUBLIC_AUTH_API_URL` | Auth service URL | `https://your-auth-service.herokuapp.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Main app URL | `https://your-crm-app.herokuapp.com` |

## Microservices Deployment

For a complete deployment, you'll also need to deploy the microservices:

1. **Transactions Service**: Deploy to `your-transactions-service.herokuapp.com`
2. **Buyers Service**: Deploy to `your-buyers-service.herokuapp.com`
3. **Auth Service**: Deploy to `your-auth-service.herokuapp.com`

## Authentication Bypass

With `NEXT_PUBLIC_BYPASS_AUTH=true`, the application will:
- Skip authentication checks
- Allow access to all features without login
- Use mock data when services are unavailable
- Display a "Test Mode" indicator

## Troubleshooting

### Build Failures
- Check that all dependencies are in `package.json`
- Ensure build scripts are properly configured
- Check Heroku build logs: `heroku logs --tail`

### Runtime Errors
- Check environment variables are set correctly
- Verify service URLs are accessible
- Check application logs: `heroku logs --tail`

### Service Connection Issues
- Ensure microservices are deployed and running
- Check CORS settings in microservices
- Verify API endpoints are accessible

## Monitoring

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Scale dynos
heroku ps:scale web=1
```

## Custom Domain (Optional)

```bash
# Add custom domain
heroku domains:add yourdomain.com

# Configure DNS to point to your Heroku app
```

## Security Notes

- Authentication bypass is for demo purposes only
- In production, set `NEXT_PUBLIC_BYPASS_AUTH=false`
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Set up proper CORS policies
