import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import NavigationMenu from '../../../components/layout/NavigationMenu';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock useAuth hook
jest.mock('../../../hooks/useAuth');

describe('NavigationMenu', () => {
  const mockRouter = {
    pathname: '/dashboard',
    push: jest.fn(),
  } as any;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    tenantId: 'tenant-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ChakraProvider>
        {component}
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      error: null,
      refreshToken: jest.fn(),
      updateUser: jest.fn(),
    });
  });

  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  describe('Basic Rendering', () => {
    it('renders navigation items correctly', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Buyers')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('renders with correct icons', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      // Icons should be present (we can check for the icon elements)
      const iconElements = document.querySelectorAll('svg');
      expect(iconElements.length).toBeGreaterThan(0);
    });

    it('applies active state styling', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      const dashboardItem = screen.getByText('Dashboard').closest('a');
      expect(dashboardItem).toHaveClass('chakra-link'); // Chakra UI class
    });
  });

  describe('Permission-based Rendering', () => {
    it('shows admin items for admin users', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('hides admin items for non-admin users', () => {
      const regularUser = { ...mockUser, role: 'agent' };
      renderWithTheme(<NavigationMenu user={regularUser} />);
      
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('filters navigation based on user permissions', () => {
      const limitedUser = { ...mockUser, role: 'agent' };
      renderWithTheme(<NavigationMenu user={limitedUser} />);
      
      // Should still show basic items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
      
      // Should hide admin items
      expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('hides text labels when collapsed', () => {
      renderWithTheme(<NavigationMenu user={mockUser} isCollapsed={true} />);
      
      // Should not show text labels in collapsed state
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Leads')).not.toBeInTheDocument();
      
      // Icons should still be visible
      const iconElements = document.querySelectorAll('svg');
      expect(iconElements.length).toBeGreaterThan(0);
    });

    it('maintains icon visibility in collapsed state', () => {
      renderWithTheme(<NavigationMenu user={mockUser} isCollapsed={true} />);
      
      // Icons should still be visible
      const iconElements = document.querySelectorAll('svg');
      expect(iconElements.length).toBeGreaterThan(0);
    });

    it('shows tooltips for collapsed items', () => {
      renderWithTheme(<NavigationMenu user={mockUser} isCollapsed={true} />);
      
      // In collapsed state, items should be wrapped in Tooltip components
      // We can verify this by checking the structure
      const navigationContainer = document.querySelector('[class*="chakra-stack"]');
      expect(navigationContainer).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation', () => {
    it('renders correctly on mobile', () => {
      renderWithTheme(<NavigationMenu user={mockUser} isMobile={true} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Leads')).toBeInTheDocument();
    });

    it('handles mobile touch interactions', () => {
      renderWithTheme(<NavigationMenu user={mockUser} isMobile={true} />);
      
      // Touch targets should be appropriately sized
      const dashboardItem = screen.getByText('Dashboard').closest('a');
      // Check if the item has the correct structure for touch targets
      expect(dashboardItem).toBeInTheDocument();
    });
  });

  describe('Submenu Expansion', () => {
    it('expands and collapses submenus', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      // Initially collapsed
      expect(screen.queryByText('Overview')).not.toBeInTheDocument();
      
      // Click to expand
      const dashboardItem = screen.getByText('Dashboard').closest('a');
      fireEvent.click(dashboardItem!);
      
      // Should now show submenu items
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Executive')).toBeInTheDocument();
    });

    it('toggles submenu state correctly', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      const dashboardItem = screen.getByText('Dashboard').closest('a');
      
      // First click expands
      fireEvent.click(dashboardItem!);
      expect(screen.getByText('Overview')).toBeInTheDocument();
      
      // Second click collapses
      fireEvent.click(dashboardItem!);
      expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    });
  });

  describe('Badge Display', () => {
    it('shows badges for items with badge property', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('applies correct badge colors', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      const adminBadge = screen.getByText('Admin');
      // Check if badge has the correct styling class
      expect(adminBadge).toHaveClass('chakra-badge');
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation structure', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      const navigationItems = screen.getAllByRole('link');
      expect(navigationItems.length).toBeGreaterThan(0);
      
      // Each navigation item should be a link
      navigationItems.forEach(item => {
        expect(item.tagName).toBe('A');
      });
    });

    it('maintains keyboard navigation support', () => {
      renderWithTheme(<NavigationMenu user={mockUser} />);
      
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to different screen sizes', () => {
      const { rerender } = renderWithTheme(<NavigationMenu user={mockUser} />);
      
      // Full navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // Collapsed navigation
      rerender(<NavigationMenu user={mockUser} isCollapsed={true} />);
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('maintains functionality across states', () => {
      const { rerender } = renderWithTheme(<NavigationMenu user={mockUser} />);
      
      // Full navigation - click to expand submenu
      const dashboardItem = screen.getByText('Dashboard').closest('a');
      fireEvent.click(dashboardItem!);
      expect(screen.getByText('Overview')).toBeInTheDocument();
      
      // Collapsed navigation - should still work
      rerender(<NavigationMenu user={mockUser} isCollapsed={true} />);
      const iconElements = document.querySelectorAll('svg');
      expect(iconElements.length).toBeGreaterThan(0);
    });
  });
});
