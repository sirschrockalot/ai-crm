# Creating Login Credentials for Heroku App

## Default Test User Credentials

If a test user has been created using the `create-test-user.js` script, you can use:

**Email**: `admin@dealcycle.com`  
**Password**: `admin123`

⚠️ **Note**: This user may not exist in your production database. You'll need to create it first.

## Option 1: Create User via Registration Page (Recommended)

### Steps:
1. **Visit Registration Page**: https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/register
2. **Fill out the form**:
   - First Name: Your first name
   - Last Name: Your last name
   - Email: Your email address
   - Password: Choose a secure password
   - Confirm Password: Re-enter password
   - Company Name: Your company name
3. **Submit** the form
4. **Check your email** for verification (if email verification is enabled)
5. **Log in** with your new credentials

### Important Notes:
- In development mode, users are auto-activated
- In production, you may need to verify your email first
- If email verification is required, check your email inbox

## Option 2: Create User via API

You can create a user directly via the API:

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

## Option 3: Create Test User via Script (Requires MongoDB Access)

If you have access to the MongoDB database, you can use the script:

### Prerequisites:
- MongoDB connection string
- Node.js installed
- Access to the auth-service-repo

### Steps:

1. **Navigate to auth service repo**:
```bash
cd /Users/jschrock/Development/cloned_repos/auth-service-repo
```

2. **Set MongoDB URI** (for Heroku MongoDB Atlas):
```bash
export MONGODB_URI="your-mongodb-atlas-connection-string"
```

3. **Run the create user script**:
```bash
node create-test-user.js
```

This will create:
- **Email**: `admin@dealcycle.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Status**: `active`

## Option 4: Check Existing Users

To check if a user already exists:

```bash
cd /Users/jschrock/Development/cloned_repos/auth-service-repo
node check-user.js admin@dealcycle.com
```

Or check any email:
```bash
node check-user.js your-email@example.com
```

## Quick Start: Create Your First Admin User

### Via Registration (Easiest):

1. Go to: https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/register
2. Register with your email and password
3. If email verification is required, check your email
4. Log in at: https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/auth/login

### Via API (If Registration Page Doesn't Work):

```bash
curl -X POST https://deal-cycle-crm-d1eb07bd4103.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "companyName": "Your Company Name"
  }'
```

## Troubleshooting

### Issue: "User already exists"
- The email is already registered
- Try logging in with that email
- Or use password reset if you forgot the password

### Issue: "Email verification required"
- Check your email inbox for verification link
- In development mode, users are auto-activated
- In production, you may need to verify email first

### Issue: "Cannot connect to auth service"
- The authorization service may be down
- Check service status: `heroku ps --app authorization-service`
- Restart if needed: `heroku restart --app authorization-service`

### Issue: "Invalid credentials"
- Double-check email and password
- Ensure account is active (not suspended)
- Check if email is verified (if required)

## Security Best Practices

1. **Change Default Password**: If using `admin123`, change it immediately after first login
2. **Use Strong Passwords**: Minimum 8 characters, include numbers and special characters
3. **Enable MFA**: Set up multi-factor authentication for admin accounts
4. **Regular Password Updates**: Change passwords periodically

## Next Steps After Creating Account

1. **Log in** with your credentials
2. **Change password** from default if applicable
3. **Set up profile** with your information
4. **Configure settings** for your organization
5. **Create additional users** as needed

## Need Help?

If you're having trouble:
1. Check authorization service logs: `heroku logs --tail --app authorization-service`
2. Verify MongoDB connection is working
3. Check that the auth service is running
4. Review the authentication documentation

