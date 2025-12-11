# Configuration Setup Guide

This guide covers all configuration options available in the CRM system.

## Table of Contents

1. [Company Settings](#company-settings)
2. [User Management](#user-management)
3. [Custom Fields](#custom-fields)
4. [Workflow Configuration](#workflow-configuration)
5. [Integration Settings](#integration-settings)
6. [Notification Settings](#notification-settings)
7. [Security Settings](#security-settings)

---

## Company Settings

Navigate to **Settings** > **System Settings** > **Company Information**

### Basic Information

- **Company Name**: Your company's legal name
- **Company Address**: Physical address
- **Phone Number**: Main contact number
- **Email Address**: Main contact email
- **Website**: Company website URL
- **Tax ID**: Business tax identification number (optional)

### Branding

- **Logo**: Upload company logo (recommended: 200x200px, PNG format)
- **Primary Color**: Brand primary color (hex code)
- **Secondary Color**: Brand secondary color (hex code)
- **Favicon**: Upload favicon (recommended: 32x32px, ICO format)

---

## User Management

Navigate to **Settings** > **User Management**

### Creating Users

See [Initial Setup Guide](./INITIAL_SETUP_GUIDE.md) for detailed user creation instructions.

### Roles and Permissions

#### Default Roles

1. **Admin**
   - Full system access
   - User management
   - System configuration
   - All CRUD operations

2. **Acquisitions**
   - Lead management (full access)
   - Lead import/export
   - Lead analytics
   - Communication management

3. **Disposition**
   - Buyer management (full access)
   - Buyer import/export
   - Deal management
   - Buyer analytics

4. **Agent**
   - View assigned leads/buyers
   - Update assigned records
   - Basic communications
   - Limited analytics

5. **Manager**
   - Team management
   - Reports and analytics
   - User assignment
   - Performance tracking

#### Creating Custom Roles

1. Navigate to **Settings** > **User Management** > **Roles**
2. Click **Create New Role**
3. Enter role details:
   - **Name**: Role name (e.g., "Senior Agent")
   - **Description**: Role description
   - **Permissions**: Select permissions from list
4. Click **Save**

### Organizational Structure

1. Navigate to **Settings** > **Organizational Settings**
2. Create departments:
   - Click **Add Department**
   - Enter department name
   - Assign manager (optional)
3. Create organizational units:
   - Click **Add Unit**
   - Enter unit name
   - Assign to department
   - Assign users to unit

---

## Custom Fields

Navigate to **Settings** > **Custom Fields**

### Lead Custom Fields

1. Click **Add Custom Field** under Lead Fields
2. Configure field:
   - **Field Name**: Internal field name (e.g., `custom_property_type`)
   - **Display Label**: User-friendly label (e.g., "Property Type")
   - **Field Type**: Text, Number, Date, Dropdown, Checkbox, etc.
   - **Required**: Whether field is required
   - **Default Value**: Default value (optional)
   - **Validation Rules**: Field validation (optional)
3. Click **Save**

### Buyer Custom Fields

Same process as lead custom fields, but under Buyer Fields section.

### Field Types

- **Text**: Single-line text input
- **Textarea**: Multi-line text input
- **Number**: Numeric input
- **Date**: Date picker
- **Dropdown**: Select from predefined options
- **Checkbox**: Boolean checkbox
- **Multi-select**: Multiple selection from options
- **File Upload**: File attachment

---

## Workflow Configuration

Navigate to **Settings** > **Workflow Management**

### Lead Statuses

Configure available lead statuses:

1. Click **Manage Lead Statuses**
2. Default statuses:
   - `new` - New lead
   - `contacted` - Initial contact made
   - `qualified` - Lead qualified
   - `converted` - Lead converted to deal
   - `lost` - Lead lost
3. Add custom statuses:
   - Click **Add Status**
   - Enter status name
   - Set status color
   - Define status order

### Buyer Statuses

Similar to lead statuses, configure buyer statuses:
- `active` - Active buyer
- `inactive` - Inactive buyer
- `preferred` - Preferred buyer
- `blacklisted` - Blacklisted buyer

### Automation Rules

1. Navigate to **Settings** > **Workflow Management** > **Automation**
2. Create automation rule:
   - **Trigger**: Event that triggers rule (e.g., "Lead status changes to 'qualified'")
   - **Condition**: Additional conditions (optional)
   - **Action**: Action to perform (e.g., "Assign to disposition team")
3. Click **Save**

### Pipeline Stages

Configure pipeline stages for lead management:

1. Navigate to **Settings** > **Workflow Management** > **Pipeline**
2. Default stages:
   - New Leads
   - Contacted
   - Qualified
   - Negotiating
   - Closed Won
   - Closed Lost
3. Customize stages:
   - Add/remove stages
   - Reorder stages
   - Set stage colors
   - Define stage requirements

---

## Integration Settings

Navigate to **Settings** > **API Integration Settings**

### Twilio (SMS & Voice)

1. **Account SID**: Your Twilio Account SID
2. **Auth Token**: Your Twilio Auth Token
3. **Phone Number**: Twilio phone number (E.164 format)
4. **Test Connection**: Verify credentials work

**Getting Twilio Credentials:**
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number
4. Enter credentials in CRM

### Email Service (SMTP)

1. **SMTP Server**: SMTP server address (e.g., `smtp.gmail.com`)
2. **SMTP Port**: Port number (e.g., `587` for TLS, `465` for SSL)
3. **Username**: SMTP username (usually your email)
4. **Password**: SMTP password or app password
5. **From Email**: Default "from" email address
6. **From Name**: Default "from" name
7. **Encryption**: TLS or SSL

**Gmail Setup:**
- Server: `smtp.gmail.com`
- Port: `587` (TLS) or `465` (SSL)
- Use App Password (not regular password)
- Enable "Less secure app access" or use OAuth2

### Google OAuth

1. **Client ID**: Google OAuth Client ID
2. **Client Secret**: Google OAuth Client Secret
3. **Redirect URI**: `https://your-domain.com/auth/callback`

**Getting Google OAuth Credentials:**
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI
6. Copy Client ID and Secret

---

## Notification Settings

Navigate to **Settings** > **Notification Settings**

### Email Notifications

Configure when to send email notifications:

- **New Lead Assigned**: Notify when lead is assigned
- **Lead Status Changed**: Notify on status change
- **New Message**: Notify on new communication
- **Daily Summary**: Daily activity summary
- **Weekly Report**: Weekly performance report

### SMS Notifications

- **New Lead Assigned**: SMS when lead assigned
- **Urgent Lead**: SMS for urgent leads
- **Follow-up Reminder**: SMS for follow-up reminders

### In-App Notifications

- **Real-time Updates**: Show real-time notifications
- **Sound Alerts**: Play sound for notifications
- **Desktop Notifications**: Browser desktop notifications

### Notification Preferences (Per User)

Users can customize their notification preferences:
1. Navigate to **Profile** > **Notification Preferences**
2. Toggle notification types
3. Set notification frequency
4. Save preferences

---

## Security Settings

Navigate to **Settings** > **Security Settings**

### Password Policy

- **Minimum Length**: Minimum password length (default: 8)
- **Require Uppercase**: Require uppercase letters
- **Require Lowercase**: Require lowercase letters
- **Require Numbers**: Require numeric characters
- **Require Special Characters**: Require special characters
- **Password Expiration**: Days until password expires (0 = never)
- **Password History**: Number of previous passwords to remember

### Session Management

- **Session Timeout**: Minutes of inactivity before logout (default: 30)
- **Max Concurrent Sessions**: Maximum concurrent sessions per user
- **Remember Me Duration**: Days for "remember me" option

### Two-Factor Authentication (2FA)

- **Require 2FA**: Require 2FA for all users
- **2FA Methods**: TOTP (authenticator app), SMS
- **Backup Codes**: Generate backup codes for users

### IP Whitelisting (Optional)

- **Enable IP Whitelist**: Restrict access to specific IPs
- **Allowed IPs**: List of allowed IP addresses/ranges

### Audit Logging

- **Enable Audit Logs**: Log all system activities
- **Log Retention**: Days to retain audit logs
- **Log Level**: Detail level (Basic, Detailed, Verbose)

---

## Data Export Settings

Navigate to **Settings** > **Data Export Settings**

### Export Format

- **Default Format**: CSV or Excel
- **Include Headers**: Include column headers
- **Date Format**: Date format in exports
- **Timezone**: Timezone for date/time fields

### Export Fields

Configure which fields to include in exports:
- Select default fields for lead exports
- Select default fields for buyer exports
- Customize per export if needed

---

## Backup and Recovery

Navigate to **Settings** > **System Settings** > **Backup**

### Automatic Backups

- **Enable Auto Backup**: Schedule automatic backups
- **Backup Frequency**: Daily, Weekly, Monthly
- **Backup Time**: Time of day for backup
- **Retention Period**: Days to retain backups

### Manual Backup

1. Click **Create Backup Now**
2. Select what to backup:
   - User data
   - Leads
   - Buyers
   - Settings
   - All data
3. Click **Backup**

### Restore from Backup

1. Click **Restore from Backup**
2. Select backup file
3. Choose what to restore
4. Click **Restore**

---

## Best Practices

1. **Start Simple**: Begin with default settings and customize as needed
2. **Document Changes**: Keep notes of configuration changes
3. **Test Changes**: Test configuration changes in staging first
4. **Regular Reviews**: Review and update settings quarterly
5. **User Training**: Train users on relevant settings
6. **Backup Before Changes**: Always backup before major changes

---

## Troubleshooting

### Settings Not Saving

1. Check user permissions (admin required)
2. Verify form validation
3. Check browser console for errors
4. Try refreshing page

### Integration Not Working

1. Verify credentials are correct
2. Test connection using "Test Connection" button
3. Check service status (Twilio, email provider)
4. Review error logs

### Custom Fields Not Appearing

1. Verify field is saved correctly
2. Check field visibility settings
3. Clear browser cache
4. Refresh page

---

## Support

For additional help:
- Review [Initial Setup Guide](./INITIAL_SETUP_GUIDE.md)
- Check [User Guide](../USER_GUIDE.md)
- Contact system administrator

