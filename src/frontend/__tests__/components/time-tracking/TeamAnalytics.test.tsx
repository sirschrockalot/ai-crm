import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TeamAnalytics } from '../../../components/time-tracking/TeamAnalytics';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TeamAnalytics', () => {
  const mockTeamData = {
    teamMembers: [
      { id: '1', name: 'John Doe', hours: 40, status: 'approved' },
      { id: '2', name: 'Jane Smith', hours: 38, status: 'pending' },
      { id: '3', name: 'Bob Johnson', hours: 42, status: 'draft' },
    ],
    teamStats: {
      totalHours: 120,
      averageHours: 40,
      completionRate: 67,
    },
  };

  it('renders without crashing', () => {
    renderWithChakra(<TeamAnalytics data={mockTeamData} />);
    expect(screen.getByText(/Team Analytics/i)).toBeInTheDocument();
  });

  it('displays team member list', () => {
    renderWithChakra(<TeamAnalytics data={mockTeamData} />);
    expect(screen.getByText(/Team Members/i)).toBeInTheDocument();
  });

  it('displays team statistics', () => {
    renderWithChakra(<TeamAnalytics data={mockTeamData} />);
    expect(screen.getByText(/Team Stats/i)).toBeInTheDocument();
  });

  it('shows completion rate', () => {
    renderWithChakra(<TeamAnalytics data={mockTeamData} />);
    expect(screen.getByText(/Completion Rate/i)).toBeInTheDocument();
  });
});
