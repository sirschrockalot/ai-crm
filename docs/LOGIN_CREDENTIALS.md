# Login Credentials for Heroku App

## Default Test User (If Created)

If you've run the `create-test-user.js` script, you can use:

**Email**: `admin@dealcycle.com`  
**Password**: `admin123`

⚠️ **This user may not exist yet** - you'll need to create it first.

## How to Create Your First User

### Method 1: Use Registration Page (Easiest)

1. **Visit**: https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/register
2. **Fill out the registration form** with your details
3. **Submit** and check your email for verification (if required)
4. **Log in** with your new credentials

### Method 2: Create via API (Once Auth Service is Running)

```bash
curl -X POST https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "YourSecurePassword123!",
    "firstName": "Your",
    "lastName": "Name",
    "companyName": "Your Company"
  }'
```

### Method 3: Create via Script (Requires MongoDB Access)

If you have MongoDB connection details:

```bash
cd /Users/jschrock/Development/cloned_repos/auth-service-repo
export MONGODB_URI="your-mongodb-connection-string"
node create-test-user.js
```

This creates:
- Email: `admin@dealcycle.com`
- Password: `admin123`
- Role: `admin`

## Current Status

⚠️ **Authorization Service is Currently Down**

The authorization service needs to be running before you can:
- Register new users
- Log in with existing credentials

### To Fix Authorization Service:

```bash
# Check status
heroku ps --app authorization-service

# Restart the service
heroku restart --app authorization-service

# Check logs for errors
heroku logs --tail --app authorization-service
```

## Quick Steps to Get Started

1. **Fix Authorization Service** (if down):
   ```bash
   heroku restart --app authorization-service
   ```

2. **Wait for service to start** (30-60 seconds)

3. **Create your first user**:
   - Option A: Visit https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/register
   - Option B: Use the API (see Method 2 above)

4. **Log in** at: https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/login

## Troubleshooting

### "Cannot connect to auth service"
- Authorization service is down
- Restart it: `heroku restart --app authorization-service`
- Wait 30-60 seconds for it to start

### "User already exists"
- Try logging in with that email
- Use password reset if needed

### "Email verification required"
- Check your email inbox
- Click the verification link
- In development, users are auto-activated

### "Invalid credentials"
- Double-check email and password
- Ensure account is active
- Verify email is verified (if required)

## Security Reminder

⚠️ **Important**: If you use the default `admin123` password:
- Change it immediately after first login
- Use a strong, unique password
- Enable MFA for admin accounts

## Need Help?

1. Check auth service logs: `heroku logs --tail --app authorization-service`
2. Verify MongoDB connection in auth service config vars
3. Check that all required environment variables are set
4. Review the authentication setup documentation

