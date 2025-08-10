import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, VStack, HStack, Button, Alert, AlertIcon, Code, Collapse } from '@chakra-ui/react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
}

export const ErrorDisplay: React.FC = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only initialize on client side
    if (!isClient || isInitialized.current) {
      return undefined;
    }
    isInitialized.current = true;

    // Capture global errors
    const handleError = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        type: 'error',
      };
      setErrors(prev => [...prev, errorInfo]);
    };

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date(),
        type: 'error',
      };
      setErrors(prev => [...prev, errorInfo]);
    };

    // Store original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Override console.error only once
    if (!(console as any)._errorDisplayInitialized) {
      (console as any)._errorDisplayInitialized = true;
      console.error = (...args) => {
        const errorInfo: ErrorInfo = {
          message: args.map(arg => 
            typeof arg === 'string' ? arg : 
            arg instanceof Error ? arg.message : 
            JSON.stringify(arg)
          ).join(' '),
          timestamp: new Date(),
          type: 'error',
        };
        setErrors(prev => [...prev, errorInfo]);
        originalConsoleError.apply(console, args);
      };

      // Override console.warn only once
      console.warn = (...args) => {
        const errorInfo: ErrorInfo = {
          message: args.map(arg => 
            typeof arg === 'string' ? arg : 
            arg instanceof Error ? arg.message : 
            JSON.stringify(arg)
          ).join(' '),
          timestamp: new Date(),
          type: 'warning',
        };
        setErrors(prev => [...prev, errorInfo]);
        originalConsoleWarn.apply(console, args);
      };
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      // Don't restore console methods on cleanup to avoid conflicts
    };
  }, [isClient]); // Add isClient as dependency

  const clearErrors = () => {
    setErrors([]);
  };

  // Don't render anything on server side or if no errors
  if (!isClient || errors.length === 0) {
    return null;
  }

  return (
    <Box
      position="fixed"
      bottom={4}
      left={4}
      maxW="600px"
      zIndex={9999}
    >
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="bold" color="red.500">
            Browser Errors ({errors.length})
          </Text>
          <HStack spacing={2}>
            <Button
              size="xs"
              onClick={() => setIsOpen(!isOpen)}
              colorScheme="red"
              variant="outline"
            >
              {isOpen ? 'Hide' : 'Show'}
            </Button>
            <Button
              size="xs"
              onClick={clearErrors}
              colorScheme="red"
              variant="outline"
            >
              Clear
            </Button>
          </HStack>
        </HStack>

        <Collapse in={isOpen}>
          <VStack align="stretch" spacing={2} maxH="400px" overflowY="auto">
            {errors.map((error, index) => (
              <Alert
                key={index}
                status={error.type === 'error' ? 'error' : 'warning'}
                variant="left-accent"
                fontSize="xs"
              >
                <AlertIcon />
                <VStack align="start" spacing={1} w="full">
                  <Text fontWeight="semibold">
                    {error.message}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {error.timestamp.toLocaleTimeString()}
                  </Text>
                  {error.stack && (
                    <Code fontSize="xs" p={2} w="full" overflowX="auto">
                      {error.stack}
                    </Code>
                  )}
                </VStack>
              </Alert>
            ))}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default ErrorDisplay;
