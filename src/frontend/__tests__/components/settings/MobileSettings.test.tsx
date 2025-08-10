import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';
import MobileSettings from '../../../components/settings/MobileSettings';
import { useMobileSettings, useUpdateMobileSettings } from '../../../hooks/useMobileSettings';

// Mock the hooks
jest.mock('../../../hooks/useMobileSettings');

const mockUseMobileSettings = useMobileSettings as jest.MockedFunction<typeof useMobileSettings>;
const mockUseUpdateMobileSettings = useUpdateMobileSettings as jest.MockedFunction<typeof useUpdateMobileSettings>;

// Mock the mobile settings service
jest.mock('../../../services/mobileSettingsService', () => ({
  getMobileSettings: jest.fn(),
  updateMobileSettings: jest.fn(),
}));

const mockMobileSettings = {
  id: 'mobile1',
  userId: 'user1',
  notifications: {
    push: true,
    email: true,
    sms: false,
    inApp: true,
    sound: true,
    vibration: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York',
    },
  },
  display: {
    theme: 'auto',
    fontSize: 'medium',
    contrast: 'normal',
    reduceMotion: false,
    highContrast: false,
  },
  security: {
    biometricAuth: true,
    pinCode: '1234',
    autoLock: true,
    lockTimeout: 300,
    remoteWipe: false,
    deviceManagement: true,
  },
  sync: {
    autoSync: true,
    syncFrequency: '15min',
    syncOnWifi: true,
    syncOnCellular: false,
    dataUsage: 'unlimited',
  },
  performance: {
    lowPowerMode: false,
    backgroundRefresh: true,
    locationServices: true,
    analytics: true,
    crashReporting: true,
  },
  accessibility: {
    screenReader: false,
    voiceControl: false,
    switchControl: false,
    assistiveTouch: false,
    largeText: false,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockUpdateMobileSettings = jest.fn();

describe('MobileSettings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseMobileSettings.mockReturnValue({
      data: mockMobileSettings,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseUpdateMobileSettings.mockReturnValue({
      mutate: mockUpdateMobileSettings,
      isLoading: false,
      error: null,
      reset: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <MobileSettings />
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders mobile settings interface', () => {
    renderComponent();

    expect(screen.getByText('Mobile Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Display & Appearance')).toBeInTheDocument();
    expect(screen.getByText('Security & Privacy')).toBeInTheDocument();
    expect(screen.getByText('Sync & Data')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('displays current notification settings', () => {
    renderComponent();

    expect(screen.getByRole('checkbox', { name: /push notifications/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /email notifications/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /sms notifications/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /in-app notifications/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /sound/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /vibration/i })).toBeChecked();
  });

  it('displays current display settings', () => {
    renderComponent();

    expect(screen.getByDisplayValue('auto')).toBeInTheDocument();
    expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('normal')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /reduce motion/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /high contrast/i })).not.toBeChecked();
  });

  it('displays current security settings', () => {
    renderComponent();

    expect(screen.getByRole('checkbox', { name: /biometric authentication/i })).toBeChecked();
    expect(screen.getByDisplayValue('1234')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /auto lock/i })).toBeChecked();
    expect(screen.getByDisplayValue('300')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remote wipe/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /device management/i })).toBeChecked();
  });

  it('displays current sync settings', () => {
    renderComponent();

    expect(screen.getByRole('checkbox', { name: /auto sync/i })).toBeChecked();
    expect(screen.getByDisplayValue('15min')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /sync on wifi/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /sync on cellular/i })).not.toBeChecked();
    expect(screen.getByDisplayValue('unlimited')).toBeInTheDocument();
  });

  it('displays current performance settings', () => {
    renderComponent();

    expect(screen.getByRole('checkbox', { name: /low power mode/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /background refresh/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /location services/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /analytics/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /crash reporting/i })).toBeChecked();
  });

  it('displays current accessibility settings', () => {
    renderComponent();

    expect(screen.getByRole('checkbox', { name: /screen reader/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /voice control/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /switch control/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /assistive touch/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /large text/i })).not.toBeChecked();
  });

  it('allows toggling push notifications', async () => {
    renderComponent();

    const pushToggle = screen.getByRole('checkbox', { name: /push notifications/i });
    fireEvent.click(pushToggle);

    expect(pushToggle).not.toBeChecked();
  });

  it('allows toggling email notifications', async () => {
    renderComponent();

    const emailToggle = screen.getByRole('checkbox', { name: /email notifications/i });
    fireEvent.click(emailToggle);

    expect(emailToggle).not.toBeChecked();
  });

  it('allows toggling SMS notifications', async () => {
    renderComponent();

    const smsToggle = screen.getByRole('checkbox', { name: /sms notifications/i });
    fireEvent.click(smsToggle);

    expect(smsToggle).toBeChecked();
  });

  it('allows toggling sound notifications', async () => {
    renderComponent();

    const soundToggle = screen.getByRole('checkbox', { name: /sound/i });
    fireEvent.click(soundToggle);

    expect(soundToggle).not.toBeChecked();
  });

  it('allows toggling vibration notifications', async () => {
    renderComponent();

    const vibrationToggle = screen.getByRole('checkbox', { name: /vibration/i });
    fireEvent.click(vibrationToggle);

    expect(vibrationToggle).not.toBeChecked();
  });

  it('allows changing theme setting', async () => {
    renderComponent();

    const themeSelect = screen.getByDisplayValue('auto');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(themeSelect).toHaveValue('dark');
  });

  it('allows changing font size setting', async () => {
    renderComponent();

    const fontSizeSelect = screen.getByDisplayValue('medium');
    fireEvent.change(fontSizeSelect, { target: { value: 'large' } });

    expect(fontSizeSelect).toHaveValue('large');
  });

  it('allows changing contrast setting', async () => {
    renderComponent();

    const contrastSelect = screen.getByDisplayValue('normal');
    fireEvent.change(contrastSelect, { target: { value: 'high' } });

    expect(contrastSelect).toHaveValue('high');
  });

  it('allows toggling reduce motion', async () => {
    renderComponent();

    const reduceMotionToggle = screen.getByRole('checkbox', { name: /reduce motion/i });
    fireEvent.click(reduceMotionToggle);

    expect(reduceMotionToggle).toBeChecked();
  });

  it('allows toggling high contrast', async () => {
    renderComponent();

    const highContrastToggle = screen.getByRole('checkbox', { name: /high contrast/i });
    fireEvent.click(highContrastToggle);

    expect(highContrastToggle).toBeChecked();
  });

  it('allows toggling biometric authentication', async () => {
    renderComponent();

    const biometricToggle = screen.getByRole('checkbox', { name: /biometric authentication/i });
    fireEvent.click(biometricToggle);

    expect(biometricToggle).not.toBeChecked();
  });

  it('allows changing PIN code', async () => {
    renderComponent();

    const pinInput = screen.getByDisplayValue('1234');
    fireEvent.change(pinInput, { target: { value: '5678' } });

    expect(pinInput).toHaveValue('5678');
  });

  it('allows toggling auto lock', async () => {
    renderComponent();

    const autoLockToggle = screen.getByRole('checkbox', { name: /auto lock/i });
    fireEvent.click(autoLockToggle);

    expect(autoLockToggle).not.toBeChecked();
  });

  it('allows changing lock timeout', async () => {
    renderComponent();

    const timeoutInput = screen.getByDisplayValue('300');
    fireEvent.change(timeoutInput, { target: { value: '600' } });

    expect(timeoutInput).toHaveValue('600');
  });

  it('allows toggling remote wipe', async () => {
    renderComponent();

    const remoteWipeToggle = screen.getByRole('checkbox', { name: /remote wipe/i });
    fireEvent.click(remoteWipeToggle);

    expect(remoteWipeToggle).toBeChecked();
  });

  it('allows toggling device management', async () => {
    renderComponent();

    const deviceManagementToggle = screen.getByRole('checkbox', { name: /device management/i });
    fireEvent.click(deviceManagementToggle);

    expect(deviceManagementToggle).not.toBeChecked();
  });

  it('allows toggling auto sync', async () => {
    renderComponent();

    const autoSyncToggle = screen.getByRole('checkbox', { name: /auto sync/i });
    fireEvent.click(autoSyncToggle);

    expect(autoSyncToggle).not.toBeChecked();
  });

  it('allows changing sync frequency', async () => {
    renderComponent();

    const frequencySelect = screen.getByDisplayValue('15min');
    fireEvent.change(frequencySelect, { target: { value: '30min' } });

    expect(frequencySelect).toHaveValue('30min');
  });

  it('allows toggling sync on WiFi', async () => {
    renderComponent();

    const wifiSyncToggle = screen.getByRole('checkbox', { name: /sync on wifi/i });
    fireEvent.click(wifiSyncToggle);

    expect(wifiSyncToggle).not.toBeChecked();
  });

  it('allows toggling sync on cellular', async () => {
    renderComponent();

    const cellularSyncToggle = screen.getByRole('checkbox', { name: /sync on cellular/i });
    fireEvent.click(cellularSyncToggle);

    expect(cellularSyncToggle).toBeChecked();
  });

  it('allows changing data usage setting', async () => {
    renderComponent();

    const dataUsageSelect = screen.getByDisplayValue('unlimited');
    fireEvent.change(dataUsageSelect, { target: { value: 'limited' } });

    expect(dataUsageSelect).toHaveValue('limited');
  });

  it('allows toggling low power mode', async () => {
    renderComponent();

    const lowPowerToggle = screen.getByRole('checkbox', { name: /low power mode/i });
    fireEvent.click(lowPowerToggle);

    expect(lowPowerToggle).toBeChecked();
  });

  it('allows toggling background refresh', async () => {
    renderComponent();

    const backgroundRefreshToggle = screen.getByRole('checkbox', { name: /background refresh/i });
    fireEvent.click(backgroundRefreshToggle);

    expect(backgroundRefreshToggle).not.toBeChecked();
  });

  it('allows toggling location services', async () => {
    renderComponent();

    const locationToggle = screen.getByRole('checkbox', { name: /location services/i });
    fireEvent.click(locationToggle);

    expect(locationToggle).not.toBeChecked();
  });

  it('allows toggling analytics', async () => {
    renderComponent();

    const analyticsToggle = screen.getByRole('checkbox', { name: /analytics/i });
    fireEvent.click(analyticsToggle);

    expect(analyticsToggle).not.toBeChecked();
  });

  it('allows toggling crash reporting', async () => {
    renderComponent();

    const crashReportingToggle = screen.getByRole('checkbox', { name: /crash reporting/i });
    fireEvent.click(crashReportingToggle);

    expect(crashReportingToggle).not.toBeChecked();
  });

  it('allows toggling screen reader', async () => {
    renderComponent();

    const screenReaderToggle = screen.getByRole('checkbox', { name: /screen reader/i });
    fireEvent.click(screenReaderToggle);

    expect(screenReaderToggle).toBeChecked();
  });

  it('allows toggling voice control', async () => {
    renderComponent();

    const voiceControlToggle = screen.getByRole('checkbox', { name: /voice control/i });
    fireEvent.click(voiceControlToggle);

    expect(voiceControlToggle).toBeChecked();
  });

  it('allows toggling switch control', async () => {
    renderComponent();

    const switchControlToggle = screen.getByRole('checkbox', { name: /switch control/i });
    fireEvent.click(switchControlToggle);

    expect(switchControlToggle).toBeChecked();
  });

  it('allows toggling assistive touch', async () => {
    renderComponent();

    const assistiveTouchToggle = screen.getByRole('checkbox', { name: /assistive touch/i });
    fireEvent.click(assistiveTouchToggle);

    expect(assistiveTouchToggle).toBeChecked();
  });

  it('allows toggling large text', async () => {
    renderComponent();

    const largeTextToggle = screen.getByRole('checkbox', { name: /large text/i });
    fireEvent.click(largeTextToggle);

    expect(largeTextToggle).toBeChecked();
  });

  it('configures quiet hours', async () => {
    renderComponent();

    const quietHoursToggle = screen.getByRole('checkbox', { name: /quiet hours/i });
    expect(quietHoursToggle).toBeChecked();

    const startTimeInput = screen.getByDisplayValue('22:00');
    const endTimeInput = screen.getByDisplayValue('08:00');

    fireEvent.change(startTimeInput, { target: { value: '21:00' } });
    fireEvent.change(endTimeInput, { target: { value: '07:00' } });

    expect(startTimeInput).toHaveValue('21:00');
    expect(endTimeInput).toHaveValue('07:00');
  });

  it('saves changes when save button is clicked', async () => {
    renderComponent();

    const pushToggle = screen.getByRole('checkbox', { name: /push notifications/i });
    fireEvent.click(pushToggle);

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateMobileSettings).toHaveBeenCalledWith({
        ...mockMobileSettings,
        notifications: {
          ...mockMobileSettings.notifications,
          push: false,
        },
      });
    });
  });

  it('resets form when reset button is clicked', async () => {
    renderComponent();

    const pushToggle = screen.getByRole('checkbox', { name: /push notifications/i });
    fireEvent.click(pushToggle);

    expect(pushToggle).not.toBeChecked();

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(pushToggle).toBeChecked();
    });
  });

  it('shows loading state when saving', () => {
    mockUseUpdateMobileSettings.mockReturnValue({
      mutate: mockUpdateMobileSettings,
      isLoading: true,
      error: null,
      reset: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows error message when update fails', () => {
    mockUseUpdateMobileSettings.mockReturnValue({
      mutate: mockUpdateMobileSettings,
      isLoading: false,
      error: new Error('Update failed'),
      reset: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText('Error: Update failed')).toBeInTheDocument();
  });

  it('shows success message when update succeeds', async () => {
    mockUpdateMobileSettings.mockImplementation((data) => {
      return Promise.resolve(data);
    });

    renderComponent();

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Mobile settings updated successfully')).toBeInTheDocument();
    });
  });

  it('expands and collapses sections when clicked', async () => {
    renderComponent();

    const securitySection = screen.getByText('Security & Privacy');
    fireEvent.click(securitySection);

    // Check if security settings are visible
    expect(screen.getByText('Biometric Authentication')).toBeInTheDocument();
    expect(screen.getByText('PIN Code')).toBeInTheDocument();
    expect(screen.getByText('Auto Lock')).toBeInTheDocument();
  });

  it('shows PIN code validation', async () => {
    renderComponent();

    const pinInput = screen.getByDisplayValue('1234');
    fireEvent.change(pinInput, { target: { value: '12' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('PIN code must be at least 4 digits')).toBeInTheDocument();
    });

    expect(mockUpdateMobileSettings).not.toHaveBeenCalled();
  });

  it('shows lock timeout validation', async () => {
    renderComponent();

    const timeoutInput = screen.getByDisplayValue('300');
    fireEvent.change(timeoutInput, { target: { value: '0' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Lock timeout must be at least 30 seconds')).toBeInTheDocument();
    });

    expect(mockUpdateMobileSettings).not.toHaveBeenCalled();
  });

  it('shows quiet hours time validation', async () => {
    renderComponent();

    const startTimeInput = screen.getByDisplayValue('22:00');
    const endTimeInput = screen.getByDisplayValue('08:00');

    fireEvent.change(startTimeInput, { target: { value: '08:00' } });
    fireEvent.change(endTimeInput, { target: { value: '07:00' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Start time must be before end time')).toBeInTheDocument();
    });

    expect(mockUpdateMobileSettings).not.toHaveBeenCalled();
  });

  it('shows device information', async () => {
    renderComponent();

    const deviceInfoSection = screen.getByText('Device Information');
    fireEvent.click(deviceInfoSection);

    expect(screen.getByText('Device Model')).toBeInTheDocument();
    expect(screen.getByText('Operating System')).toBeInTheDocument();
    expect(screen.getByText('App Version')).toBeInTheDocument();
  });

  it('shows data usage statistics', async () => {
    renderComponent();

    const dataUsageSection = screen.getByText('Data Usage');
    fireEvent.click(dataUsageSection);

    expect(screen.getByText('Data Used This Month')).toBeInTheDocument();
    expect(screen.getByText('Sync Frequency')).toBeInTheDocument();
    expect(screen.getByText('Last Sync')).toBeInTheDocument();
  });

  it('shows battery optimization settings', async () => {
    renderComponent();

    const performanceSection = screen.getByText('Performance');
    fireEvent.click(performanceSection);

    expect(screen.getByText('Battery Optimization')).toBeInTheDocument();
    expect(screen.getByText('Background App Refresh')).toBeInTheDocument();
    expect(screen.getByText('Location Services')).toBeInTheDocument();
  });

  it('shows accessibility preview', async () => {
    renderComponent();

    const accessibilitySection = screen.getByText('Accessibility');
    fireEvent.click(accessibilitySection);

    const previewButton = screen.getByText('Preview Settings');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Accessibility Preview')).toBeInTheDocument();
    });
  });

  it('exports mobile settings configuration', async () => {
    renderComponent();

    const exportButton = screen.getByText('Export Settings');
    fireEvent.click(exportButton);

    // Mock file download
    const mockDownload = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalled();
    });
  });

  it('imports mobile settings configuration', async () => {
    renderComponent();

    const importButton = screen.getByText('Import Settings');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Import Mobile Settings')).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText('Select File');
    const file = new File(['{"notifications":{"push":false}}'], 'settings.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const importConfirmButton = screen.getByText('Import');
    fireEvent.click(importConfirmButton);

    await waitFor(() => {
      expect(mockUpdateMobileSettings).toHaveBeenCalled();
    });
  });

  it('shows mobile-specific help and documentation', async () => {
    renderComponent();

    const helpButton = screen.getByText('Help & Support');
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText('Mobile Settings Help')).toBeInTheDocument();
      expect(screen.getByText('How to configure mobile notifications')).toBeInTheDocument();
      expect(screen.getByText('Security best practices')).toBeInTheDocument();
    });
  });
});
