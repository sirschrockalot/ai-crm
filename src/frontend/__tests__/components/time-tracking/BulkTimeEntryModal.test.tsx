import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BulkTimeEntryModal } from '../../../components/time-tracking/BulkTimeEntryModal';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('BulkTimeEntryModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing when open', () => {
    renderWithChakra(
      <BulkTimeEntryModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText(/Bulk Time Entry/i)).toBeInTheDocument();
  });

  it('displays the bulk entry form when open', () => {
    renderWithChakra(
      <BulkTimeEntryModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText(/Add Multiple Entries/i)).toBeInTheDocument();
  });

  it('shows save and cancel buttons', () => {
    renderWithChakra(
      <BulkTimeEntryModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });
});
