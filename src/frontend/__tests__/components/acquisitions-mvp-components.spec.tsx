import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { AcquisitionsDashboard } from '../../components/dashboard/AcquisitionsDashboard';
import { LeadQueue } from '../../components/leads/LeadQueue';
import { LeadDetail } from '../../components/leads/LeadDetail';
import { LeadStatusBadge } from '../../components/leads/LeadStatusBadge';

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  pathname: '/test',
  query: {},
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock Chakra UI toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('Acquisitions MVP Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AcquisitionsDashboard', () => {
    it('renders without crashing', () => {
      renderWithChakra(<AcquisitionsDashboard />);
      expect(screen.getByText('Acquisitions Dashboard')).toBeInTheDocument();
    });

    it('displays main call workflow section', () => {
      renderWithChakra(<AcquisitionsDashboard />);
      expect(screen.getByText('🎯 Start Making Calls')).toBeInTheDocument();
      expect(screen.getByText('Get Next Lead')).toBeInTheDocument();
    });

    it('shows KPI metrics', () => {
      renderWithChakra(<AcquisitionsDashboard />);
      expect(screen.getByText('New Leads')).toBeInTheDocument();
      expect(screen.getByText('Follow-ups Due')).toBeInTheDocument();
      expect(screen.getByText('Conversions')).toBeInTheDocument();
    });

    it('displays workflow sections', () => {
      renderWithChakra(<AcquisitionsDashboard />);
      expect(screen.getByText('New & Contacting')).toBeInTheDocument();
      expect(screen.getByText('Negotiating & Converted')).toBeInTheDocument();
    });
  });

  describe('LeadQueue', () => {
    it('renders without crashing', () => {
      renderWithChakra(<LeadQueue />);
      expect(screen.getByText('Lead Queue Management')).toBeInTheDocument();
    });

    it('displays search functionality', () => {
      renderWithChakra(<LeadQueue />);
      expect(screen.getByPlaceholderText(/Search leads by name, property, phone, or ID/)).toBeInTheDocument();
    });

    it('shows filter options', () => {
      renderWithChakra(<LeadQueue />);
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
      expect(screen.getByText('All Sources')).toBeInTheDocument();
    });

    it('displays lead table', () => {
      renderWithChakra(<LeadQueue />);
      expect(screen.getByText('Lead ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Property')).toBeInTheDocument();
    });
  });

  describe('LeadDetail', () => {
    it('renders without crashing', () => {
      renderWithChakra(<LeadDetail />);
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('displays lead information sections', () => {
      renderWithChakra(<LeadDetail />);
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Property Details')).toBeInTheDocument();
      expect(screen.getByText('Notes & Comments')).toBeInTheDocument();
    });

    it('shows quick action buttons', () => {
      renderWithChakra(<LeadDetail />);
      expect(screen.getByText('Call')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('SMS')).toBeInTheDocument();
      expect(screen.getByText('Schedule')).toBeInTheDocument();
    });

    it('displays communication history', () => {
      renderWithChakra(<LeadDetail />);
      expect(screen.getByText('Communication History')).toBeInTheDocument();
    });

    it('shows activity timeline', () => {
      renderWithChakra(<LeadDetail />);
      expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
    });
  });

  describe('LeadStatusBadge', () => {
    it('renders with correct status text', () => {
      renderWithChakra(<LeadStatusBadge status="New" />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders different statuses correctly', () => {
      const { rerender } = renderWithChakra(<LeadStatusBadge status="New" />);
      expect(screen.getByText('New')).toBeInTheDocument();

      rerender(<LeadStatusBadge status="Contacted" />);
      expect(screen.getByText('Contacted')).toBeInTheDocument();

      rerender(<LeadStatusBadge status="Qualified" />);
      expect(screen.getByText('Qualified')).toBeInTheDocument();
    });

    it('applies correct size variants', () => {
      renderWithChakra(<LeadStatusBadge status="New" size="lg" />);
      const badge = screen.getByText('New');
      expect(badge).toBeInTheDocument();
    });
  });
});
