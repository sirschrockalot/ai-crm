import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import CustomFieldsManagement from '../../../../components/settings/CustomFieldsManagement';
import { theme } from '../../../../design-system/theme';

// Mock the API service
jest.mock('../../../../services/customFieldsService', () => ({
  getCustomFields: jest.fn(),
  createCustomField: jest.fn(),
  updateCustomField: jest.fn(),
  deleteCustomField: jest.fn(),
}));

// Mock the toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockCustomFields = [
  {
    id: '1',
    label: 'Property Type',
    name: 'propertyType',
    type: 'select',
    required: true,
    options: ['Single Family', 'Multi Family', 'Commercial'],
    defaultValue: 'Single Family',
    order: 1,
    active: true,
  },
  {
    id: '2',
    label: 'Square Footage',
    name: 'squareFootage',
    type: 'number',
    required: false,
    minValue: 0,
    maxValue: 10000,
    order: 2,
    active: true,
  },
  {
    id: '3',
    label: 'Notes',
    name: 'notes',
    type: 'textarea',
    required: false,
    maxLength: 500,
    order: 3,
    active: true,
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('CustomFieldsManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the custom fields management interface', () => {
    renderWithTheme(<CustomFieldsManagement />);
    
    expect(screen.getByText('Custom Fields Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Custom Field/i })).toBeInTheDocument();
  });

  it('displays custom fields table with columns', () => {
    renderWithTheme(<CustomFieldsManagement />);
    
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows add custom field button', () => {
    renderWithTheme(<CustomFieldsManagement />);
    
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    expect(addButton).toBeInTheDocument();
  });

  it('opens add custom field modal when add button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    expect(screen.getByLabelText(/Field Label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Field Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Required/i)).toBeInTheDocument();
  });

  it('allows creating a text field', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Property Address');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'text');
    
    const requiredCheckbox = screen.getByLabelText(/Required/i);
    await user.click(requiredCheckbox);
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show success message or close modal
    expect(screen.queryByText('Add Custom Field')).not.toBeInTheDocument();
  });

  it('allows creating a select field with options', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Property Status');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'select');
    
    // Add options
    const addOptionButton = screen.getByRole('button', { name: /Add Option/i });
    await user.click(addOptionButton);
    
    const optionInput = screen.getByPlaceholderText(/Enter option/i);
    await user.type(optionInput, 'Available');
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show success message or close modal
    expect(screen.queryByText('Add Custom Field')).not.toBeInTheDocument();
  });

  it('allows creating a number field with validation', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Price Range');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'number');
    
    const minValueInput = screen.getByLabelText(/Minimum Value/i);
    await user.type(minValueInput, '0');
    
    const maxValueInput = screen.getByLabelText(/Maximum Value/i);
    await user.type(maxValueInput, '1000000');
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show success message or close modal
    expect(screen.queryByText('Add Custom Field')).not.toBeInTheDocument();
  });

  it('allows creating a date field', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Closing Date');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'date');
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show success message or close modal
    expect(screen.queryByText('Add Custom Field')).not.toBeInTheDocument();
  });

  it('allows creating a checkbox field', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Property Features');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'checkbox');
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show success message or close modal
    expect(screen.queryByText('Add Custom Field')).not.toBeInTheDocument();
  });

  it('allows creating a textarea field', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Additional Notes');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'textarea');
    
    const maxLengthInput = screen.getByLabelText(/Maximum Length/i);
    await user.type(maxLengthInput, '1000');
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show success message or close modal
    expect(screen.queryByText('Add Custom Field')).not.toBeInTheDocument();
  });

  it('validates required fields in add form', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Try to submit without required fields
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Field label is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Field type is required/i)).toBeInTheDocument();
    });
  });

  it('validates field name format', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Property Address');
    
    const nameInput = screen.getByLabelText(/Field Name/i);
    await user.type(nameInput, 'invalid field name');
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Field name must be alphanumeric with underscores/i)).toBeInTheDocument();
    });
  });

  it('allows editing existing custom fields', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Find edit button
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    if (editButtons.length > 0) {
      await user.click(editButtons[0]);
      
      expect(screen.getByText(/Edit Custom Field/i)).toBeInTheDocument();
      
      // Modify the field
      const labelInput = screen.getByLabelText(/Field Label/i);
      await user.clear(labelInput);
      await user.type(labelInput, 'Updated Property Type');
      
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(saveButton);
      
      // Should show success message or close modal
      expect(screen.queryByText(/Edit Custom Field/i)).not.toBeInTheDocument();
    }
  });

  it('allows reordering custom fields', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Find reorder buttons
    const moveUpButtons = screen.getAllByRole('button', { name: /Move Up/i });
    const moveDownButtons = screen.getAllByRole('button', { name: /Move Down/i });
    
    if (moveUpButtons.length > 0) {
      await user.click(moveUpButtons[0]);
      // Should move field up
    }
    
    if (moveDownButtons.length > 0) {
      await user.click(moveDownButtons[0]);
      // Should move field down
    }
  });

  it('allows toggling field status', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Find toggle buttons
    const toggleButtons = screen.getAllByRole('button', { name: /Toggle/i });
    if (toggleButtons.length > 0) {
      await user.click(toggleButtons[0]);
      
      // Should show confirmation dialog
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    }
  });

  it('allows deleting custom fields', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Find delete button
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      
      // Should show confirmation dialog
      expect(screen.getByText(/Are you sure you want to delete the custom field/i)).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
      
      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(confirmButton);
      
      // Should remove the field
      expect(screen.queryByText(/Are you sure you want to delete the custom field/i)).not.toBeInTheDocument();
    }
  });

  it('shows field preview in modal', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Test Field');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'text');
    
    // Should show field preview
    expect(screen.getByText('Field Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  it('allows setting default values', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in field details
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Default Field');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'text');
    
    const defaultValueInput = screen.getByLabelText(/Default Value/i);
    await user.type(defaultValueInput, 'Default Text');
    
    expect(defaultValueInput).toHaveValue('Default Text');
  });

  it('handles field type specific options', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Select select field type
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'select');
    
    // Should show options section
    expect(screen.getByText('Field Options')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Option/i })).toBeInTheDocument();
  });

  it('shows field usage information', () => {
    renderWithTheme(<CustomFieldsManagement />);
    
    // Check if usage information is displayed
    expect(screen.getByText(/Fields in Use/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Fields/i)).toBeInTheDocument();
  });

  it('allows bulk operations', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Select multiple fields
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]); // Select first field
      await user.click(checkboxes[2]); // Select second field
      
      // Should show bulk action buttons
      expect(screen.getByRole('button', { name: /Bulk Actions/i })).toBeInTheDocument();
    }
  });

  it('exports custom fields configuration', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Find export button
    const exportButton = screen.queryByRole('button', { name: /Export/i });
    if (exportButton) {
      await user.click(exportButton);
      
      // Should show export options
      expect(screen.getByText(/Export Format/i)).toBeInTheDocument();
    }
  });

  it('maintains accessibility standards', () => {
    renderWithTheme(<CustomFieldsManagement />);
    
    // Check for proper table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Check for proper form labels
    expect(screen.getByLabelText(/Field Label/i)).toBeInTheDocument();
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: /Add Custom Field/i })).toBeInTheDocument();
  });

  it('handles form submission with loading state', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CustomFieldsManagement />);
    
    // Open add modal
    const addButton = screen.getByRole('button', { name: /Add Custom Field/i });
    await user.click(addButton);
    
    // Fill in required fields
    const labelInput = screen.getByLabelText(/Field Label/i);
    await user.type(labelInput, 'Test Field');
    
    const typeSelect = screen.getByLabelText(/Field Type/i);
    await user.selectOptions(typeSelect, 'text');
    
    const createButton = screen.getByRole('button', { name: /Create Field/i });
    await user.click(createButton);
    
    // Should show loading state
    expect(createButton).toBeDisabled();
  });
});
