import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  Heading,
  Text,
  Container,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AuthErrorPage: NextPage = () => {
  const router = useRouter();
  const { error, error_description } = router.query;

  const getErrorDetails = () => {
    switch (error) {
      case 'access_denied':
        return {
          title: 'Access Denied',
          description: 'You denied the authentication request. Please try again to access the application.',
          icon: '🚫',
        };
      case 'invalid_request':
        return {
          title: 'Invalid Request',
          description: 'The authentication request was invalid. Please try logging in again.',
          icon: '⚠️',
        };
      case 'server_error':
        return {
          title: 'Server Error',
          description: 'An error occurred on our servers. Please try again later.',
          icon: '🔧',
        };
      case 'temporarily_unavailable':
        return {
          title: 'Service Temporarily Unavailable',
          description: 'The authentication service is temporarily unavailable. Please try again later.',
          icon: '⏳',
        };
      case 'unauthorized_client':
        return {
          title: 'Unauthorized Client',
          description: 'This application is not authorized to perform authentication.',
          icon: '🔒',
        };
      case 'unsupported_response_type':
        return {
          title: 'Unsupported Response Type',
          description: 'The authentication response type is not supported.',
          icon: '❌',
        };
      default:
        return {
          title: 'Authentication Error',
          description: error_description || 'An unexpected error occurred during authentication. Please try again.',
          icon: '❓',
        };
    }
  };

  const errorDetails = getErrorDetails();

  const handleRetry = () => {
    router.push('/auth/login');
  };

  const handleContactSupport = () => {
    // In a real application, this would open a support ticket or contact form
    window.open('mailto:support@dealcycle.com?subject=Authentication Error', '_blank');
  };

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
      <Card variant="elevated" p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4}>
            <Image
              src="/logo.svg"
              alt="DealCycle CRM"
              height="60px"
            />
            <Box fontSize="4xl">{errorDetails.icon}</Box>
            <Heading size="lg" textAlign="center">
              {errorDetails.title}
            </Heading>
          </VStack>

          {/* Error Alert */}
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>
                {errorDetails.description}
              </AlertDescription>
            </Box>
          </Alert>

          {/* Error Details */}
          {error && (
            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                Error Details:
              </Text>
              <Text fontSize="sm" color="gray.600" fontFamily="mono">
                Error: {error}
              </Text>
              {error_description && (
                <Text fontSize="sm" color="gray.600" fontFamily="mono" mt={1}>
                  Description: {error_description}
                </Text>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <VStack spacing={3}>
            <Button
              variant="primary"
              size="lg"
              width="full"
              onClick={handleRetry}
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              size="md"
              width="full"
              onClick={handleContactSupport}
            >
              Contact Support
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
            >
              Return to Home
            </Button>
          </VStack>

          {/* Help Text */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600">
              If this problem persists, please contact our support team for assistance.
            </Text>
          </Box>
        </VStack>
      </Card>
    </Container>
  );
};

export default AuthErrorPage;
