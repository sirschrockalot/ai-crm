import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  leadId: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  leadId,
}) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !dueAt) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both title and due date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (!bypassAuth) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/tasks/lead/${leadId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          dueAt: new Date(dueAt).toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Task created',
          description: 'Task has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setTitle('');
        setDueAt('');
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create task');
      }
    } catch (error: any) {
      toast({
        title: 'Error creating task',
        description: error.message || 'Failed to create task',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Task Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Due Date</FormLabel>
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<FiPlus />}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!title.trim() || !dueAt}
          >
            Create Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
