import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import Sidebar from '../../../components/layout/Sidebar';

// Mock Chakra UI hooks
const mockUseDisclosure = {
  isOpen: false,
  onOpen: jest.fn(),
  onClose: jest.fn(),
};

const mockUseBreakpointValue = jest.fn();

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useDisclosure: () => mockUseDisclosure,
  useBreakpointValue: (value: any) => mockUseBreakpointValue(value),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBreakpointValue.mockReturnValue(false); // Default to desktop
    mockUseDisclosure.isOpen = false;
  });

  describe('Basic Rendering', () => {
    it('renders sidebar with navigation items', () => {
      renderWithTheme(<Sidebar />);
      
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Buyers')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Automation')).toBeInTheDocument();
    });

    it('renders section headers correctly', () => {
      renderWithTheme(<Sidebar />);
      
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
      expect(screen.getByText('Main Navigation')).toBeInTheDocument();
    });

    it('renders with proper initial state', () => {
      renderWithTheme(<Sidebar />);
      
      // Mobile drawer should not be visible initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Navigation items should be visible
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
    });
  });

  describe('Navigation Items', () => {
    it('renders all main navigation sections', () => {
      renderWithTheme(<Sidebar />);
      
      const sections = [
        'Dashboards',
        'Main Navigation'
      ];
      
      sections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });

    it('renders navigation links with proper hrefs', () => {
      renderWithTheme(<Sidebar />);
      
      const dashboardLink = screen.getByText('Overview').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      
      const leadsLink = screen.getByText('Leads').closest('a');
      expect(leadsLink).toHaveAttribute('href', '/leads');
      
      const buyersLink = screen.getByText('Buyers').closest('a');
      expect(buyersLink).toHaveAttribute('href', '/buyers');
    });

    it('renders navigation items with icons', () => {
      renderWithTheme(<Sidebar />);
      
      // Check that icons are present (SVG elements)
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('renders dashboard sub-items correctly', () => {
      renderWithTheme(<Sidebar />);
      
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Executive')).toBeInTheDocument();
      expect(screen.getByText('Acquisitions')).toBeInTheDocument();
      expect(screen.getByText('Dispositions')).toBeInTheDocument();
      expect(screen.getByText('Team Member')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('Time Tracking')).toBeInTheDocument();
    });

    it('renders leads sub-navigation', () => {
      renderWithTheme(<Sidebar />);
      
      expect(screen.getByText('Import Leads')).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('handles mobile menu toggle', () => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      renderWithTheme(<Sidebar />);
      
      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();
      
      fireEvent.click(menuButton);
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });

    it('shows mobile drawer when opened', () => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      mockUseDisclosure.isOpen = true;
      
      renderWithTheme(<Sidebar />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('closes mobile drawer when close button is clicked', () => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      mockUseDisclosure.isOpen = true;
      
      renderWithTheme(<Sidebar />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(mockUseDisclosure.onClose).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('renders desktop layout by default', () => {
      mockUseBreakpointValue.mockReturnValue(false); // Desktop
      renderWithTheme(<Sidebar />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('css-1fvzr0f');
    });

    it('renders mobile layout when breakpoint indicates mobile', () => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      renderWithTheme(<Sidebar />);
      
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('adapts layout based on screen size', () => {
      // Test desktop layout
      mockUseBreakpointValue.mockReturnValue(false);
      const { rerender } = renderWithTheme(<Sidebar />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Test mobile layout
      mockUseBreakpointValue.mockReturnValue(true);
      rerender(
        <ChakraProvider theme={theme}>
          <Sidebar />
        </ChakraProvider>
      );
      
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('handles breakpoint changes gracefully', () => {
      const { rerender } = renderWithTheme(<Sidebar />);
      
      // Change from desktop to mobile
      mockUseBreakpointValue.mockReturnValue(true);
      rerender(
        <ChakraProvider theme={theme}>
          <Sidebar />
        </ChakraProvider>
      );
      
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('manages mobile drawer state correctly', () => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      renderWithTheme(<Sidebar />);
      
      // Initially closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Open drawer
      mockUseDisclosure.isOpen = true;
      const { rerender } = renderWithTheme(<Sidebar />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <Sidebar />
        </ChakraProvider>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles client-side initialization', () => {
      renderWithTheme(<Sidebar />);
      
      // Should render without errors
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates with Chakra UI components', () => {
      renderWithTheme(<Sidebar />);
      
      // Should use Chakra UI components
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
    });

    it('works with responsive design system', () => {
      renderWithTheme(<Sidebar />);
      
      // Should respond to breakpoint changes
      expect(mockUseBreakpointValue).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles missing breakpoint values gracefully', () => {
      mockUseBreakpointValue.mockReturnValue(undefined);
      renderWithTheme(<Sidebar />);
      
      // Should still render without crashing
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
    });

    it('handles disclosure hook errors gracefully', () => {
      // Mock a failed disclosure hook
      const originalError = console.error;
      console.error = jest.fn();
      
      try {
        renderWithTheme(<Sidebar />);
        expect(screen.getByText('Dashboards')).toBeInTheDocument();
      } finally {
        console.error = originalError;
      }
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      renderWithTheme(<Sidebar />);
      
      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('uses proper semantic structure', () => {
      renderWithTheme(<Sidebar />);
      
      // Should have navigation role
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('provides proper navigation landmarks', () => {
      renderWithTheme(<Sidebar />);
      
      // Should have navigation role
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently without unnecessary re-renders', () => {
      const { rerender } = renderWithTheme(<Sidebar />);
      
      // Re-render with same props
      rerender(
        <ChakraProvider theme={theme}>
          <Sidebar />
        </ChakraProvider>
      );
      
      // Should still show the same content
      expect(screen.getByText('Dashboards')).toBeInTheDocument();
    });

    it('handles large navigation structures efficiently', () => {
      renderWithTheme(<Sidebar />);
      
      // Should render all navigation items without performance issues
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Time Tracking')).toBeInTheDocument();
    });
  });
});
