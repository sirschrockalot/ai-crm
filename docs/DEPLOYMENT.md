# Deployment Guide

Production deployment instructions for DealCycle CRM.

## Heroku Deployment

### Prerequisites

- Heroku CLI installed
- Heroku account with app created
- Doppler configured for production secrets

### Deployment Steps

1. **Configure Doppler for Production**

```bash
doppler setup --project <project> --config production
```

2. **Set Heroku Config Vars**

```bash
# Use Doppler to sync secrets to Heroku
doppler secrets download --no-file --format env | heroku config:set --app <app-name>
```

3. **Deploy Frontend**

```bash
# Deploy to Heroku
git push heroku main

# Or use Heroku CLI
heroku git:remote -a <app-name>
git push heroku main
```

4. **Deploy Backend Services**

Each microservice should be deployed separately:

```bash
# Auth Service
cd ../auth-service-repo
git push heroku main

# Leads Service
cd ../Leads-Service
git push heroku main

# Repeat for other services
```

### Environment Configuration

All environment variables should be managed through Doppler. Never commit secrets.

Required environment variables:
- Database connection strings
- JWT secrets
- Service URLs
- API keys
- Feature flags

### Health Checks

Verify deployment:

```bash
# Frontend
curl https://<app-name>.herokuapp.com/api/health

# Auth Service
curl https://<auth-service>.herokuapp.com/health

# Leads Service
curl https://<leads-service>.herokuapp.com/health
```

### Monitoring

- Use Heroku metrics dashboard
- Set up error tracking (Sentry)
- Monitor service health endpoints
- Track performance metrics

## Post-Deployment

1. **Verify Services**

Check all service health endpoints are responding.

2. **Test Authentication**

Verify login and authentication flow works.

3. **Check Database**

Ensure database connections are working.

4. **Monitor Logs**

```bash
heroku logs --tail --app <app-name>
```

## Rollback

If deployment fails:

```bash
# Rollback to previous release
heroku rollback --app <app-name>
```

## Additional Resources

- [Heroku Documentation](https://devcenter.heroku.com/)
- [Doppler Documentation](https://docs.doppler.com/)
- [Troubleshooting](./TROUBLESHOOTING.md)
