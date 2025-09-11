import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Image,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';

const ResetPasswordPage: NextPage = () => {
  const router = useRouter();
  const { isLoading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      setIsSubmitted(true);
      toast({
        title: 'Reset email sent',
        description: 'Please check your email for password reset instructions',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isSubmitted) {
    return (
      <Container maxW="md" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
        <Card variant="elevated" p={8}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={4}>
              <Image
                src="/logo.svg"
                alt="DealCycle CRM"
                height="60px"
              />
              <Box color="green.500" fontSize="4xl">📧</Box>
              <Heading size="lg" textAlign="center">
                Check Your Email
              </Heading>
              <Text color="gray.600" textAlign="center">
                We&apos;ve sent password reset instructions to:
              </Text>
              <Text fontWeight="semibold" color="primary.600">
                {email}
              </Text>
            </VStack>

            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                If you don&apos;t see the email, check your spam folder. The link will expire in 1 hour.
              </Text>
            </Alert>

            <VStack spacing={3}>
              <Button
                variant="primary"
                size="md"
                width="full"
                onClick={() => router.push('/auth/login')}
              >
                Return to Login
              </Button>
              
              <Text fontSize="sm" color="gray.600">
                Didn&apos;t receive the email?{' '}
                <Text
                  as="button"
                  color="primary.600"
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => setIsSubmitted(false)}
                >
                  Try again
                </Text>
              </Text>
            </VStack>
          </VStack>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
      <Card variant="elevated" p={8}>
        <VStack spacing={6} align="stretch">
          {/* Logo and Header */}
          <VStack spacing={4}>
            <Image
              src="/logo.svg"
              alt="DealCycle CRM"
              height="60px"
            />
            <Heading size="lg" textAlign="center">
              Reset Your Password
            </Heading>
            <Text color="gray.600" textAlign="center">
              Enter your email address and we&apos;ll send you a link to reset your password
            </Text>
          </VStack>

          {/* Reset Form */}
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                error={error}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                width="full"
                isLoading={isSubmitting}
              >
                Send Reset Link
              </Button>
            </VStack>
          </Box>

          {/* Footer Links */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600">
              Remember your password?{' '}
              <Text
                as="a"
                href="/auth/login"
                color="primary.600"
                _hover={{ textDecoration: 'underline' }}
              >
                Sign in here
              </Text>
            </Text>
          </Box>
        </VStack>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;
