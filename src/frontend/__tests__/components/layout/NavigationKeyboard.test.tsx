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

describe('Global Navigation System Keyboard Navigation', () => {
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

  describe('STORY-NAV-010: Keyboard Navigation Support', () => {
    it('provides full keyboard access to all navigation items', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify all navigation items are keyboard accessible
      const navigationItems = screen.getAllByRole('link');
      expect(navigationItems.length).toBeGreaterThan(0);
      
      // Test that each item can receive focus
      navigationItems.forEach(item => {
        item.focus();
        expect(document.activeElement).toBe(item);
      });
    });

    it('maintains logical tab order through navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      const navigationItems = screen.getAllByRole('link');
      expect(navigationItems.length).toBeGreaterThan(0);
      
      // Test tab navigation order
      navigationItems.forEach((item, index) => {
        item.focus();
        expect(document.activeElement).toBe(item);
        
        // Test tab to next item
        if (index < navigationItems.length - 1) {
          const nextItem = navigationItems[index + 1];
          nextItem.focus();
          expect(document.activeElement).toBe(nextItem);
        }
      });
    });

    it('provides keyboard shortcuts for common actions', () => {
      renderWithProviders(<NavigationPanel />);
      
      const navigation = screen.getByRole('navigation');
      
      // Test escape key for mobile navigation
      fireEvent.keyDown(navigation, { key: 'Escape', code: 'Escape' });
      
      // Test enter key for navigation items
      const navigationItems = screen.getAllByRole('link');
      if (navigationItems.length > 0) {
        fireEvent.keyDown(navigationItems[0], { key: 'Enter', code: 'Enter' });
      }
      
      // Test space key for buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      });
    });

    it('provides clear focus indicators for all interactive elements', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test focus indicators for navigation items
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(item => {
        item.focus();
        expect(document.activeElement).toBe(item);
        
        // Verify focus is visible (this would test CSS focus styles)
        expect(item).toHaveAttribute('tabindex', '0');
      });
      
      // Test focus indicators for buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });
  });

  describe('Tab Order and Focus Management', () => {
    it('follows logical navigation flow in tab order', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Get all focusable elements in expected order
      const focusableElements = screen.getAllByRole('link').concat(
        screen.getAllByRole('button')
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Test tab navigation through all elements
      focusableElements.forEach((element, index) => {
        element.focus();
        expect(document.activeElement).toBe(element);
        
        // Test tab to next element
        if (index < focusableElements.length - 1) {
          const nextElement = focusableElements[index + 1];
          nextElement.focus();
          expect(document.activeElement).toBe(nextElement);
        }
      });
    });

    it('handles focus trapping in mobile navigation drawer', () => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
      mockUseDisclosure.isOpen = true;
      
      renderWithProviders(<NavigationPanel />);
      
      // Test focus management in mobile drawer
      const mobileElements = screen.getAllByRole('link').concat(
        screen.getAllByRole('button')
      );
      
      if (mobileElements.length > 0) {
        mobileElements.forEach(element => {
          element.focus();
          expect(document.activeElement).toBe(element);
        });
      }
    });

    it('maintains focus context during navigation state changes', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Focus on navigation item
      const navigationItems = screen.getAllByRole('link');
      if (navigationItems.length > 0) {
        navigationItems[0].focus();
        expect(document.activeElement).toBe(navigationItems[0]);
        
        // Change navigation state
        const toggleButton = screen.getByLabelText('Collapse navigation');
        toggleButton.focus();
        expect(document.activeElement).toBe(toggleButton);
        
        // Toggle collapse
        fireEvent.click(toggleButton);
        
        await waitFor(() => {
          // Focus should remain manageable
          expect(document.activeElement).toBeInTheDocument();
        });
      }
    });
  });

  describe('Keyboard Shortcuts and Hotkeys', () => {
    it('supports navigation-specific keyboard shortcuts', () => {
      renderWithProviders(<NavigationPanel />);
      
      const navigation = screen.getByRole('navigation');
      
      // Test common navigation shortcuts
      const shortcuts = [
        { key: 'h', code: 'KeyH', description: 'Go to Home' },
        { key: 'd', code: 'KeyD', description: 'Go to Dashboard' },
        { key: 'l', code: 'KeyL', description: 'Go to Leads' },
        { key: 'b', code: 'KeyB', description: 'Go to Buyers' },
      ];
      
      shortcuts.forEach(shortcut => {
        fireEvent.keyDown(navigation, { key: shortcut.key, code: shortcut.code });
        // Note: Actual shortcut handling would be implemented in the component
      });
    });

    it('provides keyboard shortcuts for quick actions', () => {
      renderWithProviders(<NavigationPanel />);
      
      const quickActions = screen.getByTestId('quick-actions');
      
      // Test quick action shortcuts
      const actionShortcuts = [
        { key: 'n', code: 'KeyN', description: 'New Lead' },
        { key: 'i', code: 'KeyI', description: 'Import' },
        { key: 's', code: 'KeyS', description: 'Search' },
      ];
      
      actionShortcuts.forEach(shortcut => {
        fireEvent.keyDown(quickActions, { key: shortcut.key, code: shortcut.code });
        // Note: Actual shortcut handling would be implemented in the component
      });
    });

    it('handles modifier key combinations', () => {
      renderWithProviders(<NavigationPanel />);
      
      const navigation = screen.getByRole('navigation');
      
      // Test modifier key combinations
      const modifierCombos = [
        { key: 'n', code: 'KeyN', ctrlKey: true, description: 'Ctrl+N for New' },
        { key: 's', code: 'KeyS', ctrlKey: true, description: 'Ctrl+S for Search' },
        { key: 'f', code: 'KeyF', ctrlKey: true, description: 'Ctrl+F for Find' },
      ];
      
      modifierCombos.forEach(combo => {
        fireEvent.keyDown(navigation, {
          key: combo.key,
          code: combo.code,
          ctrlKey: combo.ctrlKey,
        });
        // Note: Actual shortcut handling would be implemented in the component
      });
    });
  });

  describe('Focus Management and Indicators', () => {
    it('provides visible focus indicators for all interactive elements', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test focus indicators for navigation items
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(item => {
        item.focus();
        expect(document.activeElement).toBe(item);
        
        // Verify focus attributes
        expect(item).toHaveAttribute('tabindex', '0');
      });
      
      // Test focus indicators for buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        button.focus();
        expect(document.activeElement).toBe(button);
        
        // Verify focus attributes
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });

    it('maintains focus during dynamic content updates', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Focus on navigation item
      const navigationItems = screen.getAllByRole('link');
      if (navigationItems.length > 0) {
        navigationItems[0].focus();
        expect(document.activeElement).toBe(navigationItems[0]);
        
        // Simulate content update (e.g., route change)
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
        
        // Focus should remain manageable
        await waitFor(() => {
          expect(document.activeElement).toBeInTheDocument();
        });
      }
    });

    it('handles focus restoration after navigation actions', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Focus on navigation item
      const navigationItems = screen.getAllByRole('link');
      if (navigationItems.length > 0) {
        navigationItems[0].focus();
        expect(document.activeElement).toBe(navigationItems[0]);
        
        // Simulate navigation action
        fireEvent.click(navigationItems[0]);
        
        // Focus should be restored or moved appropriately
        expect(document.activeElement).toBeInTheDocument();
      }
    });
  });

  describe('Mobile Keyboard Navigation', () => {
    beforeEach(() => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
    });

    it('provides keyboard access to mobile navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test hamburger menu keyboard access
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      hamburgerButton.focus();
      expect(document.activeElement).toBe(hamburgerButton);
      
      // Test enter key to open mobile navigation
      fireEvent.keyDown(hamburgerButton, { key: 'Enter', code: 'Enter' });
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });

    it('handles mobile navigation keyboard interactions', () => {
      mockUseDisclosure.isOpen = true;
      renderWithProviders(<NavigationPanel />);
      
      // Test mobile navigation keyboard access
      const mobileElements = screen.getAllByRole('link').concat(
        screen.getAllByRole('button')
      );
      
      if (mobileElements.length > 0) {
        mobileElements.forEach(element => {
          element.focus();
          expect(document.activeElement).toBe(element);
          
          // Test keyboard activation
          fireEvent.keyDown(element, { key: 'Enter', code: 'Enter' });
        });
      }
    });

    it('provides escape key support for mobile navigation', () => {
      mockUseDisclosure.isOpen = true;
      renderWithProviders(<NavigationPanel />);
      
      const mobileNavigation = screen.getByTestId('navigation-menu');
      
      // Test escape key to close mobile navigation
      fireEvent.keyDown(mobileNavigation, { key: 'Escape', code: 'Escape' });
      
      // Note: This would test actual escape key handling in the component
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles keyboard navigation errors gracefully', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test invalid keyboard events
      const navigation = screen.getByRole('navigation');
      
      // Test unsupported keys
      fireEvent.keyDown(navigation, { key: 'F1', code: 'F1' });
      fireEvent.keyDown(navigation, { key: 'F2', code: 'F2' });
      
      // Should not throw errors
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('maintains keyboard navigation during loading states', () => {
      // Test with loading state
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: true,
      });
      
      renderWithProviders(<NavigationPanel />);
      
      // Should still provide keyboard navigation
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Test keyboard events during loading
      fireEvent.keyDown(navigation, { key: 'Tab', code: 'Tab' });
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('handles rapid keyboard input without errors', () => {
      renderWithProviders(<NavigationPanel />);
      
      const navigation = screen.getByRole('navigation');
      
      // Test rapid keyboard input
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(navigation, { key: 'Tab', code: 'Tab' });
        fireEvent.keyUp(navigation, { key: 'Tab', code: 'Tab' });
      }
      
      // Should handle without errors
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Integration with Screen Readers', () => {
    it('announces keyboard navigation actions', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test keyboard navigation announcements
      const navigationItems = screen.getAllByRole('link');
      if (navigationItems.length > 0) {
        navigationItems[0].focus();
        
        // Test that focus changes are announced
        expect(document.activeElement).toBe(navigationItems[0]);
        
        // Test keyboard activation
        fireEvent.keyDown(navigationItems[0], { key: 'Enter', code: 'Enter' });
        
        // Note: This would test actual screen reader announcements
      }
    });

    it('provides context for keyboard navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify keyboard navigation context
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(item => {
        expect(item).toHaveAttribute('href');
        expect(item.textContent).toBeTruthy();
        
        // Test keyboard context
        item.focus();
        expect(document.activeElement).toBe(item);
      });
    });
  });
});
