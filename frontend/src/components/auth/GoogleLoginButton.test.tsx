import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoogleLoginButton from './GoogleLoginButton';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    // Reset mock location
    mockLocation.href = '';
    // Set environment variable
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api';
  });

  it('renders Google login button', () => {
    render(<GoogleLoginButton />);
    
    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
  });

  it('shows Google icon', () => {
    render(<GoogleLoginButton />);
    
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('redirects to Google OAuth endpoint when clicked', async () => {
    render(<GoogleLoginButton />);
    
    const button = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLocation.href).toBe('http://localhost:3001/api/auth/google');
    });
  });

  it('shows loading state when clicked', async () => {
    render(<GoogleLoginButton />);
    
    const button = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });

  it('disables button during loading', async () => {
    render(<GoogleLoginButton />);
    
    const button = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('handles error gracefully', async () => {
    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.location.href to throw error
    Object.defineProperty(window, 'location', {
      value: {
        get href() {
          throw new Error('Network error');
        },
        set href(value) {
          throw new Error('Network error');
        },
      },
      writable: true,
    });

    render(<GoogleLoginButton />);
    
    const button = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Google login error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
}); 