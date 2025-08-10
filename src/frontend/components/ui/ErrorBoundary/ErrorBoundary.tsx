import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, VStack, Heading, Text, Button, useToast } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box p={8} textAlign="center">
          <VStack spacing={4}>
            <Heading size="lg" color="red.500">
              Something went wrong
            </Heading>
            <Text color="gray.600">
              We encountered an unexpected error. Please try refreshing the page.
            </Text>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box p={4} bg="gray.100" borderRadius="md" textAlign="left" maxW="600px">
                <Text fontWeight="bold" mb={2}>Error Details:</Text>
                <Text fontSize="sm" fontFamily="mono" color="red.600">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text fontSize="sm" fontFamily="mono" color="gray.600" mt={2}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </Box>
            )}
            <Button colorScheme="blue" onClick={this.handleReset}>
              Try Again
            </Button>
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
  
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Error caught by useErrorBoundary:', error, errorInfo);
    toast({
      title: 'An error occurred',
      description: error.message || 'Something went wrong',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return { handleError };
};

// HOC to wrap components with error boundary
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