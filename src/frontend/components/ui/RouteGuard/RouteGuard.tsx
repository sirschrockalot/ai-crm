import React, { useEffect, useState } from 'react';
import { Box, VStack, Spinner, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  fallback,
  redirectTo = '/auth/login',
}) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Mock authentication check - in real app, this would call your auth service
        const token = localStorage.getItem('authToken');
        
        if (!requireAuth) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        if (!token) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Mock role check - in real app, this would verify user roles
        const userRoles = ['admin', 'user']; // Mock user roles
        
        if (requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
          setIsAuthorized(hasRequiredRole);
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, requiredRoles]);

  useEffect(() => {
    if (isAuthorized === false && !isLoading) {
      router.push(redirectTo);
    }
  }, [isAuthorized, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Checking authorization...</Text>
        </VStack>
      </Box>
    );
  }

  if (isAuthorized === false) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Access Denied
          </Text>
          <Text color="gray.600">
            You don&apos;t have permission to access this page.
          </Text>
          <Button onClick={() => router.push('/')}>
            Go to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
};
