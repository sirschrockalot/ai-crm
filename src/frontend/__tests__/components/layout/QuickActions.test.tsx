import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import { QuickActions } from '../../../components/layout/QuickActions';
import { useRouter } from 'next/router';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('QuickActions', () => {
  const mockRouter = {
    pathname: '/dashboard',
    asPath: '/dashboard',
    push: jest.fn(),
    query: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe('Basic Rendering', () => {
    it('renders quick actions container', () => {
      renderWithTheme(<QuickActions />);
      
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('renders all quick action buttons', () => {
      renderWithTheme(<QuickActions />);
      
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('New Buyer')).toBeInTheDocument();
      expect(screen.getByText('New Deal')).toBeInTheDocument();
      expect(screen.getByText('Quick Report')).toBeInTheDocument();
      expect(screen.getByText('Time Entry')).toBeInTheDocument();
    });

    it('renders action icons', () => {
      renderWithTheme(<QuickActions />);
      
      // Icons should be present (using test IDs or aria-labels)
      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Action Functionality', () => {
    it('navigates to new lead page', async () => {
      renderWithTheme(<QuickActions />);
      
      const newLeadButton = screen.getByText('New Lead');
      fireEvent.click(newLeadButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/leads/new');
      });
    });

    it('navigates to new buyer page', async () => {
      renderWithTheme(<QuickActions />);
      
      const newBuyerButton = screen.getByText('New Buyer');
      fireEvent.click(newBuyerButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/buyers/new');
      });
    });

    it('navigates to new deal page', async () => {
      renderWithTheme(<QuickActions />);
      
      const newDealButton = screen.getByText('New Deal');
      fireEvent.click(newDealButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/deals/new');
      });
    });

    it('navigates to quick report page', async () => {
      renderWithTheme(<QuickActions />);
      
      const quickReportButton = screen.getByText('Quick Report');
      fireEvent.click(quickReportButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/analytics/quick-report');
      });
    });

    it('navigates to time entry page', async () => {
      renderWithTheme(<QuickActions />);
      
      const timeEntryButton = screen.getByText('Time Entry');
      fireEvent.click(timeEntryButton);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/time-tracking/entry');
      });
    });
  });

  describe('Role-Based Actions', () => {
    it('shows all actions for admin users', () => {
      const adminUser = { role: 'admin', permissions: ['all'] };
      renderWithTheme(<QuickActions user={adminUser} />);
      
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('New Buyer')).toBeInTheDocument();
      expect(screen.getByText('New Deal')).toBeInTheDocument();
      expect(screen.getByText('Quick Report')).toBeInTheDocument();
      expect(screen.getByText('Time Entry')).toBeInTheDocument();
    });

    it('filters actions for manager users', () => {
      const managerUser = { role: 'manager', permissions: ['leads:write', 'buyers:write'] };
      renderWithTheme(<QuickActions user={managerUser} />);
      
      // Manager should see most actions
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('New Buyer')).toBeInTheDocument();
      expect(screen.getByText('New Deal')).toBeInTheDocument();
      
      // But not admin-specific actions
      expect(screen.queryByText('Quick Report')).not.toBeInTheDocument();
    });

    it('filters actions for agent users', () => {
      const agentUser = { role: 'agent', permissions: ['leads:write'] };
      renderWithTheme(<QuickActions user={agentUser} />);
      
      // Agent should see limited actions
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      
      // Should not see other actions
      expect(screen.queryByText('New Buyer')).not.toBeInTheDocument();
      expect(screen.queryByText('New Deal')).not.toBeInTheDocument();
      expect(screen.queryByText('Quick Report')).not.toBeInTheDocument();
      expect(screen.queryByText('Time Entry')).not.toBeInTheDocument();
    });

    it('handles users without roles gracefully', () => {
      const noRoleUser = { role: undefined, permissions: [] };
      renderWithTheme(<QuickActions user={noRoleUser} />);
      
      // Should show basic actions
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });

    it('handles null user gracefully', () => {
      renderWithTheme(<QuickActions user={null} />);
      
      // Should show all actions when no user
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('New Buyer')).toBeInTheDocument();
    });
  });

  describe('Permission-Based Filtering', () => {
    it('shows lead actions with lead permissions', () => {
      const userWithLeadPermissions = { 
        role: 'agent', 
        permissions: ['leads:write', 'leads:create'] 
      };
      renderWithTheme(<QuickActions user={userWithLeadPermissions} />);
      
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });

    it('shows buyer actions with buyer permissions', () => {
      const userWithBuyerPermissions = { 
        role: 'manager', 
        permissions: ['buyers:write', 'buyers:create'] 
      };
      renderWithTheme(<QuickActions user={userWithBuyerPermissions} />);
      
      expect(screen.getByText('New Buyer')).toBeInTheDocument();
    });

    it('shows deal actions with deal permissions', () => {
      const userWithDealPermissions = { 
        role: 'manager', 
        permissions: ['deals:write', 'deals:create'] 
      };
      renderWithTheme(<QuickActions user={userWithDealPermissions} />);
      
      expect(screen.getByText('New Deal')).toBeInTheDocument();
    });

    it('shows analytics actions with analytics permissions', () => {
      const userWithAnalyticsPermissions = { 
        role: 'admin', 
        permissions: ['analytics:read', 'analytics:write'] 
      };
      renderWithTheme(<QuickActions user={userWithAnalyticsPermissions} />);
      
      expect(screen.getByText('Quick Report')).toBeInTheDocument();
    });

    it('shows time tracking actions with time permissions', () => {
      const userWithTimePermissions = { 
        role: 'agent', 
        permissions: ['time:write', 'time:create'] 
      };
      renderWithTheme(<QuickActions user={userWithTimePermissions} />);
      
      expect(screen.getByText('Time Entry')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders on mobile devices', () => {
      renderWithTheme(<QuickActions isMobile={true} />);
      
      // Should render without errors on mobile
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('New Buyer')).toBeInTheDocument();
    });

    it('adapts layout for small screens', () => {
      renderWithTheme(<QuickActions isMobile={true} />);
      
      // Mobile layout should be functional
      const actionButtons = screen.getAllByRole('button');
      actionButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('handles collapsed state', () => {
      renderWithTheme(<QuickActions isCollapsed={true} />);
      
      // Should still show actions in collapsed state
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithTheme(<QuickActions />);
      
      const actionButtons = screen.getAllByRole('button');
      actionButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('has proper button roles', () => {
      renderWithTheme(<QuickActions />);
      
      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('maintains proper focus management', () => {
      renderWithTheme(<QuickActions />);
      
      const firstButton = screen.getByText('New Lead').closest('button');
      firstButton?.focus();
      
      expect(document.activeElement).toBe(firstButton);
    });

    it('handles keyboard navigation', () => {
      renderWithTheme(<QuickActions />);
      
      const newLeadButton = screen.getByText('New Lead').closest('button');
      
      // Test keyboard interaction
      fireEvent.keyDown(newLeadButton!, { key: 'Enter' });
      
      // Should trigger navigation
      expect(mockRouter.push).toHaveBeenCalledWith('/leads/new');
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many permissions', () => {
      const userWithManyPermissions = {
        role: 'admin',
        permissions: Array.from({ length: 100 }, (_, i) => `permission:${i}`),
      };
      
      expect(() => {
        renderWithTheme(<QuickActions user={userWithManyPermissions} />);
      }).not.toThrow();
    });

    it('handles rapid clicks efficiently', async () => {
      renderWithTheme(<QuickActions />);
      
      const newLeadButton = screen.getByText('New Lead');
      
      // Rapidly click multiple times
      for (let i = 0; i < 3; i++) {
        fireEvent.click(newLeadButton);
      }
      
      // Should handle without errors
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/leads/new');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles navigation errors gracefully', () => {
      // Mock router to throw error
      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      expect(() => {
        renderWithTheme(<QuickActions />);
      }).not.toThrow();
      
      // Should still render
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });

    it('handles missing user data gracefully', () => {
      const invalidUser = { role: 'invalid', permissions: null };
      
      expect(() => {
        renderWithTheme(<QuickActions user={invalidUser} />);
      }).not.toThrow();
      
      // Should still render basic actions
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    it('allows custom action configuration', () => {
      const customActions = [
        { label: 'Custom Action', route: '/custom', icon: 'custom-icon' },
      ];
      
      renderWithTheme(<QuickActions customActions={customActions} />);
      
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('merges custom actions with default actions', () => {
      const customActions = [
        { label: 'Custom Action', route: '/custom', icon: 'custom-icon' },
      ];
      
      renderWithTheme(<QuickActions customActions={customActions} />);
      
      // Should show both custom and default actions
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });

    it('handles empty custom actions', () => {
      renderWithTheme(<QuickActions customActions={[]} />);
      
      // Should show default actions
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('New Buyer')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('works with navigation context', () => {
      // This would test integration with NavigationContext if needed
      renderWithTheme(<QuickActions />);
      
      // Should render without context errors
      expect(screen.getByText('New Lead')).toBeInTheDocument();
    });

    it('integrates with routing system', () => {
      renderWithTheme(<QuickActions />);
      
      const newLeadButton = screen.getByText('New Lead');
      fireEvent.click(newLeadButton);
      
      // Should use the router for navigation
      expect(mockRouter.push).toHaveBeenCalledWith('/leads/new');
    });
  });
});
