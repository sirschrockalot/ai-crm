import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { getAuthServiceConfig } from '../services/configService';

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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

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

      // Check if we're in bypass mode first
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      console.log('InitializeAuth: Bypass auth check:', {
        bypassAuth,
        envVar: process.env.NEXT_PUBLIC_BYPASS_AUTH,
        nodeEnv: process.env.NODE_ENV
      });
      
      if (bypassAuth) {
        console.log('InitializeAuth: Using bypass mode, setting authenticated state');
        // In bypass mode, always set authenticated state without checking tokens
        setState({
          user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', roles: ['user'], status: 'active' },
          isAuthenticated: true,
          isLoading: false,
          error: null,
          sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
          isSessionExpiringSoon: false,
        });
        return;
      }
      
      console.log('InitializeAuth: Not in bypass mode, checking tokens');

      const token = localStorage.getItem('auth_token');
      const refreshTokenValue = localStorage.getItem('refresh_token');
      
      if (token && refreshTokenValue) {
        // Verify token with auth service
        const controller = new AbortController();
        const authServiceConfig = getAuthServiceConfig();
        const response = await fetch(`${authServiceConfig.url}/api/auth/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (response.ok) {
          const userData = await response.json();
          setState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
            isSessionExpiringSoon: false,
          });
          
          // Start session monitoring
          startSessionMonitoring();
        } else {
          // Token is invalid, clear state
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
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Auth initialization failed:', error);
      
      // In bypass mode, don't clear state on network errors
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      if (bypassAuth) {
        setState(prev => ({ ...prev, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  // Start session monitoring
  const startSessionMonitoring = useCallback(() => {
    // Don't start session monitoring in bypass mode
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth) {
      return () => {}; // Return empty cleanup function
    }

    const checkInterval = setInterval(async () => {
      if (state.user) {
        await checkSessionTimeout();
      }
    }, 30 * 60 * 1000); // Check every 30 minutes to reduce aggressive logout

    return () => clearInterval(checkInterval);
  }, [state.user]);

  // Check session timeout
  const checkSessionTimeout = useCallback(async () => {
    try {
      // Don't check session timeout in bypass mode
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      if (bypassAuth) {
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        // No token, user is not authenticated
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
        }));
        return;
      }

      // Use the auth service's session timeout endpoint
      const controller = new AbortController();
      const authServiceConfig = getAuthServiceConfig();
      const response = await fetch(`${authServiceConfig.url}/api/auth/session/timeout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          // Session is valid, update state
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
            isSessionExpiringSoon: false,
          }));
        } else {
          // Session is invalid or timed out
          console.log('Session invalid or timed out:', data.message);
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
      } else if (response.status === 401) {
        // Session expired, clear state and redirect
        console.log('Session expired, clearing authentication state');
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
      } else {
        // Other errors (like 500, 404), just log but don't logout
        console.warn('Session timeout check failed with status:', response.status, 'but not logging out');
        // Don't clear state on network errors, just log the warning
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to check session timeout:', error);
      // Don't logout on network errors, just log the error
      // Only logout if we get a 401 from the auth service
    }
  }, [router]);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      const controller = new AbortController();
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No token available');
      }

      // Use the auth service's session timeout endpoint to extend session
      const authServiceConfig = getAuthServiceConfig();
      const response = await fetch(`${authServiceConfig.url}/api/auth/session/timeout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setState(prev => ({
            ...prev,
            sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
            isSessionExpiringSoon: false,
          }));
          return data;
        } else {
          throw new Error(data.message || 'Session is invalid');
        }
      } else {
        throw new Error(`Session extend failed: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to extend session:', error);
      throw error;
    }
  }, []);

  // Login with credentials
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if we're in bypass mode
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      console.log('Login: Bypass auth check:', {
        bypassAuth,
        envVar: process.env.NEXT_PUBLIC_BYPASS_AUTH,
        nodeEnv: process.env.NODE_ENV
      });
      
      if (bypassAuth) {
        console.log('Login: Using bypass mode, skipping API call');
        // In bypass mode, just set authenticated state without API call
        setState({
          user: { id: '1', email: credentials.email, firstName: 'Test', lastName: 'User', roles: ['user'], status: 'active' },
          isAuthenticated: true,
          isLoading: false,
          error: null,
          sessionTimeout: 24 * 60 * 60, // 24 hours in seconds
          isSessionExpiringSoon: false,
        });
        return;
      }
      
      console.log('Login: Not in bypass mode, making API call');

      const controller = new AbortController();
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
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
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  }, [startSessionMonitoring]);

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
      const refreshTokenValue = localStorage.getItem('refresh_token');
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const authServiceConfig = getAuthServiceConfig();
      const response = await fetch(`${authServiceConfig.url}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
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
