# API Documentation

API specifications and endpoints for DealCycle CRM microservices.

## Base URLs

- **Frontend API**: `http://localhost:3000/api`
- **Auth Service**: `http://localhost:3001/api/auth`
- **Leads Service**: `http://localhost:3008/api/v1/leads`
- **Transactions Service**: `http://localhost:3003/api/v1`
- **User Management Service**: `http://localhost:3005/api/v1`
- **Timesheet Service**: `http://localhost:3007/api/time-entries`

## Authentication

All API endpoints (except health checks) require JWT authentication.

```bash
# Include in headers
Authorization: Bearer <token>
```

## Health Endpoints

### Frontend
```
GET /api/health
```

### Auth Service
```
GET /health
```

### Leads Service
```
GET /health
```

## Authentication API

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

### Register
```
POST /api/auth/register
Body: { email, password, firstName, lastName }
Response: { token, user }
```

### Verify Token
```
GET /api/auth/verify
Headers: Authorization: Bearer <token>
Response: { user }
```

## Leads API

### Get Leads
```
GET /api/v1/leads
Query: ?status=NEW&page=1&limit=20
Response: { leads[], total, page, limit }
```

### Get Lead
```
GET /api/v1/leads/:id
Response: { lead }
```

### Create Lead
```
POST /api/v1/leads
Body: { firstName, lastName, email, phone, ... }
Response: { lead }
```

### Update Lead
```
PATCH /api/v1/leads/:id
Body: { status, assignedTo, ... }
Response: { lead }
```

### Import Leads
```
POST /api/v1/leads/import
Body: { rows[], defaultSource }
Response: { createdCount, duplicateCount, errors[] }
```

### Lead Events
```
GET /api/v1/leads/:id/events
Response: { events[] }

POST /api/v1/leads/:id/notes
Body: { note }
Response: { lead }

PATCH /api/v1/leads/:id/status
Body: { status }
Response: { lead }

PATCH /api/v1/leads/:id/assign
Body: { assignedTo }
Response: { lead }
```

## Tasks API

### Get Tasks
```
GET /api/v1/tasks
Query: ?filter=overdue&leadId=...
Response: { tasks[] }
```

### Create Task
```
POST /api/v1/tasks/lead/:leadId
Body: { title, dueAt }
Response: { task }
```

### Complete Task
```
PATCH /api/v1/tasks/:id/complete
Response: { task }
```

## Reports API

### Pipeline Report
```
GET /api/v1/reports/pipeline
Query: ?from=2024-01-01&to=2024-12-31
Response: { countsByStatus, conversions }
```

## Integrations API

### Underwriting Review
```
POST /api/v1/integrations/underwriting/review
Body: { leadId, estimatedValue, ... }
Response: { success, data?, error? }
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Additional Resources

- [Swagger Documentation](http://localhost:3008/api/docs) - Interactive API docs
- [Development Guide](./DEVELOPMENT.md)
- [Architecture Guide](./ARCHITECTURE.md)
