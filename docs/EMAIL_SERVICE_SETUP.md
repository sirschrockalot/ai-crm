# Email Service Setup Guide

## Overview

The authorization service now includes a complete email service for:
- ✅ Email verification during registration
- ✅ Password reset emails
- ✅ Welcome emails after verification
- ✅ Resend verification emails

## Email Service Configuration

The email service supports two methods:

### Option 1: SendGrid (Recommended for Heroku)

SendGrid is a reliable email service provider that works well with Heroku.

#### Setup Steps:

1. **Create a SendGrid Account** (if you don't have one):
   - Go to https://sendgrid.com
   - Sign up for a free account (100 emails/day free)

2. **Get Your API Key**:
   - Log into SendGrid dashboard
   - Go to Settings → API Keys
   - Create a new API Key with "Mail Send" permissions
   - Copy the API key

3. **Set Heroku Config Vars**:
   ```bash
   heroku config:set SENDGRID_API_KEY=your-api-key-here --app authorization-service
   ```

4. **Verify Configuration**:
   ```bash
   heroku config --app authorization-service | grep SENDGRID
   ```

### Option 2: SMTP (Gmail, Outlook, etc.)

For SMTP-based email services:

1. **Set SMTP Configuration**:
   ```bash
   heroku config:set SMTP_HOST=smtp.gmail.com --app authorization-service
   heroku config:set SMTP_PORT=587 --app authorization-service
   heroku config:set SMTP_USER=your-email@gmail.com --app authorization-service
   heroku config:set SMTP_PASS=your-app-password --app authorization-service
   ```

2. **For Gmail**:
   - Enable 2-factor authentication
   - Generate an "App Password" (not your regular password)
   - Use the app password in `SMTP_PASS`

## Required Environment Variables

### Already Configured:
- ✅ `FRONTEND_URL` - Frontend application URL
- ✅ `EMAIL_ENABLED` - Enable/disable email sending
- ✅ `EMAIL_FROM_NAME` - Display name for emails

### To Configure:
- `SENDGRID_API_KEY` - SendGrid API key (if using SendGrid)
- OR
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (587 for TLS, 465 for SSL)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password/app password

## Email Templates

The service includes three email templates:

### 1. Verification Email
- Sent when a user registers
- Contains verification link
- Expires in 24 hours

### 2. Password Reset Email
- Sent when user requests password reset
- Contains reset link
- Expires in 1 hour

### 3. Welcome Email
- Sent after email verification
- Welcomes user to the platform

## Testing Email Service

### Test Registration Flow:

1. **Register a new user**:
   ```bash
   curl -X POST https://authorization-service-6b92f7e273cf.herokuapp.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPassword123!",
       "firstName": "Test",
       "lastName": "User",
       "companyName": "Test Company"
     }'
   ```

2. **Check email inbox** for verification email

3. **Verify email** using the token from the email:
   ```bash
   curl -X POST https://authorization-service-6b92f7e273cf.herokuapp.com/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token": "verification-token-from-email"}'
   ```

### Test Password Reset:

1. **Request password reset**:
   ```bash
   curl -X POST https://authorization-service-6b92f7e273cf.herokuapp.com/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Check email** for reset link

## Troubleshooting

### Emails Not Sending

1. **Check Email Service Status**:
   ```bash
   heroku logs --tail --app authorization-service | grep -i email
   ```

2. **Verify Configuration**:
   ```bash
   heroku config --app authorization-service | grep -E "(SENDGRID|SMTP|EMAIL)"
   ```

3. **Check Service Logs**:
   ```bash
   heroku logs --tail --app authorization-service
   ```

### Common Issues

#### "Email service not configured"
- **Solution**: Set either `SENDGRID_API_KEY` or SMTP configuration variables

#### "Failed to send email"
- **Solution**: 
  - Verify API key is correct (SendGrid)
  - Check SMTP credentials (SMTP)
  - Ensure email service is enabled: `EMAIL_ENABLED=true`

#### "Connection timeout"
- **Solution**: 
  - Check SMTP host and port
  - Verify firewall/network settings
  - Try different SMTP port (587 vs 465)

## Production Recommendations

1. **Use SendGrid** for better deliverability
2. **Set up SPF/DKIM records** for your domain
3. **Monitor email delivery** in SendGrid dashboard
4. **Set up email templates** in SendGrid for better customization
5. **Use environment-specific email addresses** for testing

## Next Steps

1. ✅ Email service is implemented
2. ✅ Email templates are created
3. ⏳ Configure SendGrid or SMTP
4. ⏳ Test email sending
5. ⏳ Deploy to production

## Quick Setup Commands

```bash
# Set up SendGrid (recommended)
heroku config:set SENDGRID_API_KEY=your-api-key --app authorization-service

# OR set up SMTP
heroku config:set SMTP_HOST=smtp.gmail.com --app authorization-service
heroku config:set SMTP_PORT=587 --app authorization-service
heroku config:set SMTP_USER=your-email@gmail.com --app authorization-service
heroku config:set SMTP_PASS=your-app-password --app authorization-service

# Verify configuration
heroku config --app authorization-service

# Restart service
heroku restart --app authorization-service
```

