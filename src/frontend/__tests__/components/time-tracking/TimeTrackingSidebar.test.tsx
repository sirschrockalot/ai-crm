import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TimeTrackingSidebar } from '../../../components/time-tracking/TimeTrackingSidebar';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TimeTrackingSidebar', () => {
  const mockRecentEntries = [
    { id: '1', project: 'Project Alpha', hours: 8, date: '2024-01-15' },
    { id: '2', project: 'Project Beta', hours: 6, date: '2024-01-14' },
  ];

  const mockPendingApprovals = [
    { id: '1', user: 'John Doe', week: '2024-01-08', hours: 40 },
    { id: '2', user: 'Jane Smith', week: '2024-01-08', hours: 38 },
  ];

  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(
      <TimeTrackingSidebar
        recentEntries={mockRecentEntries}
        pendingApprovals={mockPendingApprovals}
        onRefresh={mockOnRefresh}
      />
    );
    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
  });

  it('displays recent entries section', () => {
    renderWithChakra(
      <TimeTrackingSidebar
        recentEntries={mockRecentEntries}
        pendingApprovals={mockPendingApprovals}
        onRefresh={mockOnRefresh}
      />
    );
    expect(screen.getByText(/Recent Entries/i)).toBeInTheDocument();
  });

  it('displays pending approvals section', () => {
    renderWithChakra(
      <TimeTrackingSidebar
        recentEntries={mockRecentEntries}
        pendingApprovals={mockPendingApprovals}
        onRefresh={mockOnRefresh}
      />
    );
    expect(screen.getByText(/Pending Approvals/i)).toBeInTheDocument();
  });

  it('shows quick action buttons', () => {
    renderWithChakra(
      <TimeTrackingSidebar
        recentEntries={mockRecentEntries}
        pendingApprovals={mockPendingApprovals}
        onRefresh={mockOnRefresh}
      />
    );
    expect(screen.getByText(/Start Timer/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Entry/i)).toBeInTheDocument();
  });
});
