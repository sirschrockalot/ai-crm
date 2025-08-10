import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormErrorMessage,
  Textarea,
  SimpleGrid,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Link,
  Wrap,
  WrapItem,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { 
  FiLink, 
  FiSettings, 
  FiSave, 
  FiEdit2, 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiRefreshCw, 
  FiActivity,
  FiKey,
  FiShield,
  FiDownload,
  FiUpload,
  FiExternalLink,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiDatabase,
  FiServer,
  FiGlobe,
  FiWifi,
  FiSmartphone,
  FiMonitor,

} from 'react-icons/fi';
import { settingsService } from '../../services/settingsService';

interface ApiSettings {
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  authentication: {
    methods: string[];
    jwtExpiry: number;
    refreshTokenExpiry: number;
    apiKeyExpiry: number;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
  };
  monitoring: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    performanceTracking: boolean;
    errorTracking: boolean;
  };
}

interface Integration {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'crm' | 'payment' | 'analytics' | 'storage' | 'other';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  enabled: boolean;
  lastSync?: string;
  health: 'healthy' | 'warning' | 'critical';
  config: Record<string, any>;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
}

const ApiIntegrationSettings: React.FC = () => {
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const { isOpen: isIntegrationOpen, onOpen: onIntegrationOpen, onClose: onIntegrationClose } = useDisclosure();
  const { isOpen: isApiKeyOpen, onOpen: onApiKeyOpen, onClose: onApiKeyClose } = useDisclosure();
  const { isOpen: isTestOpen, onOpen: onTestOpen, onClose: onTestClose } = useDisclosure();
  
  // Form states
  const [integrationForm, setIntegrationForm] = useState<Partial<Integration>>({
    name: '',
    type: 'other',
    provider: '',
    enabled: false,
    config: {},
  });
  
  const [apiKeyForm, setApiKeyForm] = useState<Partial<ApiKey>>({
    name: '',
    permissions: [],
    expiresAt: '',
  });
  
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadApiSettings();
    loadIntegrations();
    loadApiKeys();
  }, []);

  const loadApiSettings = async () => {
    try {
      setIsLoading(true);
      // This would call the settings service
      // const settings = await settingsService.getApiSettings();
      // setApiSettings(settings);
      
      // Mock data for now
      setApiSettings({
        rateLimit: {
          enabled: true,
          requestsPerMinute: 1000,
          burstLimit: 100,
        },
        authentication: {
          methods: ['jwt', 'api_key', 'oauth2'],
          jwtExpiry: 3600,
          refreshTokenExpiry: 604800,
          apiKeyExpiry: 2592000,
        },
        cors: {
          enabled: true,
          allowedOrigins: ['https://app.dealcycle.com', 'https://admin.dealcycle.com'],
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        },
        monitoring: {
          enabled: true,
          logLevel: 'info',
          performanceTracking: true,
          errorTracking: true,
        },
      });
    } catch (error) {
      toast({
        title: 'Error loading API settings',
        description: 'Failed to load API configuration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      // Mock data for now
      setIntegrations([
        {
          id: '1',
          name: 'SendGrid Email',
          type: 'email',
          provider: 'SendGrid',
          status: 'active',
          enabled: true,
          lastSync: '2024-01-15T10:30:00Z',
          health: 'healthy',
          config: { apiKey: '***', fromEmail: 'noreply@dealcycle.com' },
        },
        {
          id: '2',
          name: 'Twilio SMS',
          type: 'sms',
          provider: 'Twilio',
          status: 'active',
          enabled: true,
          lastSync: '2024-01-15T10:25:00Z',
          health: 'healthy',
          config: { accountSid: '***', authToken: '***', fromNumber: '+1234567890' },
        },
        {
          id: '3',
          name: 'Stripe Payments',
          type: 'payment',
          provider: 'Stripe',
          status: 'testing',
          enabled: false,
          lastSync: '2024-01-14T15:45:00Z',
          health: 'warning',
          config: { publishableKey: 'pk_test_***', secretKey: 'sk_test_***' },
        },
        {
          id: '4',
          name: 'Google Analytics',
          type: 'analytics',
          provider: 'Google',
          status: 'inactive',
          enabled: false,
          health: 'critical',
          config: { trackingId: 'GA-***', viewId: '***' },
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading integrations',
        description: 'Failed to load integration list',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadApiKeys = async () => {
    try {
      // Mock data for now
      setApiKeys([
        {
          id: '1',
          name: 'Frontend App',
          key: 'dc_***',
          permissions: ['read:leads', 'read:buyers', 'write:communications'],
          createdAt: '2024-01-01T00:00:00Z',
          lastUsed: '2024-01-15T10:30:00Z',
          expiresAt: '2025-01-01T00:00:00Z',
          status: 'active',
        },
        {
          id: '2',
          name: 'Mobile App',
          key: 'dc_***',
          permissions: ['read:leads', 'read:buyers'],
          createdAt: '2024-01-10T00:00:00Z',
          lastUsed: '2024-01-15T09:15:00Z',
          expiresAt: '2025-01-10T00:00:00Z',
          status: 'active',
        },
        {
          id: '3',
          name: 'Webhook Service',
          key: 'dc_***',
          permissions: ['read:leads', 'write:leads'],
          createdAt: '2024-01-05T00:00:00Z',
          lastUsed: '2024-01-14T18:30:00Z',
          expiresAt: '2024-07-05T00:00:00Z',
          status: 'active',
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading API keys',
        description: 'Failed to load API key list',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleApiSettingsSave = async () => {
    try {
      setIsSaving(true);
      // This would call the settings service
      // await settingsService.updateApiSettings(apiSettings);
      
      toast({
        title: 'API Settings Saved',
        description: 'API configuration has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving API settings',
        description: 'Failed to update API configuration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntegrationSave = async () => {
    try {
      if (selectedIntegration) {
        // Update existing integration
        const updatedIntegrations = integrations.map(integration =>
          integration.id === selectedIntegration.id
            ? { ...integration, ...integrationForm }
            : integration
        );
        setIntegrations(updatedIntegrations);
      } else {
        // Create new integration
        const newIntegration: Integration = {
          id: Date.now().toString(),
          ...integrationForm as Integration,
          status: 'testing',
          health: 'warning',
        };
        setIntegrations([...integrations, newIntegration]);
      }
      
      onIntegrationClose();
      resetIntegrationForm();
      
      toast({
        title: 'Integration Saved',
        description: 'Integration configuration has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving integration',
        description: 'Failed to save integration configuration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleApiKeySave = async () => {
    try {
      if (selectedIntegration) {
        // Update existing API key
        const updatedApiKeys = apiKeys.map(key =>
          key.id === selectedIntegration.id
            ? { ...key, ...apiKeyForm }
            : key
        );
        setApiKeys(updatedApiKeys);
      } else {
        // Create new API key
        const newApiKey: ApiKey = {
          id: Date.now().toString(),
          key: `dc_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          status: 'active',
          ...apiKeyForm as ApiKey,
        };
        setApiKeys([...apiKeys, newApiKey]);
      }
      
      onApiKeyClose();
      resetApiKeyForm();
      
      toast({
        title: 'API Key Saved',
        description: 'API key has been created/updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving API key',
        description: 'Failed to save API key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const testIntegration = async (integration: Integration) => {
    try {
      setSelectedIntegration(integration);
      onTestOpen();
      
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResults({
        success: integration.health === 'healthy',
        message: integration.health === 'healthy' 
          ? 'Integration test successful' 
          : 'Integration test failed',
        details: {
          responseTime: Math.random() * 1000 + 100,
          statusCode: integration.health === 'healthy' ? 200 : 500,
          errors: integration.health === 'healthy' ? [] : ['Connection timeout'],
        },
      });
    } catch (error) {
      setTestResults({
        success: false,
        message: 'Integration test failed',
        details: {
          responseTime: 0,
          statusCode: 500,
          errors: ['Unexpected error occurred'],
        },
      });
    }
  };

  const resetIntegrationForm = () => {
    setIntegrationForm({
      name: '',
      type: 'other',
      provider: '',
      enabled: false,
      config: {},
    });
    setSelectedIntegration(null);
  };

  const resetApiKeyForm = () => {
    setApiKeyForm({
      name: '',
      permissions: [],
      expiresAt: '',
    });
    setSelectedIntegration(null);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'error': return 'red';
      case 'testing': return 'blue';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading API and integration settings...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          API & Integration Settings
        </Heading>
        <Text color="gray.600">
          Manage API configuration, rate limiting, authentication, and third-party integrations
        </Text>
      </Box>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>API Configuration</Tab>
          <Tab>Integrations</Tab>
          <Tab>API Keys</Tab>
        </TabList>

        <TabPanels>
          {/* API Configuration Tab */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              {apiSettings && (
                <>
                  {/* Rate Limiting */}
                  <Card bg={bgColor} shadow="sm">
                    <CardHeader>
                      <Heading size="md" color={textColor}>Rate Limiting</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="rateLimitEnabled" mb="0">
                            Enable Rate Limiting
                          </FormLabel>
                          <Switch
                            id="rateLimitEnabled"
                            isChecked={apiSettings.rateLimit.enabled}
                            onChange={(e) => setApiSettings(prev => prev ? {
                              ...prev,
                              rateLimit: { ...prev.rateLimit, enabled: e.target.checked }
                            } : null)}
                          />
                        </FormControl>
                        
                        <SimpleGrid columns={2} spacing={4}>
                          <FormControl>
                            <FormLabel>Requests per Minute</FormLabel>
                            <NumberInput
                              value={apiSettings.rateLimit.requestsPerMinute}
                              onChange={(_, value) => setApiSettings(prev => prev ? {
                                ...prev,
                                rateLimit: { ...prev.rateLimit, requestsPerMinute: value }
                              } : null)}
                              min={1}
                              max={10000}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Burst Limit</FormLabel>
                            <NumberInput
                              value={apiSettings.rateLimit.burstLimit}
                              onChange={(_, value) => setApiSettings(prev => prev ? {
                                ...prev,
                                rateLimit: { ...prev.rateLimit, burstLimit: value }
                              } : null)}
                              min={1}
                              max={1000}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Authentication */}
                  <Card bg={bgColor} shadow="sm">
                    <CardHeader>
                      <Heading size="md" color={textColor}>Authentication</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Authentication Methods</FormLabel>
                          <CheckboxGroup value={apiSettings.authentication.methods}>
                            <Wrap>
                              <WrapItem>
                                <Checkbox value="jwt">JWT</Checkbox>
                              </WrapItem>
                              <WrapItem>
                                <Checkbox value="api_key">API Key</Checkbox>
                              </WrapItem>
                              <WrapItem>
                                <Checkbox value="oauth2">OAuth 2.0</Checkbox>
                              </WrapItem>
                            </Wrap>
                          </CheckboxGroup>
                        </FormControl>
                        
                        <SimpleGrid columns={3} spacing={4}>
                          <FormControl>
                            <FormLabel>JWT Expiry (seconds)</FormLabel>
                            <NumberInput
                              value={apiSettings.authentication.jwtExpiry}
                              onChange={(_, value) => setApiSettings(prev => prev ? {
                                ...prev,
                                authentication: { ...prev.authentication, jwtExpiry: value }
                              } : null)}
                              min={300}
                              max={86400}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Refresh Token Expiry (days)</FormLabel>
                            <NumberInput
                              value={apiSettings.authentication.refreshTokenExpiry / 86400}
                              onChange={(_, value) => setApiSettings(prev => prev ? {
                                ...prev,
                                authentication: { ...prev.authentication, refreshTokenExpiry: value * 86400 }
                              } : null)}
                              min={1}
                              max={365}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>API Key Expiry (days)</FormLabel>
                            <NumberInput
                              value={apiSettings.authentication.apiKeyExpiry / 86400}
                              onChange={(_, value) => setApiSettings(prev => prev ? {
                                ...prev,
                                authentication: { ...prev.authentication, apiKeyExpiry: value * 86400 }
                              } : null)}
                              min={1}
                              max={365}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* CORS Settings */}
                  <Card bg={bgColor} shadow="sm">
                    <CardHeader>
                      <Heading size="md" color={textColor}>CORS Configuration</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="corsEnabled" mb="0">
                            Enable CORS
                          </FormLabel>
                          <Switch
                            id="corsEnabled"
                            isChecked={apiSettings.cors.enabled}
                            onChange={(e) => setApiSettings(prev => prev ? {
                              ...prev,
                              cors: { ...prev.cors, enabled: e.target.checked }
                            } : null)}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Allowed Origins</FormLabel>
                          <Textarea
                            value={apiSettings.cors.allowedOrigins.join('\n')}
                            onChange={(e) => setApiSettings(prev => prev ? {
                              ...prev,
                              cors: { ...prev.cors, allowedOrigins: e.target.value.split('\n').filter(Boolean) }
                            } : null)}
                            placeholder="https://app.dealcycle.com&#10;https://admin.dealcycle.com"
                            rows={3}
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Save Button */}
                  <HStack justify="flex-end">
                    <Button
                      colorScheme="blue"
                      leftIcon={<FiSave />}
                      onClick={handleApiSettingsSave}
                      isLoading={isSaving}
                    >
                      Save API Settings
                    </Button>
                  </HStack>
                </>
              )}
            </VStack>
          </TabPanel>

          {/* Integrations Tab */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              {/* Integrations Header */}
              <HStack justify="space-between">
                <Box>
                  <Heading size="md" color={textColor}>Third-Party Integrations</Heading>
                  <Text color="gray.600">Manage external service connections</Text>
                </Box>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    resetIntegrationForm();
                    onIntegrationOpen();
                  }}
                >
                  Add Integration
                </Button>
              </HStack>

              {/* Integrations List */}
              <Card bg={bgColor} shadow="sm">
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Type</Th>
                        <Th>Provider</Th>
                        <Th>Status</Th>
                        <Th>Health</Th>
                        <Th>Last Sync</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {integrations.map((integration) => (
                        <Tr key={integration.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{integration.name}</Text>
                              <Badge
                                colorScheme={integration.enabled ? 'green' : 'gray'}
                                size="sm"
                              >
                                {integration.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" variant="outline">
                              {integration.type}
                            </Badge>
                          </Td>
                          <Td>{integration.provider}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(integration.status)}>
                              {integration.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={getHealthColor(integration.health)}>
                              {integration.health}
                            </Badge>
                          </Td>
                          <Td>
                            {integration.lastSync ? (
                              <Text fontSize="sm">
                                {new Date(integration.lastSync).toLocaleDateString()}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="gray.500">Never</Text>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Test integration"
                                icon={<FiActivity />}
                                size="sm"
                                variant="outline"
                                onClick={() => testIntegration(integration)}
                              />
                              <IconButton
                                aria-label="Edit integration"
                                icon={<FiEdit2 />}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedIntegration(integration);
                                  setIntegrationForm(integration);
                                  onIntegrationOpen();
                                }}
                              />
                              <IconButton
                                aria-label="Delete integration"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* API Keys Tab */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              {/* API Keys Header */}
              <HStack justify="space-between">
                <Box>
                  <Heading size="md" color={textColor}>API Keys</Heading>
                  <Text color="gray.600">Manage API access keys and permissions</Text>
                </Box>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiPlus />}
                  onClick={() => {
                    resetApiKeyForm();
                    onApiKeyOpen();
                  }}
                >
                  Create API Key
                </Button>
              </HStack>

              {/* API Keys List */}
              <Card bg={bgColor} shadow="sm">
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Key</Th>
                        <Th>Permissions</Th>
                        <Th>Created</Th>
                        <Th>Last Used</Th>
                        <Th>Expires</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {apiKeys.map((apiKey) => (
                        <Tr key={apiKey.id}>
                          <Td fontWeight="medium">{apiKey.name}</Td>
                          <Td>
                            <HStack>
                              <Code fontSize="sm">{apiKey.key}</Code>
                              <IconButton
                                aria-label="Copy key"
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                              />
                            </HStack>
                          </Td>
                          <Td>
                            <Wrap>
                              {apiKey.permissions.map((permission) => (
                                <WrapItem key={permission}>
                                  <Badge size="sm" variant="outline">
                                    {permission}
                                  </Badge>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(apiKey.createdAt).toLocaleDateString()}
                            </Text>
                          </Td>
                          <Td>
                            {apiKey.lastUsed ? (
                              <Text fontSize="sm">
                                {new Date(apiKey.lastUsed).toLocaleDateString()}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="gray.500">Never</Text>
                            )}
                          </Td>
                          <Td>
                            {apiKey.expiresAt ? (
                              <Text fontSize="sm">
                                {new Date(apiKey.expiresAt).toLocaleDateString()}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="gray.500">Never</Text>
                            )}
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(apiKey.status)}>
                              {apiKey.status}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit API key"
                                icon={<FiEdit2 />}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedIntegration(apiKey as any);
                                  setApiKeyForm(apiKey);
                                  onApiKeyOpen();
                                }}
                              />
                              <IconButton
                                aria-label="Revoke API key"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Integration Modal */}
      <Modal isOpen={isIntegrationOpen} onClose={onIntegrationClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedIntegration ? 'Edit Integration' : 'Add Integration'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Integration Name</FormLabel>
                <Input
                  value={integrationForm.name}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., SendGrid Email"
                />
              </FormControl>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={integrationForm.type}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="crm">CRM</option>
                    <option value="payment">Payment</option>
                    <option value="analytics">Analytics</option>
                    <option value="storage">Storage</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Provider</FormLabel>
                  <Input
                    value={integrationForm.provider}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g., SendGrid"
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="integrationEnabled" mb="0">
                  Enable Integration
                </FormLabel>
                <Switch
                  id="integrationEnabled"
                  isChecked={integrationForm.enabled}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, enabled: e.target.checked }))}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Configuration (JSON)</FormLabel>
                <Textarea
                  value={JSON.stringify(integrationForm.config, null, 2)}
                  onChange={(e) => {
                    try {
                      const config = JSON.parse(e.target.value);
                      setIntegrationForm(prev => ({ ...prev, config }));
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"apiKey": "your-api-key", "fromEmail": "noreply@example.com"}'
                  rows={4}
                  fontFamily="mono"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onIntegrationClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleIntegrationSave}>
              {selectedIntegration ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* API Key Modal */}
      <Modal isOpen={isApiKeyOpen} onClose={onApiKeyClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedIntegration ? 'Edit API Key' : 'Create API Key'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Key Name</FormLabel>
                <Input
                  value={apiKeyForm.name}
                  onChange={(e) => setApiKeyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Frontend App"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Permissions</FormLabel>
                <CheckboxGroup value={apiKeyForm.permissions || []}>
                  <Wrap>
                    <WrapItem>
                      <Checkbox value="read:leads">Read Leads</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="write:leads">Write Leads</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="read:buyers">Read Buyers</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="write:buyers">Write Buyers</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="read:communications">Read Communications</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="write:communications">Write Communications</Checkbox>
                    </WrapItem>
                  </Wrap>
                </CheckboxGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Expires At (Optional)</FormLabel>
                <Input
                  type="date"
                  value={apiKeyForm.expiresAt}
                  onChange={(e) => setApiKeyForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onApiKeyClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleApiKeySave}>
              {selectedIntegration ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Test Results Modal */}
      <Modal isOpen={isTestOpen} onClose={onTestClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Integration Test Results</ModalHeader>
          <ModalBody>
            {testResults && (
              <VStack spacing={4} align="stretch">
                <Alert
                  status={testResults.success ? 'success' : 'error'}
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  height="200px"
                >
                  <AlertIcon boxSize="40px" />
                  <AlertTitle mt={4} mb={1} fontSize="lg">
                    {testResults.success ? 'Test Successful' : 'Test Failed'}
                  </AlertTitle>
                  <AlertDescription maxWidth="sm">
                    {testResults.message}
                  </AlertDescription>
                </Alert>
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Test Details:</Text>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm">
                      <strong>Response Time:</strong> {testResults.details.responseTime.toFixed(0)}ms
                    </Text>
                    <Text fontSize="sm">
                      <strong>Status Code:</strong> {testResults.details.statusCode}
                    </Text>
                    {testResults.details.errors.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">Errors:</Text>
                        <UnorderedList>
                          {testResults.details.errors.map((error: string, index: number) => (
                            <ListItem key={index} fontSize="sm">{error}</ListItem>
                          ))}
                        </UnorderedList>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onTestClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ApiIntegrationSettings;
