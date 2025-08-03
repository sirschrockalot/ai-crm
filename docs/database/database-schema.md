# 🗄️ Database Schema - DealCycle CRM

## 📋 Database Overview

**Database:** MongoDB
**Multi-Tenant Strategy:** Tenant ID in every collection
**Indexing Strategy:** Compound indexes for performance
**Backup Strategy:** Daily automated backups
**Versioning:** Schema version tracking
**AI Integration:** Enhanced schemas for AI-powered features
**Automation Support:** Workflow and automation tracking

---

## 🏗️ Collection Structure

### **Tenants Collection**

```javascript
{
  _id: ObjectId,
  name: String,                    // Company name
  domain: String,                  // Custom domain (optional)
  subdomain: String,               // Subdomain identifier
  subscription_plan: String,       // basic, professional, enterprise
  subscription_status: String,     // active, suspended, cancelled
  subscription_start_date: Date,
  subscription_end_date: Date,
  max_users: Number,
  max_leads: Number,
  features_enabled: [String],      // Array of enabled features
  settings: {
    sms_enabled: Boolean,
    call_enabled: Boolean,
    llm_features_enabled: Boolean,
    custom_branding: Boolean,
    auto_tagging: Boolean,
    ai_summaries: Boolean,
    automation_enabled: Boolean,
    advanced_analytics: Boolean,
    ai_lead_scoring: Boolean,
    ai_buyer_matching: Boolean
  },
  billing_info: {
    contact_name: String,
    contact_email: String,
    billing_address: String,
    payment_method: String
  },
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Domain lookup
{ domain: 1 }

// Subdomain lookup
{ subdomain: 1 }

// Subscription status
{ subscription_status: 1, subscription_end_date: 1 }
```

---

### **Users Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  google_id: String,              // Google OAuth ID
  email: String,
  name: String,
  first_name: String,
  last_name: String,
  phone: String,
  avatar_url: String,
  role: String,                   // admin, acquisition_rep, disposition_manager
  permissions: [String],          // Array of specific permissions
  is_active: Boolean,
  is_verified: Boolean,
  last_login: Date,
  login_count: Number,
  preferences: {
    theme: String,                // light, dark, auto
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    dashboard_layout: Object,
    default_view: String          // leads, buyers, dashboard
  },
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + email (unique per tenant)
{ tenant_id: 1, email: 1 }

// Google ID lookup
{ google_id: 1 }

// Tenant + role
{ tenant_id: 1, role: 1 }

// Active users
{ tenant_id: 1, is_active: 1 }

// Last login for analytics
{ tenant_id: 1, last_login: -1 }
```

---

### **Leads Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  name: String,
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    county: String,
    full_address: String
  },
  property_details: {
    type: String,                 // single_family, multi_family, commercial, land
    bedrooms: Number,
    bathrooms: Number,
    square_feet: Number,
    lot_size: Number,
    year_built: Number
  },
  estimated_value: Number,
  asking_price: Number,
  source: String,                 // website, referral, cold_call, etc.
  status: String,                 // new, contacted, under_contract, closed, lost
  priority: String,               // low, medium, high, urgent
  assigned_to: ObjectId,          // Reference to users collection
  tags: [String],
  notes: String,
  communication_count: Number,
  last_contacted: Date,
  next_follow_up: Date,
  custom_fields: Object,          // Flexible custom fields
  ai_summary: String,             // AI-generated summary
  ai_tags: [String],              // AI-generated tags
  lead_score: Number,             // AI-powered lead score (0-100)
  qualification_probability: Number, // AI probability of qualification
  source: String,                 // Lead source (website, referral, etc.)
  automation_data: {
    workflow_id: ObjectId,        // Reference to active workflow
    last_automation_step: String, // Last executed automation step
    automation_history: [{
      step: String,
      executed_at: Date,
      result: String
    }]
  },
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + status
{ tenant_id: 1, status: 1 }

// Tenant + assigned user
{ tenant_id: 1, assigned_to: 1 }

// Tenant + phone (for duplicate detection)
{ tenant_id: 1, phone: 1 }

// Tenant + email
{ tenant_id: 1, email: 1 }

// Tenant + source
{ tenant_id: 1, source: 1 }

// Tenant + tags
{ tenant_id: 1, tags: 1 }

// Tenant + last contacted
{ tenant_id: 1, last_contacted: -1 }

// Tenant + next follow up
{ tenant_id: 1, next_follow_up: 1 }

// Full text search
{ tenant_id: 1, name: "text", phone: "text", email: "text" }
```

---

### **Buyers Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  name: String,
  phone: String,
  email: String,
  company: String,
  website: String,
  property_types: [String],       // Array of property types interested in
  price_range: {
    min: Number,
    max: Number
  },
  preferred_locations: [String],  // Array of preferred locations
  investment_criteria: String,
  funding_type: String,           // cash, conventional, hard_money, private_money
  credit_score: String,           // excellent, good, fair, poor
  experience_level: String,       // beginner, intermediate, advanced
  notes: String,
  total_deals: Number,
  total_investment: Number,
  average_deal_size: Number,
  performance_metrics: {
    conversion_rate: Number,
    average_response_time: Number,
    deal_velocity: Number,
    roi_percentage: Number
  },
  is_active: Boolean,
  is_verified: Boolean,
  last_contacted: Date,
  communication_count: Number,
  custom_fields: Object,          // Flexible custom fields
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + active status
{ tenant_id: 1, is_active: 1 }

// Tenant + phone
{ tenant_id: 1, phone: 1 }

// Tenant + email
{ tenant_id: 1, email: 1 }

// Tenant + property types
{ tenant_id: 1, property_types: 1 }

// Tenant + price range
{ tenant_id: 1, "price_range.min": 1, "price_range.max": 1 }

// Tenant + locations
{ tenant_id: 1, preferred_locations: 1 }

// Tenant + last contacted
{ tenant_id: 1, last_contacted: -1 }

// Full text search
{ tenant_id: 1, name: "text", company: "text", email: "text" }
```

---

### **Communications Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  type: String,                   // sms, call, email
  direction: String,              // inbound, outbound
  recipient_type: String,         // lead, buyer
  recipient_id: ObjectId,         // Reference to leads or buyers collection
  sender_id: ObjectId,            // Reference to users collection
  content: String,
  status: String,                 // sent, delivered, failed, answered, missed, scheduled
  twilio_sid: String,             // Twilio message/call SID
  twilio_status: String,          // Twilio status updates
  duration: Number,               // Call duration in seconds
  scheduled_at: Date,
  sent_at: Date,
  delivered_at: Date,
  read_at: Date,
  metadata: {
    device_info: String,
    location: String,
    cost: Number
  },
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + recipient
{ tenant_id: 1, recipient_type: 1, recipient_id: 1 }

// Tenant + sender
{ tenant_id: 1, sender_id: 1 }

// Tenant + type
{ tenant_id: 1, type: 1 }

// Tenant + status
{ tenant_id: 1, status: 1 }

// Tenant + scheduled
{ tenant_id: 1, scheduled_at: 1 }

// Tenant + sent date
{ tenant_id: 1, sent_at: -1 }

// Twilio SID lookup
{ twilio_sid: 1 }
```

---

### **Deals Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  lead_id: ObjectId,              // Reference to leads collection
  buyer_id: ObjectId,             // Reference to buyers collection
  assigned_to: ObjectId,          // Reference to users collection
  status: String,                 // pending, under_contract, closed, cancelled
  deal_type: String,              // wholesale, flip, buy_and_hold
  property_address: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    county: String,
    full_address: String
  },
  property_details: {
    type: String,
    bedrooms: Number,
    bathrooms: Number,
    square_feet: Number,
    lot_size: Number,
    year_built: Number
  },
  financials: {
    purchase_price: Number,
    sale_price: Number,
    rehab_cost: Number,
    closing_costs: Number,
    holding_costs: Number,
    profit: Number,
    roi: Number
  },
  timeline: {
    contract_date: Date,
    closing_date: Date,
    rehab_start_date: Date,
    rehab_end_date: Date,
    listing_date: Date,
    sale_date: Date
  },
  notes: String,
  documents: [{
    name: String,
    url: String,
    type: String,
    uploaded_at: Date
  }],
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + status
{ tenant_id: 1, status: 1 }

// Tenant + lead
{ tenant_id: 1, lead_id: 1 }

// Tenant + buyer
{ tenant_id: 1, buyer_id: 1 }

// Tenant + assigned user
{ tenant_id: 1, assigned_to: 1 }

// Tenant + deal type
{ tenant_id: 1, deal_type: 1 }

// Tenant + closing date
{ tenant_id: 1, "timeline.closing_date": 1 }
```

---

### **Activities Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  user_id: ObjectId,              // Reference to users collection
  type: String,                   // lead_created, lead_updated, communication_sent, etc.
  entity_type: String,            // lead, buyer, deal, communication
  entity_id: ObjectId,            // Reference to the related entity
  description: String,
  metadata: Object,               // Flexible metadata for different activity types
  ip_address: String,
  user_agent: String,
  created_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + user
{ tenant_id: 1, user_id: 1 }

// Tenant + type
{ tenant_id: 1, type: 1 }

// Tenant + entity
{ tenant_id: 1, entity_type: 1, entity_id: 1 }

// Tenant + date (for activity feeds)
{ tenant_id: 1, created_at: -1 }
```

---

### **Tags Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  name: String,
  color: String,                  // Hex color code
  description: String,
  category: String,               // lead_tags, buyer_tags, deal_tags
  is_system: Boolean,             // System-generated tags
  usage_count: Number,
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + name (unique per tenant)
{ tenant_id: 1, name: 1 }

// Tenant + category
{ tenant_id: 1, category: 1 }

// Tenant + usage count
{ tenant_id: 1, usage_count: -1 }
```

---

### **Templates Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  name: String,
  type: String,                   // sms, email, call_script
  category: String,               // follow_up, introduction, offer, etc.
  content: String,
  variables: [String],            // Array of available variables
  is_default: Boolean,
  is_active: Boolean,
  created_by: ObjectId,           // Reference to users collection
  usage_count: Number,
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + type
{ tenant_id: 1, type: 1 }

// Tenant + category
{ tenant_id: 1, category: 1 }

// Tenant + active status
{ tenant_id: 1, is_active: 1 }

// Tenant + usage count
{ tenant_id: 1, usage_count: -1 }
```

---

### **Workflows Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  name: String,
  description: String,
  status: String,                 // active, inactive, draft
  trigger: {
    type: String,                 // lead_created, status_changed, communication_sent, scheduled
    conditions: Object,
    schedule: {
      frequency: String,          // daily, weekly, monthly
      time: String,
      timezone: String
    }
  },
  steps: [{
    id: String,
    type: String,                 // action, condition, delay
    name: String,
    config: Object,
    order: Number,
    next_step_id: String,
    condition_branch: {
      true_step_id: String,
      false_step_id: String
    }
  }],
  statistics: {
    total_executions: Number,
    successful_executions: Number,
    failed_executions: Number,
    last_executed: Date,
    average_execution_time: Number
  },
  created_by: ObjectId,           // Reference to users collection
  tags: [String],
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + status
{ tenant_id: 1, status: 1 }

// Tenant + trigger type
{ tenant_id: 1, "trigger.type": 1 }

// Tenant + created by
{ tenant_id: 1, created_by: 1 }

// Tenant + tags
{ tenant_id: 1, tags: 1 }
```

### **Analytics Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  metric_name: String,            // leads_created, deals_closed, conversion_rate, etc.
  metric_value: Number,
  metric_unit: String,            // count, percentage, currency, time
  dimensions: {
    user_id: ObjectId,            // Reference to users collection
    lead_source: String,
    lead_status: String,
    date: Date,
    automation_workflow: String
  },
  recorded_at: Date,
  aggregation_period: String,     // daily, hourly, real_time
  created_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + metric + date
{ tenant_id: 1, metric_name: 1, recorded_at: -1 }

// Tenant + user + date
{ tenant_id: 1, "dimensions.user_id": 1, recorded_at: -1 }

// Tenant + source + date
{ tenant_id: 1, "dimensions.lead_source": 1, recorded_at: -1 }

// Tenant + aggregation period
{ tenant_id: 1, aggregation_period: 1, recorded_at: -1 }
```

### **Settings Collection**

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,            // Reference to tenants collection
  category: String,               // general, notifications, integrations, etc.
  key: String,
  value: Mixed,                   // Can be string, number, boolean, object
  description: String,
  is_system: Boolean,             // System settings vs user settings
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```javascript
// Primary index
{ _id: 1 }

// Tenant + category + key (unique per tenant)
{ tenant_id: 1, category: 1, key: 1 }

// Tenant + category
{ tenant_id: 1, category: 1 }
```

---

## 🔗 Relationships

### **One-to-Many Relationships**

```javascript
// Tenant -> Users
Tenant._id -> Users.tenant_id

// Tenant -> Leads
Tenant._id -> Leads.tenant_id

// Tenant -> Buyers
Tenant._id -> Buyers.tenant_id

// Tenant -> Communications
Tenant._id -> Communications.tenant_id

// User -> Leads (assigned)
User._id -> Lead.assigned_to

// User -> Communications (sender)
User._id -> Communication.sender_id
```

### **Many-to-Many Relationships**

```javascript
// Leads <-> Buyers (through Deals)
Lead._id -> Deal.lead_id
Buyer._id -> Deal.buyer_id

// Users <-> Communications (through sender_id)
User._id -> Communication.sender_id
```

---

## 📊 Data Validation Rules

### **Lead Validation**

```javascript
{
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tenant_id", "name", "phone"],
      properties: {
        tenant_id: {
          bsonType: "objectId",
          description: "must be a valid ObjectId"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100
        },
        phone: {
          bsonType: "string",
          pattern: "^[+]?[1-9]\\d{1,14}$"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        status: {
          enum: ["new", "contacted", "under_contract", "closed", "lost"]
        }
      }
    }
  }
}
```

### **Buyer Validation**

```javascript
{
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tenant_id", "name", "phone"],
      properties: {
        tenant_id: {
          bsonType: "objectId"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100
        },
        phone: {
          bsonType: "string",
          pattern: "^[+]?[1-9]\\d{1,14}$"
        },
        price_range: {
          bsonType: "object",
          properties: {
            min: { bsonType: "number", minimum: 0 },
            max: { bsonType: "number", minimum: 0 }
          }
        }
      }
    }
  }
}
```

---

## 🔍 Query Optimization

### **Common Query Patterns**

```javascript
// Get leads by status with pagination
db.leads.find({
  tenant_id: ObjectId("..."),
  status: "new"
}).sort({ created_at: -1 }).skip(offset).limit(limit)

// Get communications for a specific lead
db.communications.find({
  tenant_id: ObjectId("..."),
  recipient_type: "lead",
  recipient_id: ObjectId("...")
}).sort({ created_at: -1 })

// Get buyers matching lead criteria
db.buyers.find({
  tenant_id: ObjectId("..."),
  is_active: true,
  property_types: { $in: ["single_family"] },
  "price_range.min": { $lte: 200000 },
  "price_range.max": { $gte: 150000 }
})

// Get team performance metrics
db.leads.aggregate([
  { $match: { tenant_id: ObjectId("...") } },
  { $group: {
    _id: "$assigned_to",
    total_leads: { $sum: 1 },
    converted_leads: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } }
  }}
])
```

### **Index Strategy**

```javascript
// Compound indexes for common queries
db.leads.createIndex({ "tenant_id": 1, "status": 1, "created_at": -1 })
db.leads.createIndex({ "tenant_id": 1, "assigned_to": 1, "status": 1 })
db.communications.createIndex({ "tenant_id": 1, "recipient_type": 1, "recipient_id": 1, "created_at": -1 })
db.buyers.createIndex({ "tenant_id": 1, "property_types": 1, "price_range.min": 1, "price_range.max": 1 })
```

---

## 🔒 Security Considerations

### **Multi-Tenant Data Isolation**

```javascript
// All queries must include tenant_id filter
const getLeads = async (tenantId, filters = {}) => {
  return await db.leads.find({
    tenant_id: ObjectId(tenantId),
    ...filters
  });
};

// Middleware to ensure tenant isolation
const tenantMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.user.tenant_id;
  req.tenantId = tenantId;
  next();
};
```

### **Data Encryption**

```javascript
// Sensitive fields should be encrypted at rest
const sensitiveFields = [
  'phone',
  'email',
  'address',
  'financials'
];

// Use MongoDB encryption or application-level encryption
```

---

## 📈 Performance Monitoring

### **Database Metrics**

```javascript
// Monitor query performance
db.leads.find().explain("executionStats")

// Monitor index usage
db.leads.getIndexes()

// Monitor collection sizes
db.stats()

// Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 })
```

### **Optimization Strategies**

1. **Index Optimization:** Regular index analysis and optimization
2. **Query Optimization:** Use aggregation pipelines for complex queries
3. **Connection Pooling:** Optimize MongoDB connection settings
4. **Caching:** Redis for frequently accessed data
5. **Sharding:** Horizontal scaling for large datasets

---

## 🔄 Migration Strategy

### **Schema Versioning**

```javascript
// Track schema versions
{
  _id: ObjectId,
  collection: String,
  version: Number,
  applied_at: Date,
  changes: Array
}
```

### **Migration Scripts**

```javascript
// Example migration script
const migrateLeads = async () => {
  await db.leads.updateMany(
    { address: { $exists: false } },
    { $set: { address: {} } }
  );
};
```

---

This database schema provides a solid foundation for the Presidential Digs CRM with proper multi-tenant isolation, comprehensive indexing, and scalability considerations. The schema is designed to support all the features outlined in the PRD while maintaining performance and security standards. 