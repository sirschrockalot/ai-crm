import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormErrorMessage,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiBuilding, FiBriefcase } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { titleCompanyService, TitleCompany } from '../../services/titleCompanyService';

const TitleCompaniesPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [titleCompanies, setTitleCompanies] = useState<TitleCompany[]>([]);
  const [closingAttorneys, setClosingAttorneys] = useState<TitleCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Form states
  const [formData, setFormData] = useState<Partial<TitleCompany>>({
    name: '',
    email: '',
    phone: '',
    officeAddress: '',
    type: 'title_company',
    notes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const titleCompaniesData = await titleCompanyService.getByType('title_company');
      const closingAttorneysData = await titleCompanyService.getByType('closing_attorney');
      setTitleCompanies(titleCompaniesData);
      setClosingAttorneys(closingAttorneysData);
    } catch (error: any) {
      console.error('Error loading title companies:', error);
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load title companies and closing attorneys',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone is required';
    }
    if (!formData.officeAddress?.trim()) {
      errors.officeAddress = 'Office address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const type = activeTab === 0 ? 'title_company' : 'closing_attorney';
      const newCompany = await titleCompanyService.create({
        ...formData,
        type,
      } as Omit<TitleCompany, 'id' | 'createdAt' | 'updatedAt'>);

      if (type === 'title_company') {
        setTitleCompanies(prev => [...prev, newCompany]);
      } else {
        setClosingAttorneys(prev => [...prev, newCompany]);
      }

      toast({
        title: 'Success',
        description: `${type === 'title_company' ? 'Title company' : 'Closing attorney'} created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      resetForm();
      onCreateClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async () => {
    if (!editingId || !validateForm()) return;

    try {
      const updated = await titleCompanyService.update(editingId, formData);
      
      if (updated.type === 'title_company') {
        setTitleCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        setClosingAttorneys(prev => prev.map(c => c.id === updated.id ? updated : c));
      }

      toast({
        title: 'Success',
        description: 'Updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      resetForm();
      onEditClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await titleCompanyService.delete(deletingId);
      
      setTitleCompanies(prev => prev.filter(c => c.id !== deletingId));
      setClosingAttorneys(prev => prev.filter(c => c.id !== deletingId));

      toast({
        title: 'Success',
        description: 'Deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setDeletingId(null);
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openEditModal = (company: TitleCompany) => {
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone,
      officeAddress: company.officeAddress,
      type: company.type,
      notes: company.notes || '',
    });
    setEditingId(company.id || company._id || null);
    onEditOpen();
  };

  const openDeleteModal = (id: string) => {
    setDeletingId(id);
    onDeleteOpen();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      officeAddress: '',
      type: activeTab === 0 ? 'title_company' : 'closing_attorney',
      notes: '',
    });
    setEditingId(null);
    setFormErrors({});
  };

  const handleCreateOpen = () => {
    resetForm();
    onCreateOpen();
  };

  const renderTable = (companies: TitleCompany[]) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Phone</Th>
          <Th>Office Address</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {isLoadingData ? (
          <Tr>
            <Td colSpan={5} textAlign="center" py={8}>
              <Text color="gray.500">Loading...</Text>
            </Td>
          </Tr>
        ) : companies.length === 0 ? (
          <Tr>
            <Td colSpan={5} textAlign="center" py={8}>
              <Text color="gray.500">No {activeTab === 0 ? 'title companies' : 'closing attorneys'} found</Text>
            </Td>
          </Tr>
        ) : (
          companies.map((company) => (
            <Tr key={company.id || company._id}>
              <Td fontWeight="medium">{company.name}</Td>
              <Td>{company.email}</Td>
              <Td>{company.phone}</Td>
              <Td>{company.officeAddress}</Td>
              <Td>
                <HStack spacing={2}>
                  <Tooltip label="Edit">
                    <IconButton
                      aria-label="Edit"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(company)}
                    />
                  </Tooltip>
                  <Tooltip label="Delete">
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => openDeleteModal(company.id || company._id || '')}
                    />
                  </Tooltip>
                </HStack>
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  onClick={() => router.push('/transactions')}
                >
                  Back to Transactions
                </Button>
                <Divider orientation="vertical" h={6} />
                <VStack align="start" spacing={1}>
                  <Heading size="lg">Title Companies & Closing Attorneys</Heading>
                  <Text color="gray.600">Manage title companies and closing attorneys for transactions</Text>
                </VStack>
              </HStack>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleCreateOpen}
              >
                Add New
              </Button>
            </HStack>

            {/* Tabs */}
            <Card bg={cardBg}>
              <CardBody>
                <Tabs index={activeTab} onChange={setActiveTab}>
                  <TabList>
                    <Tab>
                      <HStack spacing={2}>
                        <Icon as={FiBuilding} />
                        <Text>Title Companies</Text>
                        <Badge>{titleCompanies.length}</Badge>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <Icon as={FiBriefcase} />
                        <Text>Closing Attorneys</Text>
                        <Badge>{closingAttorneys.length}</Badge>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      {renderTable(titleCompanies)}
                    </TabPanel>
                    <TabPanel>
                      {renderTable(closingAttorneys)}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>

      {/* Create/Edit Modal */}
      <Modal isOpen={isCreateOpen || isEditOpen} onClose={() => {
        onCreateClose();
        onEditClose();
        resetForm();
      }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingId ? 'Edit' : 'Add New'} {activeTab === 0 ? 'Title Company' : 'Closing Attorney'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!formErrors.name}>
                <FormLabel>Name *</FormLabel>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Company or Attorney Name"
                />
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.email}>
                <FormLabel>Email *</FormLabel>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.phone}>
                <FormLabel>Phone *</FormLabel>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
                <FormErrorMessage>{formErrors.phone}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.officeAddress}>
                <FormLabel>Office Address *</FormLabel>
                <Textarea
                  value={formData.officeAddress || ''}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  placeholder="Street Address, City, State ZIP"
                  rows={3}
                />
                <FormErrorMessage>{formErrors.officeAddress}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => {
              onCreateClose();
              onEditClose();
              resetForm();
            }}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={editingId ? handleEdit : handleCreate}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to delete this {activeTab === 0 ? 'title company' : 'closing attorney'}? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TitleCompaniesPage;

