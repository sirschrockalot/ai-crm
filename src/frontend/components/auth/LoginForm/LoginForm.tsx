import React, { useState } from 'react';
import {
  VStack,
  Box,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import GoogleAuthButton from '../GoogleAuthButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showGoogleAuth?: boolean;
  showTestMode?: boolean;
  onTestModeClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  showGoogleAuth = true,
  showTestMode = false,
  onTestModeClick,
}) => {
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await login(data as { email: string; password: string });
      
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // AuthContext will handle the redirect to dashboard
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });

      toast({
        title: 'Login failed',
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

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6} align="stretch">
        {/* Google OAuth Button (feature-flagged externally via prop) */}
        {showGoogleAuth && (
          <>
            <GoogleAuthButton />
            <Divider />
          </>
        )}

        {/* Email/Password Form */}
        <VStack spacing={4}>
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            width="full"
            isLoading={isLoading || isSubmitting}
          >
            Sign In
          </Button>
        </VStack>

        {/* Test Mode Button */}
        {showTestMode && onTestModeClick && (
          <>
            <Divider />
            <Button
              variant="ghost"
              size="md"
              onClick={onTestModeClick}
              leftIcon={<Box as="span" fontSize="sm">🧪</Box>}
            >
              Test Mode Login
            </Button>
          </>
        )}

        {/* Root Error */}
        {errors.root && (
          <Box
            p={3}
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="md"
            color="red.700"
            fontSize="sm"
          >
            {errors.root.message}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default LoginForm;
