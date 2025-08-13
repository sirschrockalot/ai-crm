import React from 'react';
import { Box, HStack, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { NavigationPanel, Header, BreadcrumbNav } from '../layout';
import { useNavigation } from '../../hooks/useNavigation';

interface BuyersLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  loadingMessage?: string;
  showNavigation?: boolean;
}

const BuyersLayout: React.FC<BuyersLayoutProps> = ({
  children,
  loading = false,
  error = null,
  isAuthenticated = true,
  loadingMessage = 'Loading buyers...',
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

  // Show loading state
  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          {showNavigation && (
            <NavigationPanel
              isCollapsed={isCollapsed}
              onToggle={handleNavigationToggle}
            />
          )}
          <Box flex={1} p={{ base: 4, md: 6 }}>
            <VStack align="center" justify="center" minH="400px" spacing={4}>
              <Alert status="info" maxW="md">
                <AlertIcon />
                <AlertTitle>Loading</AlertTitle>
                <AlertDescription>{loadingMessage}</AlertDescription>
              </Alert>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          {showNavigation && (
            <NavigationPanel
              isCollapsed={isCollapsed}
              onToggle={handleNavigationToggle}
            />
          )}
          <Box flex={1} p={{ base: 4, md: 6 }}>
            <VStack align="stretch" spacing={6}>
              <Alert status="warning">
                <AlertIcon />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Please log in to access buyer management features.
                </AlertDescription>
              </Alert>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          {showNavigation && (
            <NavigationPanel
              isCollapsed={isCollapsed}
              onToggle={handleNavigationToggle}
            />
          )}
          <Box flex={1} p={{ base: 4, md: 6 }}>
            <VStack align="stretch" spacing={6}>
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  // Main layout
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Box display={{ base: 'block', md: 'flex' }}>
        {showNavigation && (
          <NavigationPanel
            isCollapsed={isCollapsed}
            onToggle={handleNavigationToggle}
          />
        )}
        <Box flex={1} p={{ base: 4, md: 6 }}>
          <BreadcrumbNav />
          <VStack align="stretch" spacing={6}>
            {children}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default BuyersLayout;
