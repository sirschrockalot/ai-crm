import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import UserManagement from '../../../../components/settings/UserManagement';
import { theme } from '../../../../design-system/theme';

// Mock the API services
jest.mock('../../../../services/userService', () => ({
  getUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  assignRole: jest.fn(),
}));

jest.mock('../../../../services/roleService', () => ({
  getRoles: jest.fn(),
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-14T15:30:00Z',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

const mockRoles = [
  { id: '1', name: 'admin', description: 'Administrator' },
  { id: '2', name: 'user', description: 'Regular User' },
  { id: '3', name: 'manager', description: 'Manager' },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the user management interface', () => {
    renderWithTheme(<UserManagement />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New User/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search users/i)).toBeInTheDocument();
  });

  it('displays user table with columns', () => {
    renderWithTheme(<UserManagement />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Last Login')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows add new user button', () => {
    renderWithTheme(<UserManagement />);
    
    const addButton = screen.getByRole('button', { name: /Add New User/i });
    expect(addButton).toBeInTheDocument();
  });

  it('opens add user modal when add button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    const addButton = screen.getByRole('button', { name: /Add New User/i });
    await user.click(addButton);
    
    expect(screen.getByText('Add New User')).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
  });

  it('allows searching for users', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    const searchInput = screen.getByPlaceholderText(/Search users/i);
    await user.type(searchInput, 'john');
    
    expect(searchInput).toHaveValue('john');
  });

  it('filters users by status', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    const statusFilter = screen.getByLabelText(/Filter by Status/i);
    await user.selectOptions(statusFilter, 'active');
    
    expect(statusFilter).toHaveValue('active');
  });

  it('filters users by role', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    const roleFilter = screen.getByLabelText(/Filter by Role/i);
    await user.selectOptions(roleFilter, 'admin');
    
    expect(roleFilter).toHaveValue('admin');
  });

  it('allows editing user information', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Open edit modal (assuming there's an edit button)
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);
      
      expect(screen.getByText(/Edit User/i)).toBeInTheDocument();
    }
  });

  it('allows changing user role', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Open edit modal
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);
      
      const roleSelect = screen.getByLabelText(/Role/i);
      await user.selectOptions(roleSelect, 'manager');
      
      expect(roleSelect).toHaveValue('manager');
    }
  });

  it('allows deactivating users', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Find deactivate button
    const deactivateButtons = screen.getAllByRole('button', { name: /Deactivate/i });
    if (deactivateButtons.length > 0) {
      await user.click(deactivateButtons[0]);
      
      // Should show confirmation dialog
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    }
  });

  it('allows reactivating users', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Find reactivate button
    const reactivateButtons = screen.getAllByRole('button', { name: /Reactivate/i });
    if (reactivateButtons.length > 0) {
      await user.click(reactivateButtons[0]);
      
      // Should show confirmation dialog
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    }
  });

  it('shows user details in table', () => {
    renderWithTheme(<UserManagement />);
    
    // Check if user information is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('handles bulk actions', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Select multiple users
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]); // Select first user
      await user.click(checkboxes[2]); // Select second user
      
      // Should show bulk action buttons
      expect(screen.getByRole('button', { name: /Bulk Actions/i })).toBeInTheDocument();
    }
  });

  it('shows user activity information', () => {
    renderWithTheme(<UserManagement />);
    
    // Check for last login information
    expect(screen.getByText(/Last Login/i)).toBeInTheDocument();
    
    // Check for creation date
    expect(screen.getByText(/Created/i)).toBeInTheDocument();
  });

  it('validates required fields in add user form', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Open add user modal
    const addButton = screen.getByRole('button', { name: /Add New User/i });
    await user.click(addButton);
    
    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: /Create User/i });
    await user.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Open add user modal
    const addButton = screen.getByRole('button', { name: /Add New User/i });
    await user.click(addButton);
    
    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /Create User/i });
    await user.click(submitButton);
    
    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog for destructive actions', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Find delete button
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      
      // Should show confirmation dialog
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    }
  });

  it('handles pagination', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Check if pagination controls are present
    const nextButton = screen.queryByRole('button', { name: /Next/i });
    const prevButton = screen.queryByRole('button', { name: /Previous/i });
    
    if (nextButton) {
      await user.click(nextButton);
      // Should load next page
    }
    
    if (prevButton) {
      await user.click(prevButton);
      // Should load previous page
    }
  });

  it('exports user data', async () => {
    const user = userEvent.setup();
    renderWithTheme(<UserManagement />);
    
    // Find export button
    const exportButton = screen.queryByRole('button', { name: /Export/i });
    if (exportButton) {
      await user.click(exportButton);
      
      // Should show export options
      expect(screen.getByText(/Export Format/i)).toBeInTheDocument();
    }
  });

  it('maintains accessibility standards', () => {
    renderWithTheme(<UserManagement />);
    
    // Check for proper table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Check for proper form labels
    expect(screen.getByLabelText(/Search users/i)).toBeInTheDocument();
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: /Add New User/i })).toBeInTheDocument();
  });
});
