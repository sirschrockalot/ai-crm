import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

// Mock the userStore
jest.mock('../../stores/userStore', () => ({
  useUserStore: jest.fn(),
}));

describe('ThemeToggle', () => {
  const mockUpdatePreferences = jest.fn();
  const mockUser = {
    preferences: {
      theme: 'light',
    },
  };

  beforeEach(() => {
    mockUpdatePreferences.mockClear();
    (require('../../stores/userStore').useUserStore as jest.Mock).mockReturnValue({
      user: mockUser,
      updatePreferences: mockUpdatePreferences,
    });
  });

  it('renders theme toggle buttons', () => {
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto/i })).toBeInTheDocument();
  });

  it('displays current theme as selected', () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /light/i });
    expect(lightButton).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('handles theme change to dark', async () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(darkButton);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        theme: 'dark',
      });
    });
  });

  it('handles theme change to auto', async () => {
    render(<ThemeToggle />);

    const autoButton = screen.getByRole('button', { name: /auto/i });
    fireEvent.click(autoButton);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        theme: 'auto',
      });
    });
  });

  it('applies theme to document element', async () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(darkButton);

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
  });

  it('removes dark class when switching to light theme', async () => {
    // Set initial dark theme
    document.documentElement.classList.add('dark');
    
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /light/i });
    fireEvent.click(lightButton);

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });

  it('shows loading state while updating', async () => {
    // Mock updatePreferences to return a promise that doesn't resolve immediately
    let resolvePromise: (value: any) => void;
    const updatePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockUpdatePreferences.mockReturnValue(updatePromise);

    render(<ThemeToggle />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(darkButton);

    // Should show loading state
    expect(screen.getByText(/updating/i)).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({});

    await waitFor(() => {
      expect(screen.queryByText(/updating/i)).not.toBeInTheDocument();
    });
  });

  it('handles user without preferences', () => {
    (require('../../stores/userStore').useUserStore as jest.Mock).mockReturnValue({
      user: { preferences: undefined },
      updatePreferences: mockUpdatePreferences,
    });

    render(<ThemeToggle />);

    // Should default to auto theme
    const autoButton = screen.getByRole('button', { name: /auto/i });
    expect(autoButton).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('displays theme descriptions', () => {
    render(<ThemeToggle />);

    expect(screen.getByText(/bright theme for daytime use/i)).toBeInTheDocument();
    expect(screen.getByText(/dark theme for low-light environments/i)).toBeInTheDocument();
    expect(screen.getByText(/automatically switches based on your system preference/i)).toBeInTheDocument();
  });
}); 