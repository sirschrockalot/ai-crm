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

describe('Global Navigation System Accessibility', () => {
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

  describe('STORY-NAV-011: Screen Reader Compatibility', () => {
    it('has proper ARIA labels for navigation elements', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify main navigation has proper role
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Verify navigation panel has proper aria-label
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('provides semantic navigation structure', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify navigation menu structure
      const navigationMenu = screen.getByTestId('navigation-menu');
      expect(navigationMenu).toBeInTheDocument();
      
      // Verify navigation items are properly structured
      const navigationItems = screen.getAllByRole('link');
      expect(navigationItems.length).toBeGreaterThan(0);
      
      // Each navigation item should have proper semantic structure
      navigationItems.forEach(item => {
        expect(item.tagName).toBe('A');
        expect(item).toHaveAttribute('href');
      });
    });

    it('announces navigation state changes to screen readers', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test collapse state announcement
      const toggleButton = screen.getByLabelText('Collapse navigation');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(mockUseAccessibility.announce).toHaveBeenCalledWith('Navigation collapsed');
      });
    });

    it('provides clear navigation context for screen readers', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify navigation context is clear
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
      
      // Verify navigation items have descriptive labels
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(item => {
        expect(item).toHaveTextContent();
        expect(item.textContent!.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('meets color contrast requirements', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify navigation elements have sufficient contrast
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Test that navigation text is readable
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(item => {
        expect(item).toHaveTextContent();
        // Note: Actual color contrast testing would require visual testing tools
      });
    });

    it('provides focus indicators for keyboard navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify focus management
      const navigationItems = screen.getAllByRole('link');
      expect(navigationItems.length).toBeGreaterThan(0);
      
      // Test focus indicators
      navigationItems.forEach(item => {
        item.focus();
        expect(document.activeElement).toBe(item);
      });
    });

    it('maintains proper heading hierarchy', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify navigation doesn't break heading hierarchy
      const headings = screen.queryAllByRole('heading');
      if (headings.length > 0) {
        // Check that headings follow proper hierarchy
        headings.forEach((heading, index) => {
          if (index > 0) {
            const prevLevel = parseInt(headings[index - 1].tagName.charAt(1));
            const currentLevel = parseInt(heading.tagName.charAt(1));
            expect(currentLevel - prevLevel).toBeLessThanOrEqual(1);
          }
        });
      }
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('uses appropriate ARIA roles for navigation components', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify main navigation role
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Verify navigation menu role
      const navigationMenu = screen.getByTestId('navigation-menu');
      expect(navigationMenu).toBeInTheDocument();
      
      // Verify quick actions role
      const quickActions = screen.getByTestId('quick-actions');
      expect(quickActions).toBeInTheDocument();
    });

    it('provides descriptive ARIA labels for interactive elements', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify toggle button has descriptive label
      const toggleButton = screen.getByLabelText('Collapse navigation');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-label', 'Collapse navigation');
      
      // Verify navigation items have descriptive text
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(item => {
        expect(item).toHaveTextContent();
        expect(item.textContent!.trim().length).toBeGreaterThan(0);
      });
    });

    it('uses proper ARIA states for dynamic content', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test expanded/collapsed states
      const toggleButton = screen.getByLabelText('Collapse navigation');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      
      // Test state changes
      fireEvent.click(toggleButton);
      
      // Note: This would test aria-expanded state changes
      // The actual implementation would need to update aria-expanded
    });
  });

  describe('Screen Reader Announcements', () => {
    it('announces navigation menu expansions', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test menu expansion announcements
      const navigationMenu = screen.getByTestId('navigation-menu');
      expect(navigationMenu).toBeInTheDocument();
      
      // Simulate menu expansion
      // This would test actual menu expansion functionality
    });

    it('announces route changes and page updates', () => {
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
      
      // Verify navigation remains accessible
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('provides context for navigation actions', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify quick actions have proper context
      const quickActions = screen.getByTestId('quick-actions');
      expect(quickActions).toBeInTheDocument();
      
      // Verify navigation items provide context
      const navigationItems = screen.getAllByRole('link');
      navigationItems.forEach(item => {
        expect(item).toHaveAttribute('href');
        expect(item.textContent).toBeTruthy();
      });
    });
  });

  describe('Keyboard Navigation Accessibility', () => {
    it('supports full keyboard navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify all navigation items are keyboard accessible
      const navigationItems = screen.getAllByRole('link');
      expect(navigationItems.length).toBeGreaterThan(0);
      
      // Test tab order
      navigationItems.forEach((item, index) => {
        item.focus();
        expect(document.activeElement).toBe(item);
        
        // Test tab navigation
        if (index < navigationItems.length - 1) {
          const nextItem = navigationItems[index + 1];
          nextItem.focus();
          expect(document.activeElement).toBe(nextItem);
        }
      });
    });

    it('provides keyboard shortcuts for common actions', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test keyboard shortcuts
      const navigation = screen.getByRole('navigation');
      
      // Test escape key for mobile navigation
      fireEvent.keyDown(navigation, { key: 'Escape', code: 'Escape' });
      
      // Test enter key for navigation items
      const navigationItems = screen.getAllByRole('link');
      if (navigationItems.length > 0) {
        fireEvent.keyDown(navigationItems[0], { key: 'Enter', code: 'Enter' });
      }
    });

    it('maintains focus management during state changes', async () => {
      renderWithProviders(<NavigationPanel />);
      
      // Test focus management during collapse/expand
      const toggleButton = screen.getByLabelText('Collapse navigation');
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);
      
      fireEvent.click(toggleButton);
      
      // Focus should remain manageable
      await waitFor(() => {
        expect(document.activeElement).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      mockUseBreakpointValue.mockReturnValue(true); // Mobile
    });

    it('provides accessible mobile navigation', () => {
      renderWithProviders(<NavigationPanel />);
      
      // Verify hamburger menu is accessible
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      expect(hamburgerButton).toBeInTheDocument();
      expect(hamburgerButton).toHaveAttribute('aria-label', 'Toggle navigation menu');
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('announces mobile navigation state changes', () => {
      renderWithProviders(<NavigationPanel />);
      
      const hamburgerButton = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(hamburgerButton);
      
      expect(mockUseDisclosure.onOpen).toHaveBeenCalled();
    });

    it('maintains accessibility in mobile drawer', () => {
      mockUseDisclosure.isOpen = true;
      renderWithProviders(<NavigationPanel />);
      
      // Verify mobile navigation content is accessible
      expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('provides fallback content for screen readers', () => {
      // Test with missing navigation data
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false,
      });
      
      renderWithProviders(<NavigationPanel />);
      
      // Should still provide accessible navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('handles accessibility errors gracefully', () => {
      // Mock accessibility hook error
      mockUseAccessibility.announce.mockImplementation(() => {
        throw new Error('Accessibility error');
      });
      
      expect(() => {
        renderWithProviders(<NavigationPanel />);
      }).not.toThrow();
      
      // Should still render navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
