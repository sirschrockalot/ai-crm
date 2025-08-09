import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, VStack, HStack, Heading, Text, useToast, Badge, Button, Card, Tabs, TabList, TabPanels, Tab, TabPanel, Avatar, Divider } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { useBuyers } from '../../hooks/services/useBuyers';
import { Buyer, BuyerType } from '../../types';

const BuyerDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentBuyer, loading, error, fetchBuyer } = useBuyers();
  const toast = useToast();

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchBuyer(id);
    }
  }, [id, fetchBuyer]);

  const getBuyerTypeColor = (type: BuyerType) => {
    switch (type) {
      case 'individual': return 'blue';
      case 'company': return 'green';
      case 'investor': return 'purple';
      default: return 'gray';
    }
  };

  const getInvestmentRangeColor = (range: string) => {
    switch (range) {
      case '0-50k': return 'gray';
      case '50k-100k': return 'blue';
      case '100k-250k': return 'green';
      case '250k-500k': return 'yellow';
      case '500k+': return 'purple';
      default: return 'gray';
    }
  };

  const formatInvestmentRange = (range: string) => {
    switch (range) {
      case '0-50k': return '$0 - $50K';
      case '50k-100k': return '$50K - $100K';
      case '100k-250k': return '$100K - $250K';
      case '250k-500k': return '$250K - $500K';
      case '500k+': return '$500K+';
      default: return range;
    }
  };

  const handleEdit = () => {
    router.push(`/buyers/${id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this buyer?')) {
      // TODO: Implement delete functionality
      toast({
        title: 'Buyer deleted successfully',
        status: 'success',
        duration: 3000,
      });
      router.push('/buyers');
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
                <Heading size="lg">Buyer Details</Heading>
                <Text color="gray.600">Manage buyer information and preferences</Text>
              </VStack>
              <HStack spacing={3}>
                <Button variant="outline" onClick={() => router.push('/buyers')}>
                  Back to Buyers
                </Button>
                <Button variant="primary" onClick={handleEdit}>
                  Edit Buyer
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete Buyer
                </Button>
              </HStack>
            </HStack>

            {/* Buyer Overview */}
            <Card>
              <HStack spacing={6} align="start">
                <Avatar size="xl" name={currentBuyer.contactName} bg="blue.500" />
                <VStack align="start" spacing={4} flex={1}>
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{currentBuyer.companyName}</Heading>
                    <Text color="gray.600">{currentBuyer.contactName}</Text>
                  </VStack>
                  
                  <HStack spacing={4} wrap="wrap">
                    <Badge colorScheme={getBuyerTypeColor(currentBuyer.buyerType)}>
                      {currentBuyer.buyerType}
                    </Badge>
                    <Badge colorScheme={getInvestmentRangeColor(currentBuyer.investmentRange)}>
                      {formatInvestmentRange(currentBuyer.investmentRange)}
                    </Badge>
                    <Badge colorScheme={currentBuyer.isActive ? 'green' : 'red'}>
                      {currentBuyer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>

                  <VStack align="start" spacing={2}>
                    <Text><strong>Email:</strong> {currentBuyer.email}</Text>
                    <Text><strong>Phone:</strong> {currentBuyer.phone}</Text>
                    <Text><strong>Address:</strong> {currentBuyer.address}, {currentBuyer.city}, {currentBuyer.state} {currentBuyer.zipCode}</Text>
                  </VStack>
                </VStack>
              </HStack>
            </Card>

            {/* Tabs */}
            <Card>
              <Tabs>
                <TabList>
                  <Tab>Preferences</Tab>
                  <Tab>Communication History</Tab>
                  <Tab>Deal History</Tab>
                  <Tab>Notes</Tab>
                </TabList>

                <TabPanels>
                  {/* Preferences Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Property Preferences</Heading>
                      <HStack spacing={2} wrap="wrap">
                        {currentBuyer.preferredPropertyTypes.map((type) => (
                          <Badge key={type} colorScheme="blue">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </HStack>
                      
                      <Divider />
                      
                      <Heading size="sm">Investment Details</Heading>
                      <Text><strong>Investment Range:</strong> {formatInvestmentRange(currentBuyer.investmentRange)}</Text>
                      <Text><strong>Buyer Type:</strong> {currentBuyer.buyerType}</Text>
                    </VStack>
                  </TabPanel>

                  {/* Communication History Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Recent Communications</Heading>
                      <Text color="gray.600">No communication history available</Text>
                      <Button variant="outline" size="sm">
                        View All Communications
                      </Button>
                    </VStack>
                  </TabPanel>

                  {/* Deal History Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Deal History</Heading>
                      <Text color="gray.600">No deals found for this buyer</Text>
                      <Button variant="outline" size="sm">
                        View All Deals
                      </Button>
                    </VStack>
                  </TabPanel>

                  {/* Notes Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Notes</Heading>
                      {currentBuyer.notes ? (
                        <Text>{currentBuyer.notes}</Text>
                      ) : (
                        <Text color="gray.600">No notes available</Text>
                      )}
                      <Button variant="outline" size="sm">
                        Add Note
                      </Button>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default BuyerDetailPage;
