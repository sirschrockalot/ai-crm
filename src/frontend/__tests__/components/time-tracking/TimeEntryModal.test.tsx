import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TimeEntryModal } from '../../../components/time-tracking/TimeEntryModal';

// Mock the hooks
jest.mock('../../../hooks/useApi', () => ({
  useApi: () => ({
    execute: jest.fn(),
  }),
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TimeEntryModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing when open', () => {
    renderWithChakra(
      <TimeEntryModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        timeEntry={null}
      />
    );
    expect(screen.getByText(/Time Entry/i)).toBeInTheDocument();
  });

  it('displays form fields when open', () => {
    renderWithChakra(
      <TimeEntryModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        timeEntry={null}
      />
    );
    expect(screen.getByLabelText(/Project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument();
  });

  it('shows save and cancel buttons', () => {
    renderWithChakra(
      <TimeEntryModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        timeEntry={null}
      />
    );
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });
});
