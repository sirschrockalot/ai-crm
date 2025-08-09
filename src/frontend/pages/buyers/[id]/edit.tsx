import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, VStack, HStack, Heading, Text, useToast } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { Card } from '../../../components/ui';
import { BuyerForm } from '../../../components/forms';
import { useBuyers } from '../../../hooks/services/useBuyers';

const EditBuyerPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentBuyer, loading, error, fetchBuyer, updateBuyer } = useBuyers();
  const toast = useToast();

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchBuyer(id);
    }
  }, [id, fetchBuyer]);

  const handleUpdateBuyer = async (data: any) => {
    if (!id || typeof id !== 'string') return;
    
    try {
      await updateBuyer(id, data);
      toast({
        title: 'Buyer updated successfully',
        status: 'success',
        duration: 3000,
      });
      router.push(`/buyers/${id}`);
    } catch (error) {
      toast({
        title: 'Error updating buyer',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text>Loading buyer details...</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (error || !currentBuyer) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text color="red.500">Error loading buyer: {error}</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

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
              <VStack align="start" spacing={2}>
                <Heading size="lg">Edit Buyer</Heading>
                <Text color="gray.600">Update buyer information and preferences</Text>
              </VStack>
            </HStack>

            {/* Form */}
            <Card>
              <VStack align="stretch" spacing={6}>
                <Heading size="md">Buyer Information</Heading>
                <BuyerForm
                  onSubmit={handleUpdateBuyer}
                  initialData={currentBuyer}
                  isLoading={loading}
                />
              </VStack>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default EditBuyerPage;
