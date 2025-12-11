# Initial Setup Guide - Presidential Digs CRM

This guide walks you through setting up the CRM for your employees to start using it.

## Prerequisites

- All backend services are running and accessible
- Frontend is deployed and accessible
- Admin account credentials (or test mode disabled)
- Access to MongoDB (for data import if needed)

---

## Step 1: Verify Service Health

Before setting up users and data, verify that all backend services are running correctly.

### Option A: Using the Admin Dashboard

1. Log in to the CRM as an admin user
2. Navigate to the Admin page (`/admin`)
3. Look for the "Service Health Status" component
4. Verify all services show as "Healthy"

### Option B: Manual Health Checks

Check each service's health endpoint:

```bash
# Auth Service
curl http://localhost:3001/health

# Leads Service
curl http://localhost:3008/health

# User Management Service
curl http://localhost:3005/health

# Timesheet Service
curl http://localhost:3007/health
```

All should return a successful response.

---

## Step 2: Create Initial Admin User

If you don't have an admin user yet, you'll need to create one. This can be done through:

### Option A: Using the Auth Service API

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@presidentialdigs.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "companyName": "Presidential Digs",
    "role": "admin"
  }'
```

### Option B: Using the Frontend (if test mode is enabled)

1. Navigate to `/auth/test-mode`
2. Log in with test credentials
3. Navigate to Settings > User Management
4. Create your admin user

---

## Step 3: Create Employee User Accounts

### Using the User Management UI

1. Log in as an admin user
2. Navigate to **Settings** > **User Management**
3. Click **Create New User**
4. Fill in the user details:
   - **Email**: Employee's email address
   - **First Name**: Employee's first name
   - **Last Name**: Employee's last name
   - **Role**: Select appropriate role:
     - `admin` - Full system access
     - `acquisitions` - Lead management access
     - `disposition` - Buyer management access
     - `agent` - Basic user access
   - **Department**: Employee's department (optional)
   - **Password**: Set initial password (user should change on first login)
5. Click **Save**

### Bulk User Import (CSV)

For importing multiple users at once, see the [Bulk User Import Guide](./BULK_USER_IMPORT.md).

### User Roles Reference

| Role | Permissions |
|------|-------------|
| `admin` | Full system access, user management, settings |
| `acquisitions` | Lead management, lead import/export, lead analytics |
| `disposition` | Buyer management, buyer-lead matching, deal management |
| `agent` | View assigned leads, update lead status, basic communications |
| `manager` | Team management, reports, analytics |

---

## Step 4: Configure Company Settings

1. Log in as an admin user
2. Navigate to **Settings** > **System Settings**
3. Configure the following:

### Company Information
- Company Name
- Company Address
- Phone Number
- Email Address
- Website

### Organizational Structure
- Create departments (e.g., Acquisitions, Disposition)
- Create organizational units
- Assign users to departments

### Custom Fields
- Configure custom fields for leads
- Configure custom fields for buyers
- Set up field validation rules

### Workflow Settings
- Configure lead statuses
- Configure buyer statuses
- Set up automation rules

### Notification Preferences
- Email notification settings
- SMS notification settings
- In-app notification preferences

---

## Step 5: Import Existing Data

### Import Leads

1. Navigate to **Leads** > **Import**
2. Download the lead import template (CSV)
3. Fill in your lead data following the template format
4. Upload the CSV file
5. Map columns to lead fields
6. Review and confirm import

**Lead Import Template Fields:**
- `first_name`, `last_name`
- `email`, `phone`
- `address`, `city`, `state`, `zip_code`
- `property_type`, `estimated_value`
- `status`, `source`
- `notes`

See [Lead Import Guide](./LEAD_IMPORT_GUIDE.md) for detailed instructions.

### Import Buyers

1. Navigate to **Buyers** > **Import**
2. Download the buyer import template (CSV)
3. Fill in your buyer data
4. Upload the CSV file
5. Map columns to buyer fields
6. Review and confirm import

**Buyer Import Template Fields:**
- `first_name`, `last_name`
- `email`, `phone`
- `company_name`
- `investment_preferences`
- `budget_range`
- `target_locations`

See [Buyer Import Guide](./BUYER_IMPORT_GUIDE.md) for detailed instructions.

---

## Step 6: Set Up Integrations

### Twilio (SMS & Voice)

1. Navigate to **Settings** > **API Integration Settings**
2. Enter your Twilio credentials:
   - Account SID
   - Auth Token
   - Phone Number
3. Test the connection
4. Save settings

### Email Service

1. Navigate to **Settings** > **API Integration Settings**
2. Configure email service:
   - SMTP Server
   - SMTP Port
   - Username/Password
   - From Email Address
3. Test the connection
4. Save settings

### Google OAuth (Optional)

1. Navigate to **Settings** > **API Integration Settings**
2. Enter Google OAuth credentials:
   - Client ID
   - Client Secret
   - Redirect URI
3. Save settings

---

## Step 7: Configure User Permissions

1. Navigate to **Settings** > **User Management** > **Roles**
2. Review default roles and permissions
3. Create custom roles if needed
4. Assign roles to users

### Default Role Permissions

**Admin:**
- All permissions

**Acquisitions:**
- `leads:read`, `leads:write`, `leads:delete`
- `leads:import`, `leads:export`
- `communications:read`, `communications:write`
- `analytics:read`

**Disposition:**
- `buyers:read`, `buyers:write`, `buyers:delete`
- `buyers:import`, `buyers:export`
- `deals:read`, `deals:write`
- `communications:read`, `communications:write`
- `analytics:read`

**Agent:**
- `leads:read` (assigned only)
- `leads:write` (assigned only)
- `communications:read`, `communications:write`

---

## Step 8: Test Core Workflows

Before employees start using the system, test these core workflows:

### Lead Management Workflow
1. Create a new lead
2. Assign lead to an agent
3. Update lead status
4. Add notes/communications
5. Export lead data

### Buyer Management Workflow
1. Create a new buyer
2. Set buyer preferences
3. Match buyer to leads
4. Track buyer performance

### Communication Workflow
1. Send SMS to a lead
2. Make a call (if Twilio configured)
3. Send email
4. View communication history

### Dashboard Workflow
1. View role-based dashboard
2. Check analytics
3. Review recent activity
4. Access quick actions

---

## Step 9: User Training

### Create Training Materials

1. **Quick Start Guide** - Basic navigation and common tasks
2. **Role-Specific Guides** - Tailored to each user role
3. **Video Tutorials** - Screen recordings of key workflows
4. **FAQ Document** - Common questions and answers

### Schedule Training Sessions

1. **Admin Training** - System configuration and user management
2. **Acquisitions Team** - Lead management workflows
3. **Disposition Team** - Buyer management workflows
4. **General Users** - Basic navigation and tasks

---

## Step 10: Go Live Checklist

Before going live, verify:

- [ ] All backend services are healthy
- [ ] Admin user account created
- [ ] Employee user accounts created
- [ ] Company settings configured
- [ ] Custom fields set up
- [ ] Existing data imported (if applicable)
- [ ] Integrations configured (Twilio, Email)
- [ ] User permissions configured
- [ ] Core workflows tested
- [ ] Training materials prepared
- [ ] Support contact information available
- [ ] Backup procedures in place

---

## Troubleshooting

### Users Can't Log In

1. Verify user account is active
2. Check user email is correct
3. Verify password is set correctly
4. Check if account is locked
5. Verify authentication service is running

### Data Import Fails

1. Check CSV file format matches template
2. Verify required fields are present
3. Check for duplicate entries
4. Review error messages in import log
5. Try importing smaller batches

### Services Not Responding

1. Check service health status
2. Verify service URLs in environment configuration
3. Check network connectivity
4. Review service logs
5. Restart services if needed

---

## Next Steps

After initial setup:

1. Monitor system usage and performance
2. Gather user feedback
3. Address any issues promptly
4. Plan for additional features
5. Schedule regular data backups

---

## Support

For additional help:
- Review the [User Guide](../USER_GUIDE.md)
- Check the [FAQ](../FAQ.md)
- Contact your system administrator

