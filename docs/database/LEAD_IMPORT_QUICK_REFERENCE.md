# Lead Import Quick Reference

## Required Fields (Must Have)
| Field | CSV Column Names | Example |
|-------|------------------|---------|
| **First Name** | `first_name`, `firstName`, `fname` | `John` |
| **Last Name** | `last_name`, `lastName`, `lname` | `Smith` |
| **Email** | `email`, `email_address` | `john@email.com` |
| **Phone** | `phone`, `phone_number`, `mobile` | `(555) 123-4567` |
| **City** | `city`, `town` | `Austin` |
| **State** | `state`, `province` | `TX` |
| **ZIP Code** | `zip_code`, `zipCode`, `zip` | `78701` |
| **Property Type** | `property_type`, `propertyType`, `type` | `single_family` |
| **Estimated Value** | `estimated_value`, `estimatedValue`, `value` | `350000` |

## Optional Fields
| Field | CSV Column Names | Example |
|-------|------------------|---------|
| **Address** | `address`, `street_address`, `property_address` | `123 Main St` |
| **Status** | `status`, `lead_status`, `stage` | `new` |
| **Assigned To** | `assigned_to`, `assignedTo`, `owner` | `user-1` |
| **Source** | `source`, `lead_source`, `origin` | `Website` |
| **Company** | `company`, `company_name` | `Smith Real Estate` |
| **Score** | `score`, `lead_score`, `rating` | `85` |
| **Notes** | `notes`, `comments`, `description` | `Interested in Austin` |

## Valid Values

### Property Types
- `single_family` - Single family home
- `multi_family` - Multi-family property
- `commercial` - Commercial property
- `land` - Vacant land

### Lead Status
- `new` - Newly created lead
- `contacted` - Initial contact made
- `qualified` - Lead has been qualified
- `converted` - Lead converted to sale
- `lost` - Lead lost or inactive

### Common Sources
- `Website` - Company website
- `Referral` - Referral from client
- `Social Media` - Social media platforms
- `Cold Call` - Cold calling campaign
- `Email Campaign` - Email marketing
- `Google Ads` - Google advertising
- `Facebook Ads` - Facebook advertising

## Sample CSV Headers

### Minimal Format
```csv
first_name,last_name,email,phone,city,state,zip_code,property_type,estimated_value
```

### Standard Format
```csv
first_name,last_name,email,phone,city,state,zip_code,property_type,estimated_value,status,source,notes
```

### Complete Format
```csv
first_name,last_name,email,phone,city,state,zip_code,address,property_type,estimated_value,status,assigned_to,source,company,score,notes
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Missing required field | Add the field to your CSV or use default values |
| Invalid email format | Check for typos, ensure @ symbol and domain |
| Invalid property type | Use only: single_family, multi_family, commercial, land |
| Invalid status | Use only: new, contacted, qualified, converted, lost |
| Non-numeric value | Remove $ signs and commas from property values |
| Phone format issues | Any format accepted, minimum 10 digits |

## Quick Start

1. **Download Template**: Use `LEAD_IMPORT_SIMPLE_TEMPLATE.csv`
2. **Fill Required Fields**: At minimum, include all required fields
3. **Validate Data**: Check email formats and property values
4. **Import**: Upload through the CRM import feature
5. **Review Results**: Check for any validation errors

## Need Help?

- **Full Documentation**: See `LEAD_IMPORT_MAPPING.md`
- **Sample Data**: See `LEAD_IMPORT_TEMPLATE.csv`
- **Field Configuration**: See `LEAD_FIELD_MAPPING.json`
