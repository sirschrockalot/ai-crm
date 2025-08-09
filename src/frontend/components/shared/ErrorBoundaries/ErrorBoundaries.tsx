import React, { Component, ReactNode } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiSettings, FiX } from 'react-icons/fi';
import { formatErrorForUser } from '../../../utils/error';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
  variant?: 'alert' | 'card' | 'minimal';
  context?: 'dashboard' | 'analytics' | 'automation' | 'leads' | 'generic';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    
    // Log error for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  handleGoSettings = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/settings';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          variant={this.props.variant}
          context={this.props.context}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onGoSettings={this.handleGoSettings}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  variant?: 'alert' | 'card' | 'minimal';
  context?: 'dashboard' | 'analytics' | 'automation' | 'leads' | 'generic';
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoSettings?: () => void;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorInfo,
  variant = 'card',
  context = 'generic',
  onRetry,
  onGoHome,
  onGoSettings,
  showDetails = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getContextMessage = () => {
    switch (context) {
      case 'dashboard':
        return 'There was an error loading the dashboard.';
      case 'analytics':
        return 'There was an error loading the analytics data.';
      case 'automation':
        return 'There was an error in the automation system.';
      case 'leads':
        return 'There was an error loading the leads data.';
      default:
        return 'Something went wrong.';
    }
  };

  const getContextActions = () => {
    switch (context) {
      case 'dashboard':
        return [
          { label: 'Refresh Dashboard', onClick: onRetry, colorScheme: 'blue' },
          { label: 'Go to Settings', onClick: onGoSettings, colorScheme: 'gray' },
        ];
      case 'analytics':
        return [
          { label: 'Retry Analytics', onClick: onRetry, colorScheme: 'blue' },
          { label: 'Go to Dashboard', onClick: onGoHome, colorScheme: 'gray' },
        ];
      case 'automation':
        return [
          { label: 'Retry Automation', onClick: onRetry, colorScheme: 'blue' },
          { label: 'Go to Settings', onClick: onGoSettings, colorScheme: 'gray' },
        ];
      case 'leads':
        return [
          { label: 'Retry Leads', onClick: onRetry, colorScheme: 'blue' },
          { label: 'Go to Dashboard', onClick: onGoHome, colorScheme: 'gray' },
        ];
      default:
        return [
          { label: 'Try Again', onClick: onRetry, colorScheme: 'blue' },
          { label: 'Go Home', onClick: onGoHome, colorScheme: 'gray' },
        ];
    }
  };

  if (variant === 'alert') {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" py={8}>
        <AlertIcon boxSize="40px" />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {getContextMessage()}
          {error && (
            <Text fontSize="sm" color="gray.500" mt={2}>
              {formatErrorForUser(error)}
            </Text>
          )}
        </AlertDescription>
        {onRetry && (
          <Button
            mt={4}
            leftIcon={<FiRefreshCw />}
            colorScheme="blue"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </Alert>
    );
  }

  if (variant === 'minimal') {
    return (
      <HStack spacing={2} p={2}>
        <FiAlertTriangle color="red" size={16} />
        <Text fontSize="sm" color="red.600">
          {getContextMessage()}
        </Text>
        {onRetry && (
          <Button size="xs" variant="ghost" onClick={onRetry}>
            <FiRefreshCw size={12} />
          </Button>
        )}
      </HStack>
    );
  }

  // Default card variant
  return (
    <Box
      p={8}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      maxW="md"
      mx="auto"
      mt={8}
    >
      <VStack spacing={6} textAlign="center">
        <Box
          p={4}
          bg="red.50"
          borderRadius="full"
          color="red.500"
        >
          <FiAlertTriangle size={32} />
        </Box>
        
        <VStack spacing={2}>
          <Heading size="md" color="red.600">
            Error
          </Heading>
          <Text color="gray.600">
            {getContextMessage()}
          </Text>
          {error && (
            <Text fontSize="sm" color="gray.500">
              {formatErrorForUser(error)}
            </Text>
          )}
        </VStack>

        <HStack spacing={3}>
          {getContextActions().map((action, index) => (
            <Button
              key={index}
              leftIcon={action.label.includes('Retry') || action.label.includes('Try') ? <FiRefreshCw /> : undefined}
              colorScheme={action.colorScheme as any}
              onClick={action.onClick}
              size="sm"
            >
              {action.label}
            </Button>
          ))}
        </HStack>

        {showDetails && error && process.env.NODE_ENV === 'development' && (
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
            <Text>{error.message}</Text>
            {errorInfo && (
              <Text mt={2} fontSize="xs">
                {errorInfo.componentStack}
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

// Specialized error boundaries for different contexts
export const DashboardErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'context'>> = (props) => (
  <ErrorBoundary {...props} context="dashboard" />
);

export const AnalyticsErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'context'>> = (props) => (
  <ErrorBoundary {...props} context="analytics" />
);

export const AutomationErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'context'>> = (props) => (
  <ErrorBoundary {...props} context="automation" />
);

export const LeadsErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'context'>> = (props) => (
  <ErrorBoundary {...props} context="leads" />
);

export const GenericErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'context'>> = (props) => (
  <ErrorBoundary {...props} context="generic" />
);

// Hook for functional components to use error boundary
export const useErrorBoundary = () => {
  const toast = useToast();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    toast({
      title: 'An error occurred',
      description: formatErrorForUser(error),
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    console.error('Error caught by useErrorBoundary:', error, errorInfo);
  };

  return { handleError };
};

export default ErrorBoundary;
