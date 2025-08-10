import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';
import OrganizationalSettings from '../../../components/settings/OrganizationalSettings';
import { useOrganization, useUpdateOrganization } from '../../../hooks/useOrganization';

// Mock the hooks
jest.mock('../../../hooks/useOrganization');

const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;
const mockUseUpdateOrganization = useUpdateOrganization as jest.MockedFunction<typeof useUpdateOrganization>;

// Mock the organization service
jest.mock('../../../services/organizationService', () => ({
  getOrganization: jest.fn(),
  updateOrganization: jest.fn(),
}));

const mockOrganization = {
  id: 'org1',
  name: 'Presidential Digs',
  legalName: 'Presidential Digs LLC',
  industry: 'Real Estate',
  size: '50-100',
  website: 'https://presidentialdigs.com',
  phone: '+1-555-0123',
  email: 'info@presidentialdigs.com',
  address: {
    street: '123 Main Street',
    city: 'Washington',
    state: 'DC',
    zipCode: '20001',
    country: 'USA',
  },
  branding: {
    logo: 'https://example.com/logo.png',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontFamily: 'Roboto',
    customCSS: '',
  },
  departments: [
    {
      id: 'dept1',
      name: 'Sales',
      description: 'Sales and business development',
      manager: 'John Doe',
      members: ['user1', 'user2', 'user3'],
    },
    {
      id: 'dept2',
      name: 'Marketing',
      description: 'Marketing and lead generation',
      manager: 'Jane Smith',
      members: ['user4', 'user5'],
    },
  ],
  teams: [
    {
      id: 'team1',
      name: 'Acquisitions Team',
      description: 'Property acquisition specialists',
      department: 'Sales',
      members: ['user1', 'user2'],
      lead: 'John Doe',
    },
    {
      id: 'team2',
      name: 'Marketing Team',
      description: 'Digital marketing and lead generation',
      department: 'Marketing',
      members: ['user4', 'user5'],
      lead: 'Jane Smith',
    },
  ],
  settings: {
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York',
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockUpdateOrganization = jest.fn();

describe('OrganizationalSettings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseOrganization.mockReturnValue({
      data: mockOrganization,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseUpdateOrganization.mockReturnValue({
      mutate: mockUpdateOrganization,
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
          <OrganizationalSettings />
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders organizational settings interface', () => {
    renderComponent();

    expect(screen.getByText('Organizational Settings')).toBeInTheDocument();
    expect(screen.getByText('Company Information')).toBeInTheDocument();
    expect(screen.getByText('Branding & Appearance')).toBeInTheDocument();
    expect(screen.getByText('Organizational Structure')).toBeInTheDocument();
    expect(screen.getByText('Regional Settings')).toBeInTheDocument();
  });

  it('displays current company information', () => {
    renderComponent();

    expect(screen.getByDisplayValue('Presidential Digs')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Presidential Digs LLC')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Real Estate')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50-100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://presidentialdigs.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1-555-0123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('info@presidentialdigs.com')).toBeInTheDocument();
  });

  it('displays current address information', () => {
    renderComponent();

    expect(screen.getByDisplayValue('123 Main Street')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Washington')).toBeInTheDocument();
    expect(screen.getByDisplayValue('DC')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USA')).toBeInTheDocument();
  });

  it('displays current branding settings', () => {
    renderComponent();

    expect(screen.getByDisplayValue('#1976d2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('#dc004e')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Roboto')).toBeInTheDocument();
  });

  it('displays current regional settings', () => {
    renderComponent();

    expect(screen.getByDisplayValue('America/New_York')).toBeInTheDocument();
    expect(screen.getByDisplayValue('MM/DD/YYYY')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
    expect(screen.getByDisplayValue('en')).toBeInTheDocument();
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('17:00')).toBeInTheDocument();
  });

  it('allows editing company name', async () => {
    renderComponent();

    const companyNameInput = screen.getByDisplayValue('Presidential Digs');
    fireEvent.change(companyNameInput, { target: { value: 'New Company Name' } });

    expect(companyNameInput).toHaveValue('New Company Name');
  });

  it('allows editing company industry', async () => {
    renderComponent();

    const industryInput = screen.getByDisplayValue('Real Estate');
    fireEvent.change(industryInput, { target: { value: 'Technology' } });

    expect(industryInput).toHaveValue('Technology');
  });

  it('allows editing company website', async () => {
    renderComponent();

    const websiteInput = screen.getByDisplayValue('https://presidentialdigs.com');
    fireEvent.change(websiteInput, { target: { value: 'https://newcompany.com' } });

    expect(websiteInput).toHaveValue('https://newcompany.com');
  });

  it('allows editing company address', async () => {
    renderComponent();

    const streetInput = screen.getByDisplayValue('123 Main Street');
    fireEvent.change(streetInput, { target: { value: '456 New Street' } });

    expect(streetInput).toHaveValue('456 New Street');
  });

  it('allows editing branding colors', async () => {
    renderComponent();

    const primaryColorInput = screen.getByDisplayValue('#1976d2');
    fireEvent.change(primaryColorInput, { target: { value: '#ff0000' } });

    expect(primaryColorInput).toHaveValue('#ff0000');
  });

  it('allows editing timezone settings', async () => {
    renderComponent();

    const timezoneInput = screen.getByDisplayValue('America/New_York');
    fireEvent.change(timezoneInput, { target: { value: 'America/Los_Angeles' } });

    expect(timezoneInput).toHaveValue('America/Los_Angeles');
  });

  it('allows editing working hours', async () => {
    renderComponent();

    const startTimeInput = screen.getByDisplayValue('09:00');
    fireEvent.change(startTimeInput, { target: { value: '08:00' } });

    expect(startTimeInput).toHaveValue('08:00');
  });

  it('saves changes when save button is clicked', async () => {
    renderComponent();

    const companyNameInput = screen.getByDisplayValue('Presidential Digs');
    fireEvent.change(companyNameInput, { target: { value: 'Updated Company Name' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        ...mockOrganization,
        name: 'Updated Company Name',
      });
    });
  });

  it('resets form when reset button is clicked', async () => {
    renderComponent();

    const companyNameInput = screen.getByDisplayValue('Presidential Digs');
    fireEvent.change(companyNameInput, { target: { value: 'Changed Name' } });

    expect(companyNameInput).toHaveValue('Changed Name');

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(companyNameInput).toHaveValue('Presidential Digs');
    });
  });

  it('shows loading state when saving', () => {
    mockUseUpdateOrganization.mockReturnValue({
      mutate: mockUpdateOrganization,
      isLoading: true,
      error: null,
      reset: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows error message when update fails', () => {
    mockUseUpdateOrganization.mockReturnValue({
      mutate: mockUpdateOrganization,
      isLoading: false,
      error: new Error('Update failed'),
      reset: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText('Error: Update failed')).toBeInTheDocument();
  });

  it('shows success message when update succeeds', async () => {
    mockUpdateOrganization.mockImplementation((data) => {
      return Promise.resolve(data);
    });

    renderComponent();

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Organization settings updated successfully')).toBeInTheDocument();
    });
  });

  it('validates required fields before saving', async () => {
    renderComponent();

    const companyNameInput = screen.getByDisplayValue('Presidential Digs');
    fireEvent.change(companyNameInput, { target: { value: '' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
    });

    expect(mockUpdateOrganization).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    renderComponent();

    const emailInput = screen.getByDisplayValue('info@presidentialdigs.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates website URL format', async () => {
    renderComponent();

    const websiteInput = screen.getByDisplayValue('https://presidentialdigs.com');
    fireEvent.change(websiteInput, { target: { value: 'invalid-url' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    renderComponent();

    const phoneInput = screen.getByDisplayValue('+1-555-0123');
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
    });
  });

  it('expands and collapses sections when clicked', async () => {
    renderComponent();

    const brandingSection = screen.getByText('Branding & Appearance');
    fireEvent.click(brandingSection);

    // Check if branding settings are visible
    expect(screen.getByText('Primary Color')).toBeInTheDocument();
    expect(screen.getByText('Secondary Color')).toBeInTheDocument();
    expect(screen.getByText('Font Family')).toBeInTheDocument();
  });

  it('shows logo upload interface', async () => {
    renderComponent();

    const brandingSection = screen.getByText('Branding & Appearance');
    fireEvent.click(brandingSection);

    expect(screen.getByText('Company Logo')).toBeInTheDocument();
    expect(screen.getByText('Upload Logo')).toBeInTheDocument();
  });

  it('handles logo file upload', async () => {
    renderComponent();

    const brandingSection = screen.getByText('Branding & Appearance');
    fireEvent.click(brandingSection);

    const fileInput = screen.getByLabelText('Upload Logo');
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('logo.png')).toBeInTheDocument();
    });
  });

  it('shows color picker for branding colors', async () => {
    renderComponent();

    const brandingSection = screen.getByText('Branding & Appearance');
    fireEvent.click(brandingSection);

    const primaryColorInput = screen.getByDisplayValue('#1976d2');
    expect(primaryColorInput).toHaveAttribute('type', 'color');
  });

  it('shows font family selector', async () => {
    renderComponent();

    const brandingSection = screen.getByText('Branding & Appearance');
    fireEvent.click(brandingSection);

    const fontSelect = screen.getByDisplayValue('Roboto');
    expect(fontSelect.tagName).toBe('SELECT');
  });

  it('shows custom CSS editor', async () => {
    renderComponent();

    const brandingSection = screen.getByText('Branding & Appearance');
    fireEvent.click(brandingSection);

    expect(screen.getByText('Custom CSS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter custom CSS...')).toBeInTheDocument();
  });

  it('shows department management interface', async () => {
    renderComponent();

    const structureSection = screen.getByText('Organizational Structure');
    fireEvent.click(structureSection);

    expect(screen.getByText('Departments')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('shows team management interface', async () => {
    renderComponent();

    const structureSection = screen.getByText('Organizational Structure');
    fireEvent.click(structureSection);

    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Acquisitions Team')).toBeInTheDocument();
    expect(screen.getByText('Marketing Team')).toBeInTheDocument();
  });

  it('allows adding new department', async () => {
    renderComponent();

    const structureSection = screen.getByText('Organizational Structure');
    fireEvent.click(structureSection);

    const addDeptButton = screen.getByText('Add Department');
    fireEvent.click(addDeptButton);

    await waitFor(() => {
      expect(screen.getByText('Department Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Department Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  it('allows adding new team', async () => {
    renderComponent();

    const structureSection = screen.getByText('Organizational Structure');
    fireEvent.click(structureSection);

    const addTeamButton = screen.getByText('Add Team');
    fireEvent.click(addTeamButton);

    await waitFor(() => {
      expect(screen.getByText('Team Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Team Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
  });

  it('shows timezone selector with common options', async () => {
    renderComponent();

    const regionalSection = screen.getByText('Regional Settings');
    fireEvent.click(regionalSection);

    const timezoneSelect = screen.getByDisplayValue('America/New_York');
    fireEvent.click(timezoneSelect);

    // Check for common timezone options
    expect(screen.getByText('America/New_York')).toBeInTheDocument();
    expect(screen.getByText('America/Los_Angeles')).toBeInTheDocument();
    expect(screen.getByText('Europe/London')).toBeInTheDocument();
  });

  it('shows date format options', async () => {
    renderComponent();

    const regionalSection = screen.getByText('Regional Settings');
    fireEvent.click(regionalSection);

    const dateFormatSelect = screen.getByDisplayValue('MM/DD/YYYY');
    fireEvent.click(dateFormatSelect);

    expect(screen.getByText('MM/DD/YYYY')).toBeInTheDocument();
    expect(screen.getByText('DD/MM/YYYY')).toBeInTheDocument();
    expect(screen.getByText('YYYY-MM-DD')).toBeInTheDocument();
  });

  it('shows currency options', async () => {
    renderComponent();

    const regionalSection = screen.getByText('Regional Settings');
    fireEvent.click(regionalSection);

    const currencySelect = screen.getByDisplayValue('USD');
    fireEvent.click(currencySelect);

    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('GBP')).toBeInTheDocument();
  });

  it('shows language options', async () => {
    renderComponent();

    const regionalSection = screen.getByText('Regional Settings');
    fireEvent.click(regionalSection);

    const languageSelect = screen.getByDisplayValue('en');
    fireEvent.click(languageSelect);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
  });

  it('shows working hours configuration', async () => {
    renderComponent();

    const regionalSection = screen.getByText('Regional Settings');
    fireEvent.click(regionalSection);

    expect(screen.getByText('Working Hours')).toBeInTheDocument();
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('17:00')).toBeInTheDocument();
  });

  it('allows setting custom working hours', async () => {
    renderComponent();

    const regionalSection = screen.getByText('Regional Settings');
    fireEvent.click(regionalSection);

    const startTimeInput = screen.getByDisplayValue('09:00');
    const endTimeInput = screen.getByDisplayValue('17:00');

    fireEvent.change(startTimeInput, { target: { value: '08:30' } });
    fireEvent.change(endTimeInput, { target: { value: '18:30' } });

    expect(startTimeInput).toHaveValue('08:30');
    expect(endTimeInput).toHaveValue('18:30');
  });

  it('shows preview of branding changes', async () => {
    renderComponent();

    const brandingSection = screen.getByText('Branding & Appearance');
    fireEvent.click(brandingSection);

    const previewButton = screen.getByText('Preview Changes');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Branding Preview')).toBeInTheDocument();
    });
  });

  it('exports organization configuration', async () => {
    renderComponent();

    const exportButton = screen.getByText('Export Configuration');
    fireEvent.click(exportButton);

    // Mock file download
    const mockDownload = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalled();
    });
  });

  it('imports organization configuration', async () => {
    renderComponent();

    const importButton = screen.getByText('Import Configuration');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Import Organization Configuration')).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText('Select File');
    const file = new File(['{"name":"Imported Org"}'], 'org.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const importConfirmButton = screen.getByText('Import');
    fireEvent.click(importConfirmButton);

    await waitFor(() => {
      expect(mockUpdateOrganization).toHaveBeenCalled();
    });
  });
});
