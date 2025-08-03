# 🏗️ Frontend Architecture Document - DealCycle CRM

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Frontend Architecture Specification |
| **Project** | DealCycle CRM |
| **Version** | 3.0 |
| **Last Updated** | 2024-12-19 |
| **Owner** | Architect Agent |
| **Status** | Updated |

---

## 🔄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-19 | 3.0 | Updated to DealCycle CRM with modern design system and role-based dashboards | Architect Agent |
| 2024-12-19 | 2.0 | Complete micro frontend architecture with Chakra UI | Architect Agent |

---

## 🎯 Template and Framework Selection

### **Selected Architecture: Modern Monolithic with Component-Based Design**

**Framework Strategy:**
- **Main Application**: Next.js 14+ (App Router)
- **Styling**: Chakra UI with custom design system
- **State Management**: Zustand + React Query
- **Real-time**: WebSocket integration
- **Containerization**: Docker with microservices backend

**Rationale:**
- **Simplicity**: Single codebase reduces complexity and deployment overhead
- **Performance**: Optimized bundle with code splitting and lazy loading
- **Brand Consistency**: Shared design system across all components
- **Developer Experience**: Easier debugging and state management
- **Cost Efficiency**: Reduced infrastructure and maintenance costs
- **Feature Flags**: Comprehensive feature flag system for safe deployments

---

## 🛠️ Frontend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Framework** | Next.js | 14+ | Main Application | SSR/SSG, built-in routing, excellent DX |
| **Language** | TypeScript | 5+ | Type Safety | Complex CRM data models, team collaboration |
| **Styling** | Chakra UI | 3+ | Component Library | Accessibility, theme system, customization |
| **State Management** | Zustand | 4+ | Client State | Lightweight, simple API, perfect for React |
| **Server State** | React Query | 5+ | API State | Caching, synchronization, real-time updates |
| **Forms** | React Hook Form + Zod | Latest | Form Management | Type-safe forms, validation, performance |
| **Charts** | Recharts | Latest | Data Visualization | Responsive charts, customization, accessibility |
| **Real-time** | WebSocket | Native | Real-time Communication | Live updates, event-driven architecture |
| **Testing** | Jest + RTL | Latest | Unit Testing | Component testing, mocking capabilities |
| **E2E Testing** | Playwright | Latest | End-to-End | Cross-browser, reliable automation |
| **Containerization** | Docker | Latest | Deployment | Consistent environments, scalability |
| **Error Tracking** | Custom + Sentry | Latest | Monitoring | Centralized error management |
| **Feature Flags** | Custom + Redis | Latest | Feature Management | Safe deployments, gradual rollouts |
| **Design System** | Custom on Chakra UI | 1.0 | UI Consistency | Brand alignment, component reusability |

---

## 📁 Project Structure

```
/dealcycle-crm
├── frontend/                        # Next.js Main Application
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
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── AuthGuard.tsx
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
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── backend/                         # NestJS Backend
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── nginx/
│   │       └── nginx.conf
│   └── scripts/
│       ├── build.sh
│       ├── deploy.sh
│       └── health-check.sh
└── docs/
    ├── api/
    ├── deployment/
    └── development/
```

---

## 🧩 Component Standards

### **Component Template**

```typescript
// Example: LeadCard component
import React from 'react';
import { Box, Card, Text, Badge, Button } from '@chakra-ui/react';
import { Lead } from '../types/lead';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const handleEdit = () => {
    onEdit(lead);
  };

  const handleDelete = () => {
    onDelete(lead.id);
  };

  return (
    <Card p={4} shadow="md" borderWidth="1px" _hover={{ shadow: 'lg' }}>
      <Box>
        <Text fontSize="lg" fontWeight="bold">
          {lead.propertyAddress}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {lead.ownerName}
        </Text>
        <Badge colorScheme={lead.status === 'active' ? 'green' : 'gray'}>
          {lead.status}
        </Badge>
      </Box>
      
      <Box mt={4} display="flex" gap={2}>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={handleEdit}
          isLoading={isLoading}
        >
          Edit
        </Button>
        <Button
          size="sm"
          colorScheme="red"
          onClick={handleDelete}
          isLoading={isLoading}
        >
          Delete
        </Button>
      </Box>
    </Card>
  );
};
```

### **Naming Conventions**

**Components:**
- Use PascalCase: `LeadCard`, `UserProfile`, `NavigationMenu`
- Suffix with type: `LeadCard.tsx`, `UserProfile.tsx`
- Group related components in folders: `leads/`, `users/`, `navigation/`

**Files:**
- Use kebab-case for utilities: `api-service.ts`, `validation-helpers.ts`
- Use camelCase for stores: `leadStore.ts`, `authStore.ts`
- Use PascalCase for types: `Lead.ts`, `User.ts`

**Services:**
- Suffix with Service: `LeadService`, `AuthService`, `WebSocketService`
- Use camelCase for methods: `getLeads()`, `createLead()`, `updateLead()`

**Constants:**
- Use UPPER_SNAKE_CASE: `API_ENDPOINTS`, `USER_ROLES`, `ERROR_MESSAGES`

---

## 🗂️ State Management

### **Store Structure**

```
stores/
├── authStore.ts          # Authentication state
├── navigationStore.ts    # Navigation state
├── globalStore.ts        # Global app state
└── moduleStores/         # Module-specific stores
    ├── leadStore.ts
    ├── buyerStore.ts
    ├── communicationStore.ts
    ├── dashboardStore.ts
    └── settingsStore.ts
```

### **State Management Template**

```typescript
// Example: Lead Store
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Lead, CreateLeadDto, UpdateLeadDto } from '../types/lead';
import { leadService } from '../services/leadService';

interface LeadState {
  // State
  leads: Lead[];
  currentLead: Lead | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchLeads: () => Promise<void>;
  createLead: (lead: CreateLeadDto) => Promise<void>;
  updateLead: (id: string, updates: UpdateLeadDto) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  setCurrentLead: (lead: Lead | null) => void;
  clearError: () => void;
}

export const useLeadStore = create<LeadState>()(
  devtools(
    (set, get) => ({
      // Initial state
      leads: [],
      currentLead: null,
      loading: false,
      error: null,

      // Actions
      fetchLeads: async () => {
        set({ loading: true, error: null });
        try {
          const leads = await leadService.getLeads();
          set({ leads, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch leads',
            loading: false 
          });
        }
      },

      createLead: async (lead: CreateLeadDto) => {
        set({ loading: true, error: null });
        try {
          const newLead = await leadService.createLead(lead);
          set(state => ({
            leads: [...state.leads, newLead],
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create lead',
            loading: false 
          });
        }
      },

      updateLead: async (id: string, updates: UpdateLeadDto) => {
        set({ loading: true, error: null });
        try {
          const updatedLead = await leadService.updateLead(id, updates);
          set(state => ({
            leads: state.leads.map(lead => 
              lead.id === id ? updatedLead : lead
            ),
            currentLead: state.currentLead?.id === id ? updatedLead : state.currentLead,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update lead',
            loading: false 
          });
        }
      },

      deleteLead: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await leadService.deleteLead(id);
          set(state => ({
            leads: state.leads.filter(lead => lead.id !== id),
            currentLead: state.currentLead?.id === id ? null : state.currentLead,
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete lead',
            loading: false 
          });
        }
      },

      setCurrentLead: (lead: Lead | null) => {
        set({ currentLead: lead });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'lead-store',
    }
  )
);
```

---

## 🔌 API Integration

### **Service Template**

```typescript
// Example: Lead Service
import { API_BASE_URL } from '../utils/constants';
import { Lead, CreateLeadDto, UpdateLeadDto } from '../types/lead';
import { tokenManager } from '../auth/tokenManager';

class LeadService {
  private baseUrl: string;
  private tokenManager: typeof tokenManager;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/leads`;
    this.tokenManager = tokenManager;
  }

  private getHeaders(): HeadersInit {
    const token = this.tokenManager.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getLeads(): Promise<Lead[]> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Lead[]>(response);
  }

  async getLead(id: string): Promise<Lead> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Lead>(response);
  }

  async createLead(lead: CreateLeadDto): Promise<Lead> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(lead),
    });
    return this.handleResponse<Lead>(response);
  }

  async updateLead(id: string, updates: UpdateLeadDto): Promise<Lead> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse<Lead>(response);
  }

  async deleteLead(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
}

export const leadService = new LeadService();
```

### **API Client Configuration**

```typescript
// shared/api/client.ts
import { tokenManager } from '../auth/tokenManager';
import { ErrorTracker } from '../monitoring/errorTracker';

class ApiClient {
  private baseUrl: string;
  private tokenManager: typeof tokenManager;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.tokenManager = tokenManager;
  }

  private getHeaders(): HeadersInit {
    const token = this.tokenManager.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      ErrorTracker.getInstance().captureError(error as Error, {
        module: 'api-client',
        endpoint,
        method: options.method || 'GET',
      });
      throw error;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || '');
```

---

## 🛣️ Routing

### **Route Configuration**

```typescript
// frontend/src/pages/_app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../components/auth/AuthProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { WebSocketProvider } from '../components/realtime/WebSocketProvider';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <Component {...pageProps} />
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
```

```typescript
// frontend/src/pages/leads/index.tsx
import { Suspense } from 'react';
import { LeadList } from '../../components/features/leads/LeadList';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function LeadsPage() {
  return (
    <AuthGuard requiredPermissions={['leads:read']}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage your real estate leads</p>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <LeadList />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
```

---

## 🎨 Styling Guidelines

### **Styling Approach**

**Chakra UI with Custom Design System:**
- Use Chakra UI components as base
- Extend with custom design tokens
- Implement consistent spacing and typography
- Support dark mode and accessibility
- Use feature flags for safe component rollouts

### **Design System Configuration**

```typescript
// src/theme/index.ts
import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      900: '#1E3A8A',
    },
    secondary: {
      50: '#F3E8FF',
      100: '#EDE9FE',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      900: '#5B21B6',
    },
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      900: '#064E3B',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      900: '#92400E',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      900: '#7F1D1D',
    },
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      900: '#0F172A',
    }
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Card: {
      baseStyle: {
        container: {
          shadow: 'md',
          borderRadius: 'lg',
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});
```

---

## 🧪 Testing Requirements

### **Component Test Template**

```typescript
// Example: LeadCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadCard } from './LeadCard';

const mockLead = {
  id: '1',
  propertyAddress: '123 Main St',
  ownerName: 'John Doe',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const renderComponent = (component: React.ReactElement) => {
  return render(component);
};

describe('LeadCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders lead information correctly', () => {
    renderComponent(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    renderComponent(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockLead);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderComponent(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockLead.id);
  });

  it('shows loading state when isLoading is true', () => {
    renderComponent(
      <LeadCard
        lead={mockLead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );

    const editButton = screen.getByText('Edit');
    const deleteButton = screen.getByText('Delete');
    
    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});
```

### **Testing Best Practices**

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test critical user flows (using Playwright)
4. **Coverage Goals**: Aim for 80% code coverage
5. **Test Structure**: Arrange-Act-Assert pattern
6. **Mock External Dependencies**: API calls, routing, state management

---

## ⚙️ Environment Configuration

### **Required Environment Variables**

**Main Application:**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_APP_NAME=DealCycle CRM
NEXT_PUBLIC_VERSION=1.0.0

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External Services
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your-twilio-sid
NEXT_PUBLIC_AI_API_KEY=your-ai-api-key

# Feature Flags
NEXT_PUBLIC_ENABLE_AUTOMATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

---

## 👨‍💻 Frontend Developer Standards

### **Critical Coding Rules**

1. **TypeScript Strict Mode**: Always use strict TypeScript configuration
2. **Component Composition**: Prefer composition over inheritance
3. **State Management**: Use Zustand for client state, React Query for server state
4. **Error Boundaries**: Wrap all modules with error boundaries
5. **Loading States**: Always provide loading and error states
6. **Accessibility**: Use semantic HTML and ARIA attributes
7. **Performance**: Implement lazy loading and code splitting
8. **Testing**: Write tests for all components and utilities
9. **Documentation**: Document complex components and utilities
10. **Consistency**: Follow established patterns and conventions

### **Quick Reference**

**Common Commands:**
```bash
# Main application
cd frontend && npm run dev
cd frontend && npm run build
cd frontend && npm run test

# Backend
cd backend && npm run dev
cd backend && npm run build
cd backend && npm run test

# Docker
docker-compose up -d
docker-compose down

# Development
npm run lint
npm run type-check
npm run storybook
```

**Key Import Patterns:**
```typescript
// Components
import { Button, Input, Modal, Card, Badge } from '../ui';
import { LeadCard } from '../components/features/leads/LeadCard';

// Hooks
import { useLeadStore } from '../stores/leadStore';
import { useQuery, useMutation } from '@tanstack/react-query';

// Services
import { leadService } from '../services/leadService';

// Types
import { Lead, CreateLeadDto } from '../types/leads';

// Utils
import { formatCurrency, validateEmail } from '../utils/formatting';
```

**File Naming Conventions:**
- Components: `PascalCase.tsx` (e.g., `LeadCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useLeads.ts`)
- Services: `camelCase.ts` (e.g., `leadService.ts`)
- Types: `PascalCase.ts` (e.g., `Lead.ts`)
- Utils: `camelCase.ts` (e.g., `formatHelpers.ts`)

**Project-Specific Patterns:**
- Use TailwindCSS utility classes consistently
- Implement error boundaries for all features
- Use React Query for API state management
- Follow the established folder structure
- Use the shared UI components from the design system
- Implement proper loading and error states
- Use TypeScript for all new code
- Write tests for all components and utilities
- Use Headless UI for accessible component primitives
- Follow the established color palette and typography

---

## 🚀 Deployment Architecture

### **Docker Configuration**

**Frontend Application Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **Docker Compose**

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3002/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/dealcycle
      - JWT_SECRET=your-jwt-secret
      - TWILIO_ACCOUNT_SID=your-twilio-sid
      - TWILIO_AUTH_TOKEN=your-twilio-token
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=dealcycle

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  mongo_data:
  redis_data:
```

---

## 📊 Monitoring and Observability

### **Error Tracking**

```typescript
// shared/monitoring/errorTracker.ts
export class ErrorTracker {
  private static instance: ErrorTracker;

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  captureError(error: Error, context: {
    module: string;
    component?: string;
    userId?: string;
    tenantId?: string;
  }): void {
    // Send to centralized error tracking service
    console.error('Error captured:', {
      error: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  captureModuleError(moduleName: string, error: Error): void {
    this.captureError(error, { module: moduleName });
  }

  captureApiError(endpoint: string, error: Error, method: string): void {
    this.captureError(error, { 
      module: 'api',
      component: endpoint,
      method 
    });
  }
}
```

### **Performance Monitoring**

```typescript
// shared/monitoring/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  measureModuleLoad(moduleName: string): void {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      console.log(`Module ${moduleName} loaded in ${loadTime}ms`);
      
      // Send to monitoring service
      this.sendMetric('module_load_time', {
        module: moduleName,
        loadTime,
        timestamp: new Date().toISOString(),
      });
    };
  }

  measureApiCall(endpoint: string, method: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const responseTime = performance.now() - startTime;
      
      this.sendMetric('api_response_time', {
        endpoint,
        method,
        responseTime,
        timestamp: new Date().toISOString(),
      });
    };
  }

  private sendMetric(metricName: string, data: any): void {
    // Send to monitoring service
    console.log(`Metric: ${metricName}`, data);
  }
}
```

---

## 🔒 Security Implementation

### **Authentication & Authorization**

```typescript
// shared/auth/guards.ts
import { useAuth } from './useAuth';

interface ModuleGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  fallback?: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  children,
  requiredPermissions,
  fallback = <AccessDenied />
}) => {
  const { user, permissions } = useAuth();
  
  if (!user) {
    return <LoginRedirect />;
  }

  const hasPermission = requiredPermissions.every(
    permission => permissions.includes(permission)
  );

  if (!hasPermission) {
    return fallback;
  }

  return <>{children}</>;
};
```

### **CORS Configuration**

```typescript
// host/next.config.js
const allowedOrigins = [
  'http://localhost:3001', // leads module
  'http://localhost:3002', // buyers module
  'http://localhost:3003', // communications module
  'http://localhost:3004', // dashboard module
  'http://localhost:3005', // settings module
];

module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(','),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};
```

---

## 📈 Future Considerations

### **Scalability Plans**

1. **Module Federation Optimization**
   - Implement dynamic module loading based on user permissions
   - Add module versioning and backward compatibility
   - Optimize shared dependencies

2. **Performance Enhancements**
   - Implement service workers for offline capabilities
   - Add progressive web app features
   - Optimize bundle sizes with tree shaking

3. **Monitoring Improvements**
   - Integrate with APM tools (New Relic, DataDog)
   - Add real-time performance dashboards
   - Implement user behavior analytics

4. **Security Enhancements**
   - Add rate limiting for API calls
   - Implement content security policy
   - Add security headers and HTTPS enforcement

5. **Testing Expansion**
   - Add visual regression testing
   - Implement contract testing for APIs
   - Add performance testing

---

*This document serves as the comprehensive frontend architecture specification for the Presidential Digs CRM project. It should be updated as the project evolves and new requirements are identified.* 
*This document serves as the comprehensive frontend architecture specification for the Presidential Digs CRM project. It should be updated as the project evolves and new requirements are identified.* 