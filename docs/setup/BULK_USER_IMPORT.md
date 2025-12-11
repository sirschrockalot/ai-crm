# Bulk User Import Guide

This guide explains how to import multiple users at once using a CSV file.

## CSV Template Format

Download the user import template or create a CSV file with the following columns:

```csv
email,firstName,lastName,password,roles,department,title,phone,isActive
john.doe@presidentialdigs.com,John,Doe,SecurePass123!,"acquisitions,agent",Acquisitions,Lead Agent,555-123-4567,true
jane.smith@presidentialdigs.com,Jane,Smith,SecurePass123!,"disposition,agent",Disposition,Disposition Agent,555-234-5678,true
admin@presidentialdigs.com,Admin,User,SecurePass123!,admin,Management,System Administrator,555-000-0000,true
```

### Required Fields

- `email` - User's email address (must be unique)
- `firstName` - User's first name
- `lastName` - User's last name
- `password` - Initial password (user should change on first login)

### Optional Fields

- `roles` - Comma-separated list of roles (e.g., "acquisitions,agent")
- `department` - Department name
- `title` - Job title
- `phone` - Phone number
- `isActive` - `true` or `false` (default: `true`)

### Role Options

- `admin` - Full system access
- `acquisitions` - Lead management access
- `disposition` - Buyer management access
- `agent` - Basic user access
- `manager` - Team management access

## Import Process

### Using the Frontend UI

1. Log in as an admin user
2. Navigate to **Settings** > **User Management**
3. Click **Import Users** button
4. Select your CSV file
5. Review the preview of users to be imported
6. Click **Import** to confirm

### Using the API

```bash
curl -X POST http://localhost:3005/api/v1/users/import \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@users.csv"
```

## Validation Rules

The import process validates:

1. **Email Format** - Must be a valid email address
2. **Email Uniqueness** - Email must not already exist
3. **Password Strength** - Minimum 8 characters, must include letters and numbers
4. **Required Fields** - Email, firstName, lastName, password are required
5. **Role Validity** - Roles must be valid role names

## Import Results

After import, you'll receive:

- **Success Count** - Number of users successfully imported
- **Error Count** - Number of users that failed to import
- **Error Details** - List of errors with row numbers and reasons

## Common Errors

### Duplicate Email

**Error:** "User with email 'user@example.com' already exists"

**Solution:** Remove duplicate entries or update existing users instead

### Invalid Role

**Error:** "Invalid role 'invalid_role'"

**Solution:** Use valid role names: admin, acquisitions, disposition, agent, manager

### Weak Password

**Error:** "Password does not meet requirements"

**Solution:** Ensure passwords are at least 8 characters with letters and numbers

### Missing Required Field

**Error:** "Missing required field: email"

**Solution:** Ensure all required fields are present in the CSV

## Best Practices

1. **Test with Small Batch First** - Import 2-3 users first to verify format
2. **Use Strong Passwords** - Set secure initial passwords
3. **Verify Email Addresses** - Ensure all emails are correct before import
4. **Review Before Import** - Check the preview carefully
5. **Keep Backup** - Save a copy of your CSV file
6. **Notify Users** - Inform users their accounts have been created

## Post-Import Steps

1. **Verify Users** - Check that all users were created successfully
2. **Send Welcome Emails** - Notify users their accounts are ready
3. **Assign Initial Passwords** - Share initial passwords securely
4. **Require Password Change** - Users should change password on first login
5. **Assign to Departments** - Organize users into departments if needed

## Example CSV Files

### Minimal Example

```csv
email,firstName,lastName,password
user1@example.com,John,Doe,Password123!
user2@example.com,Jane,Smith,Password123!
```

### Complete Example

```csv
email,firstName,lastName,password,roles,department,title,phone,isActive
john.doe@presidentialdigs.com,John,Doe,SecurePass123!,"acquisitions,agent",Acquisitions,Lead Agent,555-123-4567,true
jane.smith@presidentialdigs.com,Jane,Smith,SecurePass123!,"disposition,agent",Disposition,Disposition Agent,555-234-5678,true
bob.wilson@presidentialdigs.com,Bob,Wilson,SecurePass123!,manager,Management,Team Manager,555-345-6789,true
admin@presidentialdigs.com,Admin,User,SecurePass123!,admin,Management,System Administrator,555-000-0000,true
```

## Troubleshooting

### Import Fails Completely

1. Check CSV file format (must be UTF-8)
2. Verify file is not corrupted
3. Check file size (max 10MB)
4. Review server logs for errors

### Some Users Fail to Import

1. Review error details in import results
2. Fix errors in CSV file
3. Re-import only failed users
4. Or import failed users manually

### Users Created But Can't Log In

1. Verify user account is active (`isActive=true`)
2. Check password was set correctly
3. Verify email address is correct
4. Check authentication service is running

