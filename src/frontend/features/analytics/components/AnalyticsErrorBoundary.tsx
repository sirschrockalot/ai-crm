import React, { Component, ReactNode } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { FiRefreshCw, FiAlertTriangle, FiHome } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { formatErrorForUser } from '../../../utils/error';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
  showHome?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('AnalyticsErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    const router = require('next/router').useRouter();
    router.push('/analytics');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default analytics error UI
      return (
        <Box
          p={8}
          textAlign="center"
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          maxW="lg"
          mx="auto"
          mt={8}
        >
          <VStack spacing={6}>
            <Box
              p={4}
              bg="red.100"
              borderRadius="full"
              color="red.600"
            >
              <FiAlertTriangle size={32} />
            </Box>
            
            <VStack spacing={3}>
              <Heading size="md" color="red.600">
                Analytics Error
              </Heading>
              <Text color="gray.600" fontSize="sm" textAlign="center">
                We encountered an error while loading your analytics data. 
                This might be due to a network issue or temporary service problem.
              </Text>
            </VStack>

            {this.state.error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription>
                    {formatErrorForUser(this.state.error)}
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                p={4}
                bg="gray.100"
                borderRadius="md"
                fontSize="xs"
                fontFamily="mono"
                textAlign="left"
                maxH="200px"
                overflow="auto"
                w="full"
              >
                <Text fontWeight="bold" mb={2}>
                  Error Details (Development):
                </Text>
                <Text>{this.state.error.message}</Text>
                {this.state.errorInfo && (
                  <Text mt={2} fontSize="xs">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </Box>
            )}

            <VStack spacing={3} w="full">
              {this.props.showRetry !== false && (
                <Button
                  leftIcon={<FiRefreshCw />}
                  colorScheme="blue"
                  onClick={this.handleRetry}
                  size="md"
                  w="full"
                >
                  Try Again
                </Button>
              )}
              
              {this.props.showHome !== false && (
                <Button
                  leftIcon={<FiHome />}
                  variant="outline"
                  onClick={this.handleGoHome}
                  size="md"
                  w="full"
                >
                  Go to Analytics Home
                </Button>
              )}
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to use analytics error boundary
export const useAnalyticsErrorBoundary = () => {
  const toast = useToast();
  const router = useRouter();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    toast({
      title: 'Analytics Error',
      description: formatErrorForUser(error),
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    // Log error for debugging
    console.error('Error caught by useAnalyticsErrorBoundary:', error, errorInfo);
  };

  const goToAnalyticsHome = () => {
    router.push('/analytics');
  };

  return { handleError, goToAnalyticsHome };
};

// Higher-order component to wrap analytics components with error boundary
export const withAnalyticsErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <AnalyticsErrorBoundary fallback={fallback}>
      <Component {...props} />
    </AnalyticsErrorBoundary>
  );

  WrappedComponent.displayName = `withAnalyticsErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
