import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';
import WorkflowManagement from '../../../components/settings/WorkflowManagement';
import { useWorkflows, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow } from '../../../hooks/useWorkflows';

// Mock the hooks
jest.mock('../../../hooks/useWorkflows');

const mockUseWorkflows = useWorkflows as jest.MockedFunction<typeof useWorkflows>;
const mockUseCreateWorkflow = useCreateWorkflow as jest.MockedFunction<typeof useCreateWorkflow>;
const mockUseUpdateWorkflow = useUpdateWorkflow as jest.MockedFunction<typeof useUpdateWorkflow>;
const mockUseDeleteWorkflow = useDeleteWorkflow as jest.MockedFunction<typeof useDeleteWorkflow>;

// Mock the workflow service
jest.mock('../../../services/workflowService', () => ({
  getWorkflows: jest.fn(),
  createWorkflow: jest.fn(),
  updateWorkflow: jest.fn(),
  deleteWorkflow: jest.fn(),
}));

const mockWorkflows = [
  {
    id: '1',
    name: 'Lead Qualification',
    description: 'Standard lead qualification workflow',
    type: 'lead',
    status: 'active',
    steps: [
      {
        id: 'step1',
        name: 'Initial Contact',
        type: 'action',
        order: 1,
        conditions: [],
        actions: ['send_email', 'update_status'],
      },
      {
        id: 'step2',
        name: 'Follow Up',
        type: 'decision',
        order: 2,
        conditions: ['response_received'],
        actions: ['schedule_call'],
      },
    ],
    triggers: ['lead_created', 'lead_updated'],
    automation: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Deal Closure',
    description: 'Deal closure and handoff workflow',
    type: 'deal',
    status: 'active',
    steps: [
      {
        id: 'step1',
        name: 'Final Review',
        type: 'action',
        order: 1,
        conditions: [],
        actions: ['final_approval'],
      },
    ],
    triggers: ['deal_won'],
    automation: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockCreateWorkflow = jest.fn();
const mockUpdateWorkflow = jest.fn();
const mockDeleteWorkflow = jest.fn();

describe('WorkflowManagement', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseWorkflows.mockReturnValue({
      data: mockWorkflows,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseCreateWorkflow.mockReturnValue({
      mutate: mockCreateWorkflow,
      isLoading: false,
      error: null,
      reset: jest.fn(),
    });

    mockUseUpdateWorkflow.mockReturnValue({
      mutate: mockUpdateWorkflow,
      isLoading: false,
      error: null,
      reset: jest.fn(),
    });

    mockUseDeleteWorkflow.mockReturnValue({
      mutate: mockDeleteWorkflow,
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
          <WorkflowManagement />
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders workflow management interface', () => {
    renderComponent();

    expect(screen.getByText('Workflow Management')).toBeInTheDocument();
    expect(screen.getByText('Create New Workflow')).toBeInTheDocument();
    expect(screen.getByText('Lead Qualification')).toBeInTheDocument();
    expect(screen.getByText('Deal Closure')).toBeInTheDocument();
  });

  it('displays workflow list with details', () => {
    renderComponent();

    expect(screen.getByText('Lead Qualification')).toBeInTheDocument();
    expect(screen.getByText('Standard lead qualification workflow')).toBeInTheDocument();
    expect(screen.getByText('lead')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();

    expect(screen.getByText('Deal Closure')).toBeInTheDocument();
    expect(screen.getByText('Deal closure and handoff workflow')).toBeInTheDocument();
    expect(screen.getByText('deal')).toBeInTheDocument();
  });

  it('shows create workflow form when create button is clicked', async () => {
    renderComponent();

    const createButton = screen.getByText('Create New Workflow');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Workflow Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Workflow Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Type')).toBeInTheDocument();
    });
  });

  it('creates new workflow when form is submitted', async () => {
    renderComponent();

    const createButton = screen.getByText('Create New Workflow');
    fireEvent.click(createButton);

    const nameInput = screen.getByLabelText('Workflow Name');
    const descriptionInput = screen.getByLabelText('Description');
    const typeSelect = screen.getByLabelText('Type');

    fireEvent.change(nameInput, { target: { value: 'New Workflow' } });
    fireEvent.change(descriptionInput, { target: { value: 'A new workflow' } });
    fireEvent.change(typeSelect, { target: { value: 'lead' } });

    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateWorkflow).toHaveBeenCalledWith({
        name: 'New Workflow',
        description: 'A new workflow',
        type: 'lead',
        status: 'draft',
        steps: [],
        triggers: [],
        automation: false,
      });
    });
  });

  it('edits existing workflow when edit button is clicked', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Lead Qualification')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Standard lead qualification workflow')).toBeInTheDocument();
    });
  });

  it('updates workflow when edit form is submitted', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const nameInput = screen.getByDisplayValue('Lead Qualification');
    fireEvent.change(nameInput, { target: { value: 'Updated Lead Qualification' } });

    const saveButton = screen.getByText('Update Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateWorkflow).toHaveBeenCalledWith({
        ...mockWorkflows[0],
        name: 'Updated Lead Qualification',
      });
    });
  });

  it('deletes workflow when delete button is clicked', async () => {
    renderComponent();

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Workflow')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete "Lead Qualification"?')).toBeInTheDocument();

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteWorkflow).toHaveBeenCalledWith('1');
    });
  });

  it('cancels workflow deletion when cancel is clicked', async () => {
    renderComponent();

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Delete Workflow')).not.toBeInTheDocument();
  });

  it('adds new step to workflow', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const addStepButton = screen.getByText('Add Step');
    fireEvent.click(addStepButton);

    await waitFor(() => {
      expect(screen.getByText('Step Details')).toBeInTheDocument();
      expect(screen.getByLabelText('Step Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Step Type')).toBeInTheDocument();
    });
  });

  it('configures step conditions and actions', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const addStepButton = screen.getByText('Add Step');
    fireEvent.click(addStepButton);

    const stepNameInput = screen.getByLabelText('Step Name');
    const stepTypeSelect = screen.getByLabelText('Step Type');

    fireEvent.change(stepNameInput, { target: { value: 'New Step' } });
    fireEvent.change(stepTypeSelect, { target: { value: 'decision' } });

    const saveStepButton = screen.getByText('Save Step');
    fireEvent.click(saveStepButton);

    await waitFor(() => {
      expect(screen.getByText('Step saved successfully')).toBeInTheDocument();
    });
  });

  it('reorders workflow steps', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const moveUpButton = screen.getAllByText('↑')[0];
    fireEvent.click(moveUpButton);

    // Verify step order change
    expect(mockUpdateWorkflow).toHaveBeenCalled();
  });

  it('configures workflow triggers', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const triggersSection = screen.getByText('Triggers');
    fireEvent.click(triggersSection);

    const addTriggerButton = screen.getByText('Add Trigger');
    fireEvent.click(addTriggerButton);

    await waitFor(() => {
      expect(screen.getByText('Trigger Configuration')).toBeInTheDocument();
    });
  });

  it('enables/disables workflow automation', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const automationToggle = screen.getByRole('checkbox', { name: /automation/i });
    fireEvent.click(automationToggle);

    expect(automationToggle).toBeChecked();
  });

  it('activates/deactivates workflow', async () => {
    renderComponent();

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    const saveButton = screen.getByText('Update Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateWorkflow).toHaveBeenCalledWith({
        ...mockWorkflows[0],
        status: 'inactive',
      });
    });
  });

  it('shows workflow preview', async () => {
    renderComponent();

    const previewButton = screen.getAllByText('Preview')[0];
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Workflow Preview')).toBeInTheDocument();
      expect(screen.getByText('Initial Contact')).toBeInTheDocument();
      expect(screen.getByText('Follow Up')).toBeInTheDocument();
    });
  });

  it('exports workflow configuration', async () => {
    renderComponent();

    const exportButton = screen.getAllByText('Export')[0];
    fireEvent.click(exportButton);

    // Mock file download
    const mockDownload = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalled();
    });
  });

  it('imports workflow configuration', async () => {
    renderComponent();

    const importButton = screen.getByText('Import Workflow');
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText('Import Workflow Configuration')).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText('Select File');
    const file = new File(['{"name":"Imported Workflow"}'], 'workflow.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const importConfirmButton = screen.getByText('Import');
    fireEvent.click(importConfirmButton);

    await waitFor(() => {
      expect(mockCreateWorkflow).toHaveBeenCalledWith({
        name: 'Imported Workflow',
        description: '',
        type: 'lead',
        status: 'draft',
        steps: [],
        triggers: [],
        automation: false,
      });
    });
  });

  it('shows loading state when creating workflow', () => {
    mockUseCreateWorkflow.mockReturnValue({
      mutate: mockCreateWorkflow,
      isLoading: true,
      error: null,
      reset: jest.fn(),
    });

    renderComponent();

    const createButton = screen.getByText('Create New Workflow');
    fireEvent.click(createButton);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('shows error message when workflow creation fails', () => {
    mockUseCreateWorkflow.mockReturnValue({
      mutate: mockCreateWorkflow,
      isLoading: false,
      error: new Error('Creation failed'),
      reset: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText('Error: Creation failed')).toBeInTheDocument();
  });

  it('shows success message when workflow is created', async () => {
    mockCreateWorkflow.mockImplementation((data) => {
      return Promise.resolve(data);
    });

    renderComponent();

    const createButton = screen.getByText('Create New Workflow');
    fireEvent.click(createButton);

    const nameInput = screen.getByLabelText('Workflow Name');
    fireEvent.change(nameInput, { target: { value: 'New Workflow' } });

    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Workflow created successfully')).toBeInTheDocument();
    });
  });

  it('validates required fields before saving workflow', async () => {
    renderComponent();

    const createButton = screen.getByText('Create New Workflow');
    fireEvent.click(createButton);

    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Workflow name is required')).toBeInTheDocument();
    });

    expect(mockCreateWorkflow).not.toHaveBeenCalled();
  });

  it('filters workflows by type', async () => {
    renderComponent();

    const typeFilter = screen.getByLabelText('Filter by Type');
    fireEvent.change(typeFilter, { target: { value: 'lead' } });

    await waitFor(() => {
      expect(screen.getByText('Lead Qualification')).toBeInTheDocument();
      expect(screen.queryByText('Deal Closure')).not.toBeInTheDocument();
    });
  });

  it('searches workflows by name', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search workflows...');
    fireEvent.change(searchInput, { target: { value: 'Lead' } });

    await waitFor(() => {
      expect(screen.getByText('Lead Qualification')).toBeInTheDocument();
      expect(screen.queryByText('Deal Closure')).not.toBeInTheDocument();
    });
  });

  it('duplicates existing workflow', async () => {
    renderComponent();

    const duplicateButton = screen.getAllByText('Duplicate')[0];
    fireEvent.click(duplicateButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Lead Qualification (Copy)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Standard lead qualification workflow')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Workflow');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreateWorkflow).toHaveBeenCalledWith({
        ...mockWorkflows[0],
        name: 'Lead Qualification (Copy)',
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
