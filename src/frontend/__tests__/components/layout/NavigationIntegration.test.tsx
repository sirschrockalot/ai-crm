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

describe('Global Navigation System Integration', () => {
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
    mockUseBreakpointValue.mockReturnValue(false);
    mockUseColorModeValue.mockReturnValue('white');
    mockUseDisclosure.isOpen = false;
  });

  describe('STORY-NAV-012: Navigation Integration and Testing', () => {
    it('integrates all navigation components seamlessly', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify all core components are present
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('maintains consistent navigation state across components', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test navigation state synchronization
      const navigationPanel = screen.getByRole('navigation');
      expect(navigationPanel).toBeInTheDocument();
      
      // Verify navigation context integration
      expect(screen.getByTestId('navigation-menu')).toHaveAttribute('data-user', 'admin');
    });

    it('handles role-based navigation filtering consistently', () => {
      // Test with admin user
      renderWithProviders(<NavigationPanel />);
      
      expect(screen.getByTestId('navigation-menu')).toHaveAttribute('data-user', 'admin');
      expect(screen.getByTestId('quick-actions')).toHaveAttribute('data-user', 'admin');
      
      // Test with limited user
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, role: 'acquisition_rep', permissions: ['leads:read'] },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });
      
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      expect(screen.getByTestId('navigation-menu')).toHaveAttribute('data-user', 'acquisition_rep');
    });
  });

  describe('Cross-Component State Management', () => {
    it('synchronizes navigation state between panel and menu', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test collapse state synchronization
      const toggleButton = screen.getByLabelText('Collapse navigation');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const nav = screen.getByRole('navigation');
        expect(nav).toHaveStyle({ width: '4rem' });
      });
    });

    it('maintains navigation state during route changes', () => {
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      // Change route
      mockRouter.pathname = '/leads';
      mockRouter.asPath = '/leads';
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Navigation should remain functional
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation Integration', () => {
    beforeEach(() => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
    });

    it('provides consistent mobile navigation experience', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Should show hamburger menu on mobile
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
      
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
      
      // Should show full navigation content
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('handles mobile navigation state transitions', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(hamburgerButton);
      
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });
  });

  describe('Accessibility Integration', () => {
    it('provides consistent accessibility across all components', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify navigation structure
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Verify navigation items are accessible
      const navigationItems = screen.getAllByRole('link');
      expect(navigationItems.length).toBeGreaterThan(0);
      
      // Verify keyboard navigation support
      navigationItems.forEach(item => {
        expect(item.tagName).toBe('A');
        expect(item).toHaveAttribute('href');
      });
    });

    it('announces navigation state changes', async () => {
      renderWithProviders(<NavigationPanel />);
      
      const toggleButton = screen.getByLabelText('Collapse navigation');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(mockUseAccessibility.announce).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and Responsiveness', () => {
    it('renders navigation components efficiently', () => {
      const startTime = performance.now();
      
      renderWithProviders(<NavigationPanel />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Navigation should render under 100ms as per requirements
      expect(renderTime).toBeLessThan(100);
    });

    it('adapts to different screen sizes consistently', () => {
      // Test desktop
      mockUseBreakpointValue.mockReturnValue(false);
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Test mobile
      mockUseBreakpointValue.mockReturnValue(true);
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles authentication state changes gracefully', () => {
      // Test with authenticated user
      renderWithProviders(<NavigationPanel />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Test with unauthenticated user
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });
      
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should still render navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('handles router errors gracefully', () => {
      // Mock router error
      mockUseRouter.mockImplementation(() => {
        throw new Error('Router error');
      });
      
      expect(() => {
        renderWithProviders(<NavigationPanel />);
      }).not.toThrow();
    });
  });

  describe('User Experience Validation', () => {
    it('provides intuitive navigation flow', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify navigation hierarchy is clear
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      
      // Verify quick actions are accessible
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('maintains navigation context during user interactions', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test navigation state persistence
      const toggleButton = screen.getByLabelText('Collapse navigation');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const nav = screen.getByRole('navigation');
        expect(nav).toHaveStyle({ width: '4rem' });
      });
      
      // State should persist
      expect(screen.getByRole('navigation')).toHaveStyle({ width: '4rem' });
    });
  });
});
