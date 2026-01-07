# Local Development Setup Guide

This guide helps you run the CRM locally for development without deploying to Heroku.

## Quick Start

### 1. Start the Frontend Locally

```bash
cd /Users/jschrock/Development/cloned_repos/ai-crm/src/frontend
npm run dev
```

The frontend will start on **http://localhost:3000**

### 2. Configure Environment Variables

Create or update `src/frontend/.env.local` with local service URLs:

```env
# Authentication
NEXT_PUBLIC_BYPASS_AUTH=false
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_SERVICE_API_URL=http://localhost:3001/api/auth

# Transactions Service
NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL=http://localhost:3003/api/v1

# User Management Service
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL=http://localhost:3005
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_API_URL=http://localhost:3005/api/v1

# Timesheet Service
NEXT_PUBLIC_TIMESHEET_SERVICE_URL=http://localhost:3007
NEXT_PUBLIC_TIMESHEET_SERVICE_API_URL=http://localhost:3007/api/time-entries

# Leads Service
NEXT_PUBLIC_LEADS_SERVICE_URL=http://localhost:3008
NEXT_PUBLIC_LEADS_SERVICE_API_URL=http://localhost:3008/api/v1/leads
```

### 3. Start Backend Services (Optional)

If you want to run backend services locally instead of using Heroku:

#### Auth Service
```bash
cd /Users/jschrock/Development/cloned_repos/auth-service-repo
npm run start:dev
# Runs on http://localhost:3001
```

#### Transactions Service
```bash
cd /Users/jschrock/Development/cloned_repos/transactions-service
npm run start:dev
# Runs on http://localhost:3003
```

#### User Management Service
```bash
cd /Users/jschrock/Development/cloned_repos/user-management-service
npm run start:dev
# Runs on http://localhost:3005
```

#### Timesheet Service
```bash
cd /Users/jschrock/Development/cloned_repos/Timesheet-Service
npm run start:dev
# Runs on http://localhost:3007
```

#### Leads Service
```bash
cd /Users/jschrock/Development/cloned_repos/Leads-Service
npm run start:dev
# Runs on http://localhost:3008
```

## Using Heroku Services (Recommended for Now)

If you don't want to run all services locally, you can keep using Heroku services. Just make sure your `.env.local` points to Heroku URLs:

```env
# Use Heroku services
NEXT_PUBLIC_AUTH_SERVICE_URL=https://authorization-service-6b92f7e273cf.herokuapp.com
NEXT_PUBLIC_AUTH_SERVICE_API_URL=https://authorization-service-6b92f7e273cf.herokuapp.com/api/auth

NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL=https://transactions-service-beb6e341ca4b.herokuapp.com
NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL=https://transactions-service-beb6e341ca4b.herokuapp.com/api/v1

NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL=https://user-management-service-prod-d6fbfdbd7a27.herokuapp.com
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_API_URL=https://user-management-service-prod-d6fbfdbd7a27.herokuapp.com/api/v1

NEXT_PUBLIC_TIMESHEET_SERVICE_URL=https://timesheet-service-1c566082b633.herokuapp.com
NEXT_PUBLIC_TIMESHEET_SERVICE_API_URL=https://timesheet-service-1c566082b633.herokuapp.com/api/time-entries

NEXT_PUBLIC_LEADS_SERVICE_URL=https://leads-service-prod-5d0550273e4c.herokuapp.com
NEXT_PUBLIC_LEADS_SERVICE_API_URL=https://leads-service-prod-5d0550273e4c.herokuapp.com/api/v1/leads
```

## Avoiding Heroku Deployments

To avoid deploying to Heroku while developing:

1. **Don't push to heroku remote**: Just commit to your local git repository
   ```bash
   git add .
   git commit -m "Your changes"
   # Don't run: git push heroku main
   ```

2. **Use a separate branch**: Create a development branch
   ```bash
   git checkout -b development
   # Make your changes
   git commit -m "Development changes"
   ```

3. **Push to GitHub only**: Push to origin (GitHub) but not to heroku
   ```bash
   git push origin main  # or git push origin development
   ```

## Development Workflow

1. **Start frontend**: `cd src/frontend && npm run dev`
2. **Make changes**: Edit files in `src/frontend/`
3. **See changes**: Browser auto-refreshes (Next.js hot reload)
4. **Test locally**: All changes are immediately visible
5. **Commit changes**: `git add . && git commit -m "Description"`
6. **When ready**: Push to Heroku: `git push heroku main`

## Hot Reload

Next.js automatically reloads when you save files. No need to restart the server!

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Environment Variables Not Loading
- Make sure `.env.local` is in `src/frontend/` directory
- Restart the dev server after changing `.env.local`
- Check that variables start with `NEXT_PUBLIC_` for client-side access

### CORS Errors
- Make sure backend services have CORS enabled for `http://localhost:3000`
- Check service environment variables for `CORS_ORIGIN`

### Service Connection Issues
- Verify services are running: `curl http://localhost:3001/api/auth/health`
- Check service logs for errors
- Ensure MongoDB is accessible if services need it

## Benefits of Local Development

✅ **Instant feedback** - See changes immediately  
✅ **No deployment wait** - Test changes before deploying  
✅ **Better debugging** - Use browser dev tools and console  
✅ **Faster iteration** - No build/deploy cycle  
✅ **Offline development** - Work without internet (if services are local)

