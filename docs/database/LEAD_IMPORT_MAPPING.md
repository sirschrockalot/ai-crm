# Lead Import Field Mapping Guide

## Overview
This document provides a comprehensive guide for mapping CSV fields when importing leads into the Presidential Digs CRM system. Use this guide to properly format your CSV files and understand field requirements.

## Required Fields

### Core Lead Information
| CRM Field | CSV Column Name | Required | Data Type | Description | Example |
|-----------|----------------|----------|-----------|-------------|---------|
| `firstName` | `first_name` or `firstName` | ✅ Yes | String | Lead's first name | "John" |
| `lastName` | `last_name` or `lastName` | ✅ Yes | String | Lead's last name | "Smith" |
| `email` | `email` | ✅ Yes | String | Valid email address | "john.smith@email.com" |
| `phone` | `phone` or `phone_number` | ✅ Yes | String | Phone number (any format) | "(555) 123-4567" |
| `city` | `city` | ✅ Yes | String | City name | "Austin" |
| `state` | `state` | ✅ Yes | String | State abbreviation or full name | "TX" or "Texas" |
| `zipCode` | `zip_code` or `zipCode` | ✅ Yes | String | ZIP/postal code | "78701" |

### Property Information
| CRM Field | CSV Column Name | Required | Data Type | Description | Example |
|-----------|----------------|----------|-----------|-------------|---------|
| `propertyType` | `property_type` or `propertyType` | ✅ Yes | String | Type of property | "single_family" |
| `estimatedValue` | `estimated_value` or `estimatedValue` | ✅ Yes | Number | Property value in USD | 350000 |
| `address` | `address` or `property_address` | ❌ No | String | Property address | "123 Main St" |
| `propertyAddress` | `property_address` or `propertyAddress` | ❌ No | String | Alternative property address | "456 Oak Ave" |

### Lead Management
| CRM Field | CSV Column Name | Required | Data Type | Description | Example |
|-----------|----------------|----------|-----------|-------------|---------|
| `status` | `status` | ❌ No | String | Lead status | "new" |
| `assignedTo` | `assigned_to` or `assignedTo` | ❌ No | String | User ID or email | "user-1" |
| `source` | `source` | ❌ No | String | Lead source | "Website" |
| `company` | `company` | ❌ No | String | Company name | "Smith Real Estate" |
| `score` | `score` | ❌ No | Number | Lead score (0-100) | 85 |
| `notes` | `notes` | ❌ No | String | Additional notes | "Interested in Austin area" |

## Field Value Options

### Property Types
Valid values for `propertyType`:
- `single_family` - Single family home
- `multi_family` - Multi-family property (duplex, triplex, etc.)
- `commercial` - Commercial property
- `land` - Vacant land

### Lead Status
Valid values for `status`:
- `new` - Newly created lead
- `contacted` - Initial contact made
- `qualified` - Lead has been qualified
- `converted` - Lead converted to sale
- `lost` - Lead lost or inactive

### Lead Sources
Common values for `source`:
- `Website` - Company website
- `Referral` - Referral from existing client
- `Social Media` - Social media platforms
- `Cold Call` - Cold calling campaign
- `Email Campaign` - Email marketing
- `Trade Show` - Trade show or event
- `Google Ads` - Google advertising
- `Facebook Ads` - Facebook advertising
- `Direct Mail` - Direct mail campaign

## Field Mapping Examples

### Example 1: Standard CSV Format
```csv
first_name,last_name,email,phone,city,state,zip_code,property_type,estimated_value,status,source,notes
John,Smith,john.smith@email.com,(555) 123-4567,Austin,TX,78701,single_family,350000,new,Website,Interested in Austin area
Jane,Doe,jane.doe@email.com,(555) 234-5678,Dallas,TX,75201,multi_family,500000,contacted,Referral,Looking for investment properties
```

### Example 2: Alternative Field Names
```csv
firstName,lastName,email,phone_number,city,state,zipCode,propertyType,estimatedValue,status,source,company
John,Smith,john.smith@email.com,555-123-4567,Austin,TX,78701,single_family,350000,new,Website,Smith Real Estate
Jane,Doe,jane.doe@email.com,555-234-5678,Dallas,TX,75201,multi_family,500000,contacted,Referral,Doe Investment Group
```

### Example 3: Extended Format with All Fields
```csv
first_name,last_name,email,phone,city,state,zip_code,address,property_type,estimated_value,status,assigned_to,source,company,score,notes
John,Smith,john.smith@email.com,(555) 123-4567,Austin,TX,78701,123 Main St,single_family,350000,new,user-1,Website,Smith Real Estate,85,Interested in Austin area properties
Jane,Doe,jane.doe@email.com,(555) 234-5678,Dallas,TX,75201,456 Oak Ave,multi_family,500000,contacted,user-2,Referral,Doe Investment Group,92,Looking for multi-family investment properties
```

## Field Validation Rules

### Email Validation
- Must be a valid email format
- Example: `user@domain.com`
- Invalid: `user@`, `@domain.com`, `user.domain.com`

### Phone Number Validation
- Accepts various formats
- Examples: `(555) 123-4567`, `555-123-4567`, `5551234567`, `+1-555-123-4567`
- Minimum 10 digits required

### State Validation
- Accepts both abbreviations and full names
- Examples: `TX`, `Texas`, `CA`, `California`
- Case insensitive

### ZIP Code Validation
- Accepts 5-digit or 9-digit format
- Examples: `78701`, `78701-1234`
- Must be numeric

### Property Value Validation
- Must be a positive number
- No currency symbols or commas
- Examples: `350000`, `500000.50`
- Invalid: `$350,000`, `350k`

## Import Options

### Duplicate Handling
- **Skip Duplicates**: Skip leads that already exist (based on email)
- **Update Existing**: Update existing leads with new data
- **Create New**: Always create new leads (may result in duplicates)

### Default Values
If fields are missing, the system will use these defaults:
- `status`: `new`
- `source`: `Import`
- `score`: `50`
- `propertyType`: `single_family`
- `estimatedValue`: `0`

### Field Mapping
The system supports automatic field mapping based on column names. If your CSV uses different column names, you can specify custom mappings:

```json
{
  "first_name": "firstName",
  "last_name": "lastName",
  "phone_number": "phone",
  "zip_code": "zipCode",
  "property_type": "propertyType",
  "estimated_value": "estimatedValue",
  "assigned_to": "assignedTo"
}
```

## Common Import Issues

### 1. Missing Required Fields
**Error**: "Required field 'firstName' is missing"
**Solution**: Ensure all required fields are present in your CSV

### 2. Invalid Email Format
**Error**: "Invalid email format for row 5"
**Solution**: Check email addresses for proper format

### 3. Invalid Property Type
**Error**: "Invalid property type 'house' for row 3"
**Solution**: Use valid property types: `single_family`, `multi_family`, `commercial`, `land`

### 4. Invalid Status
**Error**: "Invalid status 'pending' for row 2"
**Solution**: Use valid statuses: `new`, `contacted`, `qualified`, `converted`, `lost`

### 5. Non-numeric Property Value
**Error**: "Property value must be a number for row 4"
**Solution**: Remove currency symbols and commas from property values

## Best Practices

### 1. Data Preparation
- Clean your data before import
- Remove extra spaces and special characters
- Ensure consistent formatting
- Validate email addresses and phone numbers

### 2. File Format
- Use UTF-8 encoding
- Include headers in the first row
- Use comma separators
- Avoid special characters in field names

### 3. Testing
- Test with a small sample first
- Verify field mappings
- Check for validation errors
- Review imported data

### 4. Backup
- Always backup existing data before large imports
- Keep a copy of your original CSV file
- Document any custom field mappings

## Support

If you encounter issues with lead imports:
1. Check the validation errors in the import results
2. Verify your CSV format matches the examples above
3. Ensure all required fields are present
4. Contact support with specific error messages

## Related Files
- `LEAD_IMPORT_TEMPLATE.csv` - Sample CSV template
- `BUYER_IMPORT_MAPPING.md` - Buyer import field mapping
- Import API documentation
