import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
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
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { Lead } from '../types/lead';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Lead>) => void;
  lead?: Lead;
  mode: 'create' | 'edit';
  initialStageId?: string | null;
}

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyType: string;
  estimatedValue: number;
  propertyAddress?: string;
  status: string;
  priority: number;
  assignedAgent?: string;
  notes?: string;
}

const defaultValues: LeadFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  propertyType: 'single_family',
  estimatedValue: 0,
  propertyAddress: '',
  status: 'new',
  priority: 5,
  assignedAgent: '',
  notes: '',
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
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed', label: 'Closed' },
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

export const LeadForm: React.FC<LeadFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lead,
  mode,
  initialStageId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<LeadFormData>({
    defaultValues: lead ? {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      propertyType: lead.propertyType,
      estimatedValue: lead.estimatedValue || 0,
      propertyAddress: lead.propertyAddress || '',
      status: lead.status,
      priority: lead.priority || 'medium',
      assignedTo: lead.assignedTo || '',
      notes: lead.notes || '',
    } : {
      ...defaultValues,
      status: initialStageId ? 'new' : 'new',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isOpen) {
      reset(lead ? {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        propertyType: lead.propertyType,
        estimatedValue: lead.estimatedValue || 0,
        propertyAddress: lead.propertyAddress || '',
        status: lead.status,
        priority: lead.priority || 'medium',
        assignedTo: lead.assignedTo || '',
        notes: lead.notes || '',
      } : {
        ...defaultValues,
        status: initialStageId ? 'new' : 'new',
      });
    }
  }, [isOpen, lead, initialStageId, reset]);

  const onSubmitForm = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const leadData: Partial<Lead> = {
        ...data,
        propertyType: data.propertyType as PropertyType,
        createdAt: lead?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await onSubmit(leadData);
      
      toast({
        title: mode === 'create' ? 'Lead Created' : 'Lead Updated',
        description: mode === 'create' 
          ? 'New lead has been added successfully' 
          : 'Lead has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: mode === 'create' 
          ? 'Failed to create lead. Please try again.' 
          : 'Failed to update lead. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>
          {mode === 'create' ? 'Add New Lead' : 'Edit Lead'}
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: 'First name is required' }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.firstName}>
                        <FormLabel>First Name</FormLabel>
                        <Input {...field} placeholder="Enter first name" />
                        <FormErrorMessage>
                          {errors.firstName?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>

                <GridItem>
                  <Controller
                    name="lastName"
                    control={control}
                    rules={{ required: 'Last name is required' }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.lastName}>
                        <FormLabel>Last Name</FormLabel>
                        <Input {...field} placeholder="Enter last name" />
                        <FormErrorMessage>
                          {errors.lastName?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>

              {/* Contact Information */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel>Email</FormLabel>
                        <Input {...field} type="email" placeholder="Enter email address" />
                        <FormErrorMessage>
                          {errors.email?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>

                <GridItem>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: 'Phone number is required' }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.phone}>
                        <FormLabel>Phone</FormLabel>
                        <Input {...field} placeholder="Enter phone number" />
                        <FormErrorMessage>
                          {errors.phone?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>

              {/* Property Information */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="propertyType"
                    control={control}
                    rules={{ required: 'Property type is required' }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.propertyType}>
                        <FormLabel>Property Type</FormLabel>
                        <Select {...field}>
                          {propertyTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>
                          {errors.propertyType?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>

                <GridItem>
                  <Controller
                    name="estimatedValue"
                    control={control}
                    rules={{ required: 'Estimated value is required', min: { value: 0, message: 'Value must be positive' } }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.estimatedValue}>
                        <FormLabel>Estimated Value</FormLabel>
                        <NumberInput min={0} {...field}>
                          <NumberInputField placeholder="Enter estimated value" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <FormErrorMessage>
                          {errors.estimatedValue?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>

              {/* Property Address */}
              <Controller
                name="propertyAddress"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>Property Address</FormLabel>
                    <Input {...field} placeholder="Enter property address (optional)" />
                  </FormControl>
                )}
              />

              {/* Lead Management */}
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: 'Status is required' }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.status}>
                        <FormLabel>Status</FormLabel>
                        <Select {...field}>
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>
                          {errors.status?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>

                <GridItem>
                  <Controller
                    name="priority"
                    control={control}
                    rules={{ required: 'Priority is required' }}
                    render={({ field }) => (
                      <FormControl isInvalid={!!errors.priority}>
                        <FormLabel>Priority</FormLabel>
                        <Select {...field}>
                          {priorityOptions.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>
                          {errors.priority?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  />
                </GridItem>

                <GridItem>
                  <Controller
                    name="assignedAgent"
                    control={control}
                    render={({ field }) => (
                      <FormControl>
                        <FormLabel>Assigned Agent</FormLabel>
                        <Input {...field} placeholder="Enter assigned agent (optional)" />
                      </FormControl>
                    )}
                  />
                </GridItem>
              </Grid>

              {/* Notes */}
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Enter additional notes (optional)"
                      rows={4}
                    />
                  </FormControl>
                )}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}
                isDisabled={!isValid}
              >
                {mode === 'create' ? 'Create Lead' : 'Update Lead'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
