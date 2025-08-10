import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TimeTrackingAnalytics } from '../../../components/time-tracking/TimeTrackingAnalytics';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TimeTrackingAnalytics', () => {
  const mockAnalyticsData = {
    weeklyHours: [8, 7, 9, 8, 6, 0, 0],
    billableHours: 38,
    nonBillableHours: 10,
    projectAllocation: [
      { project: 'Project Alpha', hours: 25, percentage: 52 },
      { project: 'Project Beta', hours: 15, percentage: 31 },
      { project: 'Internal', hours: 8, percentage: 17 },
    ],
  };

  it('renders without crashing', () => {
    renderWithChakra(<TimeTrackingAnalytics data={mockAnalyticsData} />);
    expect(screen.getByText(/Time Analytics/i)).toBeInTheDocument();
  });

  it('displays weekly hours chart', () => {
    renderWithChakra(<TimeTrackingAnalytics data={mockAnalyticsData} />);
    expect(screen.getByText(/Weekly Hours/i)).toBeInTheDocument();
  });

  it('displays billable vs non-billable breakdown', () => {
    renderWithChakra(<TimeTrackingAnalytics data={mockAnalyticsData} />);
    expect(screen.getByText(/Billable Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Billable Hours/i)).toBeInTheDocument();
  });

  it('displays project allocation chart', () => {
    renderWithChakra(<TimeTrackingAnalytics data={mockAnalyticsData} />);
    expect(screen.getByText(/Project Allocation/i)).toBeInTheDocument();
  });
});
