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
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSave, 
  FiTag,
  FiList,
  FiCheckSquare,
  FiCalendar,
  FiHash,
  FiType,
} from 'react-icons/fi';
import { settingsService } from '../../services/settingsService';

interface CustomField {
  id: string;
  name: string;
  label: string;
  entityType: 'lead' | 'buyer' | 'property' | 'deal' | 'communication' | 'user';
  fieldType: 'text' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'url' | 'currency' | 'percentage' | 'file';
  required: boolean;
  unique: boolean;
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
  visible: boolean;
  editable: boolean;
  defaultValue?: any;
  options?: string[];
  displayOrder: number;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
}

const CustomFieldConfiguration: React.FC = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { isOpen: isFieldOpen, onOpen: onFieldOpen, onClose: onFieldClose } = useDisclosure();
  
  const [fieldForm, setFieldForm] = useState<Partial<CustomField>>({
    name: '',
    label: '',
    entityType: 'lead',
    fieldType: 'text',
    required: false,
    unique: false,
    searchable: true,
    filterable: true,
    sortable: true,
    visible: true,
    editable: true,
    displayOrder: 0,
    status: 'draft',
  });
  
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<'lead' | 'buyer' | 'property' | 'deal' | 'communication' | 'user'>('lead');
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      setCustomFields([
        {
          id: '1',
          name: 'source_channel',
          label: 'Source Channel',
          entityType: 'lead',
          fieldType: 'select',
          required: true,
          unique: false,
          searchable: true,
          filterable: true,
          sortable: true,
          visible: true,
          editable: true,
          options: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Direct Mail'],
          defaultValue: 'Website',
          displayOrder: 1,
          description: 'How the lead was acquired',
          status: 'active',
        },
        {
          id: '2',
          name: 'budget_range',
          label: 'Budget Range',
          entityType: 'buyer',
          fieldType: 'select',
          required: false,
          unique: false,
          searchable: true,
          filterable: true,
          sortable: true,
          visible: true,
          editable: true,
          options: ['$0-$50k', '$50k-$100k', '$100k-$250k', '$250k-$500k', '$500k+'],
          displayOrder: 2,
          description: 'Buyer\'s budget range for properties',
          status: 'active',
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading custom fields',
        description: 'Failed to load custom field configuration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldSave = async () => {
    try {
      setIsSaving(true);
      
      if (selectedField) {
        const updatedFields = customFields.map(field =>
          field.id === selectedField.id
            ? { ...field, ...fieldForm }
            : field
        );
        setCustomFields(updatedFields);
      } else {
        const newField: CustomField = {
          id: Date.now().toString(),
          ...fieldForm as CustomField,
        };
        setCustomFields([...customFields, newField]);
      }
      
      onFieldClose();
      resetFieldForm();
      
      toast({
        title: 'Custom Field Saved',
        description: 'Custom field configuration has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving custom field',
        description: 'Failed to save custom field configuration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteField = async (fieldId: string) => {
    try {
      const updatedFields = customFields.filter(field => field.id !== fieldId);
      setCustomFields(updatedFields);
      
      toast({
        title: 'Custom Field Deleted',
        description: 'Custom field has been removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting custom field',
        description: 'Failed to delete custom field',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetFieldForm = () => {
    setFieldForm({
      name: '',
      label: '',
      entityType: 'lead',
      fieldType: 'text',
      required: false,
      unique: false,
      searchable: true,
      filterable: true,
      sortable: true,
      visible: true,
      editable: true,
      displayOrder: 0,
      status: 'draft',
    });
    setSelectedField(null);
  };

  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return <FiType />;
      case 'number': return <FiHash />;
      case 'select': return <FiList />;
      case 'boolean': return <FiCheckSquare />;
      case 'date': return <FiCalendar />;
      default: return <FiTag />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'draft': return 'yellow';
      default: return 'gray';
    }
  };

  const filteredFields = customFields.filter(field => field.entityType === selectedEntityType);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading custom field configuration...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Custom Field Configuration
        </Heading>
        <Text color="gray.600">
          Manage custom fields for leads, buyers, properties, deals, and communications
        </Text>
      </Box>

      <HStack justify="space-between">
        <Select
          value={selectedEntityType}
          onChange={(e) => setSelectedEntityType(e.target.value as any)}
          width="200px"
        >
          <option value="lead">Leads</option>
          <option value="buyer">Buyers</option>
          <option value="property">Properties</option>
          <option value="deal">Deals</option>
          <option value="communication">Communications</option>
          <option value="user">Users</option>
        </Select>
        <Button
          colorScheme="blue"
          leftIcon={<FiPlus />}
          onClick={() => {
            resetFieldForm();
            setFieldForm(prev => ({ ...prev, entityType: selectedEntityType }));
            onFieldOpen();
          }}
        >
          Add Custom Field
        </Button>
      </HStack>

      <Card bg={bgColor} shadow="sm">
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Field</Th>
                <Th>Type</Th>
                <Th>Properties</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFields.map((field) => (
                <Tr key={field.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{field.label}</Text>
                      <Text fontSize="sm" color="gray.500" fontFamily="mono">
                        {field.name}
                      </Text>
                      {field.description && (
                        <Text fontSize="sm" color="gray.600">
                          {field.description}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <HStack>
                      {getFieldTypeIcon(field.fieldType)}
                      <Badge colorScheme="blue" variant="outline">
                        {field.fieldType}
                      </Badge>
                    </HStack>
                  </Td>
                  <Td>
                    <Wrap spacing={1}>
                      {field.required && (
                        <Badge size="sm" colorScheme="red">Required</Badge>
                      )}
                      {field.unique && (
                        <Badge size="sm" colorScheme="purple">Unique</Badge>
                      )}
                      {field.searchable && (
                        <Badge size="sm" colorScheme="green">Searchable</Badge>
                      )}
                      {field.filterable && (
                        <Badge size="sm" colorScheme="blue">Filterable</Badge>
                      )}
                    </Wrap>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(field.status)}>
                      {field.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit field"
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedField(field);
                          setFieldForm(field);
                          onFieldOpen();
                        }}
                      />
                      <IconButton
                        aria-label="Delete field"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => deleteField(field.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isFieldOpen} onClose={onFieldClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedField ? 'Edit Custom Field' : 'Create Custom Field'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Field Name</FormLabel>
                  <Input
                    value={fieldForm.name}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., source_channel"
                    fontFamily="mono"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Display Label</FormLabel>
                  <Input
                    value={fieldForm.label}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Source Channel"
                  />
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Entity Type</FormLabel>
                  <Select
                    value={fieldForm.entityType}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, entityType: e.target.value as any }))}
                  >
                    <option value="lead">Lead</option>
                    <option value="buyer">Buyer</option>
                    <option value="property">Property</option>
                    <option value="deal">Deal</option>
                    <option value="communication">Communication</option>
                    <option value="user">User</option>
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Field Type</FormLabel>
                  <Select
                    value={fieldForm.fieldType}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, fieldType: e.target.value as any }))}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="date">Date</option>
                    <option value="datetime">Date & Time</option>
                    <option value="boolean">Boolean</option>
                    <option value="select">Single Select</option>
                    <option value="multiselect">Multi Select</option>
                    <option value="textarea">Text Area</option>
                    <option value="url">URL</option>
                    <option value="currency">Currency</option>
                    <option value="percentage">Percentage</option>
                    <option value="file">File</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              {(fieldForm.fieldType === 'select' || fieldForm.fieldType === 'multiselect') && (
                <FormControl>
                  <FormLabel>Options</FormLabel>
                  <Textarea
                    value={fieldForm.options?.join('\n') || ''}
                    onChange={(e) => setFieldForm(prev => ({ 
                      ...prev, 
                      options: e.target.value.split('\n').filter(Boolean) 
                    }))}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                  />
                </FormControl>
              )}
              
              <SimpleGrid columns={2} spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="required" mb="0">
                    Required
                  </FormLabel>
                  <Switch
                    id="required"
                    isChecked={fieldForm.required}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, required: e.target.checked }))}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="unique" mb="0">
                    Unique
                  </FormLabel>
                  <Switch
                    id="unique"
                    isChecked={fieldForm.unique}
                    onChange={(e) => setFieldForm(prev => ({ ...prev, unique: e.target.checked }))}
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={fieldForm.description || ''}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this field"
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFieldClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleFieldSave} isLoading={isSaving}>
              {selectedField ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default CustomFieldConfiguration;
