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
  Image,
  Icon,
} from '@chakra-ui/react';
import { FiSettings, FiHome, FiGlobe, FiZap, FiLink, FiSave, FiEdit2, FiPlus, FiTrash2, FiEye } from 'react-icons/fi';
import { settingsService, SystemSettings as SystemSettingsType } from '../../services/settingsService';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SystemSettingsType | null>(null);
  
  // Company info modal
  const { isOpen: isCompanyOpen, onOpen: onCompanyOpen, onClose: onCompanyClose } = useDisclosure();
  const [companyForm, setCompanyForm] = useState<{
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  }>({
    name: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  
  // Branding modal
  const { isOpen: isBrandingOpen, onOpen: onBrandingOpen, onClose: onBrandingClose } = useDisclosure();
  const [brandingForm, setBrandingForm] = useState<{
    primaryColor: string;
    secondaryColor: string;
    customCss?: string;
  }>({
    primaryColor: '#3182CE',
    secondaryColor: '#805AD5',
    customCss: '',
  });
  
  // Feature flags modal
  const { isOpen: isFeaturesOpen, onOpen: onFeaturesOpen, onClose: onFeaturesClose } = useDisclosure();
  
  // Integration modal
  const { isOpen: isIntegrationOpen, onOpen: onIntegrationOpen, onClose: onIntegrationClose } = useDisclosure();
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    enabled: false,
    config: {},
  });
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSystemSettings();
      setSettings(data);
      setFormData(data);
      setCompanyForm(data.company);
      setBrandingForm(data.branding);
    } catch (error) {
      toast({
        title: 'Error loading settings',
        description: 'Failed to load system settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setIsSaving(true);
      const updatedSettings = await settingsService.updateSystemSettings(formData);
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      toast({
        title: 'Settings saved',
        description: 'System settings have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save system settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanySave = async () => {
    try {
      const updatedSettings = await settingsService.updateSystemSettings({
        ...formData,
        company: companyForm,
      });
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      onCompanyClose();
      toast({
        title: 'Company info updated',
        description: 'Company information has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update company information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBrandingSave = async () => {
    try {
      const updatedSettings = await settingsService.updateSystemSettings({
        ...formData,
        branding: brandingForm,
      });
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      onBrandingClose();
      toast({
        title: 'Branding updated',
        description: 'Branding settings have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update branding settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFeatureToggle = async (feature: string, enabled: boolean) => {
    if (!formData) return;
    
    try {
      const updatedFeatures = { ...formData.features, [feature]: enabled };
      const updatedSettings = await settingsService.updateSystemSettings({
        ...formData,
        features: updatedFeatures,
      });
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      toast({
        title: 'Feature updated',
        description: `${feature} has been ${enabled ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update feature setting',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleIntegrationToggle = async (integration: string, enabled: boolean) => {
    if (!formData) return;
    
    try {
      const updatedIntegrations = {
        ...formData.integrations,
        [integration]: { ...formData.integrations[integration], enabled },
      };
      const updatedSettings = await settingsService.updateSystemSettings({
        ...formData,
        integrations: updatedIntegrations,
      });
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      toast({
        title: 'Integration updated',
        description: `${integration} has been ${enabled ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update integration setting',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateFormData = (path: string, value: any) => {
    if (!formData) return;
    
    const keys = path.split('.');
    const newData = { ...formData };
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setFormData(newData);
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Text>Loading system settings...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color={textColor}>
        System Settings
      </Heading>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Company & Branding</Tab>
          <Tab>Features & Integrations</Tab>
          <Tab>System Configuration</Tab>
        </TabList>

        <TabPanels>
          {/* Company & Branding Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiHome} color="blue.500" />
                      <Heading size="md">Company Information</Heading>
                    </HStack>
                    <Button size="sm" onClick={onCompanyOpen} leftIcon={<FiEdit2 />}>
                      Edit
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontWeight="medium" color="gray.600">Company Name</Text>
                      <Text>{settings?.company.name || 'Not set'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color="gray.600">Email</Text>
                      <Text>{settings?.company.email || 'Not set'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color="gray.600">Phone</Text>
                      <Text>{settings?.company.phone || 'Not set'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color="gray.600">Website</Text>
                      <Text>{settings?.company.website || 'Not set'}</Text>
                    </Box>
                    <Box gridColumn={{ base: '1', md: '1 / -1' }}>
                      <Text fontWeight="medium" color="gray.600">Address</Text>
                      <Text>{settings?.company.address || 'Not set'}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  {settings?.company.logo && (
                    <Box mt={4}>
                      <Text fontWeight="medium" color="gray.600" mb={2}>Company Logo</Text>
                      <Image src={settings.company.logo} alt="Company Logo" maxH="100px" />
                    </Box>
                  )}
                </CardBody>
              </Card>

              {/* Branding Settings */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiGlobe} color="blue.500" />
                      <Heading size="md">Branding</Heading>
                    </HStack>
                    <Button size="sm" onClick={onBrandingOpen} leftIcon={<FiEdit2 />}>
                      Edit
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontWeight="medium" color="gray.600">Primary Color</Text>
                      <HStack>
                        <Box
                          w="24px"
                          h="24px"
                          borderRadius="md"
                          bg={settings?.branding.primaryColor}
                          border="1px"
                          borderColor={borderColor}
                        />
                        <Text>{settings?.branding.primaryColor}</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color="gray.600">Secondary Color</Text>
                      <HStack>
                        <Box
                          w="24px"
                          h="24px"
                          borderRadius="md"
                          bg={settings?.branding.secondaryColor}
                          border="1px"
                          borderColor={borderColor}
                        />
                        <Text>{settings?.branding.secondaryColor}</Text>
                      </HStack>
                    </Box>
                  </SimpleGrid>
                  
                  {settings?.branding.customCss && (
                    <Box mt={4}>
                      <Text fontWeight="medium" color="gray.600" mb={2}>Custom CSS</Text>
                      <Box
                        p={3}
                        bg="gray.100"
                        borderRadius="md"
                        fontFamily="mono"
                        fontSize="sm"
                        maxH="100px"
                        overflow="auto"
                      >
                        {settings.branding.customCss}
                      </Box>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Features & Integrations Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Feature Flags */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiZap} color="blue.500" />
                      <Heading size="md">Feature Flags</Heading>
                    </HStack>
                    <Button size="sm" onClick={onFeaturesOpen} leftIcon={<FiEdit2 />}>
                      Manage
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {Object.entries(settings?.features || {}).map(([feature, enabled]) => (
                      <FormControl key={feature} display="flex" alignItems="center">
                        <FormLabel mb="0" flex={1}>
                          {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                        </FormLabel>
                        <Switch
                          isChecked={enabled}
                          onChange={(e) => handleFeatureToggle(feature, e.target.checked)}
                        />
                      </FormControl>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Integrations */}
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiLink} color="blue.500" />
                      <Heading size="md">Integrations</Heading>
                    </HStack>
                    <Button size="sm" onClick={onIntegrationOpen} leftIcon={<FiPlus />}>
                      Add Integration
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Integration</Th>
                        <Th>Status</Th>
                        <Th>Configuration</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(settings?.integrations || {}).map(([name, config]) => (
                        <Tr key={name}>
                          <Td>
                            <Text fontWeight="medium">{name}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={config.enabled ? 'green' : 'gray'}>
                              {config.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" noOfLines={2}>
                              {Object.keys(config.config).length > 0 
                                ? `${Object.keys(config.config).length} config options`
                                : 'No configuration'
                              }
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Switch
                                size="sm"
                                isChecked={config.enabled}
                                onChange={(e) => handleIntegrationToggle(name, e.target.checked)}
                              />
                              <Tooltip label="View configuration">
                                <IconButton
                                  aria-label="View configuration"
                                  icon={<FiEye />}
                                  size="sm"
                                  variant="ghost"
                                />
                              </Tooltip>
                              <Tooltip label="Remove integration">
                                <IconButton
                                  aria-label="Remove integration"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                />
                              </Tooltip>
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

          {/* System Configuration Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={FiSettings} color="blue.500" />
                    <Heading size="md">System Configuration</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>System Configuration</AlertTitle>
                        <AlertDescription>
                          These settings control core system behavior and should be configured carefully.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <Button colorScheme="blue" onClick={handleSave} isLoading={isSaving}>
                      Save All Settings
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Company Information Modal */}
      <Modal isOpen={isCompanyOpen} onClose={onCompanyClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Company Information</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter company email"
                  type="email"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter company phone"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="Enter company website"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Logo URL</FormLabel>
                <Input
                  value={companyForm.logo}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, logo: e.target.value }))}
                  placeholder="Enter logo URL"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter company address"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCompanyClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCompanySave}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Branding Modal */}
      <Modal isOpen={isBrandingOpen} onClose={onBrandingClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Branding</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Primary Color</FormLabel>
                <Input
                  value={brandingForm.primaryColor}
                  onChange={(e) => setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#3182CE"
                  type="color"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Secondary Color</FormLabel>
                <Input
                  value={brandingForm.secondaryColor}
                  onChange={(e) => setBrandingForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#805AD5"
                  type="color"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Custom CSS</FormLabel>
                <Textarea
                  value={brandingForm.customCss}
                  onChange={(e) => setBrandingForm(prev => ({ ...prev, customCss: e.target.value }))}
                  placeholder="Enter custom CSS rules"
                  rows={6}
                  fontFamily="mono"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBrandingClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleBrandingSave}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default SystemSettings;
