import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import SystemSettings from '../../../../components/settings/SystemSettings';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getSystemSettings: jest.fn(),
    updateSystemSettings: jest.fn(),
    getSystemInfo: jest.fn(),
    getSystemHealth: jest.fn(),
    restartSystem: jest.fn(),
    backupSystem: jest.fn(),
    restoreSystem: jest.fn(),
  },
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockSystemSettings = {
  general: {
    companyName: 'Presidential Digs CRM',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    language: 'en',
    currency: 'USD',
    decimalPlaces: 2,
  },
  performance: {
    cacheEnabled: true,
    cacheTTL: 3600,
    maxConcurrentUsers: 100,
    sessionTimeout: 30,
    autoLogout: true,
    compressionEnabled: true,
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    },
    mfaRequired: true,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    auditLogging: true,
    dataEncryption: true,
  },
  integrations: {
    emailProvider: 'smtp',
    smtpSettings: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      username: 'noreply@presidentialdigs.com',
    },
    paymentProvider: 'stripe',
    analyticsEnabled: true,
    backupEnabled: true,
    backupFrequency: 'daily',
  },
  maintenance: {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance',
    autoBackup: true,
    backupRetention: 30,
    logRetention: 90,
    systemUpdates: true,
    updateNotifications: true,
  },
};

const mockSystemInfo = {
  version: '1.0.0',
  buildDate: '2024-01-15T10:00:00Z',
  nodeVersion: '18.17.0',
  databaseVersion: '6.0.4',
  uptime: '7 days, 3 hours',
  memoryUsage: '45%',
  cpuUsage: '23%',
  diskUsage: '67%',
  activeUsers: 45,
  totalUsers: 150,
};

const mockSystemHealth = {
  status: 'healthy',
  checks: {
    database: { status: 'healthy', responseTime: 45 },
    api: { status: 'healthy', responseTime: 120 },
    cache: { status: 'healthy', responseTime: 15 },
    storage: { status: 'healthy', responseTime: 80 },
  },
  lastCheck: '2024-01-15T10:30:00Z',
  recommendations: [
    'Consider increasing cache TTL for better performance',
    'Database connection pool could be optimized',
  ],
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('SystemSettings', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the system settings interface', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Settings')).toBeInTheDocument();
      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Performance Settings')).toBeInTheDocument();
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      expect(screen.getByText('Integration Settings')).toBeInTheDocument();
      expect(screen.getByText('Maintenance Settings')).toBeInTheDocument();
    });
  });

  it('displays current system settings', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Presidential Digs CRM')).toBeInTheDocument();
      expect(screen.getByDisplayValue('America/New_York')).toBeInTheDocument();
      expect(screen.getByDisplayValue('MM/DD/YYYY')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12-hour')).toBeInTheDocument();
    });
  });

  it('allows updating general settings', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockSettingsService.updateSystemSettings.mockResolvedValue(undefined);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Presidential Digs CRM')).toBeInTheDocument();
    });

    const companyNameInput = screen.getByDisplayValue('Presidential Digs CRM');
    fireEvent.change(companyNameInput, { target: { value: 'New Company Name' } });

    expect(companyNameInput).toHaveValue('New Company Name');
  });

  it('allows updating performance settings', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Enable Caching')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3600')).toBeInTheDocument();
    });

    const cacheToggle = screen.getByLabelText('Enable Caching');
    expect(cacheToggle).toBeChecked();

    const cacheTTLInput = screen.getByDisplayValue('3600');
    fireEvent.change(cacheTTLInput, { target: { value: '7200' } });
    expect(cacheTTLInput).toHaveValue(7200);
  });

  it('allows updating security settings', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      expect(screen.getByDisplayValue('90')).toBeInTheDocument();
    });

    const minLengthInput = screen.getByDisplayValue('8');
    fireEvent.change(minLengthInput, { target: { value: '12' } });
    expect(minLengthInput).toHaveValue(12);

    const expirationInput = screen.getByDisplayValue('90');
    fireEvent.change(expirationInput, { target: { value: '180' } });
    expect(expirationInput).toHaveValue(180);
  });

  it('allows updating integration settings', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('smtp.gmail.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('587')).toBeInTheDocument();
    });

    const smtpHostInput = screen.getByDisplayValue('smtp.gmail.com');
    fireEvent.change(smtpHostInput, { target: { value: 'smtp.outlook.com' } });
    expect(smtpHostInput).toHaveValue('smtp.outlook.com');

    const smtpPortInput = screen.getByDisplayValue('587');
    fireEvent.change(smtpPortInput, { target: { value: '465' } });
    expect(smtpPortInput).toHaveValue(465);
  });

  it('allows updating maintenance settings', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Maintenance Mode')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });

    const maintenanceToggle = screen.getByLabelText('Maintenance Mode');
    expect(maintenanceToggle).not.toBeChecked();

    const backupRetentionInput = screen.getByDisplayValue('30');
    fireEvent.change(backupRetentionInput, { target: { value: '60' } });
    expect(backupRetentionInput).toHaveValue(60);
  });

  it('displays system information', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Information')).toBeInTheDocument();
      expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument();
      expect(screen.getByText('Build Date: 01/15/2024')).toBeInTheDocument();
      expect(screen.getByText('Node Version: 18.17.0')).toBeInTheDocument();
      expect(screen.getByText('Database Version: 6.0.4')).toBeInTheDocument();
    });
  });

  it('displays system health status', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('Status: Healthy')).toBeInTheDocument();
      expect(screen.getByText('Database: Healthy (45ms)')).toBeInTheDocument();
      expect(screen.getByText('API: Healthy (120ms)')).toBeInTheDocument();
    });
  });

  it('displays system health recommendations', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Consider increasing cache TTL for better performance')).toBeInTheDocument();
      expect(screen.getByText('Database connection pool could be optimized')).toBeInTheDocument();
    });
  });

  it('allows restarting the system', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockSettingsService.restartSystem.mockResolvedValue(undefined);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Actions')).toBeInTheDocument();
    });

    const restartButton = screen.getByText('Restart System');
    fireEvent.click(restartButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm System Restart')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to restart the system?')).toBeInTheDocument();
    });
  });

  it('allows backing up the system', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockSettingsService.backupSystem.mockResolvedValue({
      backupId: 'backup-123',
      filename: 'backup-2024-01-15.zip',
      size: '2.5 GB',
    });

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Actions')).toBeInTheDocument();
    });

    const backupButton = screen.getByText('Create Backup');
    fireEvent.click(backupButton);

    await waitFor(() => {
      expect(mockSettingsService.backupSystem).toHaveBeenCalled();
    });
  });

  it('allows restoring the system from backup', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockSettingsService.restoreSystem.mockResolvedValue(undefined);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Actions')).toBeInTheDocument();
    });

    const restoreButton = screen.getByText('Restore from Backup');
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(screen.getByText('Restore System')).toBeInTheDocument();
      expect(screen.getByText('Select backup file to restore from:')).toBeInTheDocument();
    });
  });

  it('saves system settings successfully', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockSettingsService.updateSystemSettings.mockResolvedValue(undefined);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.updateSystemSettings).toHaveBeenCalled();
    });
  });

  it('handles system settings update errors gracefully', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockSettingsService.updateSystemSettings.mockRejectedValue(new Error('Update failed'));

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Update failed',
          status: 'error',
        })
      );
    });
  });

  it('shows loading state while fetching data', async () => {
    mockSettingsService.getSystemSettings.mockImplementation(() => new Promise(() => {}));
    mockSettingsService.getSystemInfo.mockImplementation(() => new Promise(() => {}));
    mockSettingsService.getSystemHealth.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<SystemSettings />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading state while saving', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockSettingsService.updateSystemSettings.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Presidential Digs CRM')).toBeInTheDocument();
    });

    const companyNameInput = screen.getByDisplayValue('Presidential Digs CRM');
    fireEvent.change(companyNameInput, { target: { value: '' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
    });
  });

  it('displays system metrics', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Metrics')).toBeInTheDocument();
      expect(screen.getByText('Memory Usage: 45%')).toBeInTheDocument();
      expect(screen.getByText('CPU Usage: 23%')).toBeInTheDocument();
      expect(screen.getByText('Disk Usage: 67%')).toBeInTheDocument();
      expect(screen.getByText('Active Users: 45 / 150')).toBeInTheDocument();
    });
  });

  it('allows refreshing system health', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockSettingsService.getSystemHealth).toHaveBeenCalledTimes(2);
    });
  });

  it('displays maintenance mode warning when enabled', async () => {
    const settingsWithMaintenance = {
      ...mockSystemSettings,
      maintenance: {
        ...mockSystemSettings.maintenance,
        maintenanceMode: true,
      },
    };

    mockSettingsService.getSystemSettings.mockResolvedValue(settingsWithMaintenance);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByText('⚠️ Maintenance Mode Active')).toBeInTheDocument();
      expect(screen.getByText('System is currently in maintenance mode')).toBeInTheDocument();
    });
  });

  it('allows configuring backup settings', async () => {
    mockSettingsService.getSystemSettings.mockResolvedValue(mockSystemSettings);
    mockSettingsService.getSystemInfo.mockResolvedValue(mockSystemInfo);
    mockSettingsService.getSystemHealth.mockResolvedValue(mockSystemHealth);

    renderWithTheme(<SystemSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Auto Backup')).toBeInTheDocument();
      expect(screen.getByDisplayValue('daily')).toBeInTheDocument();
    });

    const autoBackupToggle = screen.getByLabelText('Auto Backup');
    expect(autoBackupToggle).toBeChecked();

    const backupFrequencySelect = screen.getByDisplayValue('daily');
    fireEvent.change(backupFrequencySelect, { target: { value: 'weekly' } });
    expect(backupFrequencySelect).toHaveValue('weekly');
  });
});
