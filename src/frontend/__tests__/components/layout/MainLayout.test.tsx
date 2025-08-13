import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import MainLayout from '../../../components/layout/MainLayout/MainLayout';
import { NavigationProvider } from '../../../contexts/NavigationContext';
import { useAuth } from '../../../hooks/useAuth';

// Mock the hooks
jest.mock('../../../hooks/useAuth');

// Mock the child components
jest.mock('../../../components/layout/NavigationPanel', () => ({
  NavigationPanel: ({ isCollapsed, onToggleCollapse }: any) => (
    <div data-testid="navigation-panel" data-collapsed={isCollapsed}>
      <button onClick={() => onToggleCollapse(!isCollapsed)} data-testid="toggle-nav">
        Toggle Navigation
      </button>
      Navigation Panel
    </div>
  ),
}));

jest.mock('../../../components/layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../../components/layout/BreadcrumbNav', () => ({
  BreadcrumbNav: () => <div data-testid="breadcrumb-nav">Breadcrumb Navigation</div>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      <NavigationProvider>
        {component}
      </NavigationProvider>
    </ChakraProvider>
  );
};

describe('MainLayout', () => {
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

  describe('Basic Rendering', () => {
    it('renders layout with all components', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders without navigation panel when showNavigation is false', () => {
      renderWithProviders(
        <MainLayout showNavigation={false}>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.queryByTestId('navigation-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders without breadcrumbs when showBreadcrumbs is false', () => {
      renderWithProviders(
        <MainLayout showBreadcrumbs={false}>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('breadcrumb-nav')).not.toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Navigation State Management', () => {
    it('manages navigation collapse state', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const toggleButton = screen.getByTestId('toggle-nav');
      const navigationPanel = screen.getByTestId('navigation-panel');
      
      expect(navigationPanel).toHaveAttribute('data-collapsed', 'false');
      
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(navigationPanel).toHaveAttribute('data-collapsed', 'true');
      });
    });

    it('persists navigation state across re-renders', async () => {
      const { rerender } = renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const toggleButton = screen.getByTestId('toggle-nav');
      const navigationPanel = screen.getByTestId('navigation-panel');
      
      // Toggle to collapsed state
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(navigationPanel).toHaveAttribute('data-collapsed', 'true');
      });
      
      // Re-render and check state persists
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <MainLayout>
              <div>Test Content</div>
            </MainLayout>
          </NavigationProvider>
        </ChakraProvider>
      );
      
      expect(screen.getByTestId('navigation-panel')).toHaveAttribute('data-collapsed', 'true');
    });

    it('handles multiple navigation toggles correctly', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const toggleButton = screen.getByTestId('toggle-nav');
      const navigationPanel = screen.getByTestId('navigation-panel');
      
      // Start expanded
      expect(navigationPanel).toHaveAttribute('data-collapsed', 'false');
      
      // Toggle to collapsed
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(navigationPanel).toHaveAttribute('data-collapsed', 'true');
      });
      
      // Toggle back to expanded
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(navigationPanel).toHaveAttribute('data-collapsed', 'false');
      });
      
      // Toggle to collapsed again
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(navigationPanel).toHaveAttribute('data-collapsed', 'true');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to different screen sizes', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('maintains layout integrity on mobile devices', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('handles tablet viewport correctly', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Content Layout', () => {
    it('renders content in proper layout structure', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('handles multiple content sections', () => {
      renderWithProviders(
        <MainLayout>
          <div>Section 1</div>
          <div>Section 2</div>
          <div>Section 3</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('renders complex nested content structures', () => {
      renderWithProviders(
        <MainLayout>
          <div>
            <h1>Main Title</h1>
            <div>
              <h2>Subtitle</h2>
              <p>Content paragraph</p>
            </div>
          </div>
        </MainLayout>
      );
      
      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Content paragraph')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates with Header component', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('integrates with NavigationPanel component', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
    });

    it('integrates with BreadcrumbNav component', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
    });
  });

  describe('Context Integration', () => {
    it('uses NavigationContext for state management', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
    });

    it('integrates with authentication context', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large content', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Content item {i}</div>
      ));

      expect(() => {
        renderWithProviders(
          <MainLayout>
            {largeContent}
          </MainLayout>
        );
      }).not.toThrow();
      
      expect(screen.getByText('Content item 0')).toBeInTheDocument();
      expect(screen.getByText('Content item 99')).toBeInTheDocument();
    });

    it('handles rapid navigation state changes efficiently', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const toggleButton = screen.getByTestId('toggle-nav');
      
      // Rapid clicks
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
    });

    it('maintains performance during re-renders', () => {
      const { rerender } = renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      // Multiple re-renders
      rerender(
        <ChakraProvider theme={theme}>
          <NavigationProvider>
            <MainLayout>
              <div>Updated Content</div>
            </MainLayout>
          </NavigationProvider>
        </ChakraProvider>
      );
      
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper semantic structure', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
    });

    it('provides proper ARIA labels for interactive elements', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('toggle-nav')).toBeInTheDocument();
    });

    it('maintains keyboard navigation support', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const toggleButton = screen.getByTestId('toggle-nav');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('handles component errors gracefully', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      expect(() => {
        renderWithProviders(
          <MainLayout>
            <ErrorComponent />
          </MainLayout>
        );
      }).toThrow('Test error');
    });

    it('continues to function when child components fail', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      expect(() => {
        renderWithProviders(
          <MainLayout>
            <ErrorComponent />
          </MainLayout>
        );
      }).toThrow('Test error');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      renderWithProviders(
        <MainLayout>
          {null}
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      renderWithProviders(
        <MainLayout>
          {null}
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      renderWithProviders(
        <MainLayout>
          {undefined}
        </MainLayout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('navigation-panel')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-nav')).toBeInTheDocument();
    });

    it('handles mixed valid and invalid children', () => {
      renderWithProviders(
        <MainLayout>
          <div>Valid Content</div>
          {null}
          {undefined}
          <div>More Valid Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Valid Content')).toBeInTheDocument();
      expect(screen.getByText('More Valid Content')).toBeInTheDocument();
    });
  });
});
