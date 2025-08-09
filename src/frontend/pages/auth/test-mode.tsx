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
  Select,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

const testUsers: TestUser[] = [
  {
    id: '1',
    email: 'admin@dealcycle.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Admin',
    tenantId: 'tenant-1',
  },
  {
    id: '2',
    email: 'acquisition@dealcycle.com',
    firstName: 'Acquisition',
    lastName: 'Rep',
    role: 'Acquisition Rep',
    tenantId: 'tenant-1',
  },
  {
    id: '3',
    email: 'disposition@dealcycle.com',
    firstName: 'Disposition',
    lastName: 'Manager',
    role: 'Disposition Manager',
    tenantId: 'tenant-1',
  },
  {
    id: '4',
    email: 'team@dealcycle.com',
    firstName: 'Team',
    lastName: 'Member',
    role: 'Team Member',
    tenantId: 'tenant-1',
  },
];

const TestModePage: NextPage = () => {
  const router = useRouter();
  const { updateUser } = useAuth();
  const toast = useToast();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select a test user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = testUsers.find(u => u.id === selectedUser);
      if (!user) {
        throw new Error('Selected user not found');
      }

      // Call test mode login API
      const response = await fetch('/api/auth/test-mode/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          role: user.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Test login failed');
      }

      const { token } = await response.json();

      // Store token
      localStorage.setItem('auth_token', token);

      // Update auth context
      updateUser(user);

      toast({
        title: 'Test Login Successful',
        description: `Logged in as ${user.firstName} ${user.lastName} (${user.role})`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Test Login Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
      <Card variant="elevated" p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4}>
            <Image
              src="/logo.png"
              alt="DealCycle CRM"
              height="60px"
              fallbackSrc="https://via.placeholder.com/200x60?text=DealCycle+CRM"
            />
            <Heading size="lg" textAlign="center">
              Test Mode Login
            </Heading>
            <Text color="gray.600" textAlign="center">
              Development and testing environment
            </Text>
          </VStack>

          <Alert status="warning">
            <AlertIcon />
            <Text fontSize="sm">
              This is a test environment. Select a test user to quickly access the system for development and testing purposes.
            </Text>
          </Alert>

          {/* Test User Selection */}
          <VStack spacing={4}>
            <Text fontWeight="semibold">Select Test User:</Text>
            <Select
              placeholder="Choose a test user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              size="lg"
            >
              {testUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.role}
                </option>
              ))}
            </Select>

            {selectedUser && (
              <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <Text fontSize="sm" fontWeight="semibold">Selected User:</Text>
                {(() => {
                  const user = testUsers.find(u => u.id === selectedUser);
                  return user ? (
                    <VStack align="start" spacing={1} mt={2}>
                      <Text fontSize="sm">
                        <strong>Name:</strong> {user.firstName} {user.lastName}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Email:</strong> {user.email}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Role:</strong> {user.role}
                      </Text>
                    </VStack>
                  ) : null;
                })()}
              </Box>
            )}
          </VStack>

          <Divider />

          {/* Action Buttons */}
          <VStack spacing={3}>
            <Button
              variant="primary"
              size="lg"
              width="full"
              onClick={handleTestLogin}
              isLoading={isLoading}
              disabled={!selectedUser}
            >
              Login as Test User
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={handleBackToLogin}
            >
              Back to Regular Login
            </Button>
          </VStack>

          {/* Footer */}
          <Box textAlign="center">
            <Text fontSize="xs" color="gray.500">
              Test mode is only available in development environment
            </Text>
          </Box>
        </VStack>
      </Card>
    </Container>
  );
};

export default TestModePage;
