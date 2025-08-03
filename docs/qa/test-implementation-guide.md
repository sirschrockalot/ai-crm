# 🧪 Test Implementation Guide - DealCycle CRM

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Test Implementation Guide |
| **Project** | DealCycle CRM |
| **Version** | 1.0 |
| **Created** | 2024-12-19 |
| **Owner** | QA Architect |
| **Status** | Active |

---

## 🎯 Implementation Overview

**Objective:** Provide practical, step-by-step guidance for implementing the test strategy across all components of the DealCycle CRM platform. This guide includes setup instructions, code examples, and best practices for each testing layer.

**Implementation Goals:**
- **Rapid Setup:** Get testing infrastructure running quickly
- **Consistent Patterns:** Standardized testing approaches across teams
- **Quality Assurance:** Ensure tests are maintainable and reliable
- **Continuous Integration:** Seamless integration with CI/CD pipeline

---

## 🚀 Quick Start Setup

### **1. Backend Testing Setup**

```bash
# Install testing dependencies
npm install --save-dev @nestjs/testing jest @types/jest supertest @types/supertest
npm install --save-dev mongodb-memory-server redis-mock faker @faker-js/faker

# Create test configuration
```

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/*.module.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts']
};
```

```typescript
// src/test/setup.ts
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Setup test database
  process.env.MONGODB_URI = uri;
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.JWT_SECRET = 'test-secret';
});

afterAll(async () => {
  await mongod.stop();
});

// Global test utilities
global.createTestApp = async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
};
```

### **2. Frontend Testing Setup**

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-environment-jsdom
npm install --save-dev msw @playwright/test chromatic

# Create test configuration
```

```typescript
// jest.config.js (Frontend)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/test/**/*'
  ]
};
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Global test utilities
global.renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ChakraProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};
```

### **3. Mobile Testing Setup**

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native
npm install --save-dev detox @maestrohq/cli

# Create test configuration
```

### **4. Micro-App Testing Setup**

```bash
# Install micro-app testing dependencies
npm install --save-dev @module-federation/utilities
npm install --save-dev webpack-module-federation-plugin
npm install --save-dev single-spa-testing
npm install --save-dev @testing-library/jest-dom

# Create test configuration
```

```typescript
// jest.config.js (Mobile)
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*'
  ]
};
```

```typescript
// jest.config.js (Micro-App)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^lead-management/(.*)$': '<rootDir>/../lead-management/src/$1',
    '^analytics/(.*)$': '<rootDir>/../analytics/src/$1',
    '^dashboard/(.*)$': '<rootDir>/../dashboard/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/bootstrap.ts',
    '!src/main.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ]
};
```

---

## 🔧 Test Implementation Examples

### **1. Backend Service Testing**

```typescript
// src/modules/leads/__tests__/leads.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LeadService } from '../leads.service';
import { LeadRepository } from '../leads.repository';
import { FeatureFlagsService } from '../../common/services/feature-flags.service';
import { AIService } from '../../ai/ai.service';
import { LeadFactory } from '../../../test/factories/lead.factory';

describe('LeadService', () => {
  let service: LeadService;
  let repository: jest.Mocked<LeadRepository>;
  let featureFlags: jest.Mocked<FeatureFlagsService>;
  let aiService: jest.Mocked<AIService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: LeadRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByTenant: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: FeatureFlagsService,
          useValue: {
            isFeatureEnabled: jest.fn(),
            setFeatureFlag: jest.fn(),
          },
        },
        {
          provide: AIService,
          useValue: {
            scoreLead: jest.fn(),
            enrichLead: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeadService>(LeadService);
    repository = module.get(LeadRepository);
    featureFlags = module.get(FeatureFlagsService);
    aiService = module.get(AIService);
  });

  describe('createLead', () => {
    it('should create a lead with basic data', async () => {
      const leadData = LeadFactory.createValidLead();
      const expectedLead = { ...leadData, id: 'test-id', created_at: new Date() };

      repository.create.mockResolvedValue(expectedLead);
      featureFlags.isFeatureEnabled.mockResolvedValue(false);

      const result = await service.createLead(leadData);

      expect(result).toEqual(expectedLead);
      expect(repository.create).toHaveBeenCalledWith(leadData);
      expect(aiService.scoreLead).not.toHaveBeenCalled();
    });

    it('should enable AI scoring when feature flag is enabled', async () => {
      const leadData = LeadFactory.createValidLead();
      const expectedLead = { 
        ...leadData, 
        id: 'test-id', 
        lead_score: 85,
        created_at: new Date() 
      };

      repository.create.mockResolvedValue(expectedLead);
      featureFlags.isFeatureEnabled.mockResolvedValue(true);
      aiService.scoreLead.mockResolvedValue({ score: 85, confidence: 0.9 });

      const result = await service.createLead(leadData);

      expect(result.lead_score).toBe(85);
      expect(aiService.scoreLead).toHaveBeenCalledWith(leadData);
    });

    it('should validate lead data before creation', async () => {
      const invalidData = LeadFactory.createInvalidLead();

      await expect(service.createLead(invalidData))
        .rejects
        .toThrow('Invalid lead data');

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should enforce tenant isolation', async () => {
      const leadData = LeadFactory.createValidLead();
      const tenantId = 'tenant-1';

      await service.createLead(leadData, tenantId);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...leadData,
          tenant_id: tenantId
        })
      );
    });
  });

  describe('getLeadsByTenant', () => {
    it('should return only leads for the specified tenant', async () => {
      const tenantId = 'tenant-1';
      const expectedLeads = [
        LeadFactory.createValidLead({ tenant_id: tenantId }),
        LeadFactory.createValidLead({ tenant_id: tenantId })
      ];

      repository.findByTenant.mockResolvedValue(expectedLeads);

      const result = await service.getLeadsByTenant(tenantId);

      expect(result).toEqual(expectedLeads);
      expect(repository.findByTenant).toHaveBeenCalledWith(tenantId);
    });
  });
});
```

### **2. Frontend Component Testing**

```typescript
// src/components/leads/__tests__/LeadForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadForm } from '../LeadForm';
import { LeadFactory } from '../../../test/factories/lead.factory';
import { useFeatureFlag } from '../../../hooks/useFeatureFlag';

// Mock hooks
jest.mock('../../../hooks/useFeatureFlag');
jest.mock('../../../hooks/useLeads');

const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<typeof useFeatureFlag>;

describe('LeadForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    initialData: null,
  };

  beforeEach(() => {
    mockUseFeatureFlag.mockReturnValue(false);
  });

  it('should render form with all required fields', () => {
    render(<LeadForm {...defaultProps} />);

    expect(screen.getByLabelText(/property address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/property value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/asking price/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    
    render(<LeadForm {...defaultProps} onSubmit={onSubmit} />);

    const leadData = LeadFactory.createValidLead();

    await user.type(screen.getByLabelText(/property address/i), leadData.property_address);
    await user.type(screen.getByLabelText(/owner name/i), leadData.owner_name);
    await user.type(screen.getByLabelText(/owner phone/i), leadData.owner_phone);
    await user.type(screen.getByLabelText(/owner email/i), leadData.owner_email);
    await user.type(screen.getByLabelText(/property value/i), leadData.property_value.toString());
    await user.type(screen.getByLabelText(/asking price/i), leadData.asking_price.toString());

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining(leadData));
    });
  });

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    render(<LeadForm {...defaultProps} />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/property address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/owner name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
  });

  it('should enable AI features when feature flag is enabled', () => {
    mockUseFeatureFlag.mockReturnValue(true);
    
    render(<LeadForm {...defaultProps} />);

    expect(screen.getByText(/ai-powered lead scoring/i)).toBeInTheDocument();
    expect(screen.getByText(/auto-enrichment enabled/i)).toBeInTheDocument();
  });

  it('should populate form with initial data', () => {
    const initialData = LeadFactory.createValidLead();
    
    render(<LeadForm {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue(initialData.property_address)).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialData.owner_name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialData.owner_phone)).toBeInTheDocument();
  });

  it('should handle cancel action', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    
    render(<LeadForm {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
```

### **3. API Integration Testing**

```typescript
// src/modules/leads/__tests__/leads.controller.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { LeadFactory } from '../../../test/factories/lead.factory';
import { UserFactory } from '../../../test/factories/user.factory';
import { getAuthToken } from '../../../test/utils/auth';

describe('LeadController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tenantId = 'test-tenant-1';
    authToken = await getAuthToken(app, tenantId);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/leads (POST)', () => {
    it('should create a new lead', async () => {
      const leadData = LeadFactory.createValidLead();

      const response = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        property_address: leadData.property_address,
        owner_name: leadData.owner_name,
        tenant_id: tenantId,
        status: 'new',
        created_at: expect.any(String),
      });
    });

    it('should enforce tenant isolation', async () => {
      const otherTenantId = 'test-tenant-2';
      const otherAuthToken = await getAuthToken(app, otherTenantId);
      const leadData = LeadFactory.createValidLead();

      // Create lead in other tenant
      const leadResponse = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send(leadData)
        .expect(201);

      const leadId = leadResponse.body.id;

      // Try to access lead from different tenant
      await request(app.getHttpServer())
        .get(`/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should validate required fields', async () => {
      const invalidData = LeadFactory.createInvalidLead();

      const response = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('property_address should not be empty');
      expect(response.body.message).toContain('owner_name should not be empty');
    });

    it('should enable AI scoring when feature flag is enabled', async () => {
      // Enable AI scoring feature flag
      await request(app.getHttpServer())
        .post('/admin/feature-flags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          feature: 'ai-lead-scoring',
          enabled: true,
          tenantId: tenantId
        })
        .expect(200);

      const leadData = LeadFactory.createValidLead();

      const response = await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData)
        .expect(201);

      expect(response.body.lead_score).toBeDefined();
      expect(response.body.lead_score).toBeGreaterThan(0);
      expect(response.body.lead_score).toBeLessThanOrEqual(100);
    });
  });

  describe('/leads (GET)', () => {
    it('should return leads for the authenticated tenant', async () => {
      // Create test leads
      const leadData1 = LeadFactory.createValidLead();
      const leadData2 = LeadFactory.createValidLead();

      await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData1);

      await request(app.getHttpServer())
        .post('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leadData2);

      const response = await request(app.getHttpServer())
        .get('/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach((lead: any) => {
        expect(lead.tenant_id).toBe(tenantId);
      });
    });

    it('should support filtering and pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/leads?status=new&limit=10&page=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });
});
```

### **4. Feature Flag Testing**

```typescript
// src/test/feature-flags/feature-flag.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagsService } from '../../modules/common/services/feature-flags.service';
import { RedisService } from '../../modules/common/caching/redis.service';
```

### **5. Micro-App Testing**

```typescript
// src/test/micro-apps/lead-management-app.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadManagementApp } from '../../micro-apps/lead-management/LeadManagementApp';
import { EventBus } from '../../shared/event-bus';
import { SharedStateManager } from '../../shared/state-manager';

describe('LeadManagementApp', () => {
  let eventBus: EventBus;
  let stateManager: SharedStateManager;
  let container: HTMLElement;

  beforeEach(() => {
    eventBus = new EventBus();
    stateManager = new SharedStateManager();
    container = document.createElement('div');
  });

  it('should initialize micro-app correctly', () => {
    const app = new LeadManagementApp(container, eventBus, stateManager);
    
    expect(app.isInitialized()).toBe(true);
    expect(container.querySelector('[data-testid="lead-app"]')).toBeInTheDocument();
  });

  it('should handle app lifecycle events', () => {
    const app = new LeadManagementApp(container, eventBus, stateManager);
    const lifecycleSpy = jest.fn();
    
    app.onLifecycleEvent(lifecycleSpy);
    app.mount();
    
    expect(lifecycleSpy).toHaveBeenCalledWith('mounted');
    
    app.unmount();
    expect(lifecycleSpy).toHaveBeenCalledWith('unmounted');
  });

  it('should communicate with host application', () => {
    const app = new LeadManagementApp(container, eventBus, stateManager);
    const messageSpy = jest.fn();
    
    eventBus.subscribe('lead-created', messageSpy);
    app.createLead({ property_address: '123 Main St' });
    
    expect(messageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'lead-created',
        payload: { property_address: '123 Main St' }
      })
    );
  });

  it('should update shared state', () => {
    const app = new LeadManagementApp(container, eventBus, stateManager);
    
    app.updateSharedState({ selectedLead: 'lead-123' });
    
    expect(stateManager.getState()).toMatchObject({
      selectedLead: 'lead-123'
    });
  });
});
```

```typescript
// src/test/micro-apps/module-federation.test.ts
import { loadRemoteModule } from '@module-federation/utilities';

describe('Module Federation', () => {
  it('should load remote modules correctly', async () => {
    // Mock webpack module federation
    window.__webpack_require__ = {
      e: jest.fn().mockResolvedValue([]),
      l: jest.fn().mockResolvedValue({ default: jest.fn() })
    };

    const module = await loadRemoteModule({
      remoteEntry: 'http://localhost:3001/remoteEntry.js',
      remoteName: 'lead-management',
      exposedModule: './LeadForm'
    });

    expect(module).toBeDefined();
    expect(module.default).toBeInstanceOf(Function);
  });

  it('should handle federation configuration', () => {
    const config = require('../../webpack.config.js');
    const federationPlugin = config.plugins.find(
      p => p.constructor.name === 'ModuleFederationPlugin'
    );

    expect(federationPlugin.options).toMatchObject({
      name: 'lead-management',
      filename: 'remoteEntry.js',
      exposes: {
        './LeadForm': './src/components/LeadForm',
        './LeadList': './src/components/LeadList'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    });
  });

  it('should handle federation errors gracefully', async () => {
    // Mock failed module loading
    window.__webpack_require__ = {
      e: jest.fn().mockRejectedValue(new Error('Module not found')),
      l: jest.fn().mockRejectedValue(new Error('Load failed'))
    };

    await expect(loadRemoteModule({
      remoteEntry: 'http://localhost:3001/remoteEntry.js',
      remoteName: 'non-existent',
      exposedModule: './Module'
    })).rejects.toThrow('Module not found');
  });
});
```

```typescript
// src/test/micro-apps/cross-app-communication.test.ts
import { EventBus } from '../../shared/event-bus';
import { LeadManagementApp } from '../../micro-apps/lead-management/LeadManagementApp';
import { AnalyticsApp } from '../../micro-apps/analytics/AnalyticsApp';
import { DashboardApp } from '../../micro-apps/dashboard/DashboardApp';

describe('Cross-App Communication', () => {
  let eventBus: EventBus;
  let leadApp: LeadManagementApp;
  let analyticsApp: AnalyticsApp;
  let dashboardApp: DashboardApp;

  beforeEach(() => {
    eventBus = new EventBus();
    leadApp = new LeadManagementApp(eventBus);
    analyticsApp = new AnalyticsApp(eventBus);
    dashboardApp = new DashboardApp(eventBus);
  });

  it('should broadcast events across apps', () => {
    const analyticsSpy = jest.fn();
    const dashboardSpy = jest.fn();

    analyticsApp.onLeadCreated(analyticsSpy);
    dashboardApp.onLeadCreated(dashboardSpy);

    leadApp.createLead({ property_address: '123 Main St' });

    expect(analyticsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'lead-created',
        payload: { property_address: '123 Main St' }
      })
    );

    expect(dashboardSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'lead-created',
        payload: { property_address: '123 Main St' }
      })
    );
  });

  it('should handle app state synchronization', () => {
    const stateSpy = jest.fn();
    analyticsApp.onStateChange(stateSpy);

    leadApp.updateState({ selectedLead: 'lead-123' });

    expect(stateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'lead-management',
        state: { selectedLead: 'lead-123' }
      })
    );
  });

  it('should isolate app boundaries', () => {
    const isolatedEvent = { type: 'internal-event', data: 'private' };

    leadApp.emitInternalEvent(isolatedEvent);

    // Event should not propagate to other apps
    expect(analyticsApp.getInternalEvents()).not.toContain(isolatedEvent);
    expect(dashboardApp.getInternalEvents()).not.toContain(isolatedEvent);
  });
});
```

```typescript
// src/test/micro-apps/app-boundaries.test.ts
import { LeadManagementApp } from '../../micro-apps/lead-management/LeadManagementApp';
import { DashboardApp } from '../../micro-apps/dashboard/DashboardApp';

describe('App Boundaries', () => {
  it('should prevent cross-app DOM manipulation', () => {
    const leadAppContainer = document.createElement('div');
    const dashboardAppContainer = document.createElement('div');

    const leadApp = new LeadManagementApp(leadAppContainer);
    const dashboardApp = new DashboardApp(dashboardAppContainer);

    // Lead app should not be able to modify dashboard app DOM
    expect(() => {
      leadApp.manipulateDOM(dashboardAppContainer);
    }).toThrow('Cross-app DOM manipulation not allowed');
  });

  it('should isolate CSS styles between apps', () => {
    const leadApp = new LeadManagementApp();
    const dashboardApp = new DashboardApp();

    leadApp.addStyles('.lead-button { color: red; }');
    dashboardApp.addStyles('.dashboard-button { color: blue; }');

    // Styles should be scoped to respective apps
    expect(document.querySelector('.lead-button')).toHaveStyle({ color: 'red' });
    expect(document.querySelector('.dashboard-button')).toHaveStyle({ color: 'blue' });
    expect(document.querySelector('.lead-button')).not.toHaveStyle({ color: 'blue' });
  });

  it('should handle app loading and unloading', async () => {
    const container = document.createElement('div');
    const app = new LeadManagementApp(container);

    await app.load();
    expect(container.querySelector('[data-testid="lead-app"]')).toBeInTheDocument();

    await app.unload();
    expect(container.querySelector('[data-testid="lead-app"]')).not.toBeInTheDocument();
  });
});
```

describe('Feature Flags', () => {
  let featureFlagsService: FeatureFlagsService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        {
          provide: RedisService,
          useValue: {
            hget: jest.fn(),
            hset: jest.fn(),
            hgetall: jest.fn(),
          },
        },
      ],
    }).compile();

    featureFlagsService = module.get<FeatureFlagsService>(FeatureFlagsService);
    redisService = module.get(RedisService);
  });

  describe('isFeatureEnabled', () => {
    it('should check environment-level flags first', async () => {
      process.env.FEATURE_AI_LEAD_SCORING = 'true';

      const result = await featureFlagsService.isFeatureEnabled('ai-lead-scoring');

      expect(result).toBe(true);
    });

    it('should check tenant-level flags', async () => {
      process.env.FEATURE_AI_LEAD_SCORING = undefined;
      redisService.hget.mockResolvedValue('true');

      const result = await featureFlagsService.isFeatureEnabled(
        'ai-lead-scoring',
        'tenant-1'
      );

      expect(result).toBe(true);
      expect(redisService.hget).toHaveBeenCalledWith(
        'tenant:tenant-1:features',
        'ai-lead-scoring'
      );
    });

    it('should check user-level flags', async () => {
      process.env.FEATURE_AI_LEAD_SCORING = undefined;
      redisService.hget
        .mockResolvedValueOnce(null) // tenant level
        .mockResolvedValueOnce('true'); // user level

      const result = await featureFlagsService.isFeatureEnabled(
        'ai-lead-scoring',
        'tenant-1',
        'user-1'
      );

      expect(result).toBe(true);
    });

    it('should default to disabled when no flags are set', async () => {
      process.env.FEATURE_AI_LEAD_SCORING = undefined;
      redisService.hget.mockResolvedValue(null);

      const result = await featureFlagsService.isFeatureEnabled('ai-lead-scoring');

      expect(result).toBe(false);
    });
  });

  describe('setFeatureFlag', () => {
    it('should set tenant-level flag', async () => {
      await featureFlagsService.setFeatureFlag(
        'ai-lead-scoring',
        true,
        'tenant-1'
      );

      expect(redisService.hset).toHaveBeenCalledWith(
        'tenant:tenant-1:features',
        'ai-lead-scoring',
        'true'
      );
    });

    it('should set user-level flag', async () => {
      await featureFlagsService.setFeatureFlag(
        'ai-lead-scoring',
        false,
        'tenant-1',
        'user-1'
      );

      expect(redisService.hset).toHaveBeenCalledWith(
        'user:user-1:features',
        'ai-lead-scoring',
        'false'
      );
    });
  });
});
```

---

## 📊 Test Data Management

### **Test Factories**

```typescript
// src/test/factories/lead.factory.ts
import { faker } from '@faker-js/faker';

export class LeadFactory {
  static createValidLead(overrides = {}) {
    return {
      property_address: faker.location.streetAddress(),
      owner_name: faker.person.fullName(),
      owner_phone: faker.phone.number(),
      owner_email: faker.internet.email(),
      property_value: faker.number.int({ min: 50000, max: 500000 }),
      asking_price: faker.number.int({ min: 30000, max: 400000 }),
      lead_score: faker.number.int({ min: 0, max: 100 }),
      qualification_probability: faker.number.float({ min: 0, max: 1 }),
      status: 'new',
      source: faker.helpers.arrayElement(['web', 'referral', 'cold-call']),
      tenant_id: faker.string.uuid(),
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      ...overrides
    };
  }

  static createInvalidLead() {
    return {
      property_address: '',
      owner_name: '',
      owner_phone: 'invalid-phone',
      owner_email: 'invalid-email',
      property_value: -1000,
      asking_price: 'not-a-number'
    };
  }

  static createLeadWithStatus(status: string, overrides = {}) {
    return this.createValidLead({
      status,
      ...overrides
    });
  }

  static createHighValueLead(overrides = {}) {
    return this.createValidLead({
      property_value: faker.number.int({ min: 200000, max: 500000 }),
      asking_price: faker.number.int({ min: 150000, max: 400000 }),
      lead_score: faker.number.int({ min: 80, max: 100 }),
      ...overrides
    });
  }
}
```

```typescript
// src/test/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export class UserFactory {
  static createUser(overrides = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      roles: ['USER'],
      tenant_id: faker.string.uuid(),
      status: 'active',
      lastLogin: faker.date.recent(),
      mfa_enabled: false,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      },
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      ...overrides
    };
  }

  static createAdminUser(overrides = {}) {
    return this.createUser({
      roles: ['ADMIN'],
      ...overrides
    });
  }

  static createInactiveUser(overrides = {}) {
    return this.createUser({
      status: 'inactive',
      ...overrides
    });
  }
}
```

### **Test Utilities**

```typescript
// src/test/utils/auth.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserFactory } from '../factories/user.factory';

export async function getAuthToken(
  app: INestApplication, 
  tenantId = 'test-tenant'
): Promise<string> {
  const user = UserFactory.createUser({ tenant_id: tenantId });

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: user.email,
      password: 'test-password'
    })
    .expect(200);

  return response.body.access_token;
}

export async function createAuthenticatedUser(
  app: INestApplication,
  role = 'USER',
  tenantId = 'test-tenant'
) {
  const user = UserFactory.createUser({ 
    roles: [role], 
    tenant_id: tenantId 
  });

  const token = await getAuthToken(app, tenantId);

  return { user, token };
}
```

---

## 🚀 CI/CD Integration

### **GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand(\"ping\").ok'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:e2e

  micro-app-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [lead-management, analytics, dashboard]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:micro-app:${{ matrix.app }}
      - run: npm run test:federation:${{ matrix.app }}

  cross-app-integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:cross-app-integration

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:performance

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:security
      - run: npm audit
      - run: npm run security:scan
```

---

## 📈 Test Metrics & Reporting

### **Coverage Reporting**

```typescript
// jest.config.js with coverage
module.exports = {
  // ... other config
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/test/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/modules/leads/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/modules/auth/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: 'coverage'
};
```

### **Performance Monitoring**

```typescript
// src/test/performance/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      this.metrics.get(operation)!.push(duration);
    };
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMaxTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    return Math.max(...times, 0);
  }

  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      operations: {},
      summary: {
        totalOperations: this.metrics.size,
        averageResponseTime: 0,
        maxResponseTime: 0
      }
    };

    let totalTime = 0;
    let maxTime = 0;

    for (const [operation, times] of this.metrics) {
      const avgTime = this.getAverageTime(operation);
      const maxOpTime = this.getMaxTime(operation);
      
      report.operations[operation] = {
        averageTime: avgTime,
        maxTime: maxOpTime,
        callCount: times.length
      };

      totalTime += avgTime;
      maxTime = Math.max(maxTime, maxOpTime);
    }

    report.summary.averageResponseTime = totalTime / this.metrics.size;
    report.summary.maxResponseTime = maxTime;

    return report;
  }
}
```

---

**This implementation guide provides practical, actionable steps for implementing comprehensive testing across the DealCycle CRM platform, ensuring high quality and reliable software delivery.** 