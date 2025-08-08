import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, VStack, FormControl, FormLabel, FormErrorMessage, Input, Textarea, Select, Button, useToast, Checkbox } from '@chakra-ui/react';

const buyerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  buyerType: z.enum(['individual', 'company', 'investor']),
  investmentRange: z.enum(['0-50k', '50k-100k', '100k-250k', '250k-500k', '500k+']),
  preferredPropertyTypes: z.array(z.string()).min(1, 'At least one property type must be selected'),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BuyerFormData = z.infer<typeof buyerSchema>;

interface BuyerFormProps {
  onSubmit: (data: BuyerFormData) => void;
  initialData?: Partial<BuyerFormData>;
  isLoading?: boolean;
}

const BuyerForm: React.FC<BuyerFormProps> = ({ onSubmit, initialData, isLoading = false }) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      isActive: true,
      preferredPropertyTypes: [],
      ...initialData,
    },
  });

  const onFormSubmit = async (data: BuyerFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Buyer saved successfully',
        status: 'success',
        duration: 3000,
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error saving buyer',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.companyName}>
          <FormLabel>Company Name</FormLabel>
          <Input {...register('companyName')} />
          <FormErrorMessage>{errors.companyName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.contactName}>
          <FormLabel>Contact Name</FormLabel>
          <Input {...register('contactName')} />
          <FormErrorMessage>{errors.contactName?.message}</FormErrorMessage>
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

        <FormControl isInvalid={!!errors.buyerType}>
          <FormLabel>Buyer Type</FormLabel>
          <Select {...register('buyerType')}>
            <option value="individual">Individual</option>
            <option value="company">Company</option>
            <option value="investor">Investor</option>
          </Select>
          <FormErrorMessage>{errors.buyerType?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.investmentRange}>
          <FormLabel>Investment Range</FormLabel>
          <Select {...register('investmentRange')}>
            <option value="0-50k">$0 - $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="100k-250k">$100,000 - $250,000</option>
            <option value="250k-500k">$250,000 - $500,000</option>
            <option value="500k+">$500,000+</option>
          </Select>
          <FormErrorMessage>{errors.investmentRange?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.preferredPropertyTypes}>
          <FormLabel>Preferred Property Types</FormLabel>
          <VStack align="start" spacing={2}>
            <Checkbox value="single_family" {...register('preferredPropertyTypes')}>
              Single Family
            </Checkbox>
            <Checkbox value="multi_family" {...register('preferredPropertyTypes')}>
              Multi Family
            </Checkbox>
            <Checkbox value="commercial" {...register('preferredPropertyTypes')}>
              Commercial
            </Checkbox>
            <Checkbox value="land" {...register('preferredPropertyTypes')}>
              Land
            </Checkbox>
          </VStack>
          <FormErrorMessage>{errors.preferredPropertyTypes?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.notes}>
          <FormLabel>Notes</FormLabel>
          <Textarea {...register('notes')} />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <Checkbox {...register('isActive')}>Active Buyer</Checkbox>
        </FormControl>

        <Button type="submit" colorScheme="primary" isLoading={isLoading}>
          Save Buyer
        </Button>
      </VStack>
    </Box>
  );
};

export default BuyerForm; 