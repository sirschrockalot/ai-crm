# Lead Import/Export Integration

This document explains how to use the integrated lead import/export functionality that connects the frontend to the backend lead-import-service.

## Overview

The integration provides:
- **File Upload & Validation**: Upload CSV/Excel files with real-time validation
- **Import Options**: Configure how leads are imported (update existing, skip duplicates, etc.)
- **Progress Tracking**: Real-time progress updates during import/export operations
- **Export Functionality**: Export leads in multiple formats (CSV, Excel, JSON)
- **Template Downloads**: Download import templates with sample data

## Architecture

```
Frontend Components → useLeads Hook → leadService → leadImportExportService → Backend API
```

### Components
- `LeadImportExport`: Main import/export modal component
- `useLeads`: Hook providing import/export functionality
- `leadService`: Service layer for lead operations
- `leadImportExportService`: Dedicated service for import/export operations

### Repository Structure
The lead-import-service is a **separate microservice repository** located at the workspace level:
```
workspace/
├── ai_crm/                           ← Frontend application
│   ├── src/frontend/                 ← Frontend source code
│   ├── docker-compose.lead-import.yml ← Service orchestration
│   └── scripts/start-lead-import.sh  ← Service startup script
└── lead-import-service-repo/         ← Backend microservice (separate repo)
    ├── src/                          ← Service source code
    ├── Dockerfile                    ← Service containerization
    └── package.json                  ← Service dependencies
```

## Setup

### 1. Environment Configuration

Add the lead-import-service URL to your environment file:

```bash
# .env.development
NEXT_PUBLIC_LEAD_IMPORT_SERVICE_URL=http://localhost:3003
```

### 2. Start the Backend Service

Use the provided script to start the lead-import-service:

```bash
./scripts/start-lead-import.sh
```

This will start:
- Lead Import Service on port 3003 (from external repository)
- MongoDB on port 27017

**Note**: The script expects the `lead-import-service-repo` to be located at the same workspace level as the `ai_crm` project.

### 3. Verify Service is Running

Check that the service is accessible:
```bash
curl http://localhost:3003/health
```

## Usage

### Importing Leads

1. **Open Import Modal**: Use the `LeadImportExport` component
2. **Select File**: Choose a CSV or Excel file (max 10MB)
3. **Configure Options**:
   - Update existing leads
   - Skip duplicates
   - Default status/priority/source
   - Custom field mapping
4. **Start Import**: The service will process the file and show progress
5. **Monitor Progress**: Real-time updates on import status
6. **Review Results**: See imported count and any errors

### Exporting Leads

1. **Configure Export**: Choose format (CSV, Excel, JSON)
2. **Apply Filters**: Filter leads before export
3. **Start Export**: Service generates the file
4. **Download**: File is automatically downloaded when ready

### File Validation

Before importing, files are automatically validated:
- File format verification
- Data structure validation
- Error reporting with row-level details
- Sample data preview

## API Endpoints

The backend service provides these endpoints:

- `POST /leads/import-export/import` - Start import process
- `GET /leads/import-export/import/:id/progress` - Get import progress
- `POST /leads/import-export/validate` - Validate file structure
- `GET /leads/import-export/template` - Download import template
- `POST /leads/import-export/export` - Start export process
- `GET /leads/import-export/export/:id/status` - Get export status

## File Formats

### Supported Import Formats
- **CSV**: Comma-separated values
- **Excel**: .xlsx and .xls files

### Supported Export Formats
- **CSV**: Comma-separated values
- **Excel**: .xlsx format
- **JSON**: Structured data format

### Required Fields
- `name` (required)
- `phone` (required)
- `email` (optional)
- `address` (optional)
- `city` (optional)
- `state` (optional)
- `zip` (optional)
- `property_type` (optional)
- `estimated_value` (optional)

## Error Handling

The integration provides comprehensive error handling:

- **File Validation Errors**: Row-level error reporting
- **Import Errors**: Detailed error messages for failed rows
- **Network Errors**: Connection and timeout handling
- **Progress Tracking**: Real-time status updates

## Configuration Options

### Import Options
```typescript
interface ImportOptions {
  updateExisting?: boolean;      // Update existing leads
  skipDuplicates?: boolean;      // Skip duplicate leads
  batchSize?: number;            // Processing batch size
  defaultSource?: string;        // Default lead source
  defaultStatus?: string;        // Default lead status
  defaultPriority?: string;      // Default priority
  defaultTags?: string[];        // Default tags
  fieldMapping?: FieldMapping[]; // Custom field mapping
}
```

### Export Options
```typescript
interface ExportRequest {
  filters: {
    status?: string[];
    priority?: string[];
    source?: string[];
    // ... more filter options
  };
  options: {
    format: 'csv' | 'xlsx' | 'json';
    includeHeaders?: boolean;
    // ... more export options
  };
}
```

## Troubleshooting

### Common Issues

1. **Service Not Starting**
   - Check Docker is running
   - Verify ports 3003 and 27017 are available
   - Ensure `lead-import-service-repo` exists at workspace level
   - Check service logs: `docker-compose -f docker-compose.lead-import.yml logs`

2. **Import Failures**
   - Verify file format (CSV/Excel)
   - Check file size (max 10MB)
   - Review validation errors
   - Ensure required fields are present

3. **Export Issues**
   - Check export format selection
   - Verify filters are valid
   - Check browser download settings

4. **Authentication Errors**
   - Verify JWT token is valid
   - Check CORS configuration
   - Ensure service is accessible

### Debug Mode

Enable debug logging in the frontend:
```bash
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

## Development

### Repository Management

- **Frontend Changes**: Make changes in the `ai_crm` repository
- **Backend Changes**: Make changes in the `lead-import-service-repo` repository
- **Service Updates**: Update the service in its own repository, then rebuild containers

### Adding New Features

1. **Backend**: Extend the NestJS service in `lead-import-service-repo`
2. **Service Layer**: Update `leadImportExportService` in `ai_crm`
3. **Hook**: Add methods to `useLeads` in `ai_crm`
4. **Component**: Update UI components in `ai_crm`

### Testing

Test the integration:
```bash
# Start services
./scripts/start-lead-import.sh

# Test import
curl -X POST http://localhost:3003/leads/import-export/validate \
  -F "file=@sample-leads.csv"

# Test export
curl -X POST http://localhost:3003/leads/import-export/export \
  -H "Content-Type: application/json" \
  -d '{"filters":{},"options":{"format":"csv"}}'
```

## Performance Considerations

- **Batch Processing**: Large imports are processed in configurable batches
- **Progress Updates**: Real-time progress tracking with configurable intervals
- **File Size Limits**: 10MB maximum file size for imports
- **Memory Management**: Efficient processing of large datasets

## Security

- **File Validation**: Strict file type and size validation
- **Authentication**: JWT-based authentication required
- **Input Sanitization**: All input data is validated and sanitized
- **CORS**: Configurable cross-origin resource sharing
