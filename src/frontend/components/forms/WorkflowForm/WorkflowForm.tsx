import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, VStack, FormControl, FormLabel, FormErrorMessage, Input, Textarea, Select, Button, useToast, Switch } from '@chakra-ui/react';

const workflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().min(1, 'Description is required'),
  triggerType: z.enum(['manual', 'automatic', 'scheduled']),
  triggerCondition: z.string().min(1, 'Trigger condition is required'),
  actions: z.array(z.object({
    type: z.enum(['email', 'sms', 'notification', 'status_change']),
    config: z.record(z.any()),
  })).min(1, 'At least one action is required'),
  isActive: z.boolean().default(true),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowFormProps {
  onSubmit: (data: WorkflowFormData) => void;
  initialData?: Partial<WorkflowFormData>;
  isLoading?: boolean;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ onSubmit, initialData, isLoading = false }) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      isActive: true,
      priority: 'medium',
      actions: [],
      ...initialData,
    },
  });

  const onFormSubmit = async (data: WorkflowFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Workflow saved successfully',
        status: 'success',
        duration: 3000,
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error saving workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Workflow Name</FormLabel>
          <Input {...register('name')} />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea {...register('description')} />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.triggerType}>
          <FormLabel>Trigger Type</FormLabel>
          <Select {...register('triggerType')}>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="scheduled">Scheduled</option>
          </Select>
          <FormErrorMessage>{errors.triggerType?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.triggerCondition}>
          <FormLabel>Trigger Condition</FormLabel>
          <Textarea {...register('triggerCondition')} placeholder="e.g., Lead status changes to 'Contacted'" />
          <FormErrorMessage>{errors.triggerCondition?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.priority}>
          <FormLabel>Priority</FormLabel>
          <Select {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Active</FormLabel>
          <Switch {...register('isActive')} />
        </FormControl>

        <Button type="submit" colorScheme="primary" isLoading={isLoading}>
          Save Workflow
        </Button>
      </VStack>
    </Box>
  );
};

export default WorkflowForm; 