import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import ProfileSettings from '../../../../components/settings/ProfileSettings';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
  },
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockUserProfile = {
  id: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  title: 'Sales Manager',
  department: 'sales',
  avatar: 'https://example.com/avatar.jpg',
};

const mockUserPreferences = {
  theme: 'light' as const,
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY' as const,
  timeFormat: '12h' as const,
  dashboard: {
    layout: 'grid' as const,
    defaultView: 'overview',
    refreshInterval: 30,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('ProfileSettings', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the profile settings interface', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
    });
  });

  it('displays user profile information correctly', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1-555-0123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sales Manager')).toBeInTheDocument();
      expect(screen.getByDisplayValue('sales')).toBeInTheDocument();
    });
  });

  it('displays user preferences correctly', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('light')).toBeInTheDocument();
      expect(screen.getByDisplayValue('en')).toBeInTheDocument();
      expect(screen.getByDisplayValue('America/New_York')).toBeInTheDocument();
      expect(screen.getByDisplayValue('MM/DD/YYYY')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12h')).toBeInTheDocument();
    });
  });

  it('allows editing profile information', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);
    mockSettingsService.updateUserProfile.mockResolvedValue(mockUserProfile);

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('allows editing preferences', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);
    mockSettingsService.updateUserPreferences.mockResolvedValue(mockUserPreferences);

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.updateUserPreferences).toHaveBeenCalled();
    });
  });

  it('handles profile update errors gracefully', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);
    mockSettingsService.updateUserProfile.mockRejectedValue(new Error('Update failed'));

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

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

  it('handles preferences update errors gracefully', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);
    mockSettingsService.updateUserPreferences.mockRejectedValue(new Error('Update failed'));

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Save Preferences')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Preferences');
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
    mockSettingsService.getUserProfile.mockImplementation(() => new Promise(() => {}));
    mockSettingsService.getUserPreferences.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<ProfileSettings />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading state while saving', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);
    mockSettingsService.updateUserProfile.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('validates required fields before saving', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    // Clear required fields
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: '' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });
  });

  it('cancels editing and reverts changes', async () => {
    mockSettingsService.getUserProfile.mockResolvedValue(mockUserProfile);
    mockSettingsService.getUserPreferences.mockResolvedValue(mockUserPreferences);

    renderWithTheme(<ProfileSettings />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    // Verify original values are restored
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });
});
