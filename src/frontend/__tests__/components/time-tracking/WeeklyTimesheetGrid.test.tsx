import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { WeeklyTimesheetGrid } from '../../../components/time-tracking/WeeklyTimesheetGrid';

// Mock the hooks
jest.mock('../../../hooks/useApi', () => ({
  useApi: () => ({
    execute: jest.fn(),
  }),
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('WeeklyTimesheetGrid', () => {
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(<WeeklyTimesheetGrid onRefresh={mockOnRefresh} />);
    expect(screen.getByText(/Weekly Timesheet/i)).toBeInTheDocument();
  });

  it('displays the days of the week', () => {
    renderWithChakra(<WeeklyTimesheetGrid onRefresh={mockOnRefresh} />);
    expect(screen.getByText(/Monday/i)).toBeInTheDocument();
    expect(screen.getByText(/Sunday/i)).toBeInTheDocument();
  });

  it('shows save draft and submit buttons', () => {
    renderWithChakra(<WeeklyTimesheetGrid onRefresh={mockOnRefresh} />);
    expect(screen.getByText(/Save Draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit/i)).toBeInTheDocument();
  });
});
