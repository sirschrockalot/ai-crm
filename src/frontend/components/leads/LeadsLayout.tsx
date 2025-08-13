import React from 'react';
import { Box, HStack, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { NavigationPanel, Header, BreadcrumbNav } from '../layout';
import { useNavigation } from '../../hooks/useNavigation';

interface LeadsLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  loadingMessage?: string;
  showNavigation?: boolean;
}

const LeadsLayout: React.FC<LeadsLayoutProps> = ({
  children,
  loading = false,
  error = null,
  isAuthenticated = true,
  loadingMessage = 'Loading leads...',
  showNavigation = true,
}) => {
  const navigation = useNavigation();
  
  // Safely destructure with defaults to prevent runtime errors
  const isCollapsed = navigation?.state?.isCollapsed ?? false;
  const setCollapsed = navigation?.setCollapsed ?? (() => {});

  // Handle navigation collapse toggle
  const handleNavigationToggle = (collapsed: boolean) => {
    setCollapsed(collapsed);
  };

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
            <BreadcrumbNav />
            <Alert status="warning">
              <AlertIcon />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to access lead management features.
              </AlertDescription>
            </Alert>
          </Box>
        </HStack>
      </Box>
    );
  }

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
            <BreadcrumbNav />
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
          <BreadcrumbNav />
          
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

export default LeadsLayout;
