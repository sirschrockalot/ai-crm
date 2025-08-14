# Buyer Import Implementation

## Overview

The buyer import functionality allows users to import buyers from CSV files using the PDR_BUYERS_template.csv structure. This feature provides a complete import workflow with validation, field mapping, and error handling.

## Architecture

### Components

1. **BuyerImport Component** (`src/frontend/components/buyers/BuyerImport/`)
   - User interface for file upload and import configuration
   - Template download functionality
   - Import progress tracking
   - Error reporting and validation results

2. **API Endpoints** (`src/frontend/pages/api/buyers/`)
   - `/api/buyers/import-csv` - Main import endpoint
   - `/api/buyers/template` - Template download endpoint
   - `/api/buyers/validate-csv` - CSV validation endpoint
   - `/api/buyers/field-mapping` - Field mapping suggestions

3. **Services** (`src/frontend/services/`)
   - `buyerImportService.ts` - Service layer for import operations

## Field Mapping

### PDR CSV Template Structure

The system uses the PDR_BUYERS_template.csv structure with the following key fields:

| CSV Field | Buyer Property | Description |
|-----------|----------------|-------------|
| `bname` | `companyName` | Buyer/Company name |
| `bemail` | `email` | Email address |
| `bphone1` | `phone` | Primary phone number |
| `bphone2` | `phone` | Secondary phone (fallback) |
| `bstreet` | `address` | Street address |
| `bcity` | `city` | City |
| `bstate` | `state` | State |
| `bzip` | `zipCode` | ZIP code |
| `btype` | `buyerType` | Buyer type (individual/company/investor) |
| `investment_goals` | `investmentRange` | Investment range mapping |
| `btag1`, `btag2`, `btag3` | `preferredPropertyTypes` | Property type preferences |
| `notes`, `bnotes`, `property_notes` | `notes` | Combined notes field |
| `status` | `isActive` | Active status mapping |

### Automatic Field Mapping

The system automatically maps CSV fields to buyer properties using:

1. **Exact matches** - Direct field name matching
2. **Variations** - Common field name variations and synonyms
3. **Partial matches** - Keyword-based matching for similar fields

### Field Mapping Logic

```typescript
function mapCSVToBuyer(csvData: PDRBuyerCSV): Partial<Buyer> {
  const buyer: Partial<Buyer> = {
    companyName: csvData.bname || '',
    contactName: csvData.bname || '', // Using bname as contact name
    email: csvData.bemail || '',
    phone: csvData.bphone1 || csvData.bphone2 || '',
    address: csvData.bstreet || csvData.buyer_street || '',
    city: csvData.bcity || csvData.buyer_city || '',
    state: csvData.bstate || csvData.buyer_state || '',
    zipCode: csvData.bzip || csvData.buyer_zip || '',
    notes: csvData.notes || csvData.bnotes || csvData.property_notes || '',
  };

  // Map buyer type with intelligent parsing
  if (csvData.btype) {
    const btype = csvData.btype.toLowerCase();
    if (btype.includes('individual') || btype.includes('person')) {
      buyer.buyerType = 'individual';
    } else if (btype.includes('company') || btype.includes('corp') || btype.includes('llc')) {
      buyer.buyerType = 'company';
    } else if (btype.includes('investor')) {
      buyer.buyerType = 'investor';
    } else {
      buyer.buyerType = 'individual'; // Default
    }
  }

  // Map investment range from goals
  if (csvData.investment_goals) {
    const goals = csvData.investment_goals.toLowerCase();
    if (goals.includes('0-50') || goals.includes('50k')) {
      buyer.investmentRange = '0-50k';
    } else if (goals.includes('50-100') || goals.includes('100k')) {
      buyer.investmentRange = '50k-100k';
    } else if (goals.includes('100-250') || goals.includes('250k')) {
      buyer.investmentRange = '100k-250k';
    } else if (goals.includes('250-500') || goals.includes('500k')) {
      buyer.investmentRange = '250k-500k';
    } else if (goals.includes('500+') || goals.includes('500k+')) {
      buyer.investmentRange = '500k+';
    } else {
      buyer.investmentRange = '100k-250k'; // Default
    }
  }

  // Map property types from tags
  const propertyTypes: string[] = [];
  if (csvData.btag1) propertyTypes.push(csvData.btag1);
  if (csvData.btag2) propertyTypes.push(csvData.btag2);
  if (csvData.btag3) propertyTypes.push(csvData.btag3);
  
  // Intelligent property type mapping
  const allTags = [csvData.btag1, csvData.btag2, csvData.btag3, csvData.property_notes].join(' ').toLowerCase();
  if (allTags.includes('single') || allTags.includes('family')) {
    propertyTypes.push('single_family');
  }
  if (allTags.includes('multi') || allTags.includes('duplex') || allTags.includes('triplex')) {
    propertyTypes.push('multi_family');
  }
  if (allTags.includes('commercial') || allTags.includes('office') || allTags.includes('retail')) {
    propertyTypes.push('commercial');
  }
  if (allTags.includes('land') || allTags.includes('lot') || allTags.includes('acre')) {
    propertyTypes.push('land');
  }

  buyer.preferredPropertyTypes = propertyTypes.length > 0 ? propertyTypes : ['single_family'];

  return buyer;
}
```

## Validation

### Required Fields

- **Email** - Must be a valid email format
- **Company/Contact Name** - At least one name field required
- **Phone** - At least one phone number required

### Validation Rules

```typescript
function validateBuyer(buyer: Partial<Buyer>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!buyer.email || !buyer.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!buyer.companyName && !buyer.contactName) {
    errors.push('Company name or contact name is required');
  }

  if (!buyer.phone) {
    errors.push('Phone number is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### Warning Validations

- Missing address information
- Invalid email format
- Incomplete phone numbers
- Missing location data

## Import Options

### Configuration Options

1. **Skip Duplicates** (default: true)
   - Prevents duplicate buyers based on email address
   - Skips rows with existing email addresses

2. **Update Existing** (default: false)
   - Updates existing buyers instead of skipping
   - Preserves original buyer ID and timestamps

3. **Default Status** (default: true)
   - Sets imported buyers as active by default
   - Can be overridden by CSV status field

## Error Handling

### Import Errors

- **Validation Errors** - Invalid data format or missing required fields
- **Processing Errors** - File parsing or database operation failures
- **Duplicate Handling** - Configurable duplicate resolution

### Error Reporting

```typescript
interface ImportResponse {
  success: boolean;
  message: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors?: string[];
}
```

## Usage

### Frontend Integration

```typescript
import { BuyerImport } from '../../components/buyers';

// In your component
<BuyerImport onImportComplete={fetchBuyers} />
```

### API Usage

```typescript
// Import buyers from CSV
const formData = new FormData();
formData.append('file', csvFile);
formData.append('skipDuplicates', 'true');
formData.append('updateExisting', 'false');
formData.append('defaultStatus', 'true');

const response = await fetch('/api/buyers/import-csv', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

### Template Download

```typescript
// Download template
const response = await fetch('/api/buyers/template');
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'buyer_import_template.csv';
a.click();
```

## CSV Template Format

### Sample CSV Structure

```csv
buyerid,csvid,status,bname,bstreet,bcity,bstate,bzip,bssn,bphone1,bphone2,bemail,bpaypalemail,bownershiptype,notes,phone_key,btype,btag1,btag2,btag3,lsource,datecr,bnotes,useridcr,audited,buyer_street,buyer_city,buyer_zip,buyer_state,bneighborhood,investment_goals,property_notes,bcounties,archived,offer_accepted,terminated_reason,terminated_user,terminated_date,sent_comm
,1,active,John Doe,123 Main St,Chicago,IL,60601,,555-123-4567,,john.doe@email.com,,individual,First time buyer,,,,individual,single_family,,,import,2024-01-01,Looking for single family homes,user1,false,123 Main St,Chicago,60601,IL,Downtown,100k-250k,Prefers turnkey properties,Cook County,false,false,,,,
```

### Required Fields

- `bname` - Buyer/Company name
- `bemail` - Email address
- `bphone1` - Primary phone number
- `btype` - Buyer type (individual/company/investor)

### Optional Fields

- `bstreet`, `bcity`, `bstate`, `bzip` - Address information
- `investment_goals` - Investment range
- `btag1`, `btag2`, `btag3` - Property type preferences
- `notes`, `bnotes`, `property_notes` - Additional notes

## Security Considerations

1. **File Size Limits** - Maximum 10MB file size
2. **File Type Validation** - Only CSV files accepted
3. **Input Sanitization** - All data sanitized before processing
4. **Error Handling** - Secure error messages without data exposure
5. **File Cleanup** - Temporary files removed after processing

## Performance Considerations

1. **Batch Processing** - Large files processed in batches
2. **Memory Management** - Stream-based CSV parsing
3. **Progress Tracking** - Real-time import progress updates
4. **Error Recovery** - Continues processing despite individual row errors

## Testing

### Unit Tests

- Field mapping logic
- Validation rules
- Error handling
- CSV parsing

### Integration Tests

- End-to-end import workflow
- API endpoint testing
- File upload handling
- Database operations

### Manual Testing

- Template download
- File validation
- Import with various data scenarios
- Error handling scenarios

## Future Enhancements

1. **Excel Support** - Add support for .xlsx and .xls files
2. **Advanced Field Mapping** - Custom field mapping interface
3. **Bulk Operations** - Bulk update and delete operations
4. **Import Scheduling** - Scheduled import jobs
5. **Data Transformation** - Advanced data transformation rules
6. **Audit Trail** - Import history and audit logging
7. **Notification System** - Email notifications for import completion
8. **Data Validation Rules** - Custom validation rule configuration
