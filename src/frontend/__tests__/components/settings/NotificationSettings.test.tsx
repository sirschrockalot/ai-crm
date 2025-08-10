import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import NotificationSettings from '../../../../components/settings/NotificationSettings';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getNotificationSettings: jest.fn(),
    updateNotificationSettings: jest.fn(),
    getNotificationPreferences: jest.fn(),
    updateNotificationPreferences: jest.fn(),
    testNotification: jest.fn(),
  },
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockNotificationSettings = {
  email: {
    enabled: true,
    frequency: 'immediate' as const,
    types: ['leads', 'deals', 'tasks', 'reminders'],
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York',
    },
  },
  push: {
    enabled: true,
    types: ['urgent', 'leads', 'deals'],
    sound: true,
    vibration: true,
  },
  sms: {
    enabled: false,
    types: ['urgent', 'security'],
    phoneNumber: '+1234567890',
  },
  inApp: {
    enabled: true,
    types: ['all'],
    position: 'top-right' as const,
    autoHide: true,
    autoHideDelay: 5000,
  },
};

const mockNotificationPreferences = {
  leads: {
    newLead: true,
    leadUpdate: false,
    leadAssigned: true,
    leadStatusChange: true,
  },
  deals: {
    newDeal: true,
    dealUpdate: false,
    dealAssigned: true,
    dealStatusChange: true,
    dealClosed: true,
  },
  tasks: {
    newTask: true,
    taskUpdate: false,
    taskAssigned: true,
    taskDue: true,
    taskOverdue: true,
  },
  reminders: {
    appointment: true,
    followUp: true,
    payment: true,
    renewal: true,
  },
  system: {
    security: true,
    maintenance: false,
    updates: true,
    announcements: true,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('NotificationSettings', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the notification settings interface', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
    });
  });

  it('displays current notification settings', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
    });
  });

  it('allows enabling/disabling email notifications', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Enable Email Notifications')).toBeInTheDocument();
    });

    const emailToggle = screen.getByLabelText('Enable Email Notifications');
    expect(emailToggle).toBeChecked();

    fireEvent.click(emailToggle);
    expect(emailToggle).not.toBeChecked();
  });

  it('allows changing email notification frequency', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Notification Frequency')).toBeInTheDocument();
    });

    const frequencySelect = screen.getByLabelText('Notification Frequency');
    expect(frequencySelect).toHaveValue('immediate');

    fireEvent.change(frequencySelect, { target: { value: 'daily' } });
    expect(frequencySelect).toHaveValue('daily');
  });

  it('allows configuring quiet hours', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Enable Quiet Hours')).toBeInTheDocument();
    });

    const quietHoursToggle = screen.getByLabelText('Enable Quiet Hours');
    expect(quietHoursToggle).toBeChecked();

    const startTimeInput = screen.getByLabelText('Start Time');
    const endTimeInput = screen.getByLabelText('End Time');

    expect(startTimeInput).toHaveValue('22:00');
    expect(endTimeInput).toHaveValue('08:00');
  });

  it('allows enabling/disabling push notifications', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Enable Push Notifications')).toBeInTheDocument();
    });

    const pushToggle = screen.getByLabelText('Enable Push Notifications');
    expect(pushToggle).toBeChecked();

    fireEvent.click(pushToggle);
    expect(pushToggle).not.toBeChecked();
  });

  it('allows configuring push notification settings', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Enable Sound')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable Vibration')).toBeInTheDocument();
    });

    const soundToggle = screen.getByLabelText('Enable Sound');
    const vibrationToggle = screen.getByLabelText('Enable Vibration');

    expect(soundToggle).toBeChecked();
    expect(vibrationToggle).toBeChecked();

    fireEvent.click(soundToggle);
    expect(soundToggle).not.toBeChecked();
  });

  it('allows enabling/disabling SMS notifications', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Enable SMS Notifications')).toBeInTheDocument();
    });

    const smsToggle = screen.getByLabelText('Enable SMS Notifications');
    expect(smsToggle).not.toBeChecked();

    fireEvent.click(smsToggle);
    expect(smsToggle).toBeChecked();
  });

  it('allows configuring in-app notification settings', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Enable In-App Notifications')).toBeInTheDocument();
    });

    const inAppToggle = screen.getByLabelText('Enable In-App Notifications');
    expect(inAppToggle).toBeChecked();

    const positionSelect = screen.getByLabelText('Notification Position');
    expect(positionSelect).toHaveValue('top-right');

    const autoHideToggle = screen.getByLabelText('Auto-hide Notifications');
    expect(autoHideToggle).toBeChecked();
  });

  it('displays notification preferences by category', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Lead Notifications')).toBeInTheDocument();
      expect(screen.getByText('Deal Notifications')).toBeInTheDocument();
      expect(screen.getByText('Task Notifications')).toBeInTheDocument();
      expect(screen.getByText('Reminder Notifications')).toBeInTheDocument();
      expect(screen.getByText('System Notifications')).toBeInTheDocument();
    });
  });

  it('allows toggling individual notification types', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('New Lead')).toBeInTheDocument();
      expect(screen.getByLabelText('Lead Update')).toBeInTheDocument();
    });

    const newLeadToggle = screen.getByLabelText('New Lead');
    const leadUpdateToggle = screen.getByLabelText('Lead Update');

    expect(newLeadToggle).toBeChecked();
    expect(leadUpdateToggle).not.toBeChecked();

    fireEvent.click(newLeadToggle);
    expect(newLeadToggle).not.toBeChecked();
  });

  it('allows testing notifications', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);
    mockSettingsService.testNotification.mockResolvedValue(undefined);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Test Notifications')).toBeInTheDocument();
    });

    const testButton = screen.getByText('Test Notifications');
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(mockSettingsService.testNotification).toHaveBeenCalled();
    });
  });

  it('saves notification settings successfully', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);
    mockSettingsService.updateNotificationSettings.mockResolvedValue(undefined);
    mockSettingsService.updateNotificationPreferences.mockResolvedValue(undefined);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.updateNotificationSettings).toHaveBeenCalled();
      expect(mockSettingsService.updateNotificationPreferences).toHaveBeenCalled();
    });
  });

  it('handles notification settings update errors gracefully', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);
    mockSettingsService.updateNotificationSettings.mockRejectedValue(new Error('Update failed'));

    renderWithTheme(<NotificationSettings />);

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
    mockSettingsService.getNotificationSettings.mockImplementation(() => new Promise(() => {}));
    mockSettingsService.getNotificationPreferences.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<NotificationSettings />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading state while saving', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);
    mockSettingsService.updateNotificationSettings.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    // Disable email notifications
    const emailToggle = screen.getByLabelText('Enable Email Notifications');
    fireEvent.click(emailToggle);

    // Try to save without email frequency
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Email frequency is required when email notifications are enabled')).toBeInTheDocument();
    });
  });

  it('displays notification preview', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Notification Preview')).toBeInTheDocument();
    });

    const previewButton = screen.getByText('Show Preview');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Sample Notification')).toBeInTheDocument();
    });
  });

  it('allows bulk notification type selection', async () => {
    mockSettingsService.getNotificationSettings.mockResolvedValue(mockNotificationSettings);
    mockSettingsService.getNotificationPreferences.mockResolvedValue(mockNotificationPreferences);

    renderWithTheme(<NotificationSettings />);

    await waitFor(() => {
      expect(screen.getByText('Select All')).toBeInTheDocument();
      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });

    const selectAllButton = screen.getByText('Select All');
    const deselectAllButton = screen.getByText('Deselect All');

    fireEvent.click(selectAllButton);
    // All toggles should be checked

    fireEvent.click(deselectAllButton);
    // All toggles should be unchecked
  });
});
