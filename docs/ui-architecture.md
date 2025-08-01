# 🏗️ Frontend Architecture Document - Presidential Digs CRM

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Frontend Architecture Specification |
| **Project** | Presidential Digs CRM |
| **Version** | 2.0 |
| **Last Updated** | 2024-12-19 |
| **Owner** | Architect Agent |
| **Status** | Draft |

---

## 🔄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-19 | 2.0 | Complete micro frontend architecture with Chakra UI | Architect Agent |

---

## 🎯 Template and Framework Selection

### **Selected Architecture: Micro Frontend with Module Federation**

**Framework Strategy:**
- **Host Application**: Next.js 14+ (App Router)
- **Micro Frontends**: All Next.js applications
- **Styling**: Chakra UI with custom design system
- **State Management**: Zustand + React Query
- **Real-time**: WebSocket integration
- **Containerization**: Docker per module

**Rationale:**
- **Scalability**: Independent teams can work on different modules
- **Maintainability**: Isolated codebases reduce complexity
- **Performance**: Lazy loading and independent deployment
- **Brand Consistency**: Shared design system across modules
- **Fault Tolerance**: Module failures don't break entire application

---

## 🛠️ Frontend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Framework** | Next.js | 14+ | Host & Micro Frontends | SSR/SSG, built-in routing, excellent DX |
| **Language** | TypeScript | 5+ | Type Safety | Complex CRM data models, team collaboration |
| **Styling** | Chakra UI | 3+ | Component Library | Accessibility, theme system, customization |
| **State Management** | Zustand | 4+ | Client State | Lightweight, simple API, perfect for React |
| **Server State** | React Query | 5+ | API State | Caching, synchronization, real-time updates |
| **Module Federation** | @module-federation/nextjs-mf | Latest | Micro Frontend | Runtime module loading, shared dependencies |
| **Real-time** | WebSocket | Native | Cross-module Communication | Live updates, event-driven architecture |
| **Testing** | Jest + RTL | Latest | Unit Testing | Component testing, mocking capabilities |
| **E2E Testing** | Playwright | Latest | End-to-End | Cross-browser, reliable automation |
| **Containerization** | Docker | Latest | Deployment | Consistent environments, scalability |
| **Error Tracking** | Custom + Sentry | Latest | Monitoring | Centralized error management |
| **Design System** | Custom on Chakra UI | 1.0 | UI Consistency | Brand alignment, component reusability |

---

## 📁 Project Structure

```
/presidential-digs-crm
├── host/                           # Next.js Host Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── AuthGuard.tsx
│   │   │   │   └── index.ts
│   │   │   ├── navigation/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   └── index.ts
│   │   │   ├── profile/
│   │   │   │   ├── ProfileForm.tsx
│   │   │   │   ├── UserSettings.tsx
│   │   │   │   └── index.ts
│   │   │   └── layout/
│   │   │       ├── AppLayout.tsx
│   │   │       ├── ModuleContainer.tsx
│   │   │       └── index.ts
│   │   ├── pages/
│   │   │   ├── _app.tsx
│   │   │   ├── index.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── callback.tsx
│   │   │   ├── profile/
│   │   │   │   └── settings.tsx
│   │   │   └── modules/
│   │   │       ├── leads/
│   │   │       ├── buyers/
│   │   │       ├── communications/
│   │   │       ├── dashboard/
│   │   │       └── settings/
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── navigationStore.ts
│   │   │   └── globalStore.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── websocketService.ts
│   │   │   └── errorTrackingService.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── types.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   ├── next.config.js
│   ├── package.json
│   └── Dockerfile
├── micro-frontends/
│   ├── leads/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── LeadList.tsx
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   ├── LeadPipeline.tsx
│   │   │   │   └── LeadDetail.tsx
│   │   │   ├── pages/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── new.tsx
│   │   │   ├── stores/
│   │   │   │   └── leadStore.ts
│   │   │   ├── services/
│   │   │   │   └── leadService.ts
│   │   │   └── types/
│   │   │       └── lead.ts
│   │   ├── webpack.config.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── buyers/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── BuyerList.tsx
│   │   │   │   ├── BuyerCard.tsx
│   │   │   │   ├── BuyerForm.tsx
│   │   │   │   └── BuyerMatching.tsx
│   │   │   ├── pages/
│   │   │   ├── stores/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── webpack.config.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── communications/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── SMSInterface.tsx
│   │   │   │   ├── CallLog.tsx
│   │   │   │   ├── CommunicationHistory.tsx
│   │   │   │   └── MessageComposer.tsx
│   │   │   ├── pages/
│   │   │   ├── stores/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── webpack.config.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── dashboard/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── RecentActivity.tsx
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   ├── pages/
│   │   │   ├── stores/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── webpack.config.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── settings/
│       ├── src/
│       │   ├── components/
│       │   │   ├── TeamManagement.tsx
│       │   │   ├── Integrations.tsx
│       │   │   ├── Permissions.tsx
│       │   │   └── SystemSettings.tsx
│       │   ├── pages/
│       │   ├── stores/
│       │   ├── services/
│       │   └── types/
│       ├── webpack.config.js
│       ├── package.json
│       └── Dockerfile
├── shared/
│   ├── design-system/
│   │   ├── packages/
│   │   │   ├── core/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Input/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   ├── Table/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── theme/
│   │   │   │   │   ├── tokens.ts
│   │   │   │   │   ├── colors.ts
│   │   │   │   │   ├── typography.ts
│   │   │   │   │   └── spacing.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── helpers.ts
│   │   │   │   │   └── constants.ts
│   │   │   │   └── package.json
│   │   │   ├── icons/
│   │   │   │   ├── src/
│   │   │   │   └── package.json
│   │   │   └── illustrations/
│   │   │       ├── src/
│   │   │       └── package.json
│   │   ├── storybook/
│   │   │   ├── .storybook/
│   │   │   └── stories/
│   │   └── package.json
│   ├── auth/
│   │   ├── types.ts
│   │   ├── guards.ts
│   │   ├── tokenManager.ts
│   │   └── index.ts
│   ├── realtime/
│   │   ├── websocket.ts
│   │   ├── eventBus.ts
│   │   └── index.ts
│   ├── monitoring/
│   │   ├── errorTracker.ts
│   │   ├── performance.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── index.ts
│   └── utils/
│       ├── validation.ts
│       ├── formatting.ts
│       └── constants.ts
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── nginx/
│   │       └── nginx.conf
│   ├── kubernetes/
│   │   ├── host-deployment.yaml
│   │   ├── leads-deployment.yaml
│   │   ├── buyers-deployment.yaml
│   │   ├── communications-deployment.yaml
│   │   ├── dashboard-deployment.yaml
│   │   ├── settings-deployment.yaml
│   │   └── ingress.yaml
│   └── scripts/
│       ├── build-all.sh
│       ├── deploy-module.sh
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
    <Card p={4} shadow="md" borderWidth="1px">
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
// host/src/pages/_app.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../shared/design-system/theme';
import { AuthProvider } from '../components/auth/AuthProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { WebSocketProvider } from '../components/realtime/WebSocketProvider';

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
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <WebSocketProvider>
              <Component {...pageProps} />
            </WebSocketProvider>
          </AuthProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
```

```typescript
// host/src/pages/modules/leads/index.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { ModuleGuard } from '../../../components/auth/ModuleGuard';

const LeadsModule = dynamic(
  () => import('leads/LeadsModule'),
  {
    loading: () => (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <Spinner size="xl" />
      </Box>
    ),
    ssr: false,
  }
);

export default function LeadsPage() {
  return (
    <ModuleGuard requiredPermissions={['leads:read']}>
      <Suspense fallback={<Spinner />}>
        <LeadsModule />
      </Suspense>
    </ModuleGuard>
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

### **Global Theme Variables**

```css
/* shared/design-system/theme/globals.css */
:root {
  /* Colors */
  --color-primary-50: #E6F3FF;
  --color-primary-100: #CCE7FF;
  --color-primary-500: #2563EB;
  --color-primary-900: #1E3A8A;
  
  --color-secondary-50: #F0F9FF;
  --color-secondary-500: #0EA5E9;
  --color-secondary-900: #0C4A6E;
  
  --color-success-50: #F0FDF4;
  --color-success-500: #22C55E;
  --color-success-900: #14532D;
  
  --color-warning-50: #FFFBEB;
  --color-warning-500: #F59E0B;
  --color-warning-900: #78350F;
  
  --color-error-50: #FEF2F2;
  --color-error-500: #EF4444;
  --color-error-900: #7F1D1D;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Typography */
  --font-family-heading: 'Inter', sans-serif;
  --font-family-body: 'Inter', sans-serif;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

/* Dark mode variables */
[data-theme="dark"] {
  --color-primary-50: #1E3A8A;
  --color-primary-100: #1E40AF;
  --color-primary-500: #3B82F6;
  --color-primary-900: #DBEAFE;
  
  /* ... other dark mode colors */
}
```

---

## 🧪 Testing Requirements

### **Component Test Template**

```typescript
// Example: LeadCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { LeadCard } from './LeadCard';
import { theme } from '../../../shared/design-system/theme';

const mockLead = {
  id: '1',
  propertyAddress: '123 Main St',
  ownerName: 'John Doe',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('LeadCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders lead information correctly', () => {
    renderWithTheme(
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
    renderWithTheme(
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
    renderWithTheme(
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
    renderWithTheme(
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

**Host Application:**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_APP_NAME=Presidential Digs CRM
NEXT_PUBLIC_VERSION=1.0.0

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Module Federation
NEXT_PUBLIC_LEADS_URL=http://localhost:3001
NEXT_PUBLIC_BUYERS_URL=http://localhost:3002
NEXT_PUBLIC_COMMUNICATIONS_URL=http://localhost:3003
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3004
NEXT_PUBLIC_SETTINGS_URL=http://localhost:3005
```

**Micro Frontend Modules:**
```bash
# leads/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002/api/leads
NEXT_PUBLIC_MODULE_NAME=leads
NEXT_PUBLIC_HOST_URL=http://localhost:3000
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
# Host application
cd host && npm run dev
cd host && npm run build
cd host && npm run test

# Micro frontend modules
cd micro-frontends/leads && npm run dev
cd micro-frontends/leads && npm run build
cd micro-frontends/leads && npm run test

# Design system
cd shared/design-system && npm run storybook
cd shared/design-system && npm run build

# Docker
docker-compose up -d
docker-compose down
```

**Key Import Patterns:**
```typescript
// Components
import { Button, Input, Modal } from '@chakra-ui/react';
import { LeadCard } from '../components/LeadCard';

// Hooks
import { useLeadStore } from '../stores/leadStore';
import { useQuery, useMutation } from '@tanstack/react-query';

// Services
import { leadService } from '../services/leadService';

// Types
import { Lead, CreateLeadDto } from '../types/lead';

// Utils
import { formatCurrency, validateEmail } from '../utils/helpers';
```

**File Naming Conventions:**
- Components: `PascalCase.tsx` (e.g., `LeadCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useLeads.ts`)
- Services: `camelCase.ts` (e.g., `leadService.ts`)
- Types: `PascalCase.ts` (e.g., `Lead.ts`)
- Utils: `camelCase.ts` (e.g., `formatHelpers.ts`)

**Project-Specific Patterns:**
- Use Chakra UI components consistently
- Implement error boundaries for all modules
- Use React Query for API state management
- Follow the established folder structure
- Use the shared design system components
- Implement proper loading and error states
- Use TypeScript for all new code
- Write tests for all components and utilities

---

## 🚀 Deployment Architecture

### **Docker Configuration**

**Host Application Dockerfile:**
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

**Micro Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### **Docker Compose**

```yaml
version: '3.8'

services:
  host:
    build: ./host
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3002/api
    depends_on:
      - leads
      - buyers
      - communications
      - dashboard
      - settings

  leads:
    build: ./micro-frontends/leads
    ports:
      - "3001:80"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3002/api/leads

  buyers:
    build: ./micro-frontends/buyers
    ports:
      - "3002:80"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3002/api/buyers

  communications:
    build: ./micro-frontends/communications
    ports:
      - "3003:80"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3002/api/communications

  dashboard:
    build: ./micro-frontends/dashboard
    ports:
      - "3004:80"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3002/api/dashboard

  settings:
    build: ./micro-frontends/settings
    ports:
      - "3005:80"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3002/api/settings

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - host
      - leads
      - buyers
      - communications
      - dashboard
      - settings
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