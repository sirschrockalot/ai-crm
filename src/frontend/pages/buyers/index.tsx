import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, VStack, HStack, Heading, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Sidebar, Header, Navigation, SearchBar } from '../../components/layout';
import { Card, Button, Badge, Table, Modal } from '../../components/ui';
import { BuyerForm } from '../../components/forms';
import { BuyerImport, BuyerExport } from '../../components/buyers';
import { useBuyers } from '../../hooks/services/useBuyers';
import { Buyer, BuyerType } from '../../types';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

const BuyersPageContent: React.FC = () => {
  const router = useRouter();
  const { buyers, loading, error, useMockData, fetchBuyers, createBuyer, updateBuyer, deleteBuyer, toggleBuyerStatus } = useBuyers();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerTypeFilter, setBuyerTypeFilter] = useState<BuyerType | 'all'>('all');
  const [investmentRangeFilter, setInvestmentRangeFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<boolean | 'all'>('all');
  const toast = useToast();

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const handleCreateBuyer = async (data: any) => {
    try {
      await createBuyer(data);
      toast({
        title: 'Buyer created successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating buyer',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleUpdateBuyer = async (data: any) => {
    if (!selectedBuyer) return;
    try {
      await updateBuyer(selectedBuyer.id, data);
      toast({
        title: 'Buyer updated successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating buyer',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeleteBuyer = async (id: string) => {
    try {
      await deleteBuyer(id);
      toast({
        title: 'Buyer deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting buyer',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBuyerStatus(id);
      toast({
        title: 'Buyer status updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating buyer status',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const filteredBuyers = buyers.filter(buyer => {
    // Add null checks to prevent runtime errors
    if (!buyer || !buyer.companyName || !buyer.contactName || !buyer.email || !buyer.phone) {
      return false;
    }
    
    const matchesSearch = 
      buyer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone.includes(searchTerm);
    
    const matchesType = buyerTypeFilter === 'all' || buyer.buyerType === buyerTypeFilter;
    const matchesInvestment = investmentRangeFilter === 'all' || buyer.investmentRange === investmentRangeFilter;
    const matchesActive = activeFilter === 'all' || buyer.isActive === activeFilter;
    
    return matchesSearch && matchesType && matchesInvestment && matchesActive;
  });

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

  const columns = [
    {
      key: 'companyName',
      header: 'Company',
      accessor: (buyer: Buyer) => buyer?.companyName || 'N/A',
    },
    {
      key: 'contactName',
      header: 'Contact',
      accessor: (buyer: Buyer) => buyer?.contactName || 'N/A',
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (buyer: Buyer) => buyer?.email || 'N/A',
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: (buyer: Buyer) => buyer?.phone || 'N/A',
    },
    {
      key: 'buyerType',
      header: 'Type',
      accessor: (buyer: Buyer) => (
        <Badge size="sm" colorScheme={getBuyerTypeColor(buyer?.buyerType || 'individual')}>
          {buyer?.buyerType || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'investmentRange',
      header: 'Investment Range',
      accessor: (buyer: Buyer) => (
        <Badge size="sm" colorScheme={getInvestmentRangeColor(buyer?.investmentRange || '0-50k')}>
          {formatInvestmentRange(buyer?.investmentRange || '0-50k')}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      accessor: (buyer: Buyer) => (
        <Badge size="sm" colorScheme={buyer?.isActive ? 'green' : 'red'}>
          {buyer?.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (buyer: Buyer) => (
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => router.push(`/buyers/${buyer?.id || ''}`)}
            isDisabled={!buyer?.id}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => {
              setSelectedBuyer(buyer);
              onOpen();
            }}
            isDisabled={!buyer}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant={buyer?.isActive ? 'danger' : 'primary'}
            colorScheme={buyer?.isActive ? 'red' : 'blue'}
            onClick={() => buyer?.id && handleToggleStatus(buyer.id)}
            isDisabled={!buyer?.id}
          >
            {buyer?.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            colorScheme="red"
            onClick={() => buyer?.id && handleDeleteBuyer(buyer.id)}
            isDisabled={!buyer?.id}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="lg">Buyers Management</Heading>
                <Text color="gray.600">Manage your buyer database and preferences</Text>
                {useMockData && (
                  <Badge colorScheme="yellow" size="sm">
                    Using Mock Data (API Unavailable)
                  </Badge>
                )}
              </VStack>
              <HStack spacing={3}>
                <Button variant="outline" colorScheme="blue" onClick={() => router.push('/buyers/analytics')}>
                  Analytics
                </Button>
                <Button variant="outline" colorScheme="blue" onClick={() => router.push('/buyers/matching')}>
                  Matching
                </Button>
                <Button variant="outline" colorScheme="blue" onClick={() => router.push('/buyers/map')}>
                  Map Search
                </Button>
                <BuyerImport onImportComplete={fetchBuyers} />
                <BuyerExport onExportComplete={fetchBuyers} />
                <Button variant="primary" colorScheme="blue" onClick={onOpen}>
                  Add New Buyer
                </Button>
              </HStack>
            </HStack>

            {/* Filters */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Filters</Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setBuyerTypeFilter('all');
                      setInvestmentRangeFilter('all');
                      setActiveFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </HStack>
                <HStack spacing={4} wrap="wrap">
                  <SearchBar />
                  <select
                    value={buyerTypeFilter}
                    onChange={(e) => setBuyerTypeFilter(e.target.value as BuyerType | 'all')}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="investor">Investor</option>
                  </select>
                  <select
                    value={investmentRangeFilter}
                    onChange={(e) => setInvestmentRangeFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Investment Ranges</option>
                    <option value="0-50k">$0 - $50K</option>
                    <option value="50k-100k">$50K - $100K</option>
                    <option value="100k-250k">$100K - $250K</option>
                    <option value="250k-500k">$250K - $500K</option>
                    <option value="500k+">$500K+</option>
                  </select>
                  <select
                    value={activeFilter === 'all' ? 'all' : activeFilter ? 'true' : 'false'}
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        setActiveFilter('all');
                      } else {
                        setActiveFilter(e.target.value === 'true');
                      }
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </HStack>
              </VStack>
            </Card>

            {/* Stats */}
            <HStack spacing={4}>
              <Card>
                <Text fontSize="sm" color="gray.600">Total Buyers</Text>
                <Text fontSize="2xl" fontWeight="bold">{buyers?.length || 0}</Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Active Buyers</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {buyers?.filter(b => b?.isActive).length || 0}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Individual</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {buyers?.filter(b => b?.buyerType === 'individual').length || 0}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Companies</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {buyers?.filter(b => b?.buyerType === 'company').length || 0}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Investors</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {buyers?.filter(b => b?.buyerType === 'investor').length || 0}
                </Text>
              </Card>
            </HStack>

            {/* Buyers Table */}
            <Card header="Buyers">
              {loading ? (
                <Text>Loading buyers...</Text>
              ) : error ? (
                <Text color="red.500">Error loading buyers: {error}</Text>
              ) : (
                <Table
                  data={filteredBuyers}
                  columns={columns}
                  sortable
                  pagination
                  pageSize={10}
                />
              )}
            </Card>
          </VStack>
        </Box>
      </HStack>

      {/* Buyer Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={selectedBuyer ? 'Edit Buyer' : 'Add New Buyer'}
        size="lg"
      >
        <BuyerForm
          onSubmit={selectedBuyer ? handleUpdateBuyer : handleCreateBuyer}
          initialData={selectedBuyer || undefined}
          isLoading={loading}
        />
      </Modal>
    </Box>
  );
};

const BuyersPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <BuyersPageContent />
    </ErrorBoundary>
  );
};

export default BuyersPage; 