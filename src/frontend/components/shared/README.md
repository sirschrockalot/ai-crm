# Shared Component Library

This directory contains the shared component library for the Presidential Digs CRM monolithic frontend application. All components, hooks, utilities, and types are designed to be reusable across all features.

## 📁 Directory Structure

```
shared/
├── index.ts                 # Main export file
├── SharedComponents.tsx     # Reusable UI components
├── SharedHooks.ts          # Custom React hooks
├── SharedUtils.ts          # Utility functions
├── SharedTypes.ts          # TypeScript types and interfaces
└── README.md               # This documentation
```

## 🧩 Components

### UI Components

#### Buttons
- `PrimaryButton` - Primary action button with brand colors
- `SecondaryButton` - Secondary action button with outline style
- `DangerButton` - Destructive action button with red styling
- `IconButton` - Button with icon and optional text

#### Cards
- `InfoCard` - Standard information display card
- `ActionCard` - Card with header actions

#### Forms
- `FormField` - Wrapper for form inputs with label and error handling
- `TextInput` - Text input with label and validation
- `SelectInput` - Select dropdown with options

#### Status & Feedback
- `StatusBadge` - Status indicator with color coding
- `LoadingSpinner` - Loading indicator
- `LoadingSkeleton` - Skeleton loading state
- `SuccessAlert` - Success message alert
- `ErrorAlert` - Error message alert
- `WarningAlert` - Warning message alert

#### Layout
- `PageHeader` - Page title with subtitle and actions
- `SectionHeader` - Section title with subtitle and actions

#### Data Display
- `MetricCard` - Metric display with value and change indicator
- `EmptyState` - Empty state with title, description, and action
- `ActionButtons` - Standard action button group

## 🪝 Hooks

### API & Data
- `useSharedApi` - API request handling with loading and error states
- `useSharedForm` - Form state management with validation
- `useSharedState` - Generic state management

### Navigation & UI
- `useSharedNavigation` - Navigation utilities
- `useSharedPagination` - Pagination state management
- `useSharedSearch` - Search functionality
- `useSharedModal` - Modal state management
- `useSharedLoading` - Loading state management

## 🛠️ Utilities

### Date & Time
- `formatDate` - Format dates with various patterns
- `formatDateTime` - Format date and time
- `formatRelativeTime` - Human-readable relative time

### String & Text
- `capitalize` - Capitalize first letter
- `truncate` - Truncate text to specified length
- `slugify` - Convert string to URL-friendly slug

### Numbers & Currency
- `formatCurrency` - Format numbers as currency
- `formatNumber` - Format numbers with decimal places
- `formatPercentage` - Format numbers as percentages

### Arrays & Objects
- `groupBy` - Group array items by key
- `sortBy` - Sort array by key
- `unique` - Remove duplicates from array
- `pick` - Pick specific properties from object
- `omit` - Omit specific properties from object
- `deepClone` - Deep clone objects

### Validation
- `isValidEmail` - Email validation
- `isValidPhone` - Phone number validation
- `isValidUrl` - URL validation
- `isRequired` - Required field validation

### Storage
- `getLocalStorage` - Get item from localStorage
- `setLocalStorage` - Set item in localStorage
- `removeLocalStorage` - Remove item from localStorage

### URL & Query Parameters
- `getQueryParam` - Get query parameter from URL
- `setQueryParam` - Set query parameter in URL
- `removeQueryParam` - Remove query parameter from URL

### Performance
- `debounce` - Debounce function calls
- `throttle` - Throttle function calls

### Error Handling
- `getErrorMessage` - Extract error message from error object
- `isNetworkError` - Check if error is network-related

### Colors
- `hexToRgb` - Convert hex color to RGB
- `getContrastColor` - Get contrasting color for background

## 📝 Types

### Base Types
- `BaseEntity` - Base entity with id and timestamps
- `User` - User entity with role and status
- `Tenant` - Tenant entity with settings

### Enums
- `UserRole` - User role enumeration
- `UserStatus` - User status enumeration
- `TenantStatus` - Tenant status enumeration
- `LeadStatus` - Lead status enumeration
- `LeadSource` - Lead source enumeration
- `CommunicationType` - Communication type enumeration
- `AutomationTrigger` - Automation trigger enumeration
- `AutomationAction` - Automation action enumeration
- `NotificationType` - Notification type enumeration

### Settings & Configuration
- `TenantSettings` - Tenant configuration settings
- `FeatureFlags` - Feature flag configuration
- `IntegrationSettings` - Integration configuration
- `NotificationSettings` - Notification preferences
- `SecuritySettings` - Security configuration

### API & Data
- `ApiResponse` - Standard API response format
- `PaginationInfo` - Pagination metadata
- `ApiError` - API error format

### Forms & UI
- `FormField` - Form field configuration
- `SelectOption` - Select dropdown option
- `ValidationRule` - Form validation rule
- `TableColumn` - Table column configuration
- `TableFilters` - Table filter options
- `ChartData` - Chart data structure

### Workflows & Automation
- `Workflow` - Workflow definition
- `WorkflowCondition` - Workflow condition
- `WorkflowAction` - Workflow action

### Analytics
- `AnalyticsMetric` - Analytics metric data
- `AnalyticsChart` - Chart configuration
- `AnalyticsReport` - Analytics report structure

## 🚀 Usage Examples

### Using Components

```tsx
import { 
  PrimaryButton, 
  InfoCard, 
  StatusBadge,
  PageHeader 
} from '@/components/shared';

function MyPage() {
  return (
    <div>
      <PageHeader 
        title="My Page" 
        subtitle="Page description"
        actions={<PrimaryButton>Add New</PrimaryButton>}
      />
      
      <InfoCard title="Information">
        <StatusBadge status="active" />
        <p>Content goes here</p>
      </InfoCard>
    </div>
  );
}
```

### Using Hooks

```tsx
import { 
  useSharedApi, 
  useSharedForm,
  useSharedPagination 
} from '@/components/shared';

function MyComponent() {
  const { loading, error, executeRequest } = useSharedApi();
  const { values, handleChange, handleSubmit } = useSharedForm({
    name: '',
    email: ''
  });
  const { currentPage, totalPages, goToPage } = useSharedPagination();

  const handleSave = async () => {
    await executeRequest(
      () => api.saveData(values),
      { 
        showToast: true, 
        successMessage: 'Data saved successfully' 
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      {/* Form fields */}
    </form>
  );
}
```

### Using Utilities

```tsx
import { 
  formatDate, 
  formatCurrency,
  isValidEmail,
  debounce 
} from '@/components/shared';

// Format dates
const formattedDate = formatDate('2024-01-15', 'MMM dd, yyyy');

// Format currency
const formattedPrice = formatCurrency(1234.56);

// Validate email
const isValid = isValidEmail('user@example.com');

// Debounce function
const debouncedSearch = debounce((query) => {
  // Perform search
}, 300);
```

## 🎨 Design System

All components follow the Chakra UI design system with custom theme configuration:

- **Colors**: Primary, secondary, and semantic colors
- **Typography**: Inter font family with consistent sizing
- **Spacing**: 8px base unit system
- **Breakpoints**: Responsive design breakpoints
- **Components**: Consistent component variants and sizes

## 📋 Best Practices

1. **Import from shared library**: Always import components from the shared library
2. **Use TypeScript**: All components are fully typed
3. **Follow naming conventions**: Use PascalCase for components, camelCase for functions
4. **Handle errors gracefully**: Use error boundaries and proper error handling
5. **Optimize performance**: Use React.memo and useMemo where appropriate
6. **Accessibility**: All components include proper ARIA attributes
7. **Responsive design**: Components work across all screen sizes

## 🔧 Development

### Adding New Components

1. Create the component in the appropriate file
2. Add proper TypeScript types
3. Include JSDoc documentation
4. Add to the export list
5. Update this README

### Testing

All shared components should have:
- Unit tests for functionality
- Integration tests for user interactions
- Accessibility tests
- Visual regression tests

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with tree shaking
- Use lazy loading for large components

## 📚 Additional Resources

- [Chakra UI Documentation](https://chakra-ui.com/)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Design System Guidelines](./design-system.md)
