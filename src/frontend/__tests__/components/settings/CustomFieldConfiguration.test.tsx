import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import CustomFieldConfiguration from '../../../../components/settings/CustomFieldConfiguration';
import { theme } from '../../../../design-system/theme';

// Mock the settings service
jest.mock('../../../../services/settingsService', () => ({
  settingsService: {
    getCustomFields: jest.fn(),
    createCustomField: jest.fn(),
    updateCustomField: jest.fn(),
    deleteCustomField: jest.fn(),
    getEntityTypes: jest.fn(),
    getFieldTypes: jest.fn(),
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
    name: 'lead_source',
    label: 'Lead Source',
    entityType: 'lead' as const,
    fieldType: 'select' as const,
    required: true,
    unique: false,
    searchable: true,
    filterable: true,
    sortable: true,
    visible: true,
    editable: true,
    defaultValue: 'website',
    options: ['website', 'referral', 'social_media', 'cold_call'],
    displayOrder: 1,
    description: 'Source of the lead',
    status: 'active' as const,
  },
  {
    id: 'field-2',
    name: 'buyer_budget',
    label: 'Buyer Budget',
    entityType: 'buyer' as const,
    fieldType: 'currency' as const,
    required: false,
    unique: false,
    searchable: true,
    filterable: true,
    sortable: true,
    visible: true,
    editable: true,
    defaultValue: 0,
    displayOrder: 2,
    description: 'Maximum budget for property purchase',
    status: 'active' as const,
  },
  {
    id: 'field-3',
    name: 'property_features',
    label: 'Property Features',
    entityType: 'property' as const,
    fieldType: 'multiselect' as const,
    required: false,
    unique: false,
    searchable: true,
    filterable: true,
    sortable: false,
    visible: true,
    editable: true,
    options: ['pool', 'garage', 'garden', 'basement', 'fireplace'],
    displayOrder: 3,
    description: 'Features available in the property',
    status: 'draft' as const,
  },
];

const mockEntityTypes = ['lead', 'buyer', 'property', 'deal', 'communication', 'user'];

const mockFieldTypes = [
  'text', 'number', 'email', 'phone', 'date', 'datetime', 'boolean', 
  'select', 'multiselect', 'textarea', 'url', 'currency', 'percentage', 'file'
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('CustomFieldConfiguration', () => {
  const mockSettingsService = require('../../../../services/settingsService').settingsService;
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the toast function
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockReturnValue({
      toast: mockToast,
    });
  });

  it('renders the custom field configuration interface', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Configuration')).toBeInTheDocument();
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
      expect(screen.getByText('Buyer Budget')).toBeInTheDocument();
    });
  });

  it('displays custom fields correctly', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
      expect(screen.getByText('Buyer Budget')).toBeInTheDocument();
      expect(screen.getByText('Property Features')).toBeInTheDocument();
      expect(screen.getByText('lead')).toBeInTheDocument();
      expect(screen.getByText('buyer')).toBeInTheDocument();
      expect(screen.getByText('property')).toBeInTheDocument();
    });
  });

  it('allows adding new custom fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);
    mockSettingsService.createCustomField.mockResolvedValue({ success: true });

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Details')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Field Name');
    const labelInput = screen.getByLabelText('Display Label');
    const entityTypeSelect = screen.getByLabelText('Entity Type');
    const fieldTypeSelect = screen.getByLabelText('Field Type');

    await userEvent.type(nameInput, 'new_field');
    await userEvent.type(labelInput, 'New Field');
    await userEvent.selectOptions(entityTypeSelect, 'deal');
    await userEvent.selectOptions(fieldTypeSelect, 'number');

    const saveButton = screen.getByText('Save Field');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.createCustomField).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'new_field',
          label: 'New Field',
          entityType: 'deal',
          fieldType: 'number',
        })
      );
    });
  });

  it('allows editing existing custom fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);
    mockSettingsService.updateCustomField.mockResolvedValue({ success: true });

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('Edit field');
    await userEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Lead Source')).toBeInTheDocument();
    });

    const labelInput = screen.getByDisplayValue('Lead Source');
    await userEvent.clear(labelInput);
    await userEvent.type(labelInput, 'Updated Lead Source');

    const saveButton = screen.getByText('Save Field');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.updateCustomField).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Updated Lead Source',
        })
      );
    });
  });

  it('allows deleting custom fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);
    mockSettingsService.deleteCustomField.mockResolvedValue({ success: true });

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete field');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Custom Field')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSettingsService.deleteCustomField).toHaveBeenCalledWith('field-1');
    });
  });

  it('displays field type icons correctly', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Configuration')).toBeInTheDocument();
    });

    // Check that field types are displayed
    expect(screen.getByText('select')).toBeInTheDocument();
    expect(screen.getByText('currency')).toBeInTheDocument();
    expect(screen.getByText('multiselect')).toBeInTheDocument();
  });

  it('displays status badges correctly', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Configuration')).toBeInTheDocument();
    });

    // Check that status badges are displayed
    const activeStatuses = screen.getAllByText('active');
    const draftStatuses = screen.getAllByText('draft');

    expect(activeStatuses.length).toBeGreaterThan(0);
    expect(draftStatuses.length).toBeGreaterThan(0);
  });

  it('filters fields by entity type', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Configuration')).toBeInTheDocument();
    });

    const entityTypeFilter = screen.getByLabelText('Filter by Entity Type');
    await userEvent.selectOptions(entityTypeFilter, 'lead');

    // Should only show lead fields
    await waitFor(() => {
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
      expect(screen.queryByText('Buyer Budget')).not.toBeInTheDocument();
      expect(screen.queryByText('Property Features')).not.toBeInTheDocument();
    });
  });

  it('validates required fields before saving', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Details')).toBeInTheDocument();
    });

    // Try to save without required fields
    const saveButton = screen.getByText('Save Field');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Field name is required')).toBeInTheDocument();
      expect(screen.getByText('Display label is required')).toBeInTheDocument();
    });
  });

  it('handles field save errors gracefully', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);
    mockSettingsService.createCustomField.mockRejectedValue(new Error('Save failed'));

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Details')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Field Name');
    const labelInput = screen.getByLabelText('Display Label');

    await userEvent.type(nameInput, 'new_field');
    await userEvent.type(labelInput, 'New Field');

    const saveButton = screen.getByText('Save Field');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to save custom field',
          status: 'error',
        })
      );
    });
  });

  it('handles field deletion errors gracefully', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);
    mockSettingsService.deleteCustomField.mockRejectedValue(new Error('Delete failed'));

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete field');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Custom Field')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Delete');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to delete custom field',
          status: 'error',
        })
      );
    });
  });

  it('handles field loading errors gracefully', async () => {
    mockSettingsService.getCustomFields.mockRejectedValue(new Error('Failed to load fields'));
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to load custom fields',
          status: 'error',
        })
      );
    });
  });

  it('displays field options for select and multiselect fields', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Lead Source')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('Edit field');
    await userEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Details')).toBeInTheDocument();
    });

    // Check that options are displayed for select fields
    expect(screen.getByText('website')).toBeInTheDocument();
    expect(screen.getByText('referral')).toBeInTheDocument();
    expect(screen.getByText('social_media')).toBeInTheDocument();
    expect(screen.getByText('cold_call')).toBeInTheDocument();
  });

  it('allows configuring field properties', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);
    mockSettingsService.createCustomField.mockResolvedValue({ success: true });

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Details')).toBeInTheDocument();
    });

    // Configure field properties
    const requiredSwitch = screen.getByLabelText('Required');
    const uniqueSwitch = screen.getByLabelText('Unique');
    const searchableSwitch = screen.getByLabelText('Searchable');
    const filterableSwitch = screen.getByLabelText('Filterable');

    await userEvent.click(requiredSwitch);
    await userEvent.click(uniqueSwitch);
    await userEvent.click(searchableSwitch);
    await userEvent.click(filterableSwitch);

    // Fill required fields
    const nameInput = screen.getByLabelText('Field Name');
    const labelInput = screen.getByLabelText('Display Label');

    await userEvent.type(nameInput, 'test_field');
    await userEvent.type(labelInput, 'Test Field');

    const saveButton = screen.getByText('Save Field');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSettingsService.createCustomField).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test_field',
          label: 'Test Field',
          required: true,
          unique: true,
          searchable: false,
          filterable: false,
        })
      );
    });
  });

  it('displays loading states during API calls', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Configuration')).toBeInTheDocument();
    });

    // Check that loading indicators are not shown after data loads
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('resets form when adding new field', async () => {
    mockSettingsService.getCustomFields.mockResolvedValue(mockCustomFields);
    mockSettingsService.getEntityTypes.mockResolvedValue(mockEntityTypes);
    mockSettingsService.getFieldTypes.mockResolvedValue(mockFieldTypes);

    renderWithTheme(<CustomFieldConfiguration />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Field')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Custom Field');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Custom Field Details')).toBeInTheDocument();
    });

    // Check that form is reset to default values
    const nameInput = screen.getByLabelText('Field Name') as HTMLInputElement;
    const labelInput = screen.getByLabelText('Display Label') as HTMLInputElement;
    const entityTypeSelect = screen.getByLabelText('Entity Type') as HTMLSelectElement;
    const fieldTypeSelect = screen.getByLabelText('Field Type') as HTMLSelectElement;

    expect(nameInput.value).toBe('');
    expect(labelInput.value).toBe('');
    expect(entityTypeSelect.value).toBe('lead');
    expect(fieldTypeSelect.value).toBe('text');
  });
});
