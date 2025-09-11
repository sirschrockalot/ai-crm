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
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const UnauthorizedPage: NextPage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
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
            <Box fontSize="4xl">🚫</Box>
            <Heading size="lg" textAlign="center">
              Access Denied
            </Heading>
            <Text color="gray.600" textAlign="center">
              You don&apos;t have permission to access this page
            </Text>
          </VStack>

          {/* User Info */}
          {user && (
            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                Current User:
              </Text>
              <Text fontSize="sm" color="gray.600">
                {user.firstName} {user.lastName} ({user.role})
              </Text>
            </Box>
          )}

          {/* Alert */}
          <Alert status="warning">
            <AlertIcon />
            <Text fontSize="sm">
              This page requires different permissions than your current role. Please contact your administrator if you believe this is an error.
            </Text>
          </Alert>

          {/* Action Buttons */}
          <VStack spacing={3}>
            <Button
              variant="primary"
              size="lg"
              width="full"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              size="md"
              width="full"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </VStack>

          {/* Help Text */}
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600">
              If you need access to this page, please contact your system administrator.
            </Text>
          </Box>
        </VStack>
      </Card>
    </Container>
  );
};

export default UnauthorizedPage;
