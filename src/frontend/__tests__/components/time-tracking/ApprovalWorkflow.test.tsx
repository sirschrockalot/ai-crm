import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ApprovalWorkflow } from '../../../components/time-tracking/ApprovalWorkflow';

// Mock the hooks
jest.mock('../../../hooks/useApi', () => ({
  useApi: () => ({
    execute: jest.fn(),
  }),
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('ApprovalWorkflow', () => {
  const mockOnApprovalComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(<ApprovalWorkflow onApprovalComplete={mockOnApprovalComplete} />);
    expect(screen.getByText(/Approval Workflow/i)).toBeInTheDocument();
  });

  it('displays the approval queue section', () => {
    renderWithChakra(<ApprovalWorkflow onApprovalComplete={mockOnApprovalComplete} />);
    expect(screen.getByText(/Pending Approvals/i)).toBeInTheDocument();
  });

  it('shows team status overview', () => {
    renderWithChakra(<ApprovalWorkflow onApprovalComplete={mockOnApprovalComplete} />);
    expect(screen.getByText(/Team Status/i)).toBeInTheDocument();
  });
});
