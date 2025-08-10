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
} from '@chakra-ui/react';
import { FiDatabase, FiPlus, FiEdit2, FiTrash2, FiEye, FiSave, FiX, FiSettings } from 'react-icons/fi';

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea';
  entity: 'lead' | 'contact' | 'deal' | 'company';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
  };
  sortOrder: number;
  active: boolean;
  description?: string;
}

const CustomFieldsManagement: React.FC = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Form states
  const [createForm, setCreateForm] = useState<Partial<CustomField>>({
    name: '',
    label: '',
    type: 'text',
    entity: 'lead',
    required: false,
    active: true,
    sortOrder: 0,
  });
  
  const [editForm, setEditForm] = useState<CustomField | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<CustomField | null>(null);
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      setIsLoading(true);
      // This would call the settings service
      // const fields = await settingsService.getCustomFields();
      // setCustomFields(fields);
      
      // Mock data for now
      setCustomFields([
        {
          id: '1',
          name: 'property_type',
          label: 'Property Type',
          type: 'select',
          entity: 'lead',
          required: true,
          options: ['Single Family', 'Multi-Family', 'Commercial', 'Land'],
          sortOrder: 1,
          active: true,
        },
        {
          id: '2',
          name: 'budget_range',
          label: 'Budget Range',
          type: 'select',
          entity: 'lead',
          required: false,
          options: ['$100k-$200k', '$200k-$500k', '$500k-$1M', '$1M+'],
          sortOrder: 2,
          active: true,
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading custom fields',
        description: 'Failed to load custom fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateField = async () => {
    try {
      setIsSaving(true);
      // This would call the settings service
      // const newField = await settingsService.createCustomField(createForm);
      // setCustomFields(prev => [...prev, newField]);
      
      // Mock creation for now
      const newField: CustomField = {
        id: Date.now().toString(),
        ...createForm as CustomField,
      };
      setCustomFields(prev => [...prev, newField]);
      
      toast({
        title: 'Custom field created',
        description: 'Custom field has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onCreateClose();
      setCreateForm({
        name: '',
        label: '',
        type: 'text',
        entity: 'lead',
        required: false,
        active: true,
        sortOrder: 0,
      });
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: 'Failed to create custom field',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditField = async () => {
    if (!editForm) return;
    
    try {
      setIsSaving(true);
      // This would call the settings service
      // const updatedField = await settingsService.updateCustomField(editForm.id, editForm);
      // setCustomFields(prev => prev.map(f => f.id === updatedField.id ? updatedField : f));
      
      // Mock update for now
      setCustomFields(prev => prev.map(f => f.id === editForm.id ? editForm : f));
      
      toast({
        title: 'Custom field updated',
        description: 'Custom field has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onEditClose();
      setEditForm(null);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update custom field',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteField = async () => {
    if (!fieldToDelete) return;
    
    try {
      setIsSaving(true);
      // This would call the settings service
      // await settingsService.deleteCustomField(fieldToDelete.id);
      // setCustomFields(prev => prev.filter(f => f.id !== fieldToDelete.id));
      
      // Mock deletion for now
      setCustomFields(prev => prev.filter(f => f.id !== fieldToDelete.id));
      
      toast({
        title: 'Custom field deleted',
        description: 'Custom field has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteClose();
      setFieldToDelete(null);
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: 'Failed to delete custom field',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (field: CustomField) => {
    setEditForm({ ...field });
    onEditOpen();
  };

  const openDeleteModal = (field: CustomField) => {
    setFieldToDelete(field);
    onDeleteOpen();
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Single Select' },
    { value: 'multiselect', label: 'Multi Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'textarea', label: 'Text Area' },
  ];

  const entities = [
    { value: 'lead', label: 'Lead' },
    { value: 'contact', label: 'Contact' },
    { value: 'deal', label: 'Deal' },
    { value: 'company', label: 'Company' },
  ];

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading custom fields...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Custom Fields Management
        </Heading>
        <Text color="gray.600">
          Create and manage custom fields for leads, contacts, deals, and companies
        </Text>
      </Box>

      {/* Create New Field Button */}
      <HStack justify="flex-end">
        <Button
          colorScheme="blue"
          leftIcon={<FiPlus />}
          onClick={onCreateOpen}
        >
          Create Custom Field
        </Button>
      </HStack>

      {/* Custom Fields Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Custom Fields</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Field Name</Th>
                <Th>Label</Th>
                <Th>Type</Th>
                <Th>Entity</Th>
                <Th>Required</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customFields.map((field) => (
                <Tr key={field.id}>
                  <Td>
                    <Text fontWeight="medium">{field.name}</Text>
                    {field.description && (
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {field.description}
                      </Text>
                    )}
                  </Td>
                  <Td>{field.label}</Td>
                  <Td>
                    <Badge colorScheme="blue" variant="subtle">
                      {fieldTypes.find(t => t.value === field.type)?.label}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="green" variant="subtle">
                      {entities.find(e => e.value === field.entity)?.label}
                    </Badge>
                  </Td>
                  <Td>
                    {field.required ? (
                      <Badge colorScheme="red">Required</Badge>
                    ) : (
                      <Badge colorScheme="gray">Optional</Badge>
                    )}
                  </Td>
                  <Td>
                    {field.active ? (
                      <Badge colorScheme="green">Active</Badge>
                    ) : (
                      <Badge colorScheme="gray">Inactive</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Edit field">
                        <IconButton
                          aria-label="Edit field"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(field)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete field">
                        <IconButton
                          aria-label="Delete field"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openDeleteModal(field)}
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

      {/* Create Field Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Custom Field</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Field Name</FormLabel>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., property_type"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Display Label</FormLabel>
                  <Input
                    value={createForm.label}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Property Type"
                  />
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Field Type</FormLabel>
                  <Select
                    value={createForm.type}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    {fieldTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Entity</FormLabel>
                  <Select
                    value={createForm.entity}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, entity: e.target.value as any }))}
                  >
                    {entities.map((entity) => (
                      <option key={entity.value} value={entity.value}>
                        {entity.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              {(createForm.type === 'select' || createForm.type === 'multiselect') && (
                <FormControl>
                  <FormLabel>Options (one per line)</FormLabel>
                  <Textarea
                    value={createForm.options?.join('\n') || ''}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      options: e.target.value.split('\n').filter(opt => opt.trim()) 
                    }))}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                  />
                </FormControl>
              )}
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={createForm.description || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of this field"
                  rows={2}
                />
              </FormControl>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Required Field</FormLabel>
                  <Switch
                    isChecked={createForm.required}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, required: e.target.checked }))}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch
                    isChecked={createForm.active}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, active: e.target.checked }))}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleCreateField}
              isLoading={isSaving}
            >
              Create Field
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Field Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Custom Field</ModalHeader>
          <ModalBody>
            {editForm && (
              <VStack spacing={4}>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Field Name</FormLabel>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="e.g., property_type"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Display Label</FormLabel>
                    <Input
                      value={editForm.label}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, label: e.target.value } : null)}
                      placeholder="e.g., Property Type"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Field Type</FormLabel>
                    <Select
                      value={editForm.type}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Entity</FormLabel>
                    <Select
                      value={editForm.entity}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, entity: e.target.value as any } : null)}
                    >
                      {entities.map((entity) => (
                        <option key={entity.value} value={entity.value}>
                          {entity.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                {(editForm.type === 'select' || editForm.type === 'multiselect') && (
                  <FormControl>
                    <FormLabel>Options (one per line)</FormLabel>
                    <Textarea
                      value={editForm.options?.join('\n') || ''}
                      onChange={(e) => setEditForm(prev => prev ? { 
                        ...prev, 
                        options: e.target.value.split('\n').filter(opt => opt.trim()) 
                      } : null)}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={4}
                    />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Optional description of this field"
                    rows={2}
                  />
                </FormControl>
                
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Required Field</FormLabel>
                    <Switch
                      isChecked={editForm.required}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, required: e.target.checked } : null)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Active</FormLabel>
                    <Switch
                      isChecked={editForm.active}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, active: e.target.checked } : null)}
                    />
                  </FormControl>
                </SimpleGrid>
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
              onClick={handleEditField}
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
          <ModalHeader>Delete Custom Field</ModalHeader>
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Are you sure you want to delete the custom field &quot;{fieldToDelete?.label}&quot;? 
                  This action cannot be undone and may affect existing data.
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
              onClick={handleDeleteField}
              isLoading={isSaving}
            >
              Delete Field
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CustomFieldsManagement;
