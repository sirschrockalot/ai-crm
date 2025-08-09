import React, { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Image,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const mfaSchema = z.object({
  verificationCode: z.string().length(6, 'Please enter a 6-digit verification code'),
});

type MFASetupData = z.infer<typeof mfaSchema>;

interface MFASetupDataResponse {
  qrCodeUrl: string;
  secretKey: string;
  backupCodes: string[];
}

interface MFASetupProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

const MFASetup: React.FC<MFASetupProps> = ({
  onSuccess,
  onError,
  onSkip,
  showSkip = true,
}) => {
  const toast = useToast();
  const [mfaData, setMfaData] = useState<MFASetupDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<MFASetupData>({
    resolver: zodResolver(mfaSchema),
  });

  useEffect(() => {
    const setupMFA = async () => {
      try {
        const response = await fetch('/api/auth/mfa/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to setup MFA');
        }

        const data = await response.json();
        setMfaData(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to setup MFA';
        onError?.(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    setupMFA();
  }, [onError, toast]);

  const onSubmit = async (data: MFASetupData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          code: data.verificationCode,
          secretKey: mfaData?.secretKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid verification code');
      }

      toast({
        title: 'MFA Setup Complete',
        description: 'Two-factor authentication has been enabled for your account',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      
      setError('verificationCode', {
        type: 'manual',
        message: errorMessage,
      });

      toast({
        title: 'Verification Failed',
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

  if (isLoading) {
    return (
      <VStack spacing={4}>
        <Text>Setting up two-factor authentication...</Text>
      </VStack>
    );
  }

  if (!mfaData) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>Failed to setup MFA. Please try again.</Text>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Alert status="info">
        <AlertIcon />
        <Text fontSize="sm">
          Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) to set up two-factor authentication.
        </Text>
      </Alert>

      {/* QR Code Section */}
      <VStack spacing={4}>
        <Text fontWeight="semibold">Step 1: Scan QR Code</Text>
        <Box
          border="2px solid"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          bg="white"
        >
          <Image
            src={mfaData.qrCodeUrl}
            alt="MFA QR Code"
            width="200px"
            height="200px"
            mx="auto"
          />
        </Box>
      </VStack>

      <Divider />

      {/* Verification Section */}
      <VStack spacing={4}>
        <Text fontWeight="semibold">Step 2: Enter Verification Code</Text>
        <Box as="form" onSubmit={handleSubmit(onSubmit)} width="full">
          <VStack spacing={4}>
            <Input
              type="text"
              label="6-Digit Code"
              placeholder="000000"
              error={errors.verificationCode?.message}
              maxLength={6}
              {...register('verificationCode')}
              required
            />

            <HStack spacing={4} width="full">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                flex={1}
                isLoading={isSubmitting}
              >
                Verify & Enable MFA
              </Button>
              {showSkip && onSkip && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onSkip}
                >
                  Skip for Now
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>
      </VStack>

      {/* Instructions */}
      <Alert status="warning">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="semibold">Important:</Text>
          <Text fontSize="sm">
            • Save your backup codes in a secure location
          </Text>
                        <Text fontSize="sm">
                • You&apos;ll need this code to sign in from now on
              </Text>
          <Text fontSize="sm">
            • If you lose your device, use backup codes to access your account
          </Text>
        </VStack>
      </Alert>
    </VStack>
  );
};

export default MFASetup;
