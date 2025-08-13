import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  roles: string[];
  tenantId?: string;
  status: string;
  settings?: any;
  lastActive?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionTimeout: number | null;
  isSessionExpiringSoon: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  checkSessionTimeout: () => Promise<void>;
  extendSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getUserPermissions: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    sessionTimeout: null,
    isSessionExpiringSoon: false,
  });

  // Development mode authentication bypass
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' || isDevelopmentMode;

  // Initialize auth state
  useEffect(() => {
    if (bypassAuth) {
      setState({
        user: {
          id: 'dev-user-1',
          email: 'dev@dealcycle.com',
          firstName: 'Development',
          lastName: 'User',
          roles: ['admin'],
          status: 'active',
          tenantId: 'dev-tenant-1',
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionTimeout: null,
        isSessionExpiringSoon: false,
      });
      return;
    }

    initializeAuth();
  }, []);

  // Check for existing token on mount
  const initializeAuth = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (token && refreshToken) {
        // Verify token with backend
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setState({
            user: userData.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionTimeout: null,
            isSessionExpiringSoon: false,
          });
          
          // Start session monitoring
          startSessionMonitoring();
        } else {
          // Token is invalid, try to refresh
          await refreshToken();
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Start session monitoring
  const startSessionMonitoring = useCallback(() => {
    const checkInterval = setInterval(async () => {
      if (state.user) {
        await checkSessionTimeout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [state.user]);

  // Check session timeout
  const checkSessionTimeout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session/timeout', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          sessionTimeout: data.timeRemaining,
          isSessionExpiringSoon: data.isExpiringSoon,
        }));
      }
    } catch (error) {
      console.error('Failed to check session timeout:', error);
    }
  }, []);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session/extend', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          isSessionExpiringSoon: false,
        }));
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  }, []);

  // Login with credentials
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionTimeout: null,
        isSessionExpiringSoon: false,
      });

      // Start session monitoring
      startSessionMonitoring();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, [router]);

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Redirect to Google OAuth
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      window.location.href = googleAuthUrl;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Call logout endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      // Reset state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionTimeout: null,
        isSessionExpiringSoon: false,
      });

      // Redirect to login
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionTimeout: null,
        isSessionExpiringSoon: false,
      });
      router.push('/auth/login');
    }
  }, [router]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update tokens
      localStorage.setItem('auth_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      // Update user data if provided
      if (data.user) {
        setState(prev => ({
          ...prev,
          user: data.user,
        }));
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout
      await logout();
    }
  }, [logout]);

  // Update user profile
  const updateProfile = useCallback(async (profile: Partial<User>) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        user: { ...prev.user!, ...data.data },
      }));

      return data;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }, []);

  // Update user in state
  const updateUser = useCallback((user: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...user } : null,
    }));
  }, []);

  // Permission checking methods
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user || !state.user.roles) return false;
    
    // This would integrate with the backend permission system
    // For now, implement basic role-based checks
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      manager: ['user:read', 'user:update', 'lead:manage', 'buyer:manage'],
      agent: ['lead:read', 'lead:update', 'buyer:read', 'buyer:update'],
      user: ['lead:read', 'buyer:read'],
      viewer: ['lead:read', 'buyer:read'],
    };

    return state.user.roles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes('*') || permissions.includes(permission);
    });
  }, [state.user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const getUserPermissions = useCallback((): string[] => {
    if (!state.user || !state.user.roles) return [];
    
    // This would integrate with the backend permission system
    const allPermissions: string[] = [];
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      manager: ['user:read', 'user:update', 'lead:manage', 'buyer:manage'],
      agent: ['lead:read', 'lead:update', 'buyer:read', 'buyer:update'],
      user: ['lead:read', 'buyer:read'],
      viewer: ['lead:read', 'buyer:read'],
    };

    state.user.roles.forEach(role => {
      const permissions = rolePermissions[role] || [];
      if (permissions.includes('*')) {
        allPermissions.push('*');
      } else {
        permissions.forEach(permission => {
          if (!allPermissions.includes(permission)) {
            allPermissions.push(permission);
          }
        });
      }
    });

    return allPermissions;
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithGoogle,
    logout,
    refreshToken,
    updateUser,
    updateProfile,
    checkSessionTimeout,
    extendSession,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
