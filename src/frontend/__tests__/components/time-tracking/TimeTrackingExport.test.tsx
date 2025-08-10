import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TimeTrackingExport } from '../../../components/time-tracking/TimeTrackingExport';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TimeTrackingExport', () => {
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(<TimeTrackingExport onExport={mockOnExport} />);
    expect(screen.getByText(/Export Time Data/i)).toBeInTheDocument();
  });

  it('displays export format options', () => {
    renderWithChakra(<TimeTrackingExport onExport={mockOnExport} />);
    expect(screen.getByText(/Export Format/i)).toBeInTheDocument();
  });

  it('displays date range selection', () => {
    renderWithChakra(<TimeTrackingExport onExport={mockOnExport} />);
    expect(screen.getByText(/Date Range/i)).toBeInTheDocument();
  });

  it('displays export button', () => {
    renderWithChakra(<TimeTrackingExport onExport={mockOnExport} />);
    expect(screen.getByText(/Export/i)).toBeInTheDocument();
  });
});
