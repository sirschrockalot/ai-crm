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

describe('Global Navigation System Role-Based Navigation', () => {
  const mockRouter = {
    pathname: '/dashboard',
    asPath: '/dashboard',
    push: jest.fn(),
    query: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUseBreakpointValue.mockReturnValue(false);
    mockUseColorModeValue.mockReturnValue('white');
    mockUseDisclosure.isOpen = false;
  });

  describe('STORY-NAV-004: Role-Based Navigation Filtering', () => {
    it('filters navigation menu items based on user role', () => {
      // Test with admin user
      const adminUser = {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        permissions: [
          'dashboard:read',
          'leads:read',
          'leads:create',
          'buyers:read',
          'buyers:create',
          'communications:send',
          'analytics:read',
          'admin:access',
          'system:manage'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Admin should see full navigation
      expect(screen.getByTestId('navigation-menu')).toHaveAttribute('data-user', 'admin');
      expect(screen.getByTestId('quick-actions')).toHaveAttribute('data-user', 'admin');
      
      // Verify admin-specific navigation items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Buyers')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });

    it('shows full navigation including system administration for admin users', () => {
      const adminUser = {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        permissions: [
          'dashboard:read',
          'leads:read',
          'leads:create',
          'buyers:read',
          'buyers:create',
          'communications:send',
          'analytics:read',
          'admin:access',
          'system:manage',
          'users:manage',
          'settings:manage'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Admin should see system administration
      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      
      // Verify admin quick actions
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
      expect(screen.getByText('Add Buyer')).toBeInTheDocument();
      expect(screen.getByText('Import Leads')).toBeInTheDocument();
    });

    it('shows lead management and communication features for acquisition reps', () => {
      const acquisitionRep = {
        id: '2',
        email: 'rep@example.com',
        role: 'acquisition_rep',
        permissions: [
          'dashboard:read',
          'leads:read',
          'leads:create',
          'leads:edit',
          'communications:send',
          'communications:read',
          'time-tracking:read',
          'time-tracking:create'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: acquisitionRep,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Acquisition rep should see relevant navigation
      expect(screen.getByTestId('navigation-menu')).toHaveAttribute('data-user', 'acquisition_rep');
      expect(screen.getByTestId('quick-actions')).toHaveAttribute('data-user', 'acquisition_rep');
      
      // Should see lead management features
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Communications')).toBeInTheDocument();
      expect(screen.getByText('Time Tracking')).toBeInTheDocument();
      
      // Should NOT see admin features
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      
      // Should see relevant quick actions
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
      expect(screen.queryByText('Add Buyer')).not.toBeInTheDocument();
    });

    it('shows buyer management and deal features for disposition managers', () => {
      const dispositionManager = {
        id: '3',
        email: 'manager@example.com',
        role: 'disposition_manager',
        permissions: [
          'dashboard:read',
          'buyers:read',
          'buyers:create',
          'buyers:edit',
          'deals:read',
          'deals:create',
          'deals:edit',
          'analytics:read',
          'communications:read'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: dispositionManager,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Disposition manager should see relevant navigation
      expect(screen.getByTestId('navigation-menu')).toHaveAttribute('data-user', 'disposition_manager');
      expect(screen.getByTestId('quick-actions')).toHaveAttribute('data-user', 'disposition_manager');
      
      // Should see buyer and deal features
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Buyers')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Communications')).toBeInTheDocument();
      
      // Should NOT see lead management features
      expect(screen.queryByText('Leads')).not.toBeInTheDocument();
      expect(screen.queryByText('Time Tracking')).not.toBeInTheDocument();
      
      // Should see relevant quick actions
      expect(screen.getByText('Add Buyer')).toBeInTheDocument();
      expect(screen.queryByText('Add Lead')).not.toBeInTheDocument();
    });

    it('shows limited navigation based on team member permissions', () => {
      const teamMember = {
        id: '4',
        email: 'member@example.com',
        role: 'team_member',
        permissions: [
          'dashboard:read',
          'leads:read',
          'communications:read'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: teamMember,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Team member should see limited navigation
      expect(screen.getByTestId('navigation-menu')).toHaveAttribute('data-user', 'team_member');
      expect(screen.getByTestId('quick-actions')).toHaveAttribute('data-user', 'team_member');
      
      // Should see only permitted features
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Communications')).toBeInTheDocument();
      
      // Should NOT see restricted features
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
      
      // Should see limited quick actions
      expect(screen.queryByText('Add Lead')).not.toBeInTheDocument();
      expect(screen.queryByText('Add Buyer')).not.toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  describe('Permission-Based Navigation Filtering', () => {
    it('filters navigation based on specific permissions', () => {
      const userWithSpecificPermissions = {
        id: '5',
        email: 'specific@example.com',
        role: 'custom_role',
        permissions: [
          'dashboard:read',
          'leads:read',
          'leads:create',
          'analytics:read'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: userWithSpecificPermissions,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Should see features based on permissions
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      
      // Should NOT see features without permissions
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      expect(screen.queryByText('Communications')).not.toBeInTheDocument();
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    });

    it('updates navigation dynamically when permissions change', () => {
      const user = {
        id: '6',
        email: 'dynamic@example.com',
        role: 'dynamic_role',
        permissions: ['dashboard:read', 'leads:read'],
      };

      mockUseAuth.mockReturnValue({
        user,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      // Initial permissions
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      
      // Update permissions
      user.permissions = ['dashboard:read', 'leads:read', 'buyers:read', 'buyers:create'];
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should see new permissions
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Buyers')).toBeInTheDocument();
    });

    it('handles users with no permissions gracefully', () => {
      const userWithNoPermissions = {
        id: '7',
        email: 'noperms@example.com',
        role: 'no_permissions',
        permissions: [],
      };

      mockUseAuth.mockReturnValue({
        user: userWithNoPermissions,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Should still render navigation with minimal access
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      
      // Should only see basic navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // Should NOT see restricted features
      expect(screen.queryByText('Leads')).not.toBeInTheDocument();
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Quick Actions', () => {
    it('filters quick actions based on user role and permissions', () => {
      const adminUser = {
        id: '8',
        email: 'admin@example.com',
        role: 'admin',
        permissions: [
          'dashboard:read',
          'leads:create',
          'buyers:create',
          'communications:send',
          'analytics:read'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Admin should see all quick actions
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
      expect(screen.getByText('Add Buyer')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
      expect(screen.getByText('Import Leads')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('shows role-appropriate quick actions for acquisition reps', () => {
      const acquisitionRep = {
        id: '9',
        email: 'rep@example.com',
        role: 'acquisition_rep',
        permissions: [
          'dashboard:read',
          'leads:create',
          'communications:send',
          'leads:read'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: acquisitionRep,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Should see lead-related quick actions
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      
      // Should NOT see buyer-related quick actions
      expect(screen.queryByText('Add Buyer')).not.toBeInTheDocument();
    });

    it('shows role-appropriate quick actions for disposition managers', () => {
      const dispositionManager = {
        id: '10',
        email: 'manager@example.com',
        role: 'disposition_manager',
        permissions: [
          'dashboard:read',
          'buyers:create',
          'communications:send',
          'buyers:read'
        ],
      };

      mockUseAuth.mockReturnValue({
        user: dispositionManager,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Should see buyer-related quick actions
      expect(screen.getByText('Add Buyer')).toBeInTheDocument();
      expect(screen.getByText('Send Message')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      
      // Should NOT see lead-related quick actions
      expect(screen.queryByText('Add Lead')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Security and Validation', () => {
    it('securely enforces navigation permissions', () => {
      const user = {
        id: '11',
        email: 'user@example.com',
        role: 'user',
        permissions: ['dashboard:read'],
      };

      mockUseAuth.mockReturnValue({
        user,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Should only see permitted navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Leads')).not.toBeInTheDocument();
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    });

    it('validates permission changes securely', () => {
      const user = {
        id: '12',
        email: 'secure@example.com',
        role: 'secure_role',
        permissions: ['dashboard:read', 'leads:read'],
      };

      mockUseAuth.mockReturnValue({
        user,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      // Initial permissions
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      
      // Attempt to add unauthorized permission (should be ignored)
      user.permissions = ['dashboard:read', 'leads:read', 'admin:access'];
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should not show admin features even if permission is added
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    });

    it('handles malformed permission data gracefully', () => {
      const userWithMalformedPermissions = {
        id: '13',
        email: 'malformed@example.com',
        role: 'malformed_role',
        permissions: null, // Malformed permissions
      };

      mockUseAuth.mockReturnValue({
        user: userWithMalformedPermissions,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      expect(() => {
        renderWithProviders(<NavigationPanel />);
      }).not.toThrow();
      
      // Should render with minimal navigation
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('optimizes navigation filtering for performance', () => {
      const userWithManyPermissions = {
        id: '14',
        email: 'manyperms@example.com',
        role: 'many_permissions',
        permissions: Array.from({ length: 100 }, (_, i) => `permission:${i}`),
      };

      mockUseAuth.mockReturnValue({
        user: userWithManyPermissions,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      const startTime = performance.now();
      
      renderWithProviders(<NavigationPanel />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render efficiently even with many permissions
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    });

    it('caches navigation filtering results appropriately', () => {
      const user = {
        id: '15',
        email: 'cache@example.com',
        role: 'cache_role',
        permissions: ['dashboard:read', 'leads:read'],
      };

      mockUseAuth.mockReturnValue({
        user,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      // First render
      const { rerender } = renderWithProviders(<NavigationPanel />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      
      // Re-render with same permissions
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should maintain same navigation state
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
    });
  });

  describe('Integration with RBAC System', () => {
    it('integrates with existing RBAC system for permission checking', () => {
      const user = {
        id: '16',
        email: 'rbac@example.com',
        role: 'rbac_role',
        permissions: ['dashboard:read', 'leads:read', 'leads:create'],
      };

      mockUseAuth.mockReturnValue({
        user,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      renderWithProviders(<NavigationPanel />);
      
      // Should use RBAC permissions for navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.queryByText('Buyers')).not.toBeInTheDocument();
      
      // Should show appropriate quick actions based on RBAC
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
      expect(screen.queryByText('Add Buyer')).not.toBeInTheDocument();
    });

    it('handles RBAC permission updates correctly', () => {
      const user = {
        id: '17',
        email: 'rbacupdate@example.com',
        role: 'rbac_update_role',
        permissions: ['dashboard:read'],
      };

      mockUseAuth.mockReturnValue({
        user,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });

      const { rerender } = renderWithProviders(<NavigationPanel />);
      
      // Initial permissions
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Leads')).not.toBeInTheDocument();
      
      // Update RBAC permissions
      user.permissions = ['dashboard:read', 'leads:read', 'leads:create'];
      
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <NavigationPanel />
          </NavigationProvider>
        </ChakraProvider>
      );
      
      // Should reflect new RBAC permissions
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Add Lead')).toBeInTheDocument();
    });
  });
});
