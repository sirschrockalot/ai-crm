import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import LeadsPage from '../../pages/leads/index';

// Mock the hooks
jest.mock('../../hooks/services/useLeads', () => ({
  useLeads: () => ({
    leads: [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        status: 'new',
        propertyType: 'single_family',
        estimatedValue: 250000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        status: 'contacted',
        propertyType: 'multi_family',
        estimatedValue: 450000,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    fetchLeads: jest.fn(),
    createLead: jest.fn(),
    updateLead: jest.fn(),
    deleteLead: jest.fn(),
    bulkUpdate: jest.fn(),
    bulkDelete: jest.fn(),
    bulkAssign: jest.fn(),
    bulkChangeStatus: jest.fn(),
    getBulkOperationStats: jest.fn(),
    validateLeadIds: jest.fn(),
  }),
}));

// Mock the layout components
jest.mock('../../components/layout', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
  Header: () => <div data-testid="header">Header</div>,
  Navigation: () => <div data-testid="navigation">Navigation</div>,
  SearchBar: () => <div data-testid="search-bar">SearchBar</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('Leads Page E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the leads page with all components', () => {
    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('Leads Management')).toBeInTheDocument();
    expect(screen.getByText('Add New Lead')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('should display leads in the table', () => {
    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should show lead status badges', () => {
    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByText('contacted')).toBeInTheDocument();
  });

  it('should show property type badges', () => {
    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('single family')).toBeInTheDocument();
    expect(screen.getByText('multi family')).toBeInTheDocument();
  });

  it('should display estimated values', () => {
    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('$250,000')).toBeInTheDocument();
    expect(screen.getByText('$450,000')).toBeInTheDocument();
  });

  it('should show action buttons for each lead', () => {
    renderWithProviders(<LeadsPage />);

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('should show bulk operations when leads are selected', async () => {
    renderWithProviders(<LeadsPage />);

    const user = userEvent.setup();

    // Select a lead
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Select first lead

    // Bulk operations should appear
    await waitFor(() => {
      expect(screen.getByText(/Bulk Operations/)).toBeInTheDocument();
    });
  });

  it('should filter leads by status', async () => {
    renderWithProviders(<LeadsPage />);

    const user = userEvent.setup();

    // Find and click the status filter
    const statusFilter = screen.getByDisplayValue('All Statuses');
    await user.click(statusFilter);

    // Select "New" status
    const newOption = screen.getByText('New');
    await user.click(newOption);

    // Should only show new leads
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should filter leads by property type', async () => {
    renderWithProviders(<LeadsPage />);

    const user = userEvent.setup();

    // Find and click the property type filter
    const propertyFilter = screen.getByDisplayValue('All Property Types');
    await user.click(propertyFilter);

    // Select "Single Family" type
    const singleFamilyOption = screen.getByText('Single Family');
    await user.click(singleFamilyOption);

    // Should only show single family leads
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should search leads by name or email', async () => {
    renderWithProviders(<LeadsPage />);

    const user = userEvent.setup();

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'john');

    // Should only show John's lead
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should show statistics cards', () => {
    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total leads count
    expect(screen.getByText('New Leads')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // New leads count
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Qualified count
    expect(screen.getByText('Converted')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Converted count
  });

  it('should handle empty state when no leads exist', () => {
    // Mock empty leads
    jest.doMock('../../hooks/services/useLeads', () => ({
      useLeads: () => ({
        leads: [],
        loading: false,
        error: null,
        fetchLeads: jest.fn(),
        createLead: jest.fn(),
        updateLead: jest.fn(),
        deleteLead: jest.fn(),
        bulkUpdate: jest.fn(),
        bulkDelete: jest.fn(),
        bulkAssign: jest.fn(),
        bulkChangeStatus: jest.fn(),
        getBulkOperationStats: jest.fn(),
        validateLeadIds: jest.fn(),
      }),
    }));

    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('No leads found')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    // Mock loading state
    jest.doMock('../../hooks/services/useLeads', () => ({
      useLeads: () => ({
        leads: [],
        loading: true,
        error: null,
        fetchLeads: jest.fn(),
        createLead: jest.fn(),
        updateLead: jest.fn(),
        deleteLead: jest.fn(),
        bulkUpdate: jest.fn(),
        bulkDelete: jest.fn(),
        bulkAssign: jest.fn(),
        bulkChangeStatus: jest.fn(),
        getBulkOperationStats: jest.fn(),
        validateLeadIds: jest.fn(),
      }),
    }));

    renderWithProviders(<LeadsPage />);

    expect(screen.getByText('Loading leads...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    // Mock error state
    jest.doMock('../../hooks/services/useLeads', () => ({
      useLeads: () => ({
        leads: [],
        loading: false,
        error: 'Failed to load leads',
        fetchLeads: jest.fn(),
        createLead: jest.fn(),
        updateLead: jest.fn(),
        deleteLead: jest.fn(),
        bulkUpdate: jest.fn(),
        bulkDelete: jest.fn(),
        bulkAssign: jest.fn(),
        bulkChangeStatus: jest.fn(),
        getBulkOperationStats: jest.fn(),
        validateLeadIds: jest.fn(),
      }),
    }));

    renderWithProviders(<LeadsPage />);

    expect(screen.getByText(/Error loading leads/)).toBeInTheDocument();
    expect(screen.getByText('Failed to load leads')).toBeInTheDocument();
  });
}); 