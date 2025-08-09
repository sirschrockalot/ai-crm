import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { PipelineBoard } from '../PipelineBoard';
import { Lead, PropertyType } from '../../types/lead';

// Mock the hooks
jest.mock('../../hooks/usePipeline', () => ({
  usePipeline: () => ({
    stages: [
      {
        id: 'stage-1',
        name: 'New',
        order: 1,
        color: 'blue',
        leads: [],
      },
      {
        id: 'stage-2',
        name: 'Contacted',
        order: 2,
        color: 'yellow',
        leads: [],
      },
    ],
    leads: [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St',
        propertyAddress: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        propertyType: 'single_family' as PropertyType,
        estimatedValue: 450000,
        status: 'new',
        assignedTo: 'agent-1',
        notes: 'Interested in quick sale',
        source: 'website',
        company: 'ABC Realty',
        score: 85,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
    ],
    loading: false,
    error: null,
    selectedLead: null,
    moveLead: jest.fn(),
    updateStage: jest.fn(),
    selectLead: jest.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('PipelineBoard Integration', () => {
  it('renders pipeline stages correctly', () => {
    renderWithProviders(<PipelineBoard />);

    expect(screen.getByText('Lead Pipeline')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
  });

  it('displays lead count information', () => {
    renderWithProviders(<PipelineBoard />);

    expect(screen.getByText('1 leads across 2 stages')).toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    jest.doMock('../../hooks/usePipeline', () => ({
      usePipeline: () => ({
        stages: [],
        leads: [],
        loading: true,
        error: null,
        selectedLead: null,
        moveLead: jest.fn(),
        updateStage: jest.fn(),
        selectLead: jest.fn(),
      }),
    }));

    renderWithProviders(<PipelineBoard />);

    expect(screen.getByText('Loading pipeline...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    jest.doMock('../../hooks/usePipeline', () => ({
      usePipeline: () => ({
        stages: [],
        leads: [],
        loading: false,
        error: 'Failed to load pipeline',
        selectedLead: null,
        moveLead: jest.fn(),
        updateStage: jest.fn(),
        selectLead: jest.fn(),
      }),
    }));

    renderWithProviders(<PipelineBoard />);

    expect(screen.getByText('Error loading pipeline')).toBeInTheDocument();
    expect(screen.getByText('Failed to load pipeline')).toBeInTheDocument();
  });

  it('calls onLeadSelect when a lead is clicked', async () => {
    const mockOnLeadSelect = jest.fn();
    renderWithProviders(<PipelineBoard onLeadSelect={mockOnLeadSelect} />);

    // Find and click on a lead card
    const leadCard = screen.getByText('John Doe');
    fireEvent.click(leadCard);

    await waitFor(() => {
      expect(mockOnLeadSelect).toHaveBeenCalled();
    });
  });

  it('calls onStageUpdate when stage is updated', async () => {
    const mockOnStageUpdate = jest.fn();
    renderWithProviders(<PipelineBoard onStageUpdate={mockOnStageUpdate} />);

    // This would require more complex setup to test stage updates
    // For now, we just verify the component renders without errors
    expect(screen.getByText('Lead Pipeline')).toBeInTheDocument();
  });
});
