import React, { useState } from 'react';
import {
  VStack,
  Box,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type PasswordResetData = z.infer<typeof passwordResetSchema>;

interface PasswordResetProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onBackToLogin?: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({
  onSuccess,
  onError,
  onBackToLogin,
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email.trim() }),
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

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      
      setError('email', {
        type: 'manual',
        message: errorMessage,
      });

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="4xl" mb={4}>📧</Text>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Check Your Email
          </Text>
          <Text color="gray.600" mb={4}>
            We&apos;ve sent password reset instructions to:
          </Text>
          <Text fontWeight="semibold" color="primary.600">
            {getValues('email')}
          </Text>
        </Box>

        <Alert status="info">
          <AlertIcon />
                        <Text fontSize="sm">
                If you don&apos;t see the email, check your spam folder. The link will expire in 1 hour.
              </Text>
        </Alert>

        <VStack spacing={3}>
          {onBackToLogin && (
            <Button
              variant="primary"
              size="md"
              width="full"
              onClick={onBackToLogin}
            >
              Return to Login
            </Button>
          )}
          
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
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4}>
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            error={errors.email?.message}
            {...register('email')}
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

      {onBackToLogin && (
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.600">
            Remember your password?{' '}
            <Text
              as="button"
              color="primary.600"
              _hover={{ textDecoration: 'underline' }}
              onClick={onBackToLogin}
            >
              Sign in here
            </Text>
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default PasswordReset;
