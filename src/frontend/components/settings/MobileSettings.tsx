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
  Textarea,
  SimpleGrid,
  Select,
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
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  useColorMode,
} from '@chakra-ui/react';
import { 
  FiSmartphone, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSave, 
  FiX, 
  FiSettings, 
  FiDownload, 
  FiUpload,
  FiWifi,
  FiMapPin,
  FiBell,
  FiShield,
  FiDatabase,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiUser,
  FiGlobe,
  FiServer,
  FiHardDrive,
  FiCpu,
  FiTablet,
  FiMonitor,
} from 'react-icons/fi';

interface MobileApp {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'web';
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: Date;
  downloadCount: number;
  rating: number;
  features: string[];
  settings: {
    pushNotifications: boolean;
    locationServices: boolean;
    biometricAuth: boolean;
    autoSync: boolean;
    offlineMode: boolean;
    dataUsage: 'low' | 'medium' | 'high';
  };
}

interface MobileAnalytics {
  totalDownloads: number;
  activeUsers: number;
  crashRate: number;
  avgSessionTime: number;
  deviceTypes: { type: string; count: number }[];
  osVersions: { version: string; count: number }[];
}

const MobileSettings: React.FC = () => {
  const [mobileApps, setMobileApps] = useState<MobileApp[]>([]);
  const [analytics, setAnalytics] = useState<MobileAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Form states
  const [createForm, setCreateForm] = useState<Partial<MobileApp>>({
    name: '',
    platform: 'ios',
    version: '1.0.0',
    status: 'active',
    features: [],
    settings: {
      pushNotifications: true,
      locationServices: false,
      biometricAuth: false,
      autoSync: true,
      offlineMode: false,
      dataUsage: 'medium',
    },
  });
  
  const [editForm, setEditForm] = useState<MobileApp | null>(null);
  const [appToDelete, setAppToDelete] = useState<MobileApp | null>(null);
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    loadMobileApps();
    loadAnalytics();
  }, []);

  const loadMobileApps = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setMobileApps([
        {
          id: '1',
          name: 'RealEstate CRM iOS',
          platform: 'ios',
          version: '2.1.0',
          status: 'active',
          lastUpdated: new Date('2024-01-15'),
          downloadCount: 12500,
          rating: 4.5,
          features: ['Lead Management', 'Deal Tracking', 'Push Notifications'],
          settings: {
            pushNotifications: true,
            locationServices: true,
            biometricAuth: true,
            autoSync: true,
            offlineMode: true,
            dataUsage: 'medium',
          },
        },
        {
          id: '2',
          name: 'RealEstate CRM Android',
          platform: 'android',
          version: '2.0.8',
          status: 'active',
          lastUpdated: new Date('2024-01-10'),
          downloadCount: 18900,
          rating: 4.3,
          features: ['Lead Management', 'Deal Tracking', 'Offline Mode'],
          settings: {
            pushNotifications: true,
            locationServices: false,
            biometricAuth: false,
            autoSync: true,
            offlineMode: true,
            dataUsage: 'low',
          },
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading mobile apps',
        description: 'Failed to load mobile app data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalytics({
        totalDownloads: 31400,
        activeUsers: 18750,
        crashRate: 0.8,
        avgSessionTime: 12.5,
        deviceTypes: [
          { type: 'iPhone', count: 8500 },
          { type: 'Android', count: 10250 },
          { type: 'iPad', count: 1200 },
          { type: 'Tablet', count: 800 },
        ],
        osVersions: [
          { version: 'iOS 17', count: 4500 },
          { version: 'Android 14', count: 6800 },
          { version: 'iOS 16', count: 4000 },
          { version: 'Android 13', count: 3450 },
        ],
      });
    } catch (error) {
      toast({
        title: 'Error loading analytics',
        description: 'Failed to load mobile analytics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateApp = async () => {
    try {
      setIsSaving(true);
      const newApp: MobileApp = {
        id: Date.now().toString(),
        ...createForm as MobileApp,
        lastUpdated: new Date(),
        downloadCount: 0,
        rating: 0,
      };
      setMobileApps(prev => [...prev, newApp]);
      
      toast({
        title: 'Mobile app created',
        description: 'Mobile app has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onCreateClose();
      setCreateForm({
        name: '',
        platform: 'ios',
        version: '1.0.0',
        status: 'active',
        features: [],
        settings: {
          pushNotifications: true,
          locationServices: false,
          biometricAuth: false,
          autoSync: true,
          offlineMode: false,
          dataUsage: 'medium',
        },
      });
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: 'Failed to create mobile app',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditApp = async () => {
    if (!editForm) return;
    
    try {
      setIsSaving(true);
      const updatedApp = { ...editForm, lastUpdated: new Date() };
      setMobileApps(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
      
      toast({
        title: 'Mobile app updated',
        description: 'Mobile app has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onEditClose();
      setEditForm(null);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update mobile app',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApp = async () => {
    if (!appToDelete) return;
    
    try {
      setIsSaving(true);
      setMobileApps(prev => prev.filter(app => app.id !== appToDelete.id));
      
      toast({
        title: 'Mobile app deleted',
        description: 'Mobile app has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteClose();
      setAppToDelete(null);
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: 'Failed to delete mobile app',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (app: MobileApp) => {
    setEditForm({ ...app });
    onEditOpen();
  };

  const openDeleteModal = (app: MobileApp) => {
    setAppToDelete(app);
    onDeleteOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'maintenance': return 'yellow';
      default: return 'gray';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <FiSmartphone />;
      case 'android': return <FiSmartphone />;
      case 'web': return <FiGlobe />;
      default: return <FiSmartphone />;
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading mobile settings...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Mobile Settings
        </Heading>
        <Text color="gray.600">
          Configure mobile app settings, features, and monitor usage analytics
        </Text>
      </Box>

      {/* Analytics Overview */}
      {analytics && (
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Downloads</StatLabel>
                  <StatNumber>{analytics.totalDownloads.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Growing steadily
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Active Users</StatLabel>
                  <StatNumber>{analytics.activeUsers.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    {((analytics.activeUsers / analytics.totalDownloads) * 100).toFixed(1)}% retention
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Crash Rate</StatLabel>
                  <StatNumber>{analytics.crashRate}%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Excellent stability
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Avg Session</StatLabel>
                  <StatNumber>{analytics.avgSessionTime}m</StatNumber>
                  <StatHelpText>
                    User engagement time
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      )}

      {/* Create New App Button */}
      <HStack justify="flex-end">
        <Button
          colorScheme="blue"
          leftIcon={<FiPlus />}
          onClick={onCreateOpen}
        >
          Add Mobile App
        </Button>
      </HStack>

      {/* Mobile Apps Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Mobile Applications</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>App Name</Th>
                <Th>Platform</Th>
                <Th>Version</Th>
                <Th>Status</Th>
                <Th>Downloads</Th>
                <Th>Rating</Th>
                <Th>Last Updated</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mobileApps.map((app) => (
                <Tr key={app.id}>
                  <Td>
                    <Text fontWeight="medium">{app.name}</Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {app.features.join(', ')}
                    </Text>
                  </Td>
                  <Td>
                    <HStack>
                      {getPlatformIcon(app.platform)}
                      <Badge colorScheme="blue" variant="subtle">
                        {app.platform.toUpperCase()}
                      </Badge>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontFamily="mono">{app.version}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(app.status)} variant="subtle">
                      {app.status.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    <Text>{app.downloadCount.toLocaleString()}</Text>
                  </Td>
                  <Td>
                    <HStack>
                      <Text>{app.rating}</Text>
                      <Icon as={FiCheckCircle} color="yellow.500" />
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {app.lastUpdated.toLocaleDateString()}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Edit app">
                        <IconButton
                          aria-label="Edit app"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(app)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete app">
                        <IconButton
                          aria-label="Delete app"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openDeleteModal(app)}
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

      {/* Create App Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Mobile App</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>App Name</FormLabel>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., RealEstate CRM iOS"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Platform</FormLabel>
                  <Select
                    value={createForm.platform}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, platform: e.target.value as any }))}
                  >
                    <option value="ios">iOS</option>
                    <option value="android">Android</option>
                    <option value="web">Web App</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Version</FormLabel>
                  <Input
                    value={createForm.version}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., 1.0.0"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={createForm.status}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Features (comma separated)</FormLabel>
                <Input
                  value={createForm.features?.join(', ') || ''}
                  onChange={(e) => setCreateForm(prev => ({ 
                    ...prev, 
                    features: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                  }))}
                  placeholder="Lead Management, Deal Tracking, Push Notifications"
                />
              </FormControl>
              
              <Divider />
              
              <Text fontWeight="semibold">App Settings</Text>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Push Notifications</FormLabel>
                  <Switch
                    isChecked={createForm.settings?.pushNotifications}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings!, pushNotifications: e.target.checked } 
                    }))}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Location Services</FormLabel>
                  <Switch
                    isChecked={createForm.settings?.locationServices}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings!, locationServices: e.target.checked } 
                    }))}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Biometric Auth</FormLabel>
                  <Switch
                    isChecked={createForm.settings?.biometricAuth}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings!, biometricAuth: e.target.checked } 
                    }))}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Auto Sync</FormLabel>
                  <Switch
                    isChecked={createForm.settings?.autoSync}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings!, autoSync: e.target.checked } 
                    }))}
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Data Usage</FormLabel>
                <Select
                  value={createForm.settings?.dataUsage}
                  onChange={(e) => setCreateForm(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings!, dataUsage: e.target.value as any } 
                  }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleCreateApp}
              isLoading={isSaving}
            >
              Create App
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit App Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Mobile App</ModalHeader>
          <ModalBody>
            {editForm && (
              <VStack spacing={4}>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>App Name</FormLabel>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="e.g., RealEstate CRM iOS"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      value={editForm.platform}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, platform: e.target.value as any } : null)}
                    >
                      <option value="ios">iOS</option>
                      <option value="android">Android</option>
                      <option value="web">Web App</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Version</FormLabel>
                    <Input
                      value={editForm.version}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, version: e.target.value } : null)}
                      placeholder="e.g., 1.0.0"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Features (comma separated)</FormLabel>
                  <Input
                    value={editForm.features?.join(', ') || ''}
                    onChange={(e) => setEditForm(prev => prev ? { 
                      ...prev, 
                      features: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                    } : null)}
                    placeholder="Lead Management, Deal Tracking, Push Notifications"
                  />
                </FormControl>
                
                <Divider />
                
                <Text fontWeight="semibold">App Settings</Text>
                
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Push Notifications</FormLabel>
                    <Switch
                      isChecked={editForm.settings?.pushNotifications}
                      onChange={(e) => setEditForm(prev => prev ? { 
                        ...prev, 
                        settings: { ...prev.settings!, pushNotifications: e.target.checked } 
                      } : null)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Location Services</FormLabel>
                    <Switch
                      isChecked={editForm.settings?.locationServices}
                      onChange={(e) => setEditForm(prev => prev ? { 
                        ...prev, 
                        settings: { ...prev.settings!, locationServices: e.target.checked } 
                      } : null)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Biometric Auth</FormLabel>
                    <Switch
                      isChecked={editForm.settings?.biometricAuth}
                      onChange={(e) => setEditForm(prev => prev ? { 
                        ...prev, 
                        settings: { ...prev.settings!, biometricAuth: e.target.checked } 
                      } : null)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Auto Sync</FormLabel>
                    <Switch
                      isChecked={editForm.settings?.autoSync}
                      onChange={(e) => setEditForm(prev => prev ? { 
                        ...prev, 
                        settings: { ...prev.settings!, autoSync: e.target.checked } 
                      } : null)}
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Data Usage</FormLabel>
                  <Select
                    value={editForm.settings?.dataUsage}
                    onChange={(e) => setEditForm(prev => prev ? { 
                      ...prev, 
                      settings: { ...prev.settings!, dataUsage: e.target.value as any } 
                    } : null)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleEditApp}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Mobile App</ModalHeader>
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Are you sure you want to delete the mobile app &quot;{appToDelete?.name}&quot;? 
                  This action cannot be undone.
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              onClick={handleDeleteApp}
              isLoading={isSaving}
            >
              Delete App
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default MobileSettings;
