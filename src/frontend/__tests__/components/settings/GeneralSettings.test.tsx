import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import GeneralSettings from '../../../../components/settings/GeneralSettings';
import { theme } from '../../../../design-system/theme';

// Mock the API service
jest.mock('../../../../services/settingsService', () => ({
  getGeneralSettings: jest.fn(),
  updateGeneralSettings: jest.fn(),
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockSettings = {
  companyName: 'Test Company',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  language: 'en',
  businessHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'America/New_York',
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('GeneralSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the general settings form', () => {
    renderWithTheme(<GeneralSettings />);
    
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
  });

  it('displays business hours section', () => {
    renderWithTheme(<GeneralSettings />);
    
    expect(screen.getByText('Business Hours')).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Hours Timezone/i)).toBeInTheDocument();
  });

  it('displays notification preferences section', () => {
    renderWithTheme(<GeneralSettings />);
    
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SMS Notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Push Notifications/i)).toBeInTheDocument();
  });

  it('allows editing company name', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const companyNameInput = screen.getByLabelText(/Company Name/i);
    await user.clear(companyNameInput);
    await user.type(companyNameInput, 'New Company Name');
    
    expect(companyNameInput).toHaveValue('New Company Name');
  });

  it('allows changing timezone', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const timezoneSelect = screen.getByLabelText(/Timezone/i);
    await user.selectOptions(timezoneSelect, 'America/Los_Angeles');
    
    expect(timezoneSelect).toHaveValue('America/Los_Angeles');
  });

  it('allows changing date format', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const dateFormatSelect = screen.getByLabelText(/Date Format/i);
    await user.selectOptions(dateFormatSelect, 'DD/MM/YYYY');
    
    expect(dateFormatSelect).toHaveValue('DD/MM/YYYY');
  });

  it('allows changing currency', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const currencySelect = screen.getByLabelText(/Currency/i);
    await user.selectOptions(currencySelect, 'EUR');
    
    expect(currencySelect).toHaveValue('EUR');
  });

  it('allows changing language', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const languageSelect = screen.getByLabelText(/Language/i);
    await user.selectOptions(languageSelect, 'es');
    
    expect(languageSelect).toHaveValue('es');
  });

  it('allows changing business hours', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const startTimeInput = screen.getByLabelText(/Start Time/i);
    const endTimeInput = screen.getByLabelText(/End Time/i);
    
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '08:00');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '18:00');
    
    expect(startTimeInput).toHaveValue('08:00');
    expect(endTimeInput).toHaveValue('18:00');
  });

  it('allows changing business hours timezone', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const businessHoursTimezoneSelect = screen.getByLabelText(/Business Hours Timezone/i);
    await user.selectOptions(businessHoursTimezoneSelect, 'America/Chicago');
    
    expect(businessHoursTimezoneSelect).toHaveValue('America/Chicago');
  });

  it('allows toggling notification preferences', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const emailCheckbox = screen.getByLabelText(/Email Notifications/i);
    const smsCheckbox = screen.getByLabelText(/SMS Notifications/i);
    const pushCheckbox = screen.getByLabelText(/Push Notifications/i);
    
    // Toggle email notifications
    await user.click(emailCheckbox);
    expect(emailCheckbox).not.toBeChecked();
    
    // Toggle SMS notifications
    await user.click(smsCheckbox);
    expect(smsCheckbox).toBeChecked();
    
    // Toggle push notifications
    await user.click(pushCheckbox);
    expect(pushCheckbox).not.toBeChecked();
  });

  it('shows save button', () => {
    renderWithTheme(<GeneralSettings />);
    
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('shows reset button', () => {
    renderWithTheme(<GeneralSettings />);
    
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const companyNameInput = screen.getByLabelText(/Company Name/i);
    await user.clear(companyNameInput);
    
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
    });
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const companyNameInput = screen.getByLabelText(/Company Name/i);
    const originalValue = companyNameInput.value;
    
    await user.clear(companyNameInput);
    await user.type(companyNameInput, 'Modified Company Name');
    
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    await user.click(resetButton);
    
    expect(companyNameInput).toHaveValue(originalValue);
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);
    
    // Should show loading state
    expect(saveButton).toBeDisabled();
  });

  it('displays accessibility features', () => {
    renderWithTheme(<GeneralSettings />);
    
    // Check for proper labels
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timezone/i)).toBeInTheDocument();
    
    // Check for proper roles
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('maintains form state during navigation', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GeneralSettings />);
    
    const companyNameInput = screen.getByLabelText(/Company Name/i);
    await user.clear(companyNameInput);
    await user.type(companyNameInput, 'Test Company Name');
    
    // Navigate away and back (simulate tab switching)
    const timezoneSelect = screen.getByLabelText(/Timezone/i);
    await user.click(timezoneSelect);
    
    // Company name should still have the value
    expect(companyNameInput).toHaveValue('Test Company Name');
  });
});
