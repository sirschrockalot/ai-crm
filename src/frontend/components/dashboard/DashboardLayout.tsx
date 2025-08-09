import React from 'react';
import { Box, HStack, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../layout';
import { DashboardErrorBoundary, DashboardLoading } from './index';

interface DashboardLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
  loadingMessage?: string;
  showNavigation?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  loading = false,
  error = null,
  isAuthenticated = true,
  loadingMessage = 'Loading...',
  showNavigation = true,
}) => {
  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            {showNavigation && <Navigation />}
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

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            {showNavigation && <Navigation />}
            <DashboardLoading variant="skeleton" text={loadingMessage} />
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <DashboardErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1}>
            {showNavigation && <Navigation />}
            
            {/* Error Display */}
            {error && (
              <Alert status="error" m={6}>
                <AlertIcon />
                <AlertTitle>Error Loading Dashboard</AlertTitle>
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
    </DashboardErrorBoundary>
  );
};

export default DashboardLayout;
