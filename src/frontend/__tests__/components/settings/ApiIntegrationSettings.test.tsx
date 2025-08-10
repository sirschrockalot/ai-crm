import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import ApiIntegrationSettings from '../../../../components/settings/ApiIntegrationSettings';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getApiSettings: jest.fn(),
    updateApiSettings: jest.fn(),
    getIntegrations: jest.fn(),
    createIntegration: jest.fn(),
    updateIntegration: jest.fn(),
    deleteIntegration: jest.fn(),
    testIntegration: jest.fn(),
    getApiKeys: jest.fn(),
    createApiKey: jest.fn(),
    updateApiKey: jest.fn(),
    deleteApiKey: jest.fn(),
    regenerateApiKey: jest.fn(),
  },
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockApiSettings = {
  rateLimit: {
    enabled: true,
    requestsPerMinute: 1000,
    burstLimit: 100,
  },
  authentication: {
    methods: ['jwt', 'api_key', 'oauth2'],
    jwtExpiry: 3600,
    refreshTokenExpiry: 86400,
    apiKeyExpiry: 2592000,
  },
  cors: {
    enabled: true,
    allowedOrigins: ['https://example.com', 'https://app.example.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  monitoring: {
    enabled: true,
    logLevel: 'info' as const,
    performanceTracking: true,
    errorTracking: true,
  },
};

const mockIntegrations = [
  {
    id: 'int-1',
    name: 'Email Service',
    type: 'email' as const,
    provider: 'SendGrid',
    status: 'active' as const,
    enabled: true,
    lastSync: '2024-01-15T10:30:00Z',
    health: 'healthy' as const,
    config: {
      apiKey: 'sg_123456789',
      fromEmail: 'noreply@example.com',
    },
  },
  {
    id: 'int-2',
    name: 'Payment Gateway',
    type: 'payment' as const,
    provider: 'Stripe',
    status: 'active' as const,
    enabled: true,
    lastSync: '2024-01-15T09:15:00Z',
    health: 'healthy' as const,
    config: {
      secretKey: 'sk_test_123456789',
      publishableKey: 'pk_test_123456789',
    },
  },
];

const mockApiKeys = [
  {
    id: 'key-1',
    name: 'Frontend App',
    key: 'ak_123456789abcdef',
    permissions: ['read:leads', 'write:leads'],
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-15T12:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    status: 'active' as const,
  },
  {
    id: 'key-2',
    name: 'Mobile App',
    key: 'ak_987654321fedcba',
    permissions: ['read:leads', 'read:analytics'],
    createdAt: '2024-01-10T00:00:00Z',
    lastUsed: '2024-01-15T11:30:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    status: 'active' as const,
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('ApiIntegrationSettings', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the API integration settings interface', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('API & Integration Settings')).toBeInTheDocument();
      expect(screen.getByText('API Configuration')).toBeInTheDocument();
      expect(screen.getByText('Integrations')).toBeInTheDocument();
      expect(screen.getByText('API Keys')).toBeInTheDocument();
    });
  });

  it('displays API settings correctly', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3600')).toBeInTheDocument();
      expect(screen.getByDisplayValue('86400')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2592000')).toBeInTheDocument();
    });
  });

  it('displays integrations correctly', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Email Service')).toBeInTheDocument();
      expect(screen.getByText('SendGrid')).toBeInTheDocument();
      expect(screen.getByText('Payment Gateway')).toBeInTheDocument();
      expect(screen.getByText('Stripe')).toBeInTheDocument();
    });
  });

  it('displays API keys correctly', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Frontend App')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.getByText('ak_123456789abcdef')).toBeInTheDocument();
      expect(screen.getByText('ak_987654321fedcba')).toBeInTheDocument();
    });
  });

  it('allows editing API settings', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.updateApiSettings.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('API Configuration')).toBeInTheDocument();
    });

    const rateLimitInput = screen.getByDisplayValue('1000');
    await userEvent.clear(rateLimitInput);
    await userEvent.type(rateLimitInput, '2000');

    const saveButton = screen.getByText('Save API Settings');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.updateApiSettings).toHaveBeenCalledWith({
        ...mockApiSettings,
        rateLimit: {
          ...mockApiSettings.rateLimit,
          requestsPerMinute: 2000,
        },
      });
    });
  });

  it('allows adding new integrations', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.createIntegration.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Integration')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Integration');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Integration Details')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Integration Name');
    const providerInput = screen.getByLabelText('Provider');
    const typeSelect = screen.getByLabelText('Type');

    await userEvent.type(nameInput, 'New Integration');
    await userEvent.type(providerInput, 'New Provider');
    await userEvent.selectOptions(typeSelect, 'analytics');

    const saveButton = screen.getByText('Save Integration');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.createIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Integration',
          provider: 'New Provider',
          type: 'analytics',
        })
      );
    });
  });

  it('allows editing existing integrations', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.updateIntegration.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Email Service')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('Edit integration');
    await userEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Email Service')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Email Service');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Email Service');

    const saveButton = screen.getByText('Save Integration');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.updateIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Email Service',
        })
      );
    });
  });

  it('allows deleting integrations', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.deleteIntegration.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Email Service')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete integration');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Integration')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSettingsService.deleteIntegration).toHaveBeenCalledWith('int-1');
    });
  });

  it('allows testing integrations', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.testIntegration.mockResolvedValue({ success: true, message: 'Test successful' });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Email Service')).toBeInTheDocument();
    });

    const testButtons = screen.getAllByLabelText('Test integration');
    await userEvent.click(testButtons[0]);

    await waitFor(() => {
      expect(mockSettingsService.testIntegration).toHaveBeenCalledWith(mockIntegrations[0]);
    });
  });

  it('allows creating new API keys', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.createApiKey.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add API Key')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add API Key');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('API Key Details')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Key Name');
    await userEvent.type(nameInput, 'New API Key');

    const saveButton = screen.getByText('Save API Key');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.createApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New API Key',
        })
      );
    });
  });

  it('allows editing existing API keys', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.updateApiKey.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Frontend App')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('Edit API key');
    await userEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Frontend App')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Frontend App');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Frontend App');

    const saveButton = screen.getByText('Save API Key');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.updateApiKey).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Frontend App',
        })
      );
    });
  });

  it('allows deleting API keys', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.deleteApiKey.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Frontend App')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete API key');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete API Key')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSettingsService.deleteApiKey).toHaveBeenCalledWith('key-1');
    });
  });

  it('allows regenerating API keys', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.regenerateApiKey.mockResolvedValue({ success: true });

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Frontend App')).toBeInTheDocument();
    });

    const regenerateButtons = screen.getAllByLabelText('Regenerate API key');
    await userEvent.click(regenerateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Regenerate API Key')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Regenerate');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSettingsService.regenerateApiKey).toHaveBeenCalledWith('key-1');
    });
  });

  it('displays integration health status correctly', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Email Service')).toBeInTheDocument();
    });

    // Check that health badges are displayed
    const healthBadges = screen.getAllByText('healthy');
    expect(healthBadges.length).toBeGreaterThan(0);
  });

  it('displays API key status correctly', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Frontend App')).toBeInTheDocument();
    });

    // Check that status badges are displayed
    const statusBadges = screen.getAllByText('active');
    expect(statusBadges.length).toBeGreaterThan(0);
  });

  it('handles API settings save errors gracefully', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.updateApiSettings.mockRejectedValue(new Error('Save failed'));

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('API Configuration')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save API Settings');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to save API settings',
          status: 'error',
        })
      );
    });
  });

  it('handles integration save errors gracefully', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.createIntegration.mockRejectedValue(new Error('Save failed'));

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Integration')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Integration');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Integration Details')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Integration Name');
    await userEvent.type(nameInput, 'New Integration');

    const saveButton = screen.getByText('Save Integration');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to save integration',
          status: 'error',
        })
      );
    });
  });

  it('handles API key save errors gracefully', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);
    mockSettingsService.createApiKey.mockRejectedValue(new Error('Save failed'));

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add API Key')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add API Key');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('API Key Details')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Key Name');
    await userEvent.type(nameInput, 'New API Key');

    const saveButton = screen.getByText('Save API Key');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to save API key',
          status: 'error',
        })
      );
    });
  });

  it('validates required fields before saving', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Integration')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Integration');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Integration Details')).toBeInTheDocument();
    });

    // Try to save without required fields
    const saveButton = screen.getByText('Save Integration');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Integration name is required')).toBeInTheDocument();
    });
  });

  it('displays loading states during API calls', async () => {
    mockSettingsService.getApiSettings.mockResolvedValue(mockApiSettings);
    mockSettingsService.getIntegrations.mockResolvedValue(mockIntegrations);
    mockSettingsService.getApiKeys.mockResolvedValue(mockApiKeys);

    renderWithTheme(<ApiIntegrationSettings />);

    await waitFor(() => {
      expect(screen.getByText('API & Integration Settings')).toBeInTheDocument();
    });

    // Check that loading indicators are not shown after data loads
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
