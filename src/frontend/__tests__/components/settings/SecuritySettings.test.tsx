import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import SecuritySettings from '../../../../components/settings/SecuritySettings';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getSecuritySettings: jest.fn(),
    updateSecuritySettings: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
    verifyTwoFactor: jest.fn(),
    changePassword: jest.fn(),
    getActiveSessions: jest.fn(),
    terminateSession: jest.fn(),
  },
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockSecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: 'totp' as const,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expirationDays: 90,
  },
  sessionTimeout: 30,
  loginHistory: true,
  ipRestrictions: [],
};

const mockActiveSessions = [
  {
    id: 'session-1',
    device: 'Chrome on Windows',
    location: 'New York, NY',
    lastActive: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'session-2',
    device: 'Safari on iPhone',
    location: 'San Francisco, CA',
    lastActive: '2024-01-15T09:15:00Z',
    ipAddress: '10.0.0.50',
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('SecuritySettings', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the security settings interface', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Password Policy')).toBeInTheDocument();
      expect(screen.getByText('Session Management')).toBeInTheDocument();
    });
  });

  it('displays current security settings', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Password Policy')).toBeInTheDocument();
      expect(screen.getByText('Session Management')).toBeInTheDocument();
    });
  });

  it('allows enabling two-factor authentication', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);
    mockSettingsService.enableTwoFactor.mockResolvedValue({
      qrCode: 'data:image/png;base64,test',
      backupCodes: ['123456', '789012'],
    });

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Enable 2FA')).toBeInTheDocument();
    });

    const enableButton = screen.getByText('Enable 2FA');
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(screen.getByText('Setup Two-Factor Authentication')).toBeInTheDocument();
    });
  });

  it('allows changing password', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);
    mockSettingsService.changePassword.mockResolvedValue(undefined);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    });
  });

  it('displays active sessions', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
      expect(screen.getByText('New York, NY')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    });
  });

  it('allows terminating sessions', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);
    mockSettingsService.terminateSession.mockResolvedValue(undefined);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Terminate')).toBeInTheDocument();
    });

    const terminateButtons = screen.getAllByText('Terminate');
    fireEvent.click(terminateButtons[0]);

    await waitFor(() => {
      expect(mockSettingsService.terminateSession).toHaveBeenCalledWith('session-1');
    });
  });

  it('handles security settings update errors gracefully', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);
    mockSettingsService.updateSecuritySettings.mockRejectedValue(new Error('Update failed'));

    renderWithTheme(<SecuritySettings />);

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
    mockSettingsService.getSecuritySettings.mockImplementation(() => new Promise(() => {}));
    mockSettingsService.getActiveSessions.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<SecuritySettings />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading state while saving', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);
    mockSettingsService.updateSecuritySettings.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Password Requirements')).toBeInTheDocument();
      expect(screen.getByText('Minimum 8 characters')).toBeInTheDocument();
      expect(screen.getByText('At least one uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('At least one number')).toBeInTheDocument();
      expect(screen.getByText('At least one special character')).toBeInTheDocument();
    });
  });

  it('displays session timeout settings', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('Session Timeout')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });
  });

  it('allows configuring IP restrictions', async () => {
    mockSettingsService.getSecuritySettings.mockResolvedValue(mockSecuritySettings);
    mockSettingsService.getActiveSessions.mockResolvedValue(mockActiveSessions);

    renderWithTheme(<SecuritySettings />);

    await waitFor(() => {
      expect(screen.getByText('IP Restrictions')).toBeInTheDocument();
      expect(screen.getByText('Add IP Address')).toBeInTheDocument();
    });
  });
});
