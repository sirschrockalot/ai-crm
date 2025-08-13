import React, { useState, useEffect, useCallback } from 'react';
import { Box, HStack, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { NavigationPanel, Header, BreadcrumbNav } from '../index';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation } from '../../../contexts/NavigationContext';

interface MainLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  loadingMessage?: string;
  showNavigation?: boolean;
  showBreadcrumbs?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  loading = false,
  error = null,
  isAuthenticated = true,
  loadingMessage = 'Loading...',
  showNavigation = true,
  showBreadcrumbs = false,
}) => {
  const navigation = useNavigation();
  
  // Safely destructure with defaults to prevent runtime errors
  const isCollapsed = navigation?.state?.isCollapsed ?? false;
  const setCollapsed = navigation?.setCollapsed ?? (() => {});
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle navigation collapse toggle
  const handleNavigationToggle = useCallback((collapsed: boolean) => {
    setCollapsed(collapsed);
  }, [setCollapsed]);

  // Show loading state
  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          {showNavigation && (
            <NavigationPanel
              isCollapsed={isCollapsed}
              onToggleCollapse={handleNavigationToggle}
            />
          )}
          <Box flex={1} p={6}>
            {showBreadcrumbs && <BreadcrumbNav />}
            <VStack align="stretch" spacing={6}>
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>Loading</AlertTitle>
                <AlertDescription>{loadingMessage}</AlertDescription>
              </Alert>
            </VStack>
          </Box>
        </HStack>
      </Box>
    );
  }

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          {showNavigation && (
            <NavigationPanel
              isCollapsed={isCollapsed}
              onToggleCollapse={handleNavigationToggle}
            />
          )}
          <Box flex={1} p={6}>
            {showBreadcrumbs && <BreadcrumbNav />}
            <Alert status="warning">
              <AlertIcon />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to access dashboard features.
              </AlertDescription>
            </Alert>
          </Box>
        </HStack>
      </Box>
    );
  }

  // Main layout with navigation
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        {showNavigation && (
          <NavigationPanel
            isCollapsed={isCollapsed}
            onToggleCollapse={handleNavigationToggle}
          />
        )}
        <Box flex={1}>
          {showBreadcrumbs && <BreadcrumbNav />}
          
          {/* Error Display */}
          {error && (
            <Alert status="error" m={6}>
              <AlertIcon />
              <AlertTitle>Error Loading Content</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Page Content */}
          <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
            {children}
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default MainLayout;
