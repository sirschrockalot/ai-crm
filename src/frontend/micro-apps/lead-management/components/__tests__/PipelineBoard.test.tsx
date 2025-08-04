import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { DragDropContext } from 'react-beautiful-dnd';
import PipelineBoard from '../PipelineBoard';
import { Lead, PipelineStage } from '../../../../types/pipeline';

// Mock data
const mockStages: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Prospecting',
    description: 'Initial contact and qualification',
    type: 'prospecting',
    order: 1,
    isActive: true,
    tenantId: 'tenant-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'stage-2',
    name: 'Qualification',
    description: 'Detailed needs assessment',
    type: 'qualification',
    order: 2,
    isActive: true,
    tenantId: 'tenant-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    stageId: 'stage-1',
    status: 'active',
    priority: 'high',
    value: 50000,
    score: 85,
    source: 'Website',
    tenantId: 'tenant-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'lead-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    company: 'Tech Solutions',
    stageId: 'stage-2',
    status: 'active',
    priority: 'medium',
    value: 75000,
    score: 72,
    source: 'Referral',
    tenantId: 'tenant-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockProps = {
  stages: mockStages,
  leads: mockLeads,
  onLeadMove: jest.fn(),
  onStageAdd: jest.fn(),
  onStageEdit: jest.fn(),
  onLeadClick: jest.fn(),
  isLoading: false,
};

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

describe('PipelineBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pipeline board with stages and leads', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} />
      </TestWrapper>
    );

    // Check if stages are rendered
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Prospecting')).toBeInTheDocument();
    expect(screen.getByText('Qualification')).toBeInTheDocument();

    // Check if leads are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays correct lead counts for each stage', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} />
      </TestWrapper>
    );

    // Check lead counts
    expect(screen.getByText('1')).toBeInTheDocument(); // Prospecting stage has 1 lead
    expect(screen.getByText('1')).toBeInTheDocument(); // Qualification stage has 1 lead
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} isLoading={true} />
      </TestWrapper>
    );

    // Check if loading spinner is present
    expect(screen.getByText('Loading pipeline...')).toBeInTheDocument();
  });

  it('calls onStageAdd when add stage button is clicked', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} />
      </TestWrapper>
    );

    const addButton = screen.getByLabelText('Add stage');
    fireEvent.click(addButton);

    expect(mockProps.onStageAdd).toHaveBeenCalledTimes(1);
  });

  it('calls onStageEdit when stage edit button is clicked', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} />
      </TestWrapper>
    );

    const editButtons = screen.getAllByLabelText('Edit stage');
    fireEvent.click(editButtons[0]);

    expect(mockProps.onStageEdit).toHaveBeenCalledWith('stage-1');
  });

  it('calls onLeadClick when lead card is clicked', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} />
      </TestWrapper>
    );

    const leadCard = screen.getByText('John Doe').closest('div');
    if (leadCard) {
      fireEvent.click(leadCard);
      expect(mockProps.onLeadClick).toHaveBeenCalledWith('lead-1');
    }
  });

  it('displays lead information correctly', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} />
      </TestWrapper>
    );

    // Check lead details
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('handles empty stages gracefully', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} stages={[]} leads={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument();
  });

  it('displays stage descriptions when available', () => {
    render(
      <TestWrapper>
        <PipelineBoard {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Initial contact and qualification')).toBeInTheDocument();
    expect(screen.getByText('Detailed needs assessment')).toBeInTheDocument();
  });
}); 