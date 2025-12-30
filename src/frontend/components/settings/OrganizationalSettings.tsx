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
  Textarea,
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
  SimpleGrid,
  Select,
  Switch,
  Image,
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
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { 
  FiGlobe, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiUpload,
  FiTrash2,
  FiEye,
  FiUsers,
  FiSettings,
  FiPlus,
  FiHome
} from 'react-icons/fi';
import { settingsService } from '../../services/settingsService';

interface CompanyInfo {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  industry?: string;
  founded?: string;
  employees?: number;
  revenue?: string;
}

interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  customCss?: string;
  fontFamily?: string;
  slogan?: string;
  mission?: string;
  vision?: string;
}

interface OrganizationalUnit {
  id: string;
  name: string;
  type: 'department' | 'team' | 'division' | 'location';
  parentId?: string;
  managerId?: string;
  description?: string;
  active: boolean;
  memberCount: number;
}

const OrganizationalSettings: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const { isOpen: isCompanyOpen, onOpen: onCompanyOpen, onClose: onCompanyClose } = useDisclosure();
  const { isOpen: isBrandingOpen, onOpen: onBrandingOpen, onClose: onBrandingClose } = useDisclosure();
  const { isOpen: isUnitOpen, onOpen: onUnitOpen, onClose: onUnitClose } = useDisclosure();
  
  // Form states
  const [companyForm, setCompanyForm] = useState<Partial<CompanyInfo>>({});
  const [brandingForm, setBrandingForm] = useState<Partial<BrandingSettings>>({});
  const [unitForm, setUnitForm] = useState<Partial<OrganizationalUnit>>({
    name: '',
    type: 'department',
    active: true,
    memberCount: 0,
  });
  
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadOrganizationalData();
  }, []);

  const loadOrganizationalData = async () => {
    try {
      setIsLoading(true);
      const systemSettings = await settingsService.getSystemSettings();
      
      // Map system settings company to CompanyInfo interface
      const companyInfoData: CompanyInfo = {
        name: systemSettings.company.name,
        logo: systemSettings.company.logo,
        address: systemSettings.company.address,
        phone: systemSettings.company.phone,
        email: systemSettings.company.email,
        website: systemSettings.company.website,
        description: systemSettings.company.description,
        industry: systemSettings.company.industry,
        founded: systemSettings.company.founded,
        employees: systemSettings.company.employees,
        revenue: systemSettings.company.revenue,
      };
      
      setCompanyInfo(companyInfoData);
      setBranding({
        primaryColor: systemSettings.branding.primaryColor,
        secondaryColor: systemSettings.branding.secondaryColor,
        customCss: systemSettings.branding.customCss,
        fontFamily: systemSettings.branding.fontFamily,
        slogan: systemSettings.branding.slogan,
        mission: systemSettings.branding.mission,
        vision: systemSettings.branding.vision,
      });
      setCompanyForm(companyInfoData);
      setBrandingForm(systemSettings.branding);
      
      // Mock organizational units data
      setOrganizationalUnits([
        {
          id: '1',
          name: 'Acquisition',
          type: 'department',
          description: 'Property acquisition and sourcing',
          active: true,
          memberCount: 8,
        },
        {
          id: '2',
          name: 'Sales',
          type: 'department',
          description: 'Sales and customer relations',
          active: true,
          memberCount: 12,
        },
        {
          id: '3',
          name: 'Operations',
          type: 'department',
          description: 'Day-to-day operations management',
          active: true,
          memberCount: 15,
        },
        {
          id: '4',
          name: 'Finance',
          type: 'department',
          description: 'Financial planning and management',
          active: true,
          memberCount: 6,
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Failed to load organizational data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySave = async () => {
    try {
      setIsSaving(true);
      
      // Get current system settings to preserve other fields
      const currentSettings = await settingsService.getSystemSettings();
      
      // Merge company form data with existing company data
      const updatedCompanyData = {
        name: companyForm.name || companyInfo?.name || currentSettings.company.name || '',
        logo: companyForm.logo !== undefined ? companyForm.logo : currentSettings.company.logo,
        address: companyForm.address !== undefined ? companyForm.address : currentSettings.company.address,
        phone: companyForm.phone !== undefined ? companyForm.phone : currentSettings.company.phone,
        email: companyForm.email !== undefined ? companyForm.email : currentSettings.company.email,
        website: companyForm.website !== undefined ? companyForm.website : currentSettings.company.website,
        description: companyForm.description !== undefined ? companyForm.description : currentSettings.company.description,
        industry: companyForm.industry !== undefined ? companyForm.industry : currentSettings.company.industry,
        founded: companyForm.founded !== undefined ? companyForm.founded : currentSettings.company.founded,
        employees: companyForm.employees !== undefined ? companyForm.employees : currentSettings.company.employees,
        revenue: companyForm.revenue !== undefined ? companyForm.revenue : currentSettings.company.revenue,
      };
      
      // Update system settings with merged data, preserving branding and other fields
      const updatedSettings = await settingsService.updateSystemSettings({
        company: updatedCompanyData,
      });
      
      // Update local state with the full company info
      const fullCompanyInfo: CompanyInfo = {
        name: updatedSettings.company.name,
        logo: updatedSettings.company.logo,
        address: updatedSettings.company.address,
        phone: updatedSettings.company.phone,
        email: updatedSettings.company.email,
        website: updatedSettings.company.website,
        description: updatedSettings.company.description,
        industry: updatedSettings.company.industry,
        founded: updatedSettings.company.founded,
        employees: updatedSettings.company.employees,
        revenue: updatedSettings.company.revenue,
      };
      
      setCompanyInfo(fullCompanyInfo);
      setCompanyForm(fullCompanyInfo);
      onCompanyClose();
      toast({
        title: 'Company information updated',
        description: 'Company information has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving company information:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update company information',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrandingSave = async () => {
    try {
      setIsSaving(true);
      
      // Get current system settings to preserve other fields
      const currentSettings = await settingsService.getSystemSettings();
      
      // Merge branding form data with existing branding data
      const updatedBrandingData = {
        primaryColor: brandingForm.primaryColor || branding?.primaryColor || currentSettings.branding.primaryColor,
        secondaryColor: brandingForm.secondaryColor || branding?.secondaryColor || currentSettings.branding.secondaryColor,
        customCss: brandingForm.customCss !== undefined ? brandingForm.customCss : currentSettings.branding.customCss,
        fontFamily: brandingForm.fontFamily !== undefined ? brandingForm.fontFamily : currentSettings.branding.fontFamily,
        slogan: brandingForm.slogan !== undefined ? brandingForm.slogan : currentSettings.branding.slogan,
        mission: brandingForm.mission !== undefined ? brandingForm.mission : currentSettings.branding.mission,
        vision: brandingForm.vision !== undefined ? brandingForm.vision : currentSettings.branding.vision,
      };
      
      // Update system settings with merged data, preserving company and other fields
      const updatedSettings = await settingsService.updateSystemSettings({
        branding: updatedBrandingData,
      });
      
      const fullBrandingData: BrandingSettings = {
        primaryColor: updatedSettings.branding.primaryColor,
        secondaryColor: updatedSettings.branding.secondaryColor,
        customCss: updatedSettings.branding.customCss,
        fontFamily: updatedSettings.branding.fontFamily,
        slogan: updatedSettings.branding.slogan,
        mission: updatedSettings.branding.mission,
        vision: updatedSettings.branding.vision,
      };
      
      setBranding(fullBrandingData);
      setBrandingForm(fullBrandingData);
      onBrandingClose();
      toast({
        title: 'Branding updated',
        description: 'Branding settings have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving branding information:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update branding settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnitSave = async () => {
    try {
      setIsSaving(true);
      if (isEditing && selectedUnit) {
        // Update existing unit
        const updatedUnits = organizationalUnits.map(unit =>
          unit.id === selectedUnit.id ? { ...unit, ...unitForm } : unit
        );
        setOrganizationalUnits(updatedUnits);
      } else {
        // Create new unit
        const newUnit: OrganizationalUnit = {
          id: Date.now().toString(),
          ...unitForm as OrganizationalUnit,
        };
        setOrganizationalUnits([...organizationalUnits, newUnit]);
      }
      
      onUnitClose();
      resetUnitForm();
      toast({
        title: isEditing ? 'Unit updated' : 'Unit created',
        description: `Organizational unit has been ${isEditing ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Operation failed',
        description: `Failed to ${isEditing ? 'update' : 'create'} organizational unit`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetUnitForm = () => {
    setUnitForm({
      name: '',
      type: 'department',
      active: true,
      memberCount: 0,
    });
    setSelectedUnit(null);
    setIsEditing(false);
  };

  const openEditUnit = (unit: OrganizationalUnit) => {
    setSelectedUnit(unit);
    setUnitForm(unit);
    setIsEditing(true);
    onUnitOpen();
  };

  const deleteUnit = async (unitId: string) => {
    try {
      const updatedUnits = organizationalUnits.filter(unit => unit.id !== unitId);
      setOrganizationalUnits(updatedUnits);
      toast({
        title: 'Unit deleted',
        description: 'Organizational unit has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete organizational unit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getUnitTypeColor = (type: string) => {
    switch (type) {
      case 'department': return 'blue';
      case 'team': return 'green';
      case 'division': return 'purple';
      case 'location': return 'orange';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading organizational settings...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Organizational Settings
        </Heading>
        <Text color="gray.600">
          Manage company information, branding, and organizational structure
        </Text>
      </Box>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>
            <Icon as={FiHome} mr={2} />
            Company Info
          </Tab>
          <Tab>
            <Icon as={FiGlobe} mr={2} />
            Branding
          </Tab>
          <Tab>
            <Icon as={FiUsers} mr={2} />
            Organization
          </Tab>
        </TabList>

        <TabPanels>
          {/* Company Information Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Company Information</Heading>
                    <Button
                      leftIcon={<FiEdit2 />}
                      variant="outline"
                      size="sm"
                      onClick={onCompanyOpen}
                    >
                      Edit
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Company Name</Text>
                        <Text>{companyInfo?.name || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Industry</Text>
                        <Text>{companyInfo?.industry || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Founded</Text>
                        <Text>{companyInfo?.founded || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Employees</Text>
                        <Text>{companyInfo?.employees || 'Not set'}</Text>
                      </Box>
                    </VStack>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Email</Text>
                        <Text>{companyInfo?.email || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Phone</Text>
                        <Text>{companyInfo?.phone || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Website</Text>
                        <Text>{companyInfo?.website || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Address</Text>
                        <Text>{companyInfo?.address || 'Not set'}</Text>
                      </Box>
                    </VStack>
                  </SimpleGrid>
                  {companyInfo?.description && (
                    <Box mt={6}>
                      <Text fontWeight="medium" color="gray.600" mb={2}>Description</Text>
                      <Text>{companyInfo.description}</Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Branding Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Branding Settings</Heading>
                    <Button
                      leftIcon={<FiEdit2 />}
                      variant="outline"
                      size="sm"
                      onClick={onBrandingOpen}
                    >
                      Edit
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Primary Color</Text>
                        <HStack>
                          <Box
                            w={6}
                            h={6}
                            borderRadius="full"
                            bg={branding?.primaryColor || '#2563eb'}
                            border="2px solid"
                            borderColor="gray.200"
                          />
                          <Text>{branding?.primaryColor || '#2563eb'}</Text>
                        </HStack>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Secondary Color</Text>
                        <HStack>
                          <Box
                            w={6}
                            h={6}
                            borderRadius="full"
                            bg={branding?.secondaryColor || '#1e40af'}
                            border="2px solid"
                            borderColor="gray.200"
                          />
                          <Text>{branding?.secondaryColor || '#1e40af'}</Text>
                        </HStack>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Font Family</Text>
                        <Text>{branding?.fontFamily || 'Inter'}</Text>
                      </Box>
                    </VStack>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Slogan</Text>
                        <Text>{branding?.slogan || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Mission</Text>
                        <Text>{branding?.mission || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color="gray.600">Vision</Text>
                        <Text>{branding?.vision || 'Not set'}</Text>
                      </Box>
                    </VStack>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Organization Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Organizational Structure</Heading>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => {
                        resetUnitForm();
                        onUnitOpen();
                      }}
                    >
                      Add Unit
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {organizationalUnits.map((unit) => (
                      <Box
                        key={unit.id}
                        p={4}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="lg"
                        bg={bgColor}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={2}>
                            <HStack>
                              <Text fontWeight="medium">{unit.name}</Text>
                              <Badge colorScheme={getUnitTypeColor(unit.type)}>
                                {unit.type}
                              </Badge>
                              <Badge colorScheme={unit.active ? 'green' : 'red'}>
                                {unit.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {unit.description || 'No description'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {unit.memberCount} members
                            </Text>
                          </VStack>
                          <HStack>
                            <IconButton
                              aria-label="Edit unit"
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="outline"
                              onClick={() => openEditUnit(unit)}
                            />
                            <IconButton
                              aria-label="Delete unit"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              onClick={() => deleteUnit(unit.id)}
                            />
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Company Information Modal */}
      <Modal isOpen={isCompanyOpen} onClose={onCompanyClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Company Information</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    value={companyForm.name || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Industry</FormLabel>
                  <Input
                    value={companyForm.industry || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={companyForm.email || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={companyForm.phone || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    value={companyForm.website || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Founded</FormLabel>
                  <Input
                    value={companyForm.founded || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, founded: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Employees</FormLabel>
                  <Input
                    type="number"
                    value={companyForm.employees || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, employees: parseInt(e.target.value) || 0 })}
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  value={companyForm.address || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={companyForm.description || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCompanyClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCompanySave}
              isLoading={isSaving}
              leftIcon={<FiSave />}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Branding Modal */}
      <Modal isOpen={isBrandingOpen} onClose={onBrandingClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Branding Settings</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Primary Color</FormLabel>
                  <Input
                    type="color"
                    value={brandingForm.primaryColor || '#2563eb'}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Secondary Color</FormLabel>
                  <Input
                    type="color"
                    value={brandingForm.secondaryColor || '#1e40af'}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Font Family</FormLabel>
                  <Select
                    value={brandingForm.fontFamily || 'Inter'}
                    onChange={(e) => setBrandingForm({ ...brandingForm, fontFamily: e.target.value })}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Slogan</FormLabel>
                <Input
                  value={brandingForm.slogan || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, slogan: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Mission</FormLabel>
                <Textarea
                  value={brandingForm.mission || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, mission: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Vision</FormLabel>
                <Textarea
                  value={brandingForm.vision || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, vision: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onBrandingClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleBrandingSave}
              isLoading={isSaving}
              leftIcon={<FiSave />}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Organizational Unit Modal */}
      <Modal isOpen={isUnitOpen} onClose={onUnitClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Organizational Unit' : 'Add Organizational Unit'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={unitForm.name || ''}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select
                  value={unitForm.type || 'department'}
                  onChange={(e) => setUnitForm({ ...unitForm, type: e.target.value as any })}
                >
                  <option value="department">Department</option>
                  <option value="team">Team</option>
                  <option value="division">Division</option>
                  <option value="location">Location</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={unitForm.description || ''}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Active</FormLabel>
                <Switch
                  isChecked={unitForm.active}
                  onChange={(e) => setUnitForm({ ...unitForm, active: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onUnitClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUnitSave}
              isLoading={isSaving}
              leftIcon={<FiSave />}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default OrganizationalSettings;
