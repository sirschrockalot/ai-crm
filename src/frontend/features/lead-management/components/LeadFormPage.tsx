import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Textarea,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  useColorModeValue,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Heading,
  Text,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lead } from '../types/lead';
import { FileUpload, UploadedFile } from '../../../components/ui/FileUpload';
import { PropertyDatabaseIntegration, PropertyRecord } from '../../../components/ui/PropertyDatabaseIntegration';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { FiSearch, FiSave } from 'react-icons/fi';
import { useLeads } from '../hooks/useLeads';
import { useRouter } from 'next/navigation';

// Zod validation schema for lead form
const leadFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  propertyType: z.enum(['single_family', 'multi_family', 'commercial', 'land'], {
    required_error: 'Property type is required'
  }),
  estimatedValue: z.number().min(0, 'Estimated value must be positive'),
  propertyAddress: z.string().default(''),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost'], {
    required_error: 'Status is required'
  }),
  assignedTo: z.string().default(''),
  notes: z.string().default(''),
  source: z.string().default('website'),
  company: z.string().default(''),
  score: z.number().min(0).max(100).optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

// Type for backend CreateLeadDto


interface LeadFormPageProps {
  onSubmit?: (data: LeadFormData) => void;
  lead?: Lead;
  mode: 'create' | 'edit';
  initialStageId?: string | null;
  onCancel?: () => void;
}

const defaultValues: LeadFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  propertyType: 'single_family',
  estimatedValue: 0,
  propertyAddress: '',
  status: 'new',
  assignedTo: '',
  notes: '',
  source: 'website',
  company: '',
  score: undefined,
};

const propertyTypes = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'multi_family', label: 'Multi Family' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const priorityOptions = [
  { value: 1, label: '1 - Low' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5 - Medium' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10 - High' },
];

export const LeadFormPage: React.FC<LeadFormPageProps> = ({ lead, mode = 'create', onSubmit: onSubmitProp, onCancel }) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const router = useRouter();
  const { createLead } = useLeads();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(null);
  const [showPropertySearch, setShowPropertySearch] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const formData = watch();

  // Auto-save functionality
  const { isSaving, lastSaved, saveNow } = useAutoSave({
    data: defaultValues,
    onSave: async (data) => {
      // Auto-save logic here - save to localStorage for now
      const currentFormData = watch();
      // Create a complete data object with all required fields
      const dataToSave: LeadFormData = {
        ...defaultValues,
        ...currentFormData,
        // Ensure required fields are always present
        firstName: currentFormData.firstName || defaultValues.firstName,
        lastName: currentFormData.lastName || defaultValues.lastName,
        email: currentFormData.email || defaultValues.email,
        phone: currentFormData.phone || defaultValues.phone,
        address: currentFormData.address || defaultValues.address,
        city: currentFormData.city || defaultValues.city,
        state: currentFormData.state || defaultValues.state,
        zipCode: currentFormData.zipCode || defaultValues.zipCode,
        propertyType: currentFormData.propertyType || defaultValues.propertyType,
        estimatedValue: currentFormData.estimatedValue || defaultValues.estimatedValue,
        status: currentFormData.status || defaultValues.status,
      };
      localStorage.setItem('lead-draft', JSON.stringify(dataToSave));
      console.log('Auto-saving form data:', dataToSave);
    },
    autoSaveInterval: 30000, // 30 seconds
    enabled: mode === 'create',
    debounceDelay: 2000, // 2 seconds
  });

  // Load draft from localStorage on component mount
  useEffect(() => {
    if (mode === 'create') {
      const savedDraft = localStorage.getItem('lead-draft');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          reset(draftData);
          toast({
            title: 'Draft Loaded',
            description: 'Your previous draft has been loaded',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      }
    }
  }, [mode, reset, toast]);

  // Handle property selection from database
  const handlePropertySelect = (property: PropertyRecord) => {
    setSelectedProperty(property);
    setShowPropertySearch(false);
    
    // Auto-fill form fields with property data
    setValue('propertyType', property.propertyType.toLowerCase().replace(' ', '_') as any);
    setValue('estimatedValue', property.estimatedValue);
    setValue('propertyAddress', `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`);
    

    
    toast({
      title: 'Property Selected',
      description: `Property details have been auto-filled`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleManualEntry = () => {
    setShowPropertySearch(false);
    setSelectedProperty(null);
  };

  // Form submission handler
  const handleFormSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);
      
      if (onSubmitProp) {
        // For onSubmitProp, we need to pass the original form data
        await onSubmitProp(data);
      } else {
        // For direct submission, use the form data directly
        await createLead(data);
        
        toast({
          title: 'Lead Created',
          description: 'New lead has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Clear draft and redirect
        localStorage.removeItem('lead-draft');
        reset();
        setSelectedProperty(null);
        setUploadedFiles([]);
        router.push('/leads');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg={bgColor} borderRadius="lg" p={6} shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="flex-start">
            <Box>
              <Heading size="lg" mb={2}>
                {mode === 'create' ? 'Create New Lead' : 'Edit Lead'}
              </Heading>
              <Text color="gray.600" fontSize="sm">
                {mode === 'create' 
                  ? 'Fill out the form below to create a new lead.' 
                  : 'Update the lead information below.'}
              </Text>
            </Box>
            
            {mode === 'create' && (
              <VStack align="flex-end" spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPropertySearch(!showPropertySearch)}
                  leftIcon={<FiSearch />}
                >
                  {showPropertySearch ? 'Hide' : 'Search'} Property Database
                </Button>
                
                {isSaving && (
                  <Text fontSize="xs" color="blue.500">
                    Saving draft...
                  </Text>
                )}
                {lastSaved && (
                  <Text fontSize="xs" color="green.500">
                    Draft saved {lastSaved.toLocaleTimeString()}
                  </Text>
                )}
              </VStack>
            )}
          </HStack>
        </Box>

        <Divider />

        {/* Property Database Integration */}
        {showPropertySearch && mode === 'create' && (
          <Box>
            <Box
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.600"
              zIndex={1000}
              onClick={() => setShowPropertySearch(false)}
            />
            <Box
              position="fixed"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              borderRadius="lg"
              p={6}
              zIndex={1001}
              maxW="800px"
              w="90%"
              maxH="80vh"
              overflow="auto"
            >
              <PropertyDatabaseIntegration
                onPropertySelect={handlePropertySelect}
                onManualEntry={handleManualEntry}
                required={false}
              />
            </Box>
          </Box>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <VStack spacing={6} align="stretch">
            {/* Personal Information */}
            <Box>
              <Heading size="md" mb={4}>Personal Information</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.firstName}>
                        <FormLabel>First Name *</FormLabel>
                        <Input {...field} placeholder="Enter first name" />
                        <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.lastName}>
                        <FormLabel>Last Name *</FormLabel>
                        <Input {...field} placeholder="Enter last name" />
                        <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>
            </Box>

            {/* Contact Information */}
            <Box>
              <Heading size="md" mb={4}>Contact Information</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel>Email *</FormLabel>
                        <Input {...field} type="email" placeholder="Enter email address" />
                        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.phone}>
                        <FormLabel>Phone *</FormLabel>
                        <Input {...field} placeholder="Enter phone number" />
                        <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>
            </Box>

            {/* Address Information */}
            <Box>
              <Heading size="md" mb={4}>Address Information</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.address}>
                        <FormLabel>Address *</FormLabel>
                        <Input {...field} placeholder="Enter street address" />
                        <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.city}>
                        <FormLabel>City *</FormLabel>
                        <Input {...field} placeholder="Enter city" />
                        <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.state}>
                        <FormLabel>State *</FormLabel>
                        <Input {...field} placeholder="Enter state (e.g., TX)" maxLength={2} />
                        <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="zipCode"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.zipCode}>
                        <FormLabel>ZIP Code *</FormLabel>
                        <Input {...field} placeholder="Enter ZIP code" />
                        <FormErrorMessage>{errors.zipCode?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>
            </Box>

            {/* Property Information */}
            <Box>
              <Heading size="md" mb={4}>Property Information</Heading>
              
              {/* Selected Property Details */}
              {selectedProperty && (
                <Box mb={4} p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold" color="blue.700">
                      Property Details from Database
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedProperty(null)}
                      colorScheme="blue"
                    >
                      Clear
                    </Button>
                  </HStack>
                  <Grid templateColumns="repeat(3, 1fr)" gap={4} fontSize="sm">
                    <Text><strong>Address:</strong> {selectedProperty.address}</Text>
                    <Text><strong>Type:</strong> {selectedProperty.propertyType}</Text>
                    <Text><strong>Value:</strong> ${selectedProperty.estimatedValue.toLocaleString()}</Text>
                    <Text><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</Text>
                    <Text><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</Text>
                    <Text><strong>Square Feet:</strong> {selectedProperty.squareFeet.toLocaleString()}</Text>
                    <Text><strong>Year Built:</strong> {selectedProperty.yearBuilt}</Text>
                    <Text><strong>Lot Size:</strong> {selectedProperty.lotSize.toLocaleString()} sq ft</Text>
                    <Text><strong>Property Tax:</strong> ${selectedProperty.propertyTax.toLocaleString()}</Text>
                  </Grid>
                </Box>
              )}
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="propertyType"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.propertyType}>
                        <FormLabel>Property Type *</FormLabel>
                        <Select {...field}>
                          {propertyTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.propertyType?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="estimatedValue"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.estimatedValue}>
                        <FormLabel>Estimated Value *</FormLabel>
                        <NumberInput min={0} {...field}>
                          <NumberInputField placeholder="Enter estimated value" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <FormErrorMessage>{errors.estimatedValue?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>
              <Box mt={4}>
                <Controller
                  name="propertyAddress"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel>Property Address</FormLabel>
                      <Textarea {...field} placeholder="Enter property address" rows={3} />
                    </FormControl>
                  )}
                />
              </Box>
            </Box>

            {/* Lead Details */}
            <Box>
              <Heading size="md" mb={4}>Lead Details</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.status}>
                        <FormLabel>Status *</FormLabel>
                        <Select {...field}>
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="score"
                    control={control}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.score}>
                        <FormLabel>Lead Score</FormLabel>
                        <NumberInput min={0} max={100} {...field}>
                          <NumberInputField placeholder="Enter lead score (0-100)" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <FormErrorMessage>{errors.score?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>
              <Box mt={4}>
                <Controller
                  name="assignedTo"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel>Assigned To</FormLabel>
                      <Input {...field} placeholder="Enter assigned agent name" />
                    </FormControl>
                  )}
                />
              </Box>
            </Box>

            {/* Additional Information */}
            <Box>
              <Heading size="md" mb={4}>Additional Information</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel>Lead Source</FormLabel>
                        <Input {...field} placeholder="Enter lead source" />
                      </FormControl>
                    )}
                  />
                </GridItem>
                <GridItem>
                  <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel>Company</FormLabel>
                        <Input {...field} placeholder="Enter company name" />
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>
            </Box>

            {/* Notes */}
            <Box>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea {...field} placeholder="Enter any additional notes" rows={4} />
                  </FormControl>
                )}
              />
            </Box>

            {/* Attachments */}
            <Box>
              <FormControl>
                <FormLabel>Attachments</FormLabel>
                <FormHelperText>
                  Upload photos, documents, or other files related to this lead
                </FormHelperText>
                <FileUpload
                  onFilesChange={setUploadedFiles}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  multiple={true}
                  maxSize={10 * 1024 * 1024} // 10MB
                  maxFiles={10}
                />
              </FormControl>
            </Box>

            {/* Action Buttons */}
            <HStack spacing={4} justify="flex-end" pt={4}>
              {mode === 'create' && (
                <Button
                  variant="ghost"
                  onClick={saveNow}
                  isLoading={isSaving}
                  leftIcon={<FiSave />}
                >
                  Save Draft
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCancel || (() => router.push('/leads'))}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText="Creating..."
              >
                {mode === 'create' ? 'Create Lead' : 'Update Lead'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};
