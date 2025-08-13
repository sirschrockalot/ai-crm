# Lead Import/Export Service

A microservice for handling lead import/export operations in the Presidential Digs CRM system. This service provides robust file processing, validation, and database operations for bulk lead management.

## Features

- **File Processing**: Support for CSV and Excel (.xlsx, .xls) files
- **Data Validation**: Comprehensive validation with detailed error reporting
- **Batch Processing**: Efficient handling of large datasets with configurable batch sizes
- **Duplicate Detection**: Smart duplicate handling with update/merge options
- **Field Mapping**: Automatic and custom field mapping from CSV columns to database fields
- **Progress Tracking**: Real-time import progress monitoring
- **Template Generation**: Downloadable import templates with sample data
- **Error Handling**: Detailed error reporting with row-level feedback

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   File Upload   │───▶│  File Processor  │───▶│  Lead Import    │
│   (Controller)  │    │   Service        │    │   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Validation     │    │   MongoDB       │
                       │   Results        │    │   Database      │
                       └──────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone and navigate to the service directory:**
   ```bash
   cd src/lead-import-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.development .env
   # Edit .env with your MongoDB connection details
   ```

4. **Start the service:**
   ```bash
   npm run start:dev
   ```

### Docker Setup

1. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f lead-import-service
   ```

3. **Stop the service:**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Import Operations

#### POST `/leads/import-export/import`
Import leads from a CSV or Excel file.

**Request:**
- `file`: CSV/Excel file (multipart/form-data)
- `updateExisting`: Boolean to update existing leads
- `skipDuplicates`: Boolean to skip duplicate leads
- `batchSize`: Number for batch processing size
- `defaultSource`: String for default lead source
- `defaultStatus`: String for default lead status
- `defaultPriority`: String for default lead priority
- `defaultTags`: Array of default tags
- `fieldMapping`: JSON string of custom field mapping

**Response:**
```json
{
  "importId": "import_1234567890_abc123",
  "totalRecords": 100,
  "successfulRows": 0,
  "failedRows": 0,
  "status": "processing",
  "errors": [],
  "startedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/leads/import-export/import/:importId/progress`
Get the progress of an import operation.

#### POST `/leads/import-export/validate`
Validate a file without importing (for preview).

#### GET `/leads/import-export/template`
Download import template in CSV or Excel format.

### Export Operations

*Note: Export functionality is planned for future releases.*

## File Format Support

### CSV Files
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Headers**: First row should contain column names
- **Size Limit**: 10MB

### Excel Files
- **Formats**: .xlsx, .xls
- **Sheets**: First sheet is used for import
- **Headers**: First row should contain column names
- **Size Limit**: 10MB

## Field Mapping

### Automatic Mapping
The service automatically maps common column names to database fields:

| CSV Column | Database Field |
|------------|----------------|
| `name`, `full_name`, `first_name`, `last_name` | `name` |
| `phone`, `phone_number`, `mobile` | `phone` |
| `email`, `email_address` | `email` |
| `address` | `address.full_address` |
| `street` | `address.street` |
| `city` | `address.city` |
| `state` | `address.state` |
| `zip`, `zip_code` | `address.zip_code` |
| `county` | `address.county` |
| `property_type` | `property_details.type` |
| `bedrooms` | `property_details.bedrooms` |
| `bathrooms` | `property_details.bathrooms` |
| `square_feet` | `property_details.square_feet` |
| `estimated_value`, `value` | `estimated_value` |
| `asking_price`, `price` | `asking_price` |
| `source`, `lead_source` | `source` |
| `status` | `status` |
| `priority` | `priority` |
| `tags` | `tags` |
| `notes`, `description` | `notes` |

### Custom Field Mapping
You can provide custom field mapping using the `fieldMapping` parameter:

```json
[
  {
    "csvColumn": "customer_name",
    "dbField": "name"
  },
  {
    "csvColumn": "phone_num",
    "dbField": "phone"
  }
]
```

## Data Validation

### Required Fields
- `name`: Lead name (string)
- `phone`: Phone number (string, validated format)

### Optional Fields
- `email`: Email address (validated format)
- `address`: Address information (nested object)
- `property_details`: Property information (nested object)
- `estimated_value`: Estimated property value (number)
- `asking_price`: Asking price (number)
- `source`: Lead source (string)
- `status`: Lead status (enum: new, contacted, under_contract, closed, lost)
- `priority`: Lead priority (enum: low, medium, high, urgent)
- `tags`: Lead tags (array of strings)
- `notes`: Additional notes (string)

### Validation Rules
- **Phone Numbers**: Must be valid international format
- **Email Addresses**: Must be valid email format
- **Numeric Fields**: Must be valid numbers
- **Status Values**: Must be one of the predefined values
- **Priority Values**: Must be one of the predefined values

## Error Handling

### Validation Errors
- **Required Field Missing**: Field is required but not provided
- **Invalid Format**: Data format doesn't match expected type
- **Invalid Value**: Value is not in the allowed set

### Processing Errors
- **Database Errors**: Issues with database operations
- **File Format Errors**: Problems with file parsing
- **System Errors**: Unexpected system failures

### Error Response Format
```json
{
  "errors": [
    {
      "row": 5,
      "field": "phone",
      "value": "invalid-phone",
      "message": "Invalid phone number format"
    }
  ]
}
```

## Performance

### Batch Processing
- **Default Batch Size**: 100 records
- **Configurable**: Can be adjusted via API parameters
- **Memory Efficient**: Processes large files without memory issues

### Database Operations
- **Bulk Operations**: Uses MongoDB bulkWrite for efficiency
- **Indexed Queries**: Optimized database queries with proper indexing
- **Connection Pooling**: Efficient database connection management

## Monitoring

### Health Checks
- **Endpoint**: `/health` (planned)
- **Database**: Connection status
- **Service**: Overall service health

### Logging
- **Level**: Configurable via environment variables
- **Format**: Structured JSON logging
- **Output**: Console and file logging (configurable)

## Security

### File Upload Security
- **File Type Validation**: Only allows CSV and Excel files
- **Size Limits**: Maximum 10MB file size
- **Content Validation**: Validates file content before processing

### Data Security
- **Tenant Isolation**: All data is scoped to tenant ID
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Secure error messages without information leakage

## Development

### Project Structure
```
src/
├── lead-import/
│   ├── dto/                 # Data Transfer Objects
│   ├── schemas/             # Database schemas
│   ├── services/            # Business logic services
│   ├── lead-import.module.ts # Module configuration
│   └── lead-import.controller.ts # HTTP endpoints
├── database/
│   └── database.module.ts   # Database configuration
├── app.module.ts            # Main application module
└── main.ts                  # Application entry point
```

### Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Building
```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3005` | Service port |
| `MONGODB_URI` | `mongodb://localhost:27017/presidential_digs_crm` | MongoDB connection string |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |
| `MAX_FILE_SIZE` | `10485760` | Maximum file size in bytes |
| `DEFAULT_BATCH_SIZE` | `100` | Default batch size for processing |

### MongoDB Configuration
- **Database**: `presidential_digs_crm`
- **Collections**: `leads`
- **Indexes**: Optimized for tenant-based queries and text search

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size (max 10MB)
   - Verify file format (CSV, XLSX, XLS)
   - Check file encoding (UTF-8 for CSV)

2. **Import Stuck in Processing**
   - Check MongoDB connection
   - Verify tenant ID and user ID
   - Check service logs for errors

3. **Validation Errors**
   - Review required fields
   - Check data format requirements
   - Verify field mapping

4. **Database Connection Issues**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

### Logs
```bash
# View service logs
docker-compose logs -f lead-import-service

# View MongoDB logs
docker-compose logs -f mongodb
```

## Contributing

1. Follow the existing code style
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review service logs
3. Check API documentation at `/api` endpoint
4. Contact the development team
