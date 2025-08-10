import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TimeTrackingStats } from '../../../components/time-tracking/TimeTrackingStats';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TimeTrackingStats', () => {
  const mockStats = {
    thisWeek: 40,
    billableHours: 35,
    activeProjects: 3,
    timesheetStatus: 'draft',
  };

  it('renders without crashing', () => {
    renderWithChakra(<TimeTrackingStats stats={mockStats} />);
    expect(screen.getByText(/This Week/i)).toBeInTheDocument();
  });

  it('displays all statistics cards', () => {
    renderWithChakra(<TimeTrackingStats stats={mockStats} />);
    expect(screen.getByText(/This Week/i)).toBeInTheDocument();
    expect(screen.getByText(/Billable Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Timesheet Status/i)).toBeInTheDocument();
  });

  it('displays the correct values', () => {
    renderWithChakra(<TimeTrackingStats stats={mockStats} />);
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });
});
