import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  useToast,
  Container,
  Flex,
  Image,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const isMountedRef = useRef(true);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(credentials);
      
      // Show success toast
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // AuthContext will handle the redirect to dashboard
    } catch (error) {
      // Only show error if component is still mounted
      if (isMountedRef.current) {
        toast({
          title: 'Login failed',
          description: error instanceof Error ? error.message : 'Please check your credentials',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  const handleTestModeLogin = () => {
    router.push('/auth/test-mode');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
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
              Welcome to DealCycle CRM
            </Heading>
            <Text color="gray.600" textAlign="center">
              Sign in to your account to continue
            </Text>
          </VStack>

          {/* Google OAuth Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            leftIcon={<Box as="span" fontSize="lg">🔐</Box>}
          >
            Continue with Google
          </Button>

          <Divider />

          {/* Email/Password Form */}
          <Box as="form" onSubmit={handleLogin}>
            <VStack spacing={4}>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                width="full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          <Divider />

          {/* Test Mode Login */}
          <Button
            variant="ghost"
            size="md"
            onClick={handleTestModeLogin}
            leftIcon={<Box as="span" fontSize="sm">🧪</Box>}
          >
            Test Mode Login
          </Button>

          {/* Footer Links */}
          <Flex justify="space-between" fontSize="sm">
            <Text
              as="a"
              href="/auth/register"
              color="primary.600"
              _hover={{ textDecoration: 'underline' }}
            >
              Create account
            </Text>
            <Text
              as="a"
              href="/auth/reset-password"
              color="primary.600"
              _hover={{ textDecoration: 'underline' }}
            >
              Forgot password?
            </Text>
          </Flex>
        </VStack>
      </Card>
    </Container>
  );
};

export default LoginPage;
