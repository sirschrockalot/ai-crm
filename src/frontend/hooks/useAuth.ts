import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// Development mode authentication bypass
const isDevelopmentMode = process.env.NODE_ENV === 'development';
const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' || isDevelopmentMode;

export function useAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>(() => {
    // If bypassing auth in development, start with authenticated state
    if (bypassAuth) {
      return {
        user: {
          id: 'dev-user-1',
          email: 'dev@dealcycle.com',
          firstName: 'Development',
          lastName: 'User',
          role: 'admin',
          tenantId: 'dev-tenant-1',
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
    
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    };
  });

  // Check for existing token on mount (only if not bypassing auth)
  useEffect(() => {
    if (bypassAuth) {
      console.log('🔓 Authentication bypassed for development mode');
      return;
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token with backend
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('auth_token');
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to check authentication status',
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    if (bypassAuth) {
      console.log('🔓 Login bypassed for development mode');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem('auth_token', token);
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        const error = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Login failed',
        }));
        throw new Error(error.message || 'Login failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (bypassAuth) {
      console.log('🔓 Logout bypassed for development mode');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    if (bypassAuth) {
      console.log('🔓 Token refresh bypassed for development mode');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token to refresh');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { user, token: newToken } = await response.json();
        localStorage.setItem('auth_token', newToken);
        
        setState(prev => ({
          ...prev,
          user,
          error: null,
        }));
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      }));
      throw error;
    }
  }, []);

  const updateUser = useCallback((userUpdate: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userUpdate } : null,
    }));
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
  };
} 