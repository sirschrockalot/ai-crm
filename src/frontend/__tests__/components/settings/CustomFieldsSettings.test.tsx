import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import CustomFieldsSettings from '../../../../components/settings/CustomFieldsSettings';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getCustomFields: jest.fn(),
    createCustomField: jest.fn(),
    updateCustomField: jest.fn(),
    deleteCustomField: jest.fn(),
    getCustomFieldTypes: jest.fn(),
    validateCustomField: jest.fn(),
  },
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
    id: 'field-1',
    name: 'Property Type',
    label: 'Property Type',
    type: 'select',
    required: true,
    options: ['Single Family', 'Multi-Family', 'Commercial', 'Land'],
    defaultValue: 'Single Family',
    order: 1,
    active: true,
    entity: 'lead',
  },
  {
    id: 'field-2',
    name: 'Renovation Budget',
    label: 'Renovation Budget',
    type: 'number',
    required: false,
    minValue: 0,
    maxValue: 1000000,
    defaultValue: 50000,
    order: 2,
    active: true,
    entity: 'lead',
  },
  {
    id: 'field-3',
    name: 'Timeline',
    label: 'Timeline',
    type: 'date',
    required: true,
    defaultValue: null,
    order: 3,
    active: true,
    entity: 'lead',
  },
];

const mockCustomFieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'date', label: 'Date Picker' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'url', label: 'URL' },
  { value: 'file', label: 'File Upload' },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('CustomFieldsSettings', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the custom fields settings interface', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Custom Fields')).toBeInTheDocument();
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });
  });

  it('displays existing custom fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Property Type')).toBeInTheDocument();
      expect(screen.getByText('Renovation Budget')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });
  });

  it('allows adding a new custom field', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);
    mockSettingsService.createCustomField.mockResolvedValue({
      id: 'field-4',
      name: 'New Field',
      label: 'New Field',
      type: 'text',
      required: false,
      order: 4,
      active: true,
      entity: 'lead',
    });

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
      expect(screen.getByLabelText('Field Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Field Label')).toBeInTheDocument();
      expect(screen.getByLabelText('Field Type')).toBeInTheDocument();
    });
  });

  it('allows editing an existing custom field', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);
    mockSettingsService.updateCustomField.mockResolvedValue(undefined);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Custom Field')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Property Type')).toBeInTheDocument();
    });
  });

  it('allows deleting a custom field', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);
    mockSettingsService.deleteCustomField.mockResolvedValue(undefined);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Custom Field')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this custom field?')).toBeInTheDocument();
    });
  });

  it('displays field type options', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      const typeSelect = screen.getByLabelText('Field Type');
      expect(typeSelect).toBeInTheDocument();
      
      // Check that all field types are available
      expect(screen.getByText('Text Input')).toBeInTheDocument();
      expect(screen.getByText('Number')).toBeInTheDocument();
      expect(screen.getByText('Dropdown Select')).toBeInTheDocument();
    });
  });

  it('validates required fields when creating custom field', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create Field');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Field name is required')).toBeInTheDocument();
      expect(screen.getByText('Field label is required')).toBeInTheDocument();
      expect(screen.getByText('Field type is required')).toBeInTheDocument();
    });
  });

  it('allows configuring field options for select fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText('Field Type');
    fireEvent.change(typeSelect, { target: { value: 'select' } });

    await waitFor(() => {
      expect(screen.getByText('Field Options')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter option value')).toBeInTheDocument();
    });
  });

  it('allows setting field validation rules', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText('Field Type');
    fireEvent.change(typeSelect, { target: { value: 'number' } });

    await waitFor(() => {
      expect(screen.getByText('Validation Rules')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum Value')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum Value')).toBeInTheDocument();
    });
  });

  it('allows reordering custom fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Property Type')).toBeInTheDocument();
      expect(screen.getByText('Renovation Budget')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });

    // Check that reorder handles are present
    expect(screen.getAllByTestId('reorder-handle')).toHaveLength(3);
  });

  it('allows toggling field active status', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);
    mockSettingsService.updateCustomField.mockResolvedValue(undefined);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Active')).toBeInTheDocument();
    });

    const activeToggle = screen.getByLabelText('Active');
    expect(activeToggle).toBeChecked();

    fireEvent.click(activeToggle);
    expect(activeToggle).not.toBeChecked();
  });

  it('displays field entity information', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Entity: Lead')).toBeInTheDocument();
    });
  });

  it('allows filtering fields by entity', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by Entity')).toBeInTheDocument();
    });

    const entityFilter = screen.getByLabelText('Filter by Entity');
    fireEvent.change(entityFilter, { target: { value: 'deal' } });

    await waitFor(() => {
      expect(entityFilter).toHaveValue('deal');
    });
  });

  it('allows searching custom fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search custom fields...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search custom fields...');
    fireEvent.change(searchInput, { target: { value: 'Property' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('Property');
    });
  });

  it('handles custom field creation errors gracefully', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);
    mockSettingsService.createCustomField.mockRejectedValue(new Error('Creation failed'));

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });

    // Fill in required fields
    const nameInput = screen.getByLabelText('Field Name');
    const labelInput = screen.getByLabelText('Field Label');
    const typeSelect = screen.getByLabelText('Field Type');

    fireEvent.change(nameInput, { target: { value: 'Test Field' } });
    fireEvent.change(labelInput, { target: { value: 'Test Field' } });
    fireEvent.change(typeSelect, { target: { value: 'text' } });

    const createButton = screen.getByText('Create Field');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Creation failed',
          status: 'error',
        })
      );
    });
  });

  it('shows loading state while fetching data', async () => {
    mockSettingsService.getCustomFields.mockImplementation(() => new Promise(() => {}));
    mockSettingsService.getCustomFieldTypes.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<CustomFieldsSettings />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading state while saving', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);
    mockSettingsService.createCustomField.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });

    // Fill in required fields
    const nameInput = screen.getByLabelText('Field Name');
    const labelInput = screen.getByLabelText('Field Label');
    const typeSelect = screen.getByLabelText('Field Type');

    fireEvent.change(nameInput, { target: { value: 'Test Field' } });
    fireEvent.change(labelInput, { target: { value: 'Test Field' } });
    fireEvent.change(typeSelect, { target: { value: 'text' } });

    const createButton = screen.getByText('Create Field');
    fireEvent.click(createButton);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('validates field name format', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Field Name');
    fireEvent.change(nameInput, { target: { value: 'Invalid Field Name' } });

    await waitFor(() => {
      expect(screen.getByText('Field name must contain only letters, numbers, and underscores')).toBeInTheDocument();
    });
  });

  it('allows setting field default values', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getCustomFieldTypes.mockResolvedValue(mockCustomFieldTypes);

    renderWithTheme(<CustomFieldsSettings />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Field')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText('Field Type');
    fireEvent.change(typeSelect, { target: { value: 'text' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Default Value')).toBeInTheDocument();
    });
  });
});
