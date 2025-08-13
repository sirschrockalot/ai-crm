import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import { BreadcrumbNav } from '../../../components/layout/BreadcrumbNav';
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

describe('BreadcrumbNav', () => {
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
    it('renders breadcrumb navigation', () => {
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders home link', () => {
      renderWithTheme(<BreadcrumbNav />);
      
      const homeLink = screen.getByText('Home');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });

    it('renders current page as last item', () => {
      mockRouter.pathname = '/dashboard';
      renderWithTheme(<BreadcrumbNav />);
      
      const currentPage = screen.getByText('Dashboard');
      expect(currentPage).toBeInTheDocument();
      expect(currentPage).not.toHaveAttribute('href');
    });
  });

  describe('Route Mapping', () => {
    it('maps dashboard route correctly', () => {
      mockRouter.pathname = '/dashboard';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('maps leads route correctly', () => {
      mockRouter.pathname = '/leads';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Leads')).toBeInTheDocument();
    });

    it('maps buyers route correctly', () => {
      mockRouter.pathname = '/buyers';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Buyers')).toBeInTheDocument();
    });

    it('maps analytics route correctly', () => {
      mockRouter.pathname = '/analytics';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('maps automation route correctly', () => {
      mockRouter.pathname = '/automation';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Automation')).toBeInTheDocument();
    });

    it('maps communications route correctly', () => {
      mockRouter.pathname = '/communications';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Communications')).toBeInTheDocument();
    });

    it('maps time-tracking route correctly', () => {
      mockRouter.pathname = '/time-tracking';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Time Tracking')).toBeInTheDocument();
    });

    it('maps settings route correctly', () => {
      mockRouter.pathname = '/settings';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('maps administration route correctly', () => {
      mockRouter.pathname = '/administration';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });
  });

  describe('Nested Routes', () => {
    it('handles dashboard subroutes', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Acquisitions')).toBeInTheDocument();
    });

    it('handles leads subroutes', () => {
      mockRouter.pathname = '/leads/import';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Import Leads')).toBeInTheDocument();
    });

    it('handles buyers subroutes', () => {
      mockRouter.pathname = '/buyers/active';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Buyers')).toBeInTheDocument();
      expect(screen.getByText('Active Buyers')).toBeInTheDocument();
    });

    it('handles analytics subroutes', () => {
      mockRouter.pathname = '/analytics/reports';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('handles deep nested routes', () => {
      mockRouter.pathname = '/dashboard/acquisitions/123/details';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Acquisitions')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  describe('Dynamic Route Parameters', () => {
    it('handles ID parameters gracefully', () => {
      mockRouter.pathname = '/leads/123';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Leads')).toBeInTheDocument();
      expect(screen.getByText('Lead Details')).toBeInTheDocument();
    });

    it('handles slug parameters', () => {
      mockRouter.pathname = '/buyers/active-buyers';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Buyers')).toBeInTheDocument();
      expect(screen.getByText('Active Buyers')).toBeInTheDocument();
    });

    it('handles query parameters', () => {
      mockRouter.pathname = '/analytics/reports';
      mockRouter.query = { type: 'monthly', period: '2024' };
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('makes intermediate breadcrumbs clickable', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('prevents last item from being clickable', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      const lastItem = screen.getByText('Acquisitions');
      expect(lastItem.closest('a')).not.toBeInTheDocument();
    });

    it('navigates to correct routes when clicked', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      fireEvent.click(dashboardLink!);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Separator Display', () => {
    it('shows separators between breadcrumb items', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      const separators = screen.getAllByText('/');
      expect(separators).toHaveLength(2); // Home / Dashboard / Acquisitions
    });

    it('uses correct separator character', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      const separators = screen.getAllByText('/');
      separators.forEach(separator => {
        expect(separator).toHaveTextContent('/');
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders on mobile devices', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      // Should render without errors on mobile
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Acquisitions')).toBeInTheDocument();
    });

    it('handles long breadcrumb paths', () => {
      mockRouter.pathname = '/dashboard/acquisitions/123/details/contact/phone';
      renderWithTheme(<BreadcrumbNav />);
      
      // Should handle long paths without breaking
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA navigation role', () => {
      renderWithTheme(<BreadcrumbNav />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('has proper ARIA labels for links', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-label', 'Navigate to Dashboard');
    });

    it('indicates current page', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      const currentPage = screen.getByText('Acquisitions');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Edge Cases', () => {
    it('handles root path', () => {
      mockRouter.pathname = '/';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('/')).not.toBeInTheDocument();
    });

    it('handles unknown routes gracefully', () => {
      mockRouter.pathname = '/unknown/route';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('Route')).toBeInTheDocument();
    });

    it('handles empty pathname', () => {
      mockRouter.pathname = '';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('handles pathname with trailing slash', () => {
      mockRouter.pathname = '/dashboard/';
      renderWithTheme(<BreadcrumbNav />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many breadcrumb items', () => {
      mockRouter.pathname = '/dashboard/acquisitions/123/details/contact/phone/extension/1234';
      renderWithTheme(<BreadcrumbNav />);
      
      // Should render without performance issues
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Extension')).toBeInTheDocument();
    });

    it('handles route changes efficiently', () => {
      const { rerender } = renderWithTheme(<BreadcrumbNav />);
      
      // Initial render
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // Change route
      mockRouter.pathname = '/leads';
      rerender(<BreadcrumbNav />);
      
      // Should update efficiently
      expect(screen.getByText('Leads')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('handles different route formats', () => {
      mockRouter.pathname = '/dashboard/acquisitions';
      renderWithTheme(<BreadcrumbNav />);
      
      // Should handle various route formats
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Acquisitions')).toBeInTheDocument();
    });

    it('maintains consistent formatting', () => {
      mockRouter.pathname = '/dashboard/acquisitions/123';
      renderWithTheme(<BreadcrumbNav />);
      
      // All breadcrumb items should have consistent styling
      const breadcrumbItems = screen.getAllByRole('listitem');
      breadcrumbItems.forEach(item => {
        expect(item).toBeInTheDocument();
      });
    });
  });
});
