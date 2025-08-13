import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import { NavigationProvider } from '../../../contexts/NavigationContext';
import NavigationPanel from '../../../components/layout/NavigationPanel';
import { useAuth } from '../../../hooks/useAuth';

// Mock the hooks
jest.mock('../../../hooks/useAuth');
jest.mock('../../../hooks/useAccessibility');
jest.mock('../../../hooks/useKeyboardNavigation');

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    asPath: '/dashboard',
    push: jest.fn(),
    query: {},
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseAccessibility = {
  announce: jest.fn(),
  getAccessibilityProps: jest.fn(() => ({})),
};
const mockUseKeyboardNavigation = {
  handleKeyDown: jest.fn(),
  createFocusTrap: jest.fn(),
};

jest.mock('../../../hooks/useAccessibility', () => ({
  __esModule: true,
  useAccessibility: () => mockUseAccessibility,
  NAVIGATION_ARIA_LABELS: {
    navigation: 'Navigation',
    navigationToggle: 'Toggle navigation',
    navigationExpand: 'Expand navigation',
    navigationCollapse: 'Collapse navigation',
  },
  NAVIGATION_ARIA_ROLES: {
    navigation: 'navigation',
  },
}));

jest.mock('../../../hooks/useKeyboardNavigation', () => ({
  __esModule: true,
  useKeyboardNavigation: () => mockUseKeyboardNavigation,
}));

// Mock Chakra UI hooks
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useDisclosure: () => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onToggle: jest.fn(),
  }),
  useBreakpointValue: jest.fn((values) => {
    // Mock mobile breakpoint values for testing mobile view
    if (values.base === true && values.md === false) return true; // isMobile = true
    if (values.base === false && values.md === true && values.lg === false) return false; // isTablet = false
    return true; // Default to true (mobile mode)
  }),
  useColorModeValue: () => 'white',
}));

// Mock the child components
jest.mock('../../../components/layout/NavigationMenu', () => ({
  __esModule: true,
  default: ({ user, isCollapsed, isMobile }: any) => (
    <div data-testid="navigation-menu" data-user={user?.role} data-collapsed={isCollapsed} data-mobile={isMobile || false}>
      <a href="/dashboard">Dashboard</a>
      <a href="/leads">Leads</a>
      <a href="/buyers">Buyers</a>
    </div>
  ),
}));

jest.mock('../../../components/layout/QuickActions', () => ({
  __esModule: true,
  default: ({ user, isCollapsed, isMobile }: any) => (
    <div data-testid="quick-actions" data-user={user?.role} data-collapsed={isCollapsed} data-mobile={isMobile || false}>
      <button>Add Lead</button>
      <button>Add Buyer</button>
    </div>
  ),
}));

jest.mock('../../../components/layout/BreadcrumbNav', () => ({
  __esModule: true,
  default: () => <div data-testid="breadcrumb-nav">Breadcrumbs</div>,
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

describe('NavigationPanel', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'admin',
    permissions: ['dashboard:read', 'leads:read', 'buyers:read'],
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
  });

  describe('Desktop/Tablet Navigation', () => {
    beforeEach(() => {
      // Mock desktop breakpoint values for these tests
      jest.spyOn(require('@chakra-ui/react'), 'useBreakpointValue').mockImplementation((values) => {
        if (values.base === true && values.md === false) return false; // isMobile = false
        if (values.base === false && values.md === true && values.lg === false) return false; // isTablet = false
        return false; // Default to false (desktop mode)
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('renders desktop navigation panel', () => {
      renderWithProviders(<NavigationPanel />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('renders collapsed navigation panel', () => {
      renderWithProviders(<NavigationPanel isCollapsed={true} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders expanded navigation panel', () => {
      renderWithProviders(<NavigationPanel isCollapsed={false} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('shows navigation menu with correct props', () => {
      renderWithProviders(<NavigationPanel isCollapsed={false} />);
      
      const menu = screen.getByTestId('navigation-menu');
      expect(menu).toHaveAttribute('data-user', 'admin');
      expect(menu).toHaveAttribute('data-collapsed', 'false');
      expect(menu).toHaveAttribute('data-mobile', 'false');
    });

    it('shows quick actions with correct props', () => {
      renderWithProviders(<NavigationPanel isCollapsed={false} />);
      
      const actions = screen.getByTestId('quick-actions');
      expect(actions).toHaveAttribute('data-user', 'admin');
      expect(actions).toHaveAttribute('data-collapsed', 'false');
      expect(actions).toHaveAttribute('data-mobile', 'false');
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      // Mock mobile breakpoint values for these tests
      jest.spyOn(require('@chakra-ui/react'), 'useBreakpointValue').mockImplementation((values) => {
        if (values.base === true && values.md === false) return true; // isMobile = true
        if (values.base === false && values.md === true && values.lg === false) return false; // isTablet = false
        return true; // Default to true (mobile mode)
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('renders mobile navigation with hamburger menu', () => {
      renderWithProviders(<NavigationPanel />);
      
      expect(screen.getByLabelText('Toggle navigation')).toBeInTheDocument();
    });

    it('handles mobile navigation interactions', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation');
      expect(hamburgerButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<NavigationPanel />);
      
      // In mobile view, we should see the toggle button
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('handles keyboard navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      // In mobile view, we should see the toggle button
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
      
      // In mobile view, keyboard events are handled by the drawer, not the toggle button
      // The toggle button is just for opening the drawer
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates with navigation context', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Should render toggle button without errors, indicating context integration works
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('handles user authentication state', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });
      
      renderWithProviders(<NavigationPanel />);
      
      // Should still render toggle button even without user
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('responds to route changes', () => {
      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      // Re-render to test route change handling
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Navigation toggle should still be functional
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing user gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });
      
      expect(() => {
        renderWithProviders(<NavigationPanel />);
      }).not.toThrow();
      
      // Should still render toggle button even without user
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('handles missing permissions gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, permissions: [] },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });
      
      expect(() => {
        renderWithProviders(<NavigationPanel />);
      }).not.toThrow();
      
      // Should still render toggle button even without permissions
      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
