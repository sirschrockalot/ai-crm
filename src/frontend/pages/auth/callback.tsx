import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';

const OAuthCallbackPage: NextPage = () => {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const { code, state, error } = router.query;

        // Check for OAuth errors
        if (error) {
          setStatus('error');
          setErrorMessage(`OAuth error: ${error}`);
          return;
        }

        // Check for required parameters
        if (!code) {
          setStatus('error');
          setErrorMessage('Missing authorization code');
          return;
        }

        // Exchange code for token
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to complete authentication');
        }

        const { user, token } = await response.json();

        // Store token
        localStorage.setItem('auth_token', token);

        // Update auth context
        updateUser(user);

        setStatus('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    if (router.isReady) {
      handleOAuthCallback();
    }
  }, [router.isReady, router.query, updateUser, router]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <VStack spacing={6}>
            <Spinner size="xl" color="primary.500" />
            <Heading size="md">Completing authentication...</Heading>
            <Text color="gray.600" textAlign="center">
              Please wait while we complete your sign-in process
            </Text>
          </VStack>
        );

      case 'success':
        return (
          <VStack spacing={6}>
            <Box color="green.500" fontSize="4xl">✅</Box>
            <Heading size="md" color="green.600">Authentication Successful!</Heading>
            <Text color="gray.600" textAlign="center">
              You have been successfully signed in. Redirecting to dashboard...
            </Text>
          </VStack>
        );

      case 'error':
        return (
          <VStack spacing={6}>
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Box>
            </Alert>
            <Text color="gray.600" textAlign="center">
              Please try signing in again or contact support if the problem persists.
            </Text>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
      <Card variant="elevated" p={8}>
        <VStack spacing={6} align="stretch">
          {renderContent()}
          
          {status === 'error' && (
            <Box textAlign="center">
              <Text
                as="a"
                href="/auth/login"
                color="primary.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Return to login
              </Text>
            </Box>
          )}
        </VStack>
      </Card>
    </Container>
  );
};

export default OAuthCallbackPage;
