# 🏗️ Architecture Overview – Presidential Digs CRM

## 🔧 Stack Overview

| Layer       | Technology                            |
|-------------|----------------------------------------|
| Frontend    | Next.js + TypeScript + TailwindCSS     |
| Backend     | NestJS (Node.js) + TypeScript          |
| Database    | MongoDB (multi-tenant aware)           |
| Auth        | Google OAuth 2.0 + JWT                 |
| API Docs    | Swagger (OpenAPI) at `/api/docs`       |
| Monitoring  | Prometheus + Grafana                   |
| Deployment  | Docker Compose (GCP-compatible)        |
| Security    | RBAC, tenant guards, container hardening|

---

## 📁 Code Structure

```
/presidential-digs-crm
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
│   │   │       └── create-buyer.dto.ts
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
│   │   │   │   └── index.ts
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   └── index.ts
│   │   │   ├── forms/
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   ├── BuyerForm.tsx
│   │   │   │   └── index.ts
│   │   │   └── features/
│   │   │       ├── leads/
│   │   │       │   ├── LeadList.tsx
│   │   │       │   ├── LeadCard.tsx
│   │   │       │   ├── LeadDetail.tsx
│   │   │       │   └── LeadForm.tsx
│   │   │       ├── buyers/
│   │   │       │   ├── BuyerList.tsx
│   │   │       │   ├── BuyerCard.tsx
│   │   │       │   ├── BuyerDetail.tsx
│   │   │       │   └── BuyerForm.tsx
│   │   │       ├── communications/
│   │   │       │   ├── CommunicationHistory.tsx
│   │   │       │   ├── SMSInterface.tsx
│   │   │       │   └── CallLog.tsx
│   │   │       └── dashboard/
│   │   │           ├── DashboardStats.tsx
│   │   │           ├── RecentLeads.tsx
│   │   │           ├── QuickActions.tsx
│   │   │           └── ActivityFeed.tsx
│   │   ├── pages/
│   │   │   ├── _app.tsx
│   │   │   ├── index.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── callback.tsx
│   │   │   ├── leads/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── new.tsx
│   │   │   ├── buyers/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── new.tsx
│   │   │   ├── communications/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [leadId].tsx
│   │   │   └── settings/
│   │   │       ├── profile.tsx
│   │   │       ├── team.tsx
│   │   │       └── integrations.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLeads.ts
│   │   │   ├── useBuyers.ts
│   │   │   └── useCommunications.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── websocket.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── leadStore.ts
│   │   │   ├── buyerStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── leads.ts
│   │   │   ├── buyers.ts
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   └── constants.ts
│   │   └── styles/
│   │       └── globals.css
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

## 🔐 Security Layers

| Security Feature   | Description                                         |
|--------------------|-----------------------------------------------------|
| Auth               | Google OAuth frontend + JWT for API access         |
| RBAC               | `@Roles()` + `RolesGuard` for API access control   |
| Tenant Scoping     | `tenant.middleware.ts` + `tenantId` on queries     |
| Input Validation   | DTOs with `class-validator`                        |
| API Protection     | Helmet, rate limits, sanitization, CORS            |
| Docker Security    | Non-root users, read-only FS, `no-new-privileges`  |

---

## 📊 Monitoring

- **Prometheus**: scrape NestJS metrics at `/metrics`
- **Grafana**: dashboards for uptime, latency, error rates
- **Health Check**: `/api/health` for probes/load balancers
- **Application Logs**: Structured logging with correlation IDs
- **Error Tracking**: Sentry integration for error monitoring

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

---

## ⚙️ GitHub Actions for CI/CD

```yaml
name: Deploy CRM to GCP

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

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-docker@v3
      - run: docker build -t presidential-digs-crm .
      - run: docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/presidential-digs-crm:${{ github.sha }}

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
  };
  created_at: Date;
  updated_at: Date;
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

### Backend Optimizations

- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Optimized database connections
- **Rate Limiting**: API rate limiting and throttling

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s
- **API Response Time**: < 500ms average

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
  created_at: Date
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
      - MONGODB_URI=mongodb://mongo:27017/crm
      - JWT_SECRET=dev-secret
    depends_on:
      - mongo

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
  grafana_data:
```

### Production Environment

- **GCP Compute Engine**: Auto-scaling instance groups
- **Load Balancer**: Global HTTPS load balancer
- **SSL Certificates**: Managed SSL certificates
- **CDN**: Cloud CDN for static assets
- **Monitoring**: Cloud Monitoring integration
- **Logging**: Cloud Logging with structured logs

---

## 📈 Scalability Considerations

### Horizontal Scaling

- **Load Balancer**: Distribute traffic across multiple instances
- **Database Sharding**: MongoDB sharding for large datasets
- **Caching Layer**: Redis cluster for session and data caching
- **CDN**: Global content delivery for static assets

### Performance Monitoring

- **Application Metrics**: Custom business metrics
- **Infrastructure Metrics**: CPU, memory, disk usage
- **User Experience Metrics**: Page load times, API response times
- **Business Metrics**: Lead conversion rates, user engagement

### Disaster Recovery

- **Database Backups**: Automated daily backups
- **Multi-Region**: Cross-region deployment for high availability
- **Monitoring Alerts**: Proactive alerting for issues
- **Rollback Strategy**: Automated rollback procedures

---

This architecture provides a solid foundation for the Presidential Digs CRM with scalability, security, and maintainability in mind. The multi-tenant design supports future SaaS expansion while the modular structure enables easy development and testing.