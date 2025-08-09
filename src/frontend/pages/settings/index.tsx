import React from 'react';
import {
  Box,
  HStack,
  Heading,
  VStack,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
} from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary, Breadcrumb } from '../../components/ui';

const SettingsPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
              <Breadcrumb />
              <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                Settings
              </Heading>
              
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* User Settings */}
                <Card>
                  <CardHeader>
                    <Heading size="md">User Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Display Name</FormLabel>
                        <Input placeholder="Enter your display name" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input placeholder="Enter your email" type="email" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Timezone</FormLabel>
                        <Select placeholder="Select timezone">
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                        </Select>
                      </FormControl>
                      <Button colorScheme="blue" size="sm">
                        Save Changes
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Notifications</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Email Notifications</FormLabel>
                        <Switch />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">SMS Notifications</FormLabel>
                        <Switch />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Push Notifications</FormLabel>
                        <Switch />
                      </FormControl>
                      <Button colorScheme="blue" size="sm">
                        Save Preferences
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* System Settings */}
                <Card>
                  <CardHeader>
                    <Heading size="md">System Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Default Lead Status</FormLabel>
                        <Select placeholder="Select default status">
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Auto-refresh Interval</FormLabel>
                        <Select placeholder="Select interval">
                          <option value="30">30 seconds</option>
                          <option value="60">1 minute</option>
                          <option value="300">5 minutes</option>
                        </Select>
                      </FormControl>
                      <Button colorScheme="blue" size="sm">
                        Save Settings
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Security</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Button colorScheme="blue" size="sm" variant="outline">
                        Change Password
                      </Button>
                      <Button colorScheme="blue" size="sm" variant="outline">
                        Enable 2FA
                      </Button>
                      <Button colorScheme="blue" size="sm" variant="outline">
                        View Login History
                      </Button>
                      <Button colorScheme="red" size="sm" variant="outline">
                        Logout All Devices
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default SettingsPage;
