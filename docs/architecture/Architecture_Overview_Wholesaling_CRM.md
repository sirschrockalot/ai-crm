# 🏗️ Architecture Overview – DealCycle CRM

## 🔧 Stack Overview

| Layer       | Technology                            |
|-------------|----------------------------------------|
| Frontend    | Next.js 14 + TypeScript + TailwindCSS + Headless UI |
| Backend     | NestJS (Node.js) + TypeScript          |
| Database    | MongoDB (multi-tenant aware)           |
| Auth        | Google OAuth 2.0 + JWT                 |
| API Docs    | Swagger (OpenAPI) at `/api/docs`       |
| Monitoring  | Prometheus + Grafana                   |
| Deployment  | Docker Compose (GCP-compatible)        |
| Security    | RBAC, tenant guards, container hardening|
| State Management | Zustand (frontend)                   |
| Forms       | React Hook Form + Zod validation       |
| Charts      | Recharts for data visualization        |

---

## 📁 Code Structure

```
/dealcycle-crm
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── google.strategy.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── user.schema.ts
│   │   │   └── users.module.ts
│   │   ├── leads/
│   │   │   ├── leads.controller.ts
│   │   │   ├── leads.service.ts
│   │   │   ├── lead.schema.ts
│   │   │   └── leads.module.ts
│   │   ├── buyers/
│   │   │   ├── buyers.controller.ts
│   │   │   ├── buyers.service.ts
│   │   │   ├── buyer.schema.ts
│   │   │   └── buyers.module.ts
│   │   ├── communications/
│   │   │   ├── communications.controller.ts
│   │   │   ├── communications.service.ts
│   │   │   ├── communication.schema.ts
│   │   │   └── communications.module.ts
│   │   ├── ai/
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   └── ai.module.ts
│   │   ├── automation/
│   │   │   ├── automation.controller.ts
│   │   │   ├── automation.service.ts
│   │   │   ├── workflow.schema.ts
│   │   │   ├── workflow-engine.service.ts
│   │   │   └── automation.module.ts
│   │   ├── analytics/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── analytics.module.ts
│   │   ├── common/
│   │   │   ├── middleware/
│   │   │   │   ├── tenant.middleware.ts
│   │   │   │   └── auth.middleware.ts
│   │   │   ├── guards/
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── jwt.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── tenant.decorator.ts
│   │   │   └── dto/
│   │   │       ├── create-lead.dto.ts
│   │   │       ├── update-lead.dto.ts
│   │   │       ├── create-buyer.dto.ts
│   │   │       ├── workflow.dto.ts
│   │   │       └── dashboard.dto.ts
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── auth.config.ts
│   │   │   └── app.config.ts
│   │   └── main.ts
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── nest-cli.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Chart.tsx
│   │   │   │   └── index.ts
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── forms/
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   ├── BuyerForm.tsx
│   │   │   │   ├── WorkflowForm.tsx
│   │   │   │   └── index.ts
│   │   │   └── features/
│   │   │       ├── leads/
│   │   │       │   ├── LeadList.tsx
│   │   │       │   ├── LeadCard.tsx
│   │   │       │   ├── LeadDetail.tsx
│   │   │       │   ├── LeadForm.tsx
│   │   │       │   └── LeadImportExport.tsx
│   │   │       ├── buyers/
│   │   │       │   ├── BuyerList.tsx
│   │   │       │   ├── BuyerCard.tsx
│   │   │       │   ├── BuyerDetail.tsx
│   │   │       │   ├── BuyerForm.tsx
│   │   │       │   └── BuyerAnalytics.tsx
│   │   │       ├── communications/
│   │   │       │   ├── CommunicationHistory.tsx
│   │   │       │   ├── SMSInterface.tsx
│   │   │       │   ├── CallLog.tsx
│   │   │       │   ├── CommunicationCenter.tsx
│   │   │       │   └── CommunicationAnalytics.tsx
│   │   │       ├── dashboard/
│   │   │       │   ├── ExecutiveDashboard.tsx
│   │   │       │   ├── AcquisitionsDashboard.tsx
│   │   │       │   ├── DispositionDashboard.tsx
│   │   │       │   ├── MobileDashboard.tsx
│   │   │       │   ├── DashboardStats.tsx
│   │   │       │   ├── RecentLeads.tsx
│   │   │       │   ├── QuickActions.tsx
│   │   │       │   └── ActivityFeed.tsx
│   │   │       ├── automation/
│   │   │       │   ├── WorkflowBuilder.tsx
│   │   │       │   ├── WorkflowCanvas.tsx
│   │   │       │   ├── WorkflowComponents.tsx
│   │   │       │   ├── AutomationStats.tsx
│   │   │       │   └── WorkflowList.tsx
│   │   │       └── analytics/
│   │   │           ├── AnalyticsDashboard.tsx
│   │   │           ├── PerformanceMetrics.tsx
│   │   │           ├── ConversionCharts.tsx
│   │   │           ├── TeamPerformance.tsx
│   │   │           └── CustomReports.tsx
│   │   ├── pages/
│   │   │   ├── _app.tsx
│   │   │   ├── index.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── callback.tsx
│   │   │   ├── leads/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   ├── new.tsx
│   │   │   │   └── import-export.tsx
│   │   │   ├── buyers/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   ├── new.tsx
│   │   │   │   └── analytics.tsx
│   │   │   ├── communications/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [leadId].tsx
│   │   │   │   └── center.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── executive.tsx
│   │   │   │   ├── acquisitions.tsx
│   │   │   │   ├── disposition.tsx
│   │   │   │   └── mobile.tsx
│   │   │   ├── automation/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── builder.tsx
│   │   │   │   └── workflows.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── performance.tsx
│   │   │   │   └── reports.tsx
│   │   │   └── settings/
│   │   │       ├── profile.tsx
│   │   │       ├── team.tsx
│   │   │       └── integrations.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLeads.ts
│   │   │   ├── useBuyers.ts
│   │   │   ├── useCommunications.ts
│   │   │   ├── useAutomation.ts
│   │   │   ├── useAnalytics.ts
│   │   │   └── useDashboard.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── websocket.ts
│   │   │   ├── twilio.ts
│   │   │   └── ai.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── leadStore.ts
│   │   │   ├── buyerStore.ts
│   │   │   ├── communicationStore.ts
│   │   │   ├── automationStore.ts
│   │   │   ├── analyticsStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── leads.ts
│   │   │   ├── buyers.ts
│   │   │   ├── communications.ts
│   │   │   ├── automation.ts
│   │   │   ├── analytics.ts
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   ├── constants.ts
│   │   │   ├── charts.ts
│   │   │   └── workflow.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── components.css
│   │   │   └── design-system.css
│   │   └── design-system/
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       ├── spacing.ts
│   │       ├── shadows.ts
│   │       └── animations.ts
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
│       ├── dashboards/
│       └── provisioning/
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/
│   │       ├── network/
│   │       ├── compute/
│   │       ├── database/
│   │       └── monitoring/
│   └── docker/
│       ├── docker-compose.yml
│       ├── docker-compose.prod.yml
│       └── nginx/
│           └── nginx.conf
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── backup.sh
├── docs/
│   ├── api/
│   ├── deployment/
│   └── development/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🎨 Design System Architecture

### Color Palette
```typescript
// design-system/colors.ts
export const colors = {
  primary: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  secondary: {
    50: '#F3E8FF',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    900: '#0F172A',
  }
};
```

### Typography System
```typescript
// design-system/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
};
```

### Component Architecture
```typescript
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md'
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-300';
  const variantClasses = {
    default: 'bg-white border-gray-200 shadow-sm',
    elevated: 'bg-white border-gray-200 shadow-lg hover:shadow-xl',
    outlined: 'bg-transparent border-gray-300'
  };
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};
```

---

## 🔐 Security Layers

| Security Feature   | Description                                         |
|--------------------|-----------------------------------------------------|
| Auth               | Google OAuth frontend + JWT for API access         |
| RBAC               | `@Roles()` + `RolesGuard` for API access control   |
| Tenant Scoping     | `tenant.middleware.ts` + `tenantId` on queries     |
| Input Validation   | DTOs with `class-validator` + Zod on frontend      |
| API Protection     | Helmet, rate limits, sanitization, CORS            |
| Docker Security    | Non-root users, read-only FS, `no-new-privileges`  |
| XSS Protection     | Content Security Policy, input sanitization        |
| CSRF Protection    | CSRF tokens for state-changing operations          |

---

## 📊 Monitoring & Analytics

- **Prometheus**: scrape NestJS metrics at `/metrics`
- **Grafana**: dashboards for uptime, latency, error rates
- **Health Check**: `/api/health` for probes/load balancers
- **Application Logs**: Structured logging with correlation IDs
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Real User Monitoring (RUM)
- **Business Metrics**: Custom dashboards for KPIs and conversions

---

## ☁️ Terraform Infrastructure Plan (GCP)

| Component          | Terraform Resource             |
|--------------------|-------------------------------|
| Project & Network  | `google_project`, `google_compute_network` |
| Compute            | Instance Template + MIG        |
| Storage            | `google_storage_bucket`        |
| Mongo              | VM-hosted or GKE Pod           |
| Load Balancer      | `google_compute_global_forwarding_rule` |
| Monitoring         | Prometheus container OR GCP monitoring |
| SSL Certificate    | `google_compute_managed_ssl_certificate` |
| DNS                | `google_dns_record_set`        |
| CDN                | `google_compute_backend_bucket` |
| Redis              | Memorystore for caching        |

---

## ⚙️ GitHub Actions for CI/CD

```yaml
name: Deploy DealCycle CRM to GCP

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-docker@v3
      - run: docker build -t dealcycle-crm .
      - run: docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/dealcycle-crm:${{ github.sha }}

  terraform:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init
      - run: terraform plan
      - run: terraform apply -auto-approve
        env:
          GOOGLE_CREDENTIALS: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
```

---

## 🧠 LLM Agent Integration Strategy

| Feature                | Endpoint or Module        |
|------------------------|---------------------------|
| Notes Summary          | `/leads/:id/summary`      |
| Suggested SMS Reply    | `/comms/suggest-reply`    |
| Auto-Tagging           | Lead create/update hook   |
| GPT Descriptions       | `/deals/:id/generate-copy`|
| Buyer Matching         | `/leads/:id/match-buyers` |
| Lead Qualification     | `/leads/:id/qualify`      |
| Workflow Suggestions   | `/automation/suggest-workflow` |
| Performance Insights   | `/analytics/ai-insights`  |

---

## 🔄 Multi-Tenant Architecture

### Tenant Isolation Strategy

```typescript
// Tenant middleware
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.extractTenantId(req);
    req.tenantId = tenantId;
    next();
  }

  private extractTenantId(req: Request): string {
    // From JWT token or subdomain
    return req.headers['x-tenant-id'] as string || 'default';
  }
}

// Database queries include tenant filter
const getLeads = async (tenantId: string, filters: any) => {
  return await db.leads.find({
    tenant_id: tenantId,
    ...filters
  });
};
```

### Tenant Configuration

```typescript
interface Tenant {
  _id: ObjectId;
  name: string;
  domain: string;
  subscription_plan: 'basic' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'suspended' | 'cancelled';
  max_users: number;
  max_leads: number;
  features_enabled: string[];
  settings: {
    sms_enabled: boolean;
    call_enabled: boolean;
    llm_features_enabled: boolean;
    custom_branding: boolean;
    automation_enabled: boolean;
    advanced_analytics: boolean;
  };
  created_at: Date;
  updated_at: Date;
}
```

---

## 🤖 Automation Workflow Engine

### Workflow Schema
```typescript
interface Workflow {
  _id: ObjectId;
  tenant_id: ObjectId;
  name: string;
  description: string;
  trigger: {
    type: 'lead_created' | 'lead_status_changed' | 'communication_sent' | 'scheduled';
    conditions: WorkflowCondition[];
  };
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'notification';
  config: {
    action?: 'send_sms' | 'send_email' | 'assign_lead' | 'update_status';
    condition?: 'lead_value' | 'lead_source' | 'communication_count';
    delay?: number; // minutes
    notification?: 'email' | 'sms' | 'in_app';
  };
  next_steps: string[]; // IDs of next steps
}
```

### Workflow Engine Service
```typescript
@Injectable()
export class WorkflowEngineService {
  async executeWorkflow(workflowId: string, context: any) {
    const workflow = await this.getWorkflow(workflowId);
    const execution = await this.createExecution(workflowId, context);
    
    for (const step of workflow.steps) {
      await this.executeStep(step, context, execution);
    }
  }

  private async executeStep(step: WorkflowStep, context: any, execution: any) {
    switch (step.type) {
      case 'action':
        await this.executeAction(step.config.action, context);
        break;
      case 'condition':
        const result = await this.evaluateCondition(step.config.condition, context);
        // Route to appropriate next step based on result
        break;
      case 'delay':
        await this.scheduleDelay(step.config.delay, execution);
        break;
    }
  }
}
```

---

## 📈 Performance Optimization

### Frontend Optimizations

- **Next.js Image Optimization**: Automatic image optimization
- **Code Splitting**: Route-based code splitting
- **Static Generation**: Pre-render static pages
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Redis for API response caching
- **Service Workers**: Offline functionality and caching
- **Lazy Loading**: Component and route lazy loading
- **Virtual Scrolling**: For large data sets

### Backend Optimizations

- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Optimized database connections
- **Rate Limiting**: API rate limiting and throttling
- **Background Jobs**: Queue-based processing for heavy tasks
- **Database Sharding**: For large-scale deployments

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s
- **API Response Time**: < 500ms average
- **Core Web Vitals**: All metrics in "Good" range

---

## 🧪 Testing Strategy

### Backend Testing

```typescript
// Unit tests
describe('LeadService', () => {
  it('should create a new lead', async () => {
    const lead = await leadService.create(createLeadDto);
    expect(lead).toBeDefined();
    expect(lead.tenant_id).toBe('test-tenant');
  });
});

// Integration tests
describe('Lead API', () => {
  it('should return leads for tenant', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/leads')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
```

### Frontend Testing

```typescript
// Component tests
describe('LeadList', () => {
  it('should render leads correctly', () => {
    render(<LeadList leads={mockLeads} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});

// E2E tests
describe('Lead Management', () => {
  it('should create a new lead', () => {
    cy.visit('/leads/new');
    cy.get('[data-testid="name-input"]').type('John Doe');
    cy.get('[data-testid="phone-input"]').type('555-1234');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/leads');
  });
});
```

---

## 🔒 Security Implementation

### Authentication Flow

```typescript
// Google OAuth Strategy
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      picture: profile.photos[0].value,
      accessToken,
    };
    return user;
  }
}
```

### RBAC Implementation

```typescript
// Role decorator
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Role guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

---

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  google_id: String,
  email: String,
  name: String,
  role: String, // admin, acquisition_rep, disposition_manager
  permissions: [String],
  is_active: Boolean,
  last_login: Date,
  created_at: Date,
  updated_at: Date
}
```

### Leads Collection

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  name: String,
  phone: String,
  email: String,
  address: String,
  property_type: String,
  estimated_value: Number,
  source: String,
  status: String, // new, contacted, under_contract, closed, lost
  assigned_to: ObjectId,
  tags: [String],
  notes: String,
  communication_count: Number,
  last_contacted: Date,
  ai_summary: String,
  lead_score: Number,
  created_at: Date,
  updated_at: Date
}
```

### Buyers Collection

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  name: String,
  phone: String,
  email: String,
  company: String,
  property_types: [String],
  price_range_min: Number,
  price_range_max: Number,
  preferred_locations: [String],
  investment_criteria: String,
  notes: String,
  total_deals: Number,
  total_investment: Number,
  performance_metrics: {
    response_time: Number,
    conversion_rate: Number,
    average_deal_size: Number
  },
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Communications Collection

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  type: String, // sms, call, email
  direction: String, // inbound, outbound
  recipient_type: String, // lead, buyer
  recipient_id: ObjectId,
  sender_id: ObjectId,
  content: String,
  status: String, // sent, delivered, failed, answered, missed
  twilio_sid: String,
  duration: Number,
  scheduled_at: Date,
  sent_at: Date,
  ai_suggestions: [String],
  created_at: Date
}
```

### Workflows Collection

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  name: String,
  description: String,
  trigger: {
    type: String,
    conditions: [Object]
  },
  steps: [{
    id: String,
    type: String,
    config: Object,
    next_steps: [String]
  }],
  is_active: Boolean,
  execution_count: Number,
  success_rate: Number,
  created_at: Date,
  updated_at: Date
}
```

### Analytics Collection

```javascript
{
  _id: ObjectId,
  tenant_id: ObjectId,
  date: Date,
  metrics: {
    leads_created: Number,
    leads_converted: Number,
    communications_sent: Number,
    deals_closed: Number,
    revenue_generated: Number
  },
  user_activity: {
    active_users: Number,
    page_views: Number,
    session_duration: Number
  },
  performance: {
    response_time: Number,
    error_rate: Number,
    uptime: Number
  }
}
```

---

## 🚀 Deployment Strategy

### Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/dealcycle
      - JWT_SECRET=dev-secret
      - TWILIO_ACCOUNT_SID=dev-sid
      - TWILIO_AUTH_TOKEN=dev-token
    depends_on:
      - mongo
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    depends_on:
      - backend

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  mongo_data:
  redis_data:
  grafana_data:
```

### Production Environment

- **GCP Compute Engine**: Auto-scaling instance groups
- **Load Balancer**: Global HTTPS load balancer
- **SSL Certificates**: Managed SSL certificates
- **CDN**: Cloud CDN for static assets
- **Monitoring**: Cloud Monitoring integration
- **Logging**: Cloud Logging with structured logs
- **Redis**: Memorystore for caching and sessions
- **Backup**: Automated daily backups with retention policies

---

## 📈 Scalability Considerations

### Horizontal Scaling

- **Load Balancer**: Distribute traffic across multiple instances
- **Database Sharding**: MongoDB sharding for large datasets
- **Caching Layer**: Redis cluster for session and data caching
- **CDN**: Global content delivery for static assets
- **Microservices**: Future migration path for specific domains

### Performance Monitoring

- **Application Metrics**: Custom business metrics
- **Infrastructure Metrics**: CPU, memory, disk usage
- **User Experience Metrics**: Page load times, API response times
- **Business Metrics**: Lead conversion rates, user engagement
- **Real-time Monitoring**: Live dashboards and alerting

### Disaster Recovery

- **Database Backups**: Automated daily backups
- **Multi-Region**: Cross-region deployment for high availability
- **Monitoring Alerts**: Proactive alerting for issues
- **Rollback Strategy**: Automated rollback procedures
- **Data Recovery**: Point-in-time recovery capabilities

---

This architecture provides a solid foundation for the DealCycle CRM with scalability, security, and maintainability in mind. The multi-tenant design supports future SaaS expansion while the modular structure enables easy development and testing. The modern UI/UX design system ensures a professional and intuitive user experience across all devices.