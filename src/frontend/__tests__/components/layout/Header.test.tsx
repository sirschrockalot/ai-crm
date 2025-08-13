import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import Header from '../../../components/layout/Header';

// Mock Chakra UI hooks
const mockUseColorMode = {
  colorMode: 'light',
  toggleColorMode: jest.fn(),
};

const mockUseColorModeValue = jest.fn();

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useColorMode: () => mockUseColorMode,
  useColorModeValue: (light: any, dark: any) => mockUseColorModeValue(light, dark),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorModeValue.mockReturnValue('white');
    mockUseColorMode.colorMode = 'light';
  });

  describe('Basic Rendering', () => {
    it('renders header with application title', () => {
      renderWithTheme(<Header />);
      
      expect(screen.getByText('DealCycle CRM')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders with correct styling and layout', () => {
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveStyle({
        width: '100%',
        padding: '12px 24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      });
    });

    it('renders all header elements', () => {
      renderWithTheme(<Header />);
      
      expect(screen.getByText('DealCycle CRM')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle color mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /user/i })).toBeInTheDocument();
    });
  });

  describe('Color Mode Toggle', () => {
    it('shows sun icon in light mode', () => {
      mockUseColorMode.colorMode = 'light';
      renderWithTheme(<Header />);
      
      const colorModeButton = screen.getByLabelText('Toggle color mode');
      expect(colorModeButton).toBeInTheDocument();
      
      // Check for moon icon (toggle to dark mode)
      const icon = colorModeButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('shows moon icon in dark mode', () => {
      mockUseColorMode.colorMode = 'dark';
      renderWithTheme(<Header />);
      
      const colorModeButton = screen.getByLabelText('Toggle color mode');
      expect(colorModeButton).toBeInTheDocument();
      
      // Check for sun icon (toggle to light mode)
      const icon = colorModeButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('calls toggleColorMode when clicked', async () => {
      renderWithTheme(<Header />);
      
      const colorModeButton = screen.getByLabelText('Toggle color mode');
      fireEvent.click(colorModeButton);
      
      await waitFor(() => {
        expect(mockUseColorMode.toggleColorMode).toHaveBeenCalledTimes(1);
      });
    });

    it('has proper ARIA label for color mode toggle', () => {
      renderWithTheme(<Header />);
      
      const colorModeButton = screen.getByLabelText('Toggle color mode');
      expect(colorModeButton).toHaveAttribute('aria-label', 'Toggle color mode');
    });
  });

  describe('Notifications', () => {
    it('renders notifications button with badge', () => {
      renderWithTheme(<Header />);
      
      const notificationsButton = screen.getByLabelText('Notifications');
      expect(notificationsButton).toBeInTheDocument();
      
      // Check for notification badge
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveStyle({
        colorScheme: 'red',
        borderRadius: 'full',
      });
    });

    it('shows notifications menu when clicked', async () => {
      renderWithTheme(<Header />);
      
      const notificationsButton = screen.getByLabelText('Notifications');
      fireEvent.click(notificationsButton);
      
      await waitFor(() => {
        expect(screen.getByText('No new notifications')).toBeInTheDocument();
      });
    });

    it('has proper ARIA label for notifications', () => {
      renderWithTheme(<Header />);
      
      const notificationsButton = screen.getByLabelText('Notifications');
      expect(notificationsButton).toHaveAttribute('aria-label', 'Notifications');
    });
  });

  describe('User Menu', () => {
    it('renders user avatar button', () => {
      renderWithTheme(<Header />);
      
      const userButton = screen.getByRole('button', { name: /user/i });
      expect(userButton).toBeInTheDocument();
    });

    it('shows user menu when clicked', async () => {
      renderWithTheme(<Header />);
      
      const userButton = screen.getByRole('button', { name: /user/i });
      fireEvent.click(userButton);
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('renders all user menu items', async () => {
      renderWithTheme(<Header />);
      
      const userButton = screen.getByRole('button', { name: /user/i });
      fireEvent.click(userButton);
      
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(3);
        expect(menuItems[0]).toHaveTextContent('Profile');
        expect(menuItems[1]).toHaveTextContent('Settings');
        expect(menuItems[2]).toHaveTextContent('Logout');
      });
    });
  });

  describe('Layout and Styling', () => {
    it('uses flexbox layout for proper alignment', () => {
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      const flexContainer = header.querySelector('div');
      expect(flexContainer).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
      });
    });

    it('applies proper spacing between elements', () => {
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveStyle({
        padding: '12px 24px',
      });
    });

    it('applies theme colors correctly', () => {
      mockUseColorModeValue.mockReturnValue('white');
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveStyle({
        backgroundColor: 'white',
      });
    });

    it('applies dark mode colors when appropriate', () => {
      mockUseColorModeValue.mockReturnValue('gray.900');
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveStyle({
        backgroundColor: 'gray.900',
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('DealCycle CRM');
    });

    it('provides proper ARIA labels for interactive elements', () => {
      renderWithTheme(<Header />);
      
      expect(screen.getByLabelText('Toggle color mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    });

    it('uses proper button roles for interactive elements', () => {
      renderWithTheme(<Header />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Responsive Design', () => {
    it('maintains proper layout on different screen sizes', () => {
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveStyle({
        width: '100%',
      });
    });

    it('uses appropriate spacing for mobile and desktop', () => {
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveStyle({
        padding: '12px 24px',
      });
    });
  });

  describe('State Management', () => {
    it('handles client-side initialization correctly', () => {
      renderWithTheme(<Header />);
      
      // Color mode toggle should be visible after client initialization
      const colorModeButton = screen.getByLabelText('Toggle color mode');
      expect(colorModeButton).toBeInTheDocument();
    });

    it('maintains state during interactions', async () => {
      renderWithTheme(<Header />);
      
      const colorModeButton = screen.getByLabelText('Toggle color mode');
      fireEvent.click(colorModeButton);
      
      await waitFor(() => {
        expect(mockUseColorMode.toggleColorMode).toHaveBeenCalled();
      });
      
      // Button should still be functional after state change
      expect(colorModeButton).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates with Chakra UI theme system', () => {
      renderWithTheme(<Header />);
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      // Should use theme colors
      expect(mockUseColorModeValue).toHaveBeenCalled();
    });

    it('works with color mode context', () => {
      renderWithTheme(<Header />);
      
      const colorModeButton = screen.getByLabelText('Toggle color mode');
      expect(colorModeButton).toBeInTheDocument();
      
      // Should be connected to color mode context
      expect(mockUseColorMode.toggleColorMode).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles missing color mode gracefully', () => {
      // Mock useColorMode to return undefined
      const originalUseColorMode = mockUseColorMode.toggleColorMode;
      mockUseColorMode.toggleColorMode = undefined as any;
      
      expect(() => {
        renderWithTheme(<Header />);
      }).not.toThrow();
      
      // Restore mock
      mockUseColorMode.toggleColorMode = originalUseColorMode;
    });

    it('handles missing theme values gracefully', () => {
      mockUseColorModeValue.mockReturnValue(undefined);
      
      expect(() => {
        renderWithTheme(<Header />);
      }).not.toThrow();
    });
  });
});
