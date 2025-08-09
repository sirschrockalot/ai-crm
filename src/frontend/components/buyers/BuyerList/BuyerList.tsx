import React, { useState, useMemo } from 'react';
import { Box, VStack, HStack, Text, Badge, Button, Input, Select, Checkbox } from '@chakra-ui/react';
import { Table } from '../../ui';
import { Buyer, BuyerType } from '../../../types';

interface BuyerListProps {
  buyers: Buyer[];
  loading?: boolean;
  onEdit?: (buyer: Buyer) => void;
  onView?: (buyer: Buyer) => void;
  onDelete?: (buyerId: string) => void;
  onToggleStatus?: (buyerId: string) => void;
  onSelect?: (buyerIds: string[]) => void;
  selectedBuyers?: string[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

const BuyerList: React.FC<BuyerListProps> = ({
  buyers,
  loading = false,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  onSelect,
  selectedBuyers = [],
  sortable = true,
  filterable = true,
  pagination = true,
  pageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerTypeFilter, setBuyerTypeFilter] = useState<BuyerType | 'all'>('all');
  const [investmentRangeFilter, setInvestmentRangeFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<boolean | 'all'>('all');

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

  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
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
  }, [buyers, searchTerm, buyerTypeFilter, investmentRangeFilter, activeFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelect?.(filteredBuyers.map(b => b.id));
    } else {
      onSelect?.([]);
    }
  };

  const handleSelectBuyer = (buyerId: string, checked: boolean) => {
    if (checked) {
      onSelect?.([...selectedBuyers, buyerId]);
    } else {
      onSelect?.(selectedBuyers.filter(id => id !== buyerId));
    }
  };

  const columns = [
    ...(onSelect ? [{
      key: 'select',
      header: (
        <Checkbox
          isChecked={selectedBuyers.length === filteredBuyers.length && filteredBuyers.length > 0}
          isIndeterminate={selectedBuyers.length > 0 && selectedBuyers.length < filteredBuyers.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      accessor: (buyer: Buyer) => (
        <Checkbox
          isChecked={selectedBuyers.includes(buyer.id)}
          onChange={(e) => handleSelectBuyer(buyer.id, e.target.checked)}
        />
      ),
    }] : []),
    {
      key: 'companyName',
      header: 'Company',
      accessor: (buyer: Buyer) => buyer.companyName,
    },
    {
      key: 'contactName',
      header: 'Contact',
      accessor: (buyer: Buyer) => buyer.contactName,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (buyer: Buyer) => buyer.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: (buyer: Buyer) => buyer.phone,
    },
    {
      key: 'buyerType',
      header: 'Type',
      accessor: (buyer: Buyer) => (
        <Badge colorScheme={getBuyerTypeColor(buyer.buyerType)}>
          {buyer.buyerType}
        </Badge>
      ),
    },
    {
      key: 'investmentRange',
      header: 'Investment Range',
      accessor: (buyer: Buyer) => (
        <Badge colorScheme={getInvestmentRangeColor(buyer.investmentRange)}>
          {formatInvestmentRange(buyer.investmentRange)}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      accessor: (buyer: Buyer) => (
        <Badge colorScheme={buyer.isActive ? 'green' : 'red'}>
          {buyer.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (buyer: Buyer) => (
        <HStack spacing={2}>
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(buyer)}
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(buyer)}
            >
              Edit
            </Button>
          )}
          {onToggleStatus && (
            <Button
              size="sm"
              variant={buyer.isActive ? 'danger' : 'primary'}
              onClick={() => onToggleStatus(buyer.id)}
            >
              {buyer.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(buyer.id)}
            >
              Delete
            </Button>
          )}
        </HStack>
      ),
    },
  ];

  return (
    <VStack align="stretch" spacing={4}>
      {/* Filters */}
      {filterable && (
        <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="semibold">Filters</Text>
            <HStack spacing={4} wrap="wrap">
              <Box flex={1} minW="200px">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>Search</Text>
                <Input
                  placeholder="Search buyers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
              <Box minW="150px">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>Type</Text>
                <Select
                  value={buyerTypeFilter}
                  onChange={(e) => setBuyerTypeFilter(e.target.value as BuyerType | 'all')}
                >
                  <option value="all">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="investor">Investor</option>
                </Select>
              </Box>
              <Box minW="180px">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>Investment Range</Text>
                <Select
                  value={investmentRangeFilter}
                  onChange={(e) => setInvestmentRangeFilter(e.target.value)}
                >
                  <option value="all">All Ranges</option>
                  <option value="0-50k">$0 - $50K</option>
                  <option value="50k-100k">$50K - $100K</option>
                  <option value="100k-250k">$100K - $250K</option>
                  <option value="250k-500k">$250K - $500K</option>
                  <option value="500k+">$500K+</option>
                </Select>
              </Box>
              <Box minW="120px">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>Status</Text>
                <Select
                  value={activeFilter === 'all' ? 'all' : activeFilter.toString()}
                  onChange={(e) => setActiveFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
                >
                  <option value="all">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </Box>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Table */}
      <Table
        data={filteredBuyers}
        columns={columns}
        sortable={sortable}
        pagination={pagination}
        pageSize={pageSize}
        loading={loading}
      />
    </VStack>
  );
};

export default BuyerList;
