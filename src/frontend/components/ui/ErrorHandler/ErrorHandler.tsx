import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { FiRefreshCw, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { formatErrorForUser } from '../../../utils/error';

export interface ErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'alert' | 'toast' | 'inline';
  showRetry?: boolean;
  showDismiss?: boolean;
  autoDismiss?: boolean;
  dismissTimeout?: number;
  className?: string;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  variant = 'alert',
  showRetry = true,
  showDismiss = true,
  autoDismiss = false,
  dismissTimeout = 5000,
  className = '',
}) => {
  const toast = useToast();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (error && autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, dismissTimeout);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, autoDismiss, dismissTimeout, onDismiss]);

  useEffect(() => {
    if (error && variant === 'toast') {
      toast({
        title: 'Error',
        description: formatErrorForUser(error),
        status: 'error',
        duration: dismissTimeout,
        isClosable: true,
        position: 'top-right',
      });
    }
    return undefined;
  }, [error, variant, toast, dismissTimeout]);

  const handleRetry = () => {
    setIsVisible(false);
    onRetry?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!error || !isVisible) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <HStack spacing={2} className={className}>
        <FiAlertTriangle color="red" size={16} />
        <Text fontSize="sm" color="red.600">
          {formatErrorForUser(error)}
        </Text>
        {showRetry && onRetry && (
          <Button size="xs" variant="ghost" onClick={handleRetry}>
            <FiRefreshCw size={12} />
          </Button>
        )}
        {showDismiss && onDismiss && (
          <Button size="xs" variant="ghost" onClick={handleDismiss}>
            <FiX size={12} />
          </Button>
        )}
      </HStack>
    );
  }

  return (
    <Alert status="error" className={className}>
      <AlertIcon />
      <VStack align="start" spacing={2} flex={1}>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {formatErrorForUser(error)}
        </AlertDescription>
      </VStack>
      <HStack spacing={2}>
        {showRetry && onRetry && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCw />}
            onClick={handleRetry}
          >
            Retry
          </Button>
        )}
        {showDismiss && onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
          >
            <FiX />
          </Button>
        )}
      </HStack>
    </Alert>
  );
};

// Hook for using error handler
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    const errorMessage = formatErrorForUser(err);
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  const retry = (retryFn: () => void) => {
    clearError();
    retryFn();
  };

  return {
    error,
    handleError,
    clearError,
    retry,
  };
};

// Specialized error handler for API errors
export const ApiErrorHandler: React.FC<{
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  return (
    <ErrorHandler
      error={error}
      onRetry={onRetry}
      onDismiss={onDismiss}
      variant="alert"
      showRetry={!!onRetry}
      showDismiss={!!onDismiss}
    />
  );
};

// Specialized error handler for network errors
export const NetworkErrorHandler: React.FC<{
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  const isNetworkError = error?.toLowerCase().includes('network') || 
                        error?.toLowerCase().includes('connection');

  return (
    <Alert status={isNetworkError ? 'warning' : 'error'}>
      <AlertIcon as={isNetworkError ? FiInfo : FiAlertTriangle} />
      <VStack align="start" spacing={2} flex={1}>
        <AlertTitle>
          {isNetworkError ? 'Connection Issue' : 'Error'}
        </AlertTitle>
        <AlertDescription>
          {formatErrorForUser(error)}
        </AlertDescription>
      </VStack>
      <HStack spacing={2}>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCw />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
          >
            <FiX />
          </Button>
        )}
      </HStack>
    </Alert>
  );
};
