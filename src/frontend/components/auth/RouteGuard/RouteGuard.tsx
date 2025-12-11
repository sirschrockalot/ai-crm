import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { isAuthBypassEnabled } from '../../../services/configService';
import Loading from '../../ui/Loading';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

const AuthGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/auth/login',
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const bypassAuth = isAuthBypassEnabled();

  useEffect(() => {
    // Skip auth check if bypass is enabled
    if (bypassAuth) {
      return;
    }

    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // If roles are required, check if user has required role
      if (requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.includes(user.role);
        if (!hasRequiredRole) {
          // Redirect to unauthorized page or dashboard
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, redirectTo, bypassAuth]);

  // Skip auth check if bypass is enabled
  if (bypassAuth) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return <Loading />;
  }

  // If roles are required and user doesn't have required role, don't render children
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <Loading />;
  }

  // User is authenticated and has required role (if any), render children
  return <>{children}</>;
};

export default AuthGuard;
