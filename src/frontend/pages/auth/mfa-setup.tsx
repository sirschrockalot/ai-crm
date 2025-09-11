import React, { useState, useEffect } from 'react';
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
  HStack,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';

interface MFASetupData {
  qrCodeUrl: string;
  secretKey: string;
  backupCodes: string[];
}

const MFASetupPage: NextPage = () => {
  const router = useRouter();
  const { isLoading } = useAuth();
  const toast = useToast();
  const [mfaData, setMfaData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoadingMFA, setIsLoadingMFA] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState('');

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
        toast({
          title: 'Error',
          description: 'Failed to setup MFA. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/dashboard');
      } finally {
        setIsLoadingMFA(false);
      }
    };

    setupMFA();
  }, [router, toast]);

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    if (error) {
      setError('');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          code: verificationCode,
          secretKey: mfaData?.secretKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid verification code');
      }

      setIsSetup(true);
      toast({
        title: 'MFA Setup Complete',
        description: 'Two-factor authentication has been enabled for your account',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (isLoading || isLoadingMFA) {
    return <Loading />;
  }

  if (isSetup) {
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
              <Box color="green.500" fontSize="4xl">🔒</Box>
              <Heading size="lg" textAlign="center">
                MFA Setup Complete!
              </Heading>
              <Text color="gray.600" textAlign="center">
                Two-factor authentication has been successfully enabled for your account
              </Text>
            </VStack>

            <Alert status="success">
              <AlertIcon />
              <Text fontSize="sm">
                Your account is now protected with two-factor authentication. You&apos;ll need to enter a verification code each time you sign in.
              </Text>
            </Alert>

            <VStack spacing={3}>
              <Button
                variant="primary"
                size="lg"
                width="full"
                onClick={() => router.push('/dashboard')}
              >
                Continue to Dashboard
              </Button>
            </VStack>
          </VStack>
        </Card>
      </Container>
    );
  }

  if (!mfaData) {
    return (
      <Container maxW="md" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
        <Card variant="elevated" p={8}>
          <VStack spacing={6} align="stretch">
            <Alert status="error">
              <AlertIcon />
              <Text>Failed to setup MFA. Please try again.</Text>
            </Alert>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </VStack>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
      <Card variant="elevated" p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4}>
            <Image
              src="/logo.svg"
              alt="DealCycle CRM"
              height="60px"
            />
            <Heading size="lg" textAlign="center">
              Set Up Two-Factor Authentication
            </Heading>
            <Text color="gray.600" textAlign="center">
              Enhance your account security by enabling two-factor authentication
            </Text>
          </VStack>

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
            <Box as="form" onSubmit={handleVerify} width="full">
              <VStack spacing={4}>
                <Input
                  type="text"
                  label="6-Digit Code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  error={error}
                  maxLength={6}
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
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleSkip}
                  >
                    Skip for Now
                  </Button>
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
      </Card>
    </Container>
  );
};

export default MFASetupPage;
