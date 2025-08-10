import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TimeTrackingDashboard } from '../../../components/time-tracking/TimeTrackingDashboard';

// Mock the hooks
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', role: 'user' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

jest.mock('../../../hooks/useApi', () => ({
  useApi: () => ({
    apiCall: jest.fn(),
  }),
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TimeTrackingDashboard', () => {
  it('renders without crashing', () => {
    renderWithChakra(<TimeTrackingDashboard />);
    expect(screen.getByText(/Time Tracking Dashboard/i)).toBeInTheDocument();
  });

  it('displays the weekly timesheet section', () => {
    renderWithChakra(<TimeTrackingDashboard />);
    expect(screen.getByText(/Weekly Timesheet/i)).toBeInTheDocument();
  });

  it('displays the statistics section', () => {
    renderWithChakra(<TimeTrackingDashboard />);
    expect(screen.getByText(/This Week/i)).toBeInTheDocument();
    expect(screen.getByText(/Billable Hours/i)).toBeInTheDocument();
  });
});
