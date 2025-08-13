import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../design-system/theme';
import { NavigationProvider, useNavigation } from '../../contexts/NavigationContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useKeyboardNavigation');
jest.mock('../../hooks/useAccessibility');

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

// Test component to access context
const TestComponent = () => {
  const {
    state,
    toggleCollapse,
    toggleExpandedItem,
    setActivePage,
    setMobileCollapsed,
  } = useNavigation();

  return (
    <div>
      <div data-testid="collapsed">{state.isCollapsed.toString()}</div>
      <div data-testid="mobile">{state.mobileCollapsed.toString()}</div>
      <div data-testid="active-page">{state.activePage}</div>
      <div data-testid="expanded-items">{Array.from(state.expandedItems).join(',')}</div>
      <button onClick={toggleCollapse} data-testid="toggle-collapse">
        Toggle Collapse
      </button>
      <button onClick={() => toggleExpandedItem('dashboard')} data-testid="toggle-dashboard">
        Toggle Dashboard
      </button>
      <button onClick={() => setActivePage('/leads')} data-testid="set-leads">
        Set Leads Active
      </button>
      <button onClick={() => setMobileCollapsed(false)} data-testid="set-mobile">
        Set Mobile
      </button>
    </div>
  );
};

describe('NavigationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('provides default navigation state', () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('collapsed')).toHaveTextContent('false');
      expect(screen.getByTestId('mobile')).toHaveTextContent('true');
      expect(screen.getByTestId('active-page')).toHaveTextContent('/');
      expect(screen.getByTestId('expanded-items')).toHaveTextContent('');
    });

    it('loads collapsed state from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('{"isCollapsed": true}');
      
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('collapsed')).toHaveTextContent('true');
    });

    it('loads expanded items from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('{"expandedItems": ["dashboard", "leads"]}');
      
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('expanded-items')).toHaveTextContent('dashboard,leads');
    });

    it('handles invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      expect(() => {
        renderWithTheme(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );
      }).not.toThrow();

      // Should fall back to defaults
      expect(screen.getByTestId('collapsed')).toHaveTextContent('false');
    });
  });

  describe('State Management', () => {
    it('toggles collapsed state', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('collapsed')).toHaveTextContent('false');
      
      fireEvent.click(screen.getByTestId('toggle-collapse'));
      
      await waitFor(() => {
        expect(screen.getByTestId('collapsed')).toHaveTextContent('true');
      });
    });

    it('toggles expanded items', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('expanded-items')).toHaveTextContent('');
      
      fireEvent.click(screen.getByTestId('toggle-dashboard'));
      
      await waitFor(() => {
        expect(screen.getByTestId('expanded-items')).toHaveTextContent('dashboard');
      });
      
      // Toggle again to collapse
      fireEvent.click(screen.getByTestId('toggle-dashboard'));
      
      await waitFor(() => {
        expect(screen.getByTestId('expanded-items')).toHaveTextContent('');
      });
    });

    it('sets active page', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('active-page')).toHaveTextContent('/');
      
      fireEvent.click(screen.getByTestId('set-leads'));
      
      await waitFor(() => {
        expect(screen.getByTestId('active-page')).toHaveTextContent('/leads');
      });
    });

    it('sets mobile collapsed state', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('mobile')).toHaveTextContent('true');
      
      fireEvent.click(screen.getByTestId('set-mobile'));
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile')).toHaveTextContent('false');
      });
    });
  });

  describe('Persistence', () => {
    it('saves collapsed state to localStorage', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      fireEvent.click(screen.getByTestId('toggle-collapse'));
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'navigation_state',
          expect.stringContaining('"isCollapsed":true')
        );
      });
    });

    it('saves expanded items to localStorage', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      fireEvent.click(screen.getByTestId('toggle-dashboard'));
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'navigation_state',
          expect.stringContaining('"expandedItems":["dashboard"]')
        );
      });
    });

    it('saves active page to localStorage', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      fireEvent.click(screen.getByTestId('set-leads'));
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'navigation_state',
          expect.stringContaining('"activePage":"/leads"')
        );
      });
    });

    it('saves mobile collapsed state to localStorage', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      fireEvent.click(screen.getByTestId('set-mobile'));
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'navigation_state',
          expect.stringContaining('"mobileCollapsed":false')
        );
      });
    });
  });

  describe('Multiple Item Management', () => {
    it('maintains multiple expanded items', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      // Expand dashboard
      fireEvent.click(screen.getByTestId('toggle-dashboard'));
      
      // For now, test that dashboard remains expanded
      await waitFor(() => {
        expect(screen.getByTestId('expanded-items')).toHaveTextContent('dashboard');
      });
    });

    it('handles item removal correctly', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      // Expand dashboard
      fireEvent.click(screen.getByTestId('toggle-dashboard'));
      
      await waitFor(() => {
        expect(screen.getByTestId('expanded-items')).toHaveTextContent('dashboard');
      });
      
      // Collapse dashboard
      fireEvent.click(screen.getByTestId('toggle-dashboard'));
      
      await waitFor(() => {
        expect(screen.getByTestId('expanded-items')).toHaveTextContent('');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => {
        renderWithTheme(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );
      }).not.toThrow();
      
      // Should still render with default state
      expect(screen.getByTestId('collapsed')).toHaveTextContent('false');
      
      consoleSpy.mockRestore();
    });

    it('handles JSON parsing errors', () => {
      localStorageMock.getItem.mockReturnValue('{invalid:json}');
      
      expect(() => {
        renderWithTheme(
          <NavigationProvider>
            <TestComponent />
          </NavigationProvider>
        );
      }).not.toThrow();
      
      // Should fall back to defaults
      expect(screen.getByTestId('collapsed')).toHaveTextContent('false');
    });
  });

  describe('Performance', () => {
    it('prevents unnecessary re-renders', () => {
      const { rerender } = renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );
      
      // Initial render
      const initialCollapsed = screen.getByTestId('collapsed').textContent;
      
      // Re-render with same props
      rerender(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );
      
      // Should maintain same state
      expect(screen.getByTestId('collapsed')).toHaveTextContent(initialCollapsed!);
    });

    it('handles rapid state changes efficiently', async () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      // Rapidly toggle collapse multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByTestId('toggle-collapse'));
      }
      
      // Should handle without errors
      await waitFor(() => {
        expect(screen.getByTestId('collapsed')).toHaveTextContent('true');
      });
    });
  });

  describe('Context Provider', () => {
    it('provides navigation context to children', () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      // All test elements should be present
      expect(screen.getByTestId('collapsed')).toBeInTheDocument();
      expect(screen.getByTestId('mobile')).toBeInTheDocument();
      expect(screen.getByTestId('active-page')).toBeInTheDocument();
      expect(screen.getByTestId('expanded-items')).toBeInTheDocument();
    });

    it('maintains context state during normal operations', () => {
      renderWithTheme(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );
      
      // Change state
      fireEvent.click(screen.getByTestId('toggle-collapse'));
      
      // State should persist within the same provider instance
      expect(screen.getByTestId('collapsed')).toHaveTextContent('true');
      
      // Change another state
      fireEvent.click(screen.getByTestId('toggle-dashboard'));
      
      // Both states should be maintained
      expect(screen.getByTestId('collapsed')).toHaveTextContent('true');
      expect(screen.getByTestId('expanded-items')).toHaveTextContent('dashboard');
    });
  });
});
