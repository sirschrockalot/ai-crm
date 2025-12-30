# Login Credentials Summary

## ⚠️ Current Situation

The **authorization service is currently crashed** on Heroku, which means:
- ❌ You cannot register new users right now
- ❌ You cannot log in with existing credentials
- ✅ The frontend app is running and configured correctly

## Default Test User Credentials

If a test user was previously created, you can try:

**Email**: `admin@dealcycle.com`  
**Password**: `admin123`

⚠️ **Note**: This user may not exist in your database yet.

## Steps to Get Login Working

### Step 1: Fix Authorization Service

The authorization service needs to be fixed first. Check the logs:

```bash
heroku logs --tail --app authorization-service
```

Common issues:
- Missing MongoDB connection string
- Missing JWT_SECRET
- Missing required environment variables
- Database connection errors

### Step 2: Create Your First User

Once the auth service is running, you have two options:

#### Option A: Registration Page (Recommended)
1. Visit: https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/register
2. Fill out the form and submit
3. Log in with your new credentials

#### Option B: Create via Script
If you have MongoDB access, use the script:
```bash
cd /Users/jschrock/Development/cloned_repos/auth-service-repo
export MONGODB_URI="your-mongodb-connection-string"
node create-test-user.js
```

This creates:
- Email: `admin@dealcycle.com`
- Password: `admin123`

### Step 3: Log In

1. Visit: https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/login
2. Enter your email and password
3. Click "Log In"

## Quick Reference

### Default Test User (If Created)
- **Email**: `admin@dealcycle.com`
- **Password**: `admin123`
- **Role**: `admin`

### Registration URL
- https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/register

### Login URL
- https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/login

## Next Steps

1. **Fix authorization service** - Check logs and fix any errors
2. **Create your first user** - Use registration page or script
3. **Test login** - Verify you can log in successfully
4. **Change default password** - If using `admin123`, change it immediately

## Troubleshooting Authorization Service

Check what's wrong:

```bash
# View recent logs
heroku logs --tail --app authorization-service --num 100

# Check config vars
heroku config --app authorization-service

# Verify required vars are set:
# - MONGODB_URI
# - JWT_SECRET
# - PORT
# - NODE_ENV
```

Once the service is fixed and running, you'll be able to create users and log in!

