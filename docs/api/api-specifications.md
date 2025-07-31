# 🔌 API Specifications - Presidential Digs CRM

## 📋 API Overview

**Base URL:** `https://api.presidentialdigs.com/v1`
**Authentication:** Bearer JWT tokens
**Content Type:** `application/json`
**Rate Limiting:** 1000 requests per hour per user
**Versioning:** URL-based versioning (`/v1/`)

---

## 🔐 Authentication Endpoints

### **Google OAuth Flow**

```yaml
POST /auth/google
Description: Initiate Google OAuth authentication
Request Body:
  code: string (Google authorization code)
  redirect_uri: string
Response:
  200:
    description: Authentication successful
    content:
      application/json:
        schema:
          type: object
          properties:
            access_token: string
            refresh_token: string
            user: User object
  401:
    description: Authentication failed
```

### **Token Refresh**

```yaml
POST /auth/refresh
Description: Refresh JWT access token
Request Headers:
  Authorization: Bearer {refresh_token}
Response:
  200:
    description: Token refreshed successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            access_token: string
            refresh_token: string
  401:
    description: Invalid refresh token
```

### **Logout**

```yaml
POST /auth/logout
Description: Invalidate current session
Request Headers:
  Authorization: Bearer {access_token}
Response:
  200:
    description: Logout successful
  401:
    description: Invalid token
```

---

## 👥 User Management Endpoints

### **Get Current User**

```yaml
GET /users/me
Description: Get current user profile
Request Headers:
  Authorization: Bearer {access_token}
Response:
  200:
    description: User profile retrieved
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
  401:
    description: Unauthorized
```

### **Update User Profile**

```yaml
PUT /users/me
Description: Update current user profile
Request Headers:
  Authorization: Bearer {access_token}
Request Body:
  name: string (optional)
  phone: string (optional)
  preferences: object (optional)
Response:
  200:
    description: Profile updated successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
  400:
    description: Invalid input
  401:
    description: Unauthorized
```

### **Get Team Members**

```yaml
GET /users
Description: Get all team members for current tenant
Request Headers:
  Authorization: Bearer {access_token}
Query Parameters:
  role: string (optional) - Filter by role
  is_active: boolean (optional) - Filter by active status
Response:
  200:
    description: Team members retrieved
    content:
      application/json:
        schema:
          type: array
          items:
            $ref: '#/components/schemas/User'
  401:
    description: Unauthorized
```

---

## 📞 Lead Management Endpoints

### **Get Leads**

```yaml
GET /leads
Description: Get all leads for current tenant
Request Headers:
  Authorization: Bearer {access_token}
Query Parameters:
  status: string (optional) - Filter by status
  assigned_to: string (optional) - Filter by assigned user
  tags: string[] (optional) - Filter by tags
  search: string (optional) - Search in name, phone, email
  page: number (optional) - Page number (default: 1)
  limit: number (optional) - Items per page (default: 20)
Response:
  200:
    description: Leads retrieved successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            leads:
              type: array
              items:
                $ref: '#/components/schemas/Lead'
            pagination:
              $ref: '#/components/schemas/Pagination'
  401:
    description: Unauthorized
```

### **Get Lead by ID**

```yaml
GET /leads/{id}
Description: Get specific lead by ID
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Lead ID
Response:
  200:
    description: Lead retrieved successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Lead'
  404:
    description: Lead not found
  401:
    description: Unauthorized
```

### **Create Lead**

```yaml
POST /leads
Description: Create a new lead
Request Headers:
  Authorization: Bearer {access_token}
Request Body:
  name: string (required)
  phone: string (required)
  email: string (optional)
  address: string (optional)
  property_type: string (optional)
  estimated_value: number (optional)
  source: string (optional)
  notes: string (optional)
  tags: string[] (optional)
Response:
  201:
    description: Lead created successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Lead'
  400:
    description: Invalid input
  401:
    description: Unauthorized
```

### **Update Lead**

```yaml
PUT /leads/{id}
Description: Update existing lead
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Lead ID
Request Body:
  name: string (optional)
  phone: string (optional)
  email: string (optional)
  address: string (optional)
  property_type: string (optional)
  estimated_value: number (optional)
  source: string (optional)
  status: string (optional)
  assigned_to: string (optional)
  notes: string (optional)
  tags: string[] (optional)
Response:
  200:
    description: Lead updated successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Lead'
  400:
    description: Invalid input
  404:
    description: Lead not found
  401:
    description: Unauthorized
```

### **Delete Lead**

```yaml
DELETE /leads/{id}
Description: Delete lead by ID
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Lead ID
Response:
  204:
    description: Lead deleted successfully
  404:
    description: Lead not found
  401:
    description: Unauthorized
```

---

## 💼 Buyer Management Endpoints

### **Get Buyers**

```yaml
GET /buyers
Description: Get all buyers for current tenant
Request Headers:
  Authorization: Bearer {access_token}
Query Parameters:
  property_types: string[] (optional) - Filter by property types
  price_range_min: number (optional) - Minimum price range
  price_range_max: number (optional) - Maximum price range
  locations: string[] (optional) - Filter by preferred locations
  is_active: boolean (optional) - Filter by active status
  search: string (optional) - Search in name, company, email
  page: number (optional) - Page number (default: 1)
  limit: number (optional) - Items per page (default: 20)
Response:
  200:
    description: Buyers retrieved successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            buyers:
              type: array
              items:
                $ref: '#/components/schemas/Buyer'
            pagination:
              $ref: '#/components/schemas/Pagination'
  401:
    description: Unauthorized
```

### **Get Buyer by ID**

```yaml
GET /buyers/{id}
Description: Get specific buyer by ID
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Buyer ID
Response:
  200:
    description: Buyer retrieved successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Buyer'
  404:
    description: Buyer not found
  401:
    description: Unauthorized
```

### **Create Buyer**

```yaml
POST /buyers
Description: Create a new buyer
Request Headers:
  Authorization: Bearer {access_token}
Request Body:
  name: string (required)
  phone: string (required)
  email: string (optional)
  company: string (optional)
  property_types: string[] (optional)
  price_range_min: number (optional)
  price_range_max: number (optional)
  preferred_locations: string[] (optional)
  investment_criteria: string (optional)
  notes: string (optional)
Response:
  201:
    description: Buyer created successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Buyer'
  400:
    description: Invalid input
  401:
    description: Unauthorized
```

### **Update Buyer**

```yaml
PUT /buyers/{id}
Description: Update existing buyer
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Buyer ID
Request Body:
  name: string (optional)
  phone: string (optional)
  email: string (optional)
  company: string (optional)
  property_types: string[] (optional)
  price_range_min: number (optional)
  price_range_max: number (optional)
  preferred_locations: string[] (optional)
  investment_criteria: string (optional)
  notes: string (optional)
  is_active: boolean (optional)
Response:
  200:
    description: Buyer updated successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Buyer'
  400:
    description: Invalid input
  404:
    description: Buyer not found
  401:
    description: Unauthorized
```

### **Delete Buyer**

```yaml
DELETE /buyers/{id}
Description: Delete buyer by ID
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Buyer ID
Response:
  204:
    description: Buyer deleted successfully
  404:
    description: Buyer not found
  401:
    description: Unauthorized
```

---

## 📱 Communication Endpoints

### **Get Communications**

```yaml
GET /communications
Description: Get all communications for current tenant
Request Headers:
  Authorization: Bearer {access_token}
Query Parameters:
  type: string (optional) - Filter by type (sms, call, email)
  direction: string (optional) - Filter by direction (inbound, outbound)
  recipient_type: string (optional) - Filter by recipient type (lead, buyer)
  recipient_id: string (optional) - Filter by recipient ID
  status: string (optional) - Filter by status
  page: number (optional) - Page number (default: 1)
  limit: number (optional) - Items per page (default: 20)
Response:
  200:
    description: Communications retrieved successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            communications:
              type: array
              items:
                $ref: '#/components/schemas/Communication'
            pagination:
              $ref: '#/components/schemas/Pagination'
  401:
    description: Unauthorized
```

### **Send SMS**

```yaml
POST /communications/sms
Description: Send SMS message
Request Headers:
  Authorization: Bearer {access_token}
Request Body:
  recipient_type: string (required) - lead or buyer
  recipient_id: string (required) - ID of lead or buyer
  content: string (required) - Message content
  scheduled_at: string (optional) - ISO 8601 timestamp for scheduled sending
Response:
  201:
    description: SMS sent successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Communication'
  400:
    description: Invalid input
  401:
    description: Unauthorized
```

### **Initiate Call**

```yaml
POST /communications/call
Description: Initiate phone call
Request Headers:
  Authorization: Bearer {access_token}
Request Body:
  recipient_type: string (required) - lead or buyer
  recipient_id: string (required) - ID of lead or buyer
  notes: string (optional) - Call notes
Response:
  201:
    description: Call initiated successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Communication'
  400:
    description: Invalid input
  401:
    description: Unauthorized
```

### **Get Communication History**

```yaml
GET /communications/{recipient_type}/{recipient_id}
Description: Get communication history for specific recipient
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  recipient_type: string - lead or buyer
  recipient_id: string - ID of lead or buyer
Query Parameters:
  type: string (optional) - Filter by type
  page: number (optional) - Page number (default: 1)
  limit: number (optional) - Items per page (default: 20)
Response:
  200:
    description: Communication history retrieved
    content:
      application/json:
        schema:
          type: object
          properties:
            communications:
              type: array
              items:
                $ref: '#/components/schemas/Communication'
            pagination:
              $ref: '#/components/schemas/Pagination'
  401:
    description: Unauthorized
```

---

## 🤖 AI Features Endpoints

### **Generate Lead Summary**

```yaml
POST /ai/leads/{id}/summary
Description: Generate AI-powered lead summary
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Lead ID
Response:
  200:
    description: Summary generated successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            summary: string
            key_points: string[]
            suggested_actions: string[]
  404:
    description: Lead not found
  401:
    description: Unauthorized
```

### **Suggest Communication Reply**

```yaml
POST /ai/communications/suggest-reply
Description: Generate AI-powered communication reply suggestions
Request Headers:
  Authorization: Bearer {access_token}
Request Body:
  recipient_type: string (required) - lead or buyer
  recipient_id: string (required) - ID of lead or buyer
  context: string (required) - Previous communication context
  communication_type: string (required) - sms, call, or email
Response:
  200:
    description: Reply suggestions generated
    content:
      application/json:
        schema:
          type: object
          properties:
            suggestions: string[]
            tone: string
            confidence: number
  400:
    description: Invalid input
  401:
    description: Unauthorized
```

### **Auto-Tag Lead**

```yaml
POST /ai/leads/{id}/auto-tag
Description: Automatically tag lead based on content
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Lead ID
Response:
  200:
    description: Tags generated successfully
    content:
      application/json:
        schema:
          type: object
          properties:
            suggested_tags: string[]
            confidence: number
  404:
    description: Lead not found
  401:
    description: Unauthorized
```

### **Match Buyers to Lead**

```yaml
POST /ai/leads/{id}/match-buyers
Description: Find matching buyers for a lead
Request Headers:
  Authorization: Bearer {access_token}
Path Parameters:
  id: string - Lead ID
Response:
  200:
    description: Buyer matches found
    content:
      application/json:
        schema:
          type: object
          properties:
            matches:
              type: array
              items:
                type: object
                properties:
                  buyer_id: string
                  buyer_name: string
                  match_score: number
                  match_reasons: string[]
  404:
    description: Lead not found
  401:
    description: Unauthorized
```

---

## 📊 Analytics Endpoints

### **Get Dashboard Stats**

```yaml
GET /analytics/dashboard
Description: Get dashboard statistics
Request Headers:
  Authorization: Bearer {access_token}
Query Parameters:
  date_range: string (optional) - last_7_days, last_30_days, last_90_days
Response:
  200:
    description: Dashboard stats retrieved
    content:
      application/json:
        schema:
          type: object
          properties:
            total_leads: number
            new_leads: number
            converted_leads: number
            conversion_rate: number
            total_buyers: number
            active_buyers: number
            total_communications: number
            response_rate: number
            revenue_generated: number
            average_deal_size: number
  401:
    description: Unauthorized
```

### **Get Lead Pipeline**

```yaml
GET /analytics/leads/pipeline
Description: Get lead pipeline statistics
Request Headers:
  Authorization: Bearer {access_token}
Query Parameters:
  date_range: string (optional) - last_7_days, last_30_days, last_90_days
Response:
  200:
    description: Pipeline stats retrieved
    content:
      application/json:
        schema:
          type: object
          properties:
            pipeline:
              type: object
              properties:
                new: number
                contacted: number
                under_contract: number
                closed: number
                lost: number
            conversion_rates:
              type: object
              properties:
                new_to_contacted: number
                contacted_to_contract: number
                contract_to_closed: number
  401:
    description: Unauthorized
```

### **Get Team Performance**

```yaml
GET /analytics/team/performance
Description: Get team performance metrics
Request Headers:
  Authorization: Bearer {access_token}
Query Parameters:
  date_range: string (optional) - last_7_days, last_30_days, last_90_days
Response:
  200:
    description: Team performance retrieved
    content:
      application/json:
        schema:
          type: object
          properties:
            team_members:
              type: array
              items:
                type: object
                properties:
                  user_id: string
                  name: string
                  leads_assigned: number
                  leads_converted: number
                  conversion_rate: number
                  communications_sent: number
                  response_rate: number
  401:
    description: Unauthorized
```

---

## 🔧 System Endpoints

### **Health Check**

```yaml
GET /health
Description: System health check
Response:
  200:
    description: System healthy
    content:
      application/json:
        schema:
          type: object
          properties:
            status: string
            timestamp: string
            version: string
            uptime: number
            database: string
            redis: string
```

### **API Documentation**

```yaml
GET /api/docs
Description: Swagger API documentation
Response:
  200:
    description: API documentation
    content:
      text/html:
        schema:
          type: string
```

---

## 📋 Data Models

### **User Schema**

```yaml
User:
  type: object
  properties:
    _id: string
    tenant_id: string
    google_id: string
    email: string
    name: string
    role: string
    permissions: array
      items: string
    is_active: boolean
    last_login: string
    created_at: string
    updated_at: string
  required:
    - _id
    - tenant_id
    - email
    - name
    - role
```

### **Lead Schema**

```yaml
Lead:
  type: object
  properties:
    _id: string
    tenant_id: string
    name: string
    phone: string
    email: string
    address: string
    property_type: string
    estimated_value: number
    source: string
    status: string
    assigned_to: string
    tags: array
      items: string
    notes: string
    communication_count: number
    last_contacted: string
    created_at: string
    updated_at: string
  required:
    - _id
    - tenant_id
    - name
    - phone
```

### **Buyer Schema**

```yaml
Buyer:
  type: object
  properties:
    _id: string
    tenant_id: string
    name: string
    phone: string
    email: string
    company: string
    property_types: array
      items: string
    price_range_min: number
    price_range_max: number
    preferred_locations: array
      items: string
    investment_criteria: string
    notes: string
    total_deals: number
    total_investment: number
    is_active: boolean
    created_at: string
    updated_at: string
  required:
    - _id
    - tenant_id
    - name
    - phone
```

### **Communication Schema**

```yaml
Communication:
  type: object
  properties:
    _id: string
    tenant_id: string
    type: string
    direction: string
    recipient_type: string
    recipient_id: string
    sender_id: string
    content: string
    status: string
    twilio_sid: string
    duration: number
    scheduled_at: string
    sent_at: string
    created_at: string
  required:
    - _id
    - tenant_id
    - type
    - direction
    - recipient_type
    - recipient_id
    - sender_id
```

### **Pagination Schema**

```yaml
Pagination:
  type: object
  properties:
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  required:
    - page
    - limit
    - total
    - total_pages
```

---

## 🔒 Error Responses

### **Standard Error Format**

```yaml
Error:
  type: object
  properties:
    error: string
    message: string
    status_code: number
    timestamp: string
    path: string
    details: object
  required:
    - error
    - message
    - status_code
    - timestamp
```

### **Common Error Codes**

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## 📈 Rate Limiting

### **Rate Limit Headers**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### **Rate Limit Rules**

- **Authentication endpoints:** 10 requests per minute
- **Lead/Buyer endpoints:** 1000 requests per hour
- **Communication endpoints:** 100 requests per minute
- **AI endpoints:** 50 requests per hour
- **Analytics endpoints:** 100 requests per hour

---

## 🔐 Security Headers

All API responses include the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

This API specification provides a comprehensive foundation for the Presidential Digs CRM with proper authentication, authorization, and data validation. All endpoints are designed with multi-tenant architecture in mind and include proper error handling and rate limiting. 