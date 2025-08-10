/**
 * Settings Test Suite - Comprehensive Testing Framework
 * 
 * This file provides a unified testing framework for all settings components,
 * including test utilities, mock data, and integration test helpers.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Test utilities for settings components
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Mock data for settings testing
export const mockUserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  title: 'Sales Manager',
  department: 'Sales',
  phone: '+1-555-0123',
  avatar: 'https://example.com/avatar.jpg',
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: false,
      sms: true,
      frequency: 'daily'
    }
  }
};

export const mockSystemSettings = {
  company: {
    name: 'DealCycle CRM',
    logo: 'https://example.com/logo.png',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e'
  },
  features: {
    aiEnabled: true,
    automationEnabled: true,
    analyticsEnabled: true,
    communicationsEnabled: true
  },
  security: {
    mfaRequired: true,
    sessionTimeout: 3600,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  }
};

export const mockOrganizationalStructure = {
  departments: [
    {
      id: 'dept-1',
      name: 'Sales',
      manager: 'user-123',
      members: ['user-123', 'user-124', 'user-125'],
      permissions: ['leads:read', 'leads:write', 'deals:read']
    },
    {
      id: 'dept-2',
      name: 'Marketing',
      manager: 'user-126',
      members: ['user-126', 'user-127'],
      permissions: ['leads:read', 'campaigns:read', 'campaigns:write']
    }
  ],
  roles: [
    {
      id: 'role-1',
      name: 'Sales Manager',
      permissions: ['leads:read', 'leads:write', 'deals:read', 'deals:write', 'team:manage'],
      inheritsFrom: ['role-2']
    },
    {
      id: 'role-2',
      name: 'Sales Representative',
      permissions: ['leads:read', 'leads:write', 'deals:read']
    }
  ]
};

// Test helpers for common settings interactions
export const fillProfileForm = async (data: Partial<typeof mockUserProfile>) => {
  if (data.firstName) {
    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: data.firstName } });
  }
  
  if (data.lastName) {
    const lastNameInput = screen.getByLabelText(/last name/i);
    fireEvent.change(lastNameInput, { target: { value: data.lastName } });
  }
  
  if (data.email) {
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: data.email } });
  }
  
  if (data.phone) {
    const phoneInput = screen.getByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { value: data.phone } });
  }
  
  if (data.title) {
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: data.title } });
  }
  
  if (data.department) {
    const departmentInput = screen.getByLabelText(/department/i);
    fireEvent.change(departmentInput, { target: { value: data.department } });
  }
};

export const configureNotificationPreferences = async (preferences: any) => {
  if (preferences.email !== undefined) {
    const emailToggle = screen.getByLabelText(/email notifications/i);
    if (preferences.email !== emailToggle.checked) {
      fireEvent.click(emailToggle);
    }
  }
  
  if (preferences.push !== undefined) {
    const pushToggle = screen.getByLabelText(/push notifications/i);
    if (preferences.push !== pushToggle.checked) {
      fireEvent.click(pushToggle);
    }
  }
  
  if (preferences.sms !== undefined) {
    const smsToggle = screen.getByLabelText(/sms notifications/i);
    if (preferences.sms !== smsToggle.checked) {
      fireEvent.click(smsToggle);
    }
  }
  
  if (preferences.frequency) {
    const frequencySelect = screen.getByLabelText(/notification frequency/i);
    fireEvent.mouseDown(frequencySelect);
    const option = screen.getByText(new RegExp(preferences.frequency, 'i'));
    fireEvent.click(option);
  }
};

export const configureSecuritySettings = async (settings: any) => {
  if (settings.mfaEnabled !== undefined) {
    const mfaToggle = screen.getByLabelText(/two-factor authentication/i);
    if (settings.mfaEnabled !== mfaToggle.checked) {
      fireEvent.click(mfaToggle);
    }
  }
  
  if (settings.sessionTimeout) {
    const timeoutInput = screen.getByLabelText(/session timeout/i);
    fireEvent.change(timeoutInput, { target: { value: settings.sessionTimeout } });
  }
  
  if (settings.passwordPolicy) {
    const policy = settings.passwordPolicy;
    if (policy.minLength) {
      const minLengthInput = screen.getByLabelText(/minimum length/i);
      fireEvent.change(minLengthInput, { target: { value: policy.minLength } });
    }
    
    if (policy.requireUppercase !== undefined) {
      const uppercaseToggle = screen.getByLabelText(/require uppercase/i);
      if (policy.requireUppercase !== uppercaseToggle.checked) {
        fireEvent.click(uppercaseToggle);
      }
    }
  }
};

// Validation testing helpers
export const testFormValidation = async (formData: any, expectedErrors: string[]) => {
  // Fill form with invalid data
  await fillProfileForm(formData);
  
  // Submit form
  const submitButton = screen.getByRole('button', { name: /save|update|submit/i });
  fireEvent.click(submitButton);
  
  // Check for expected error messages
  for (const error of expectedErrors) {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(error, 'i'))).toBeInTheDocument();
    });
  }
};

// Performance testing helpers
export const measureComponentRenderTime = async (component: React.ReactElement) => {
  const startTime = performance.now();
  
  renderWithProviders(component);
  
  await waitFor(() => {
    expect(screen.getByTestId('settings-container')).toBeInTheDocument();
  });
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  // Assert render time is within acceptable limits
  expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
  
  return renderTime;
};

// Accessibility testing helpers
export const testAccessibility = async (component: React.ReactElement) => {
  const { container } = renderWithProviders(component);
  
  // Test keyboard navigation
  const firstFocusableElement = container.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusableElement) {
    (firstFocusableElement as HTMLElement).focus();
    expect(firstFocusableElement).toHaveFocus();
  }
  
  // Test ARIA labels
  const formElements = container.querySelectorAll('input, select, textarea');
  formElements.forEach(element => {
    const hasLabel = element.hasAttribute('aria-label') || 
                    element.hasAttribute('aria-labelledby') ||
                    element.closest('label') !== null;
    expect(hasLabel).toBe(true);
  });
  
  // Test color contrast (basic check)
  const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
  textElements.forEach(element => {
    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    const color = style.color;
    
    // Basic contrast check - in real testing, use a proper contrast checker
    expect(backgroundColor).not.toBe(color);
  });
};

// Integration testing helpers
export const testSettingsIntegration = async (component: React.ReactElement, mockApi: any) => {
  // Mock API calls
  jest.spyOn(global, 'fetch').mockImplementation(mockApi);
  
  renderWithProviders(component);
  
  // Test that component loads with data
  await waitFor(() => {
    expect(screen.getByTestId('settings-container')).toBeInTheDocument();
  });
  
  // Test that settings are applied
  const saveButton = screen.getByRole('button', { name: /save/i });
  fireEvent.click(saveButton);
  
  // Verify API call was made
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });
  
  // Clean up
  jest.restoreAllMocks();
};

// Export test suite configuration
export const settingsTestConfig = {
  timeout: 10000,
  retries: 2,
  coverage: {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90
  }
};

// Test data factories
export const createMockUser = (overrides: Partial<typeof mockUserProfile> = {}) => ({
  ...mockUserProfile,
  ...overrides
});

export const createMockSystemSettings = (overrides: Partial<typeof mockSystemSettings> = {}) => ({
  ...mockSystemSettings,
  ...overrides
});

export const createMockOrganizationalStructure = (overrides: Partial<typeof mockOrganizationalStructure> = {}) => ({
  ...mockOrganizationalStructure,
  ...overrides
});
