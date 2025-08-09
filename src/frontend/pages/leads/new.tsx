import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  Heading,
  HStack,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { LeadForm } from '../../features/lead-management/components/LeadForm';
import { Lead } from '../../features/lead-management/types/lead';
import { useLeads } from '../../hooks/services/useLeads';

const NewLeadPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    isAuthenticated,
    user,
    createLead,
  } = useLeads();

  const handleLeadSubmit = async (leadData: Partial<Lead>) => {
    setIsSubmitting(true);
    
    try {
      await createLead(leadData as any);
      
      toast({
        title: 'Lead Created',
        description: 'New lead has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate back to leads list
      router.push('/leads');
    } catch (error) {
      toast({
        title: 'Error Creating Lead',
        description: error instanceof Error ? error.message : 'Failed to create lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      // TODO: Show confirmation dialog
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/leads');
      }
    } else {
      router.push('/leads');
    }
  };

  const handleFormChange = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
              <Alert status="warning">
                <AlertIcon />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Please log in to access lead management features.
                </AlertDescription>
              </Alert>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Box display={{ base: 'block', md: 'flex' }}>
        <Sidebar />
        <Box flex={1}>
          <Navigation />
          <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
            {/* Breadcrumb */}
            <Breadcrumb fontSize="sm" color="gray.600">
              <BreadcrumbItem>
                <BreadcrumbLink href="/leads">Leads</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>New Lead</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Page Header */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                  Create New Lead
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Add a new lead to your pipeline
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                <Button
                  leftIcon={<FiX />}
                  variant="outline"
                  onClick={handleCancel}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="blue"
                  onClick={() => {
                    // This will be handled by the form's submit button
                    document.getElementById('lead-form-submit')?.click();
                  }}
                  isLoading={isSubmitting}
                  loadingText="Creating..."
                >
                  Create Lead
                </Button>
              </HStack>
            </HStack>

            {/* Lead Form */}
            <Box bg="white" borderRadius="lg" p={6} shadow="sm">
              <LeadForm
                isOpen={true}
                onClose={handleLeadFormCancel}
                onSubmit={handleLeadSubmit}
                mode="create"
              />
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default NewLeadPage;
