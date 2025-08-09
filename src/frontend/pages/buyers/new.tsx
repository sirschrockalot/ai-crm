import React from 'react';
import { useRouter } from 'next/router';
import { Box, VStack, HStack, Heading, Text, useToast } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { Card } from '../../components/ui';
import { BuyerForm } from '../../components/forms';
import { useBuyers } from '../../hooks/services/useBuyers';

const NewBuyerPage: React.FC = () => {
  const router = useRouter();
  const { createBuyer, loading } = useBuyers();
  const toast = useToast();

  const handleCreateBuyer = async (data: any) => {
    try {
      await createBuyer(data);
      toast({
        title: 'Buyer created successfully',
        status: 'success',
        duration: 3000,
      });
      router.push('/buyers');
    } catch (error) {
      toast({
        title: 'Error creating buyer',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

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
                <Heading size="lg">Create New Buyer</Heading>
                <Text color="gray.600">Add a new buyer to your database</Text>
              </VStack>
            </HStack>

            {/* Form */}
            <Card>
              <VStack align="stretch" spacing={6}>
                <Heading size="md">Buyer Information</Heading>
                <BuyerForm
                  onSubmit={handleCreateBuyer}
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

export default NewBuyerPage;
