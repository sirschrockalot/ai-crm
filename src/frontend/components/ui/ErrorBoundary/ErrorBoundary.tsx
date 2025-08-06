import React, { Component, ReactNode } from 'react';
import { Box, VStack, Heading, Text, Button, useToast } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
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
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    // In a real application, this would send the error to an error reporting service
    console.error('Error reported:', this.state.error, this.state.errorInfo);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          p={8}
          textAlign="center"
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          maxW="md"
          mx="auto"
          mt={8}
        >
          <VStack spacing={4}>
            <Heading size="md" color="red.600">
              Something went wrong
            </Heading>
            <Text color="gray.600" fontSize="sm">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </Text>
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
            <VStack spacing={2} w="full">
              <Button
                colorScheme="blue"
                onClick={this.handleRetry}
                size="sm"
                w="full"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReportError}
                size="sm"
                w="full"
              >
                Report Error
              </Button>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to use error boundary
export const useErrorBoundary = () => {
  const toast = useToast();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    toast({
      title: 'An error occurred',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    // Log error for debugging
    console.error('Error caught by useErrorBoundary:', error, errorInfo);
  };

  return { handleError };
};

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}; 