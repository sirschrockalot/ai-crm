import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { DragDropContext } from 'react-beautiful-dnd';
import { PipelineCard } from '../PipelineCard';
import { Lead, PropertyType } from '../../types/lead';

// Mock data
const mockLead: Lead = {
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
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <DragDropContext onDragEnd={() => {}}>
        {component}
      </DragDropContext>
    </ChakraProvider>
  );
};

describe('PipelineCard', () => {
  it('renders lead information correctly', () => {
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('$450,000')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('displays property type icon and text', () => {
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} />
    );

    expect(screen.getByText('🏠 single family')).toBeInTheDocument();
  });

  it('shows lead score when available', () => {
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} />
    );

    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('displays notes when available', () => {
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} />
    );

    expect(screen.getByText('Interested in quick sale')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} onClick={handleClick} />
    );

    const card = screen.getByText('John Doe').closest('div');
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct status color', () => {
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} />
    );

    const statusBadge = screen.getByText('new');
    expect(statusBadge).toHaveClass('chakra-badge');
  });

  it('formats currency correctly', () => {
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} />
    );

    expect(screen.getByText('$450,000')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    renderWithProviders(
      <PipelineCard lead={mockLead} index={0} />
    );

    expect(screen.getByText('Jan 15')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const leadWithoutOptionalFields: Lead = {
      ...mockLead,
      notes: undefined,
      score: undefined,
      propertyAddress: undefined,
    };

    renderWithProviders(
      <PipelineCard lead={leadWithoutOptionalFields} index={0} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Interested in quick sale')).not.toBeInTheDocument();
    expect(screen.queryByText('Score')).not.toBeInTheDocument();
  });
});
