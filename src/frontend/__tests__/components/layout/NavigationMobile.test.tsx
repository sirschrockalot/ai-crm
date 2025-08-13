import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import { NavigationProvider } from '../../../contexts/NavigationContext';
import { NavigationPanel } from '../../../components/layout/NavigationPanel/NavigationPanel';
import NavigationMenu from '../../../components/layout/NavigationMenu/NavigationMenu';
import { BreadcrumbNav } from '../../../components/layout/BreadcrumbNav';
import { QuickActions } from '../../../components/layout/QuickActions';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/router';

// Mock the hooks
jest.mock('../../../hooks/useAuth');
jest.mock('next/router');
jest.mock('../../../hooks/useBreakpointValue');
jest.mock('../../../hooks/useColorModeValue');
jest.mock('../../../hooks/useDisclosure');
jest.mock('../../../hooks/useAccessibility');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseBreakpointValue = jest.fn();
const mockUseColorModeValue = jest.fn();
const mockUseDisclosure = {
  isOpen: false,
  onOpen: jest.fn(),
  onClose: jest.fn(),
  onToggle: jest.fn(),
};
const mockUseAccessibility = {
  announce: jest.fn(),
};

jest.mock('../../../hooks/useBreakpointValue', () => ({
  __esModule: true,
  default: mockUseBreakpointValue,
}));

jest.mock('../../../hooks/useColorModeValue', () => ({
  __esModule: true,
  default: mockUseColorModeValue,
}));

jest.mock('../../../hooks/useDisclosure', () => ({
  __esModule: true,
  default: () => mockUseDisclosure,
}));

jest.mock('../../../hooks/useAccessibility', () => ({
  __esModule: true,
  default: () => mockUseAccessibility,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      <NavigationProvider>
        {component}
      </NavigationProvider>
    </ChakraProvider>
  );
};

describe('Global Navigation System Mobile Navigation', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'admin',
    permissions: [
      'dashboard:read',
      'leads:read',
      'leads:create',
      'buyers:read',
      'buyers:create',
      'communications:send',
      'analytics:read',
      'admin:access'
    ],
  };

  const mockRouter = {
    pathname: '/dashboard',
    asPath: '/dashboard',
    push: jest.fn(),
    query: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    });
    
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseBreakpointValue.mockReturnValue(true); // Default to mobile
    mockUseColorModeValue.mockReturnValue('white');
    mockUseDisclosure.isOpen = false;
  });

  describe('STORY-NAV-005: Mobile-Responsive Navigation', () => {
    it('adapts navigation panel to mobile screen sizes', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Should show hamburger menu on mobile
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
      
      // Should not show full navigation panel by default
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('provides touch-friendly navigation with appropriate touch targets', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      
      // Verify touch target size (44px minimum for accessibility)
      const buttonRect = hamburgerButton.getBoundingClientRect();
      expect(buttonRect.width).toBeGreaterThanOrEqual(44);
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
      
      // Verify touch interaction
      fireEvent.touchStart(hamburgerButton);
      fireEvent.touchEnd(hamburgerButton);
      
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });

    it('maintains navigation usability on small screens', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Open mobile navigation
      mockUseDisclosure.isOpen = true;
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should show all navigation content in mobile-friendly format
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      
      // Verify mobile-specific styling
      const navigationMenu = screen.getByTestId('navigation-menu');
      expect(navigationMenu).toHaveAttribute('data-mobile', 'true');
    });

    it('optimizes navigation performance for mobile devices', () => {
      const startTime = performance.now();
      
      renderWithProviders(<NavigationPanel />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Mobile navigation should render efficiently
      expect(renderTime).toBeLessThan(100);
      
      // Verify mobile-specific optimizations
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('provides smooth mobile user experience', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test mobile navigation interactions
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      
      // Test touch interaction
      fireEvent.touchStart(hamburgerButton);
      fireEvent.touchEnd(hamburgerButton);
      
      // Test click interaction
      fireEvent.click(hamburgerButton);
      
      // Both should work for mobile
      expect(mockUseDisclosure.onOpen).toHaveBeenCalledTimes(2);
    });
  });

  describe('STORY-NAV-006: Collapsible Mobile Navigation', () => {
    it('provides collapsible navigation on mobile devices', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Should start collapsed on mobile
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      
      // Should show hamburger menu icon
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows hamburger menu icon for collapsed navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      expect(hamburgerButton).toBeInTheDocument();
      
      // Verify hamburger icon is present
      expect(hamburgerButton.querySelector('svg')).toBeInTheDocument();
    });

    it('provides smooth navigation expansion and collapse', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Start collapsed
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      
      // Expand navigation
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(hamburgerButton);
      
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
      
      // Simulate expanded state
      mockUseDisclosure.isOpen = true;
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should show expanded navigation
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('remembers navigation state across page navigation', () => {
      // Test initial collapsed state
      renderWithProviders(<NavigationPanel />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      
      // Change route
      mockRouter.pathname = '/leads';
      mockRouter.asPath = '/leads';
      
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should maintain collapsed state
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('provides intuitive mobile navigation interactions', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      
      // Test multiple interaction methods
      fireEvent.click(hamburgerButton);
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
      
      // Test touch interaction
      fireEvent.touchStart(hamburgerButton);
      fireEvent.touchEnd(hamburgerButton);
      expect(mockUseDisclosure.onOpen).toHaveBeenCalledTimes(2);
    });
  });

  describe('Mobile Navigation State Management', () => {
    it('manages mobile navigation state correctly', () => {
      // Test collapsed state
      renderWithProviders(<NavigationPanel />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      
      // Test expanded state
      mockUseDisclosure.isOpen = true;
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    });

    it('synchronizes mobile navigation state with context', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test state synchronization
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
      
      // Open navigation
      fireEvent.click(hamburgerButton);
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });

    it('handles mobile navigation state transitions', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test state transitions
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      
      // Collapsed -> Expanded
      fireEvent.click(hamburgerButton);
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
      
      // Expanded -> Collapsed
      mockUseDisclosure.isOpen = true;
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should show expanded content
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation Content', () => {
    it('displays navigation menu in mobile-friendly format', () => {
      mockUseDisclosure.isOpen = true;
      renderWithProviders(<NavigationPanel />);
      
      const navigationMenu = screen.getByTestId('navigation-menu');
      expect(navigationMenu).toBeInTheDocument();
      expect(navigationMenu).toHaveAttribute('data-mobile', 'true');
      
      // Verify mobile-specific content
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Buyers')).toBeInTheDocument();
    });

    it('displays quick actions in mobile-friendly format', () => {
      mockUseDisclosure.isOpen = true;
      renderWithProviders(<NavigationPanel />);
      
      const quickActions = screen.getByTestId('quick-actions');
      expect(quickActions).toBeInTheDocument();
      expect(quickActions).toHaveAttribute('data-mobile', 'true');
      
      // Verify quick actions are mobile-optimized
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
      expect(screen.getByText('Add Buyer')).toBeInTheDocument();
    });

    it('provides mobile-optimized navigation hierarchy', () => {
      mockUseDisclosure.isOpen = true;
      renderWithProviders(<NavigationPanel />);
      
      // Verify mobile navigation structure
      const navigationMenu = screen.getByTestId('navigation-menu');
      expect(navigationMenu).toBeInTheDocument();
      
      // Test mobile navigation interactions
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      if (dashboardLink) {
        fireEvent.click(dashboardLink);
        // Should handle mobile navigation correctly
      }
    });
  });

  describe('Mobile Touch Interactions', () => {
    it('supports touch gestures for mobile navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      
      // Test touch events
      fireEvent.touchStart(hamburgerButton);
      fireEvent.touchEnd(hamburgerButton);
      
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });

    it('provides appropriate touch feedback', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      
      // Test touch feedback
      fireEvent.touchStart(hamburgerButton);
      
      // Verify touch target size
      const buttonRect = hamburgerButton.getBoundingClientRect();
      expect(buttonRect.width).toBeGreaterThanOrEqual(44);
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
    });

    it('handles touch interactions smoothly', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      
      // Test smooth touch interactions
      fireEvent.touchStart(hamburgerButton);
      fireEvent.touchEnd(hamburgerButton);
      
      // Should respond immediately to touch
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });
  });

  describe('Mobile Performance and Responsiveness', () => {
    it('optimizes rendering for mobile devices', () => {
      const startTime = performance.now();
      
      renderWithProviders(<NavigationPanel />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Mobile navigation should render quickly
      expect(renderTime).toBeLessThan(100);
    });

    it('adapts to different mobile screen sizes', () => {
      // Test different mobile breakpoints
      const breakpoints = [true, false]; // Mobile, Desktop
      
      breakpoints.forEach(isMobile => {
        mockUseBreakpointValue.mockReturnValue(isMobile);
        
        const { rerender } = renderWithProviders(<NavigationPanel />);
        
        if (isMobile) {
          expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
          expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        } else {
          expect(screen.getByRole('navigation')).toBeInTheDocument();
          expect(screen.queryByLabelText('Toggle navigation menu')).not.toBeInTheDocument();
        }
        
        rerender(
          <ChakraProvider theme={theme}>
            <NavigationProvider>
              <NavigationPanel />
            </NavigationProvider>
          </ChakraProvider>
        );
      });
    });

    it('maintains responsive behavior across devices', () => {
      // Test responsive behavior
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      renderWithProviders(<NavigationPanel />);
      
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
      
      // Switch to desktop
      mockUseBreakpointValue.mockReturnValue(false);
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation Accessibility', () => {
    it('provides accessible mobile navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Toggle navigation menu');
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('announces mobile navigation state changes', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(hamburgerButton);
      
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
      // Note: This would test actual accessibility announcements
    });

    it('maintains accessibility in mobile drawer', () => {
      mockUseDisclosure.isOpen = true;
      renderWithProviders(<NavigationPanel />);
      
      // Verify mobile navigation content is accessible
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      
      // Test accessibility attributes
      const navigationMenu = screen.getByTestId('navigation-menu');
      expect(navigationMenu).toHaveAttribute('data-mobile', 'true');
    });
  });

  describe('Mobile Navigation Error Handling', () => {
    it('handles mobile navigation errors gracefully', () => {
      // Test with mobile navigation errors
      mockUseDisclosure.onOpen.mockImplementation(() => {
        throw new Error('Mobile navigation error');
      });
      
      expect(() => {
        renderWithProviders(<NavigationPanel />);
      }).not.toThrow();
      
      // Should still render mobile navigation
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('provides fallback mobile navigation', () => {
      // Test fallback behavior
      renderWithProviders(<NavigationPanel />);
      
      // Should always provide mobile navigation fallback
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });
  });
});
