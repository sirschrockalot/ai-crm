import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, VStack, FormControl, FormLabel, FormErrorMessage, Input, Textarea, Select, Button, useToast } from '@chakra-ui/react';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  propertyType: z.enum(['single_family', 'multi_family', 'commercial', 'land']),
  estimatedValue: z.number().min(0, 'Estimated value must be positive'),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  initialData?: Partial<LeadFormData>;
  isLoading?: boolean;
  hideSubmitButton?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading = false, 
  hideSubmitButton = false,
  formRef
}) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData,
  });

  const onFormSubmit = async (data: LeadFormData) => {
    try {
      await onSubmit(data);
      if (!hideSubmitButton) {
        toast({
          title: 'Lead saved successfully',
          status: 'success',
          duration: 3000,
        });
        reset();
      }
    } catch (error) {
      toast({
        title: 'Error saving lead',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
      throw error; // Re-throw so parent can handle it
    }
  };

  return (
    <Box as="form" ref={formRef} onSubmit={handleSubmit(onFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.firstName}>
          <FormLabel>First Name</FormLabel>
          <Input {...register('firstName')} />
          <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.lastName}>
          <FormLabel>Last Name</FormLabel>
          <Input {...register('lastName')} />
          <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input type="email" {...register('email')} />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.phone}>
          <FormLabel>Phone</FormLabel>
          <Input type="tel" {...register('phone')} />
          <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.address}>
          <FormLabel>Address</FormLabel>
          <Input {...register('address')} />
          <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.city}>
          <FormLabel>City</FormLabel>
          <Input {...register('city')} />
          <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.state}>
          <FormLabel>State</FormLabel>
          <Input {...register('state')} maxLength={2} />
          <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.zipCode}>
          <FormLabel>ZIP Code</FormLabel>
          <Input {...register('zipCode')} />
          <FormErrorMessage>{errors.zipCode?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.propertyType}>
          <FormLabel>Property Type</FormLabel>
          <Select {...register('propertyType')}>
            <option value="single_family">Single Family</option>
            <option value="multi_family">Multi Family</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
          </Select>
          <FormErrorMessage>{errors.propertyType?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.estimatedValue}>
          <FormLabel>Estimated Value</FormLabel>
          <Input type="number" {...register('estimatedValue', { valueAsNumber: true })} />
          <FormErrorMessage>{errors.estimatedValue?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.notes}>
          <FormLabel>Notes</FormLabel>
          <Textarea {...register('notes')} />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        {hideSubmitButton ? (
          <Button type="submit" colorScheme="primary" isLoading={isLoading} display="none">
            Save Lead
          </Button>
        ) : (
          <Button type="submit" colorScheme="primary" isLoading={isLoading}>
            Save Lead
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default LeadForm; 