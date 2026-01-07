import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Select,
  Card,
  CardBody,
  Badge,
  Flex,
  Icon,
  useToast,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiMapPin, FiUser, FiCalendar } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { transactionsService, TransactionProperty } from '../../services/transactionsService';

interface StatusColumn {
  id: TransactionProperty['status'];
  label: string;
  color: string;
  count: number;
}

const TransactionStatusBoard: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [transactions, setTransactions] = useState<TransactionProperty[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    address: '',
    city: '',
    seller: '',
    coordinator: '',
  });
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const statusColumns: StatusColumn[] = [
    { id: 'gathering_docs', label: 'Gathering Docs', color: 'red', count: 0 },
    { id: 'gathering_title', label: 'Gathering Title', color: 'blue', count: 0 },
    { id: 'title_issues', label: 'Title Issues', color: 'orange', count: 0 },
    { id: 'client_help_needed', label: 'Client Help', color: 'gray', count: 0 },
    { id: 'on_hold', label: 'On Hold', color: 'orange', count: 0 },
    { id: 'pending_closing', label: 'Pending Closing', color: 'yellow', count: 0 },
    { id: 'ready_to_close', label: 'Ready to Close', color: 'purple', count: 0 },
    // Closed status removed - closed transactions are hidden from the board
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filters]);

  const loadTransactions = async () => {
    const data = await transactionsService.list();
    setTransactions(data);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Exclude closed transactions from the board
    filtered = filtered.filter(tx => tx.status !== 'closed');

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.coordinatorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specific filters
    if (filters.address) {
      filtered = filtered.filter(tx =>
        tx.address.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    if (filters.city) {
      filtered = filtered.filter(tx =>
        tx.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    if (filters.seller) {
      filtered = filtered.filter(tx =>
        tx.sellerName?.toLowerCase().includes(filters.seller.toLowerCase())
      );
    }
    if (filters.coordinator) {
      filtered = filtered.filter(tx =>
        tx.coordinatorName?.toLowerCase().includes(filters.coordinator.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionsByStatus = (status: TransactionProperty['status']) => {
    return filteredTransactions.filter(tx => tx.status === status);
  };

  const handleStatusUpdate = async (transactionId: string, newStatus: TransactionProperty['status']) => {
    try {
      await transactionsService.updateStatus(transactionId, newStatus);
      await loadTransactions();
      toast({
        title: 'Status updated',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error updating status',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, txId: string) => {
    e.dataTransfer.setData('text/plain', txId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're leaving the column entirely (not just moving to a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const txId = e.dataTransfer.getData('text/plain');
    if (!txId) return;
    await handleStatusUpdate(txId, columnId as TransactionProperty['status']);
  };

  const TransactionCard: React.FC<{ transaction: TransactionProperty }> = ({ transaction }) => (
    <Card
      size="sm"
      cursor="grab"
      _hover={{ shadow: 'md' }}
      onClick={() => router.push(`/transactions/${transaction.id}`)}
      draggable
      onDragStart={(e) => onDragStart(e, transaction.id)}
      transition="all 0.2s ease"
      _active={{ 
        cursor: 'grabbing',
        transform: 'rotate(2deg)',
        shadow: 'lg'
      }}
    >
      <CardBody p={2}>
        <VStack align="stretch" spacing={1}>
          <Text fontWeight="bold" fontSize="xs" color="blue.600">
            {transaction.id.toUpperCase()}
          </Text>
          <Text fontWeight="semibold" fontSize="xs" noOfLines={2}>
            {transaction.address}
          </Text>
          <HStack spacing={1} fontSize="xs" color="gray.600">
            <Icon as={FiMapPin} />
            <Text noOfLines={1}>{transaction.city}, {transaction.state}</Text>
          </HStack>
          <Box>
            <Text fontSize="xs" color="gray.500">Seller</Text>
            <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{transaction.sellerName || 'N/A'}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500">Coordinator</Text>
            <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{transaction.coordinatorName || 'Unassigned'}</Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );

  const StatusColumn: React.FC<{ column: StatusColumn }> = ({ column }) => {
    const columnTransactions = getTransactionsByStatus(column.id);
    const updatedColumn = { ...column, count: columnTransactions.length };
    const isDragOver = dragOverColumn === column.id;

    return (
      <VStack 
        align="stretch" 
        spacing={2} 
        h="full"
        onDragOver={(e) => onDragOver(e, column.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, column.id)}
        transition="all 0.2s ease"
        transform={isDragOver ? "scale(1.02)" : "scale(1)"}
        opacity={isDragOver ? 0.9 : 1}
      >
        <HStack spacing={2} justify="center">
          <Box w={2} h={2} borderRadius="full" bg={`${column.color}.500`} />
          <Text fontWeight="semibold" fontSize="xs" textAlign="center" noOfLines={2}>
            {column.label}
          </Text>
          {updatedColumn.count > 0 && (
            <Badge colorScheme={column.color} size="sm" fontSize="xs">
              {updatedColumn.count}
            </Badge>
          )}
        </HStack>
        <VStack 
          align="stretch" 
          spacing={2} 
          minH="300px" 
          p={1} 
          borderRadius="md" 
          border="2px dashed" 
          borderColor={isDragOver ? `${column.color}.400` : "gray.200"}
          bg={isDragOver ? `${column.color}.50` : "gray.50"}
          transition="all 0.2s ease"
          position="relative"
        >
          {columnTransactions.map(transaction => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
          {columnTransactions.length === 0 && (
            <Box
              border="2px dashed"
              borderColor={isDragOver ? `${column.color}.300` : "gray.200"}
              borderRadius="md"
              p={2}
              textAlign="center"
              minH="100px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={isDragOver ? `${column.color}.25` : "transparent"}
              transition="all 0.2s ease"
            >
              <Text 
                fontSize="xs" 
                color={isDragOver ? `${column.color}.600` : "gray.500"}
                fontWeight={isDragOver ? "semibold" : "normal"}
              >
                {isDragOver ? "Drop here" : "No transactions"}
              </Text>
            </Box>
          )}
        </VStack>
      </VStack>
    );
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
            <Box bg="gray.800" color="white" p={4} borderRadius="md">
              <Heading size="lg" textAlign="center">File Status</Heading>
            </Box>

            {/* Main Content */}
            <VStack align="stretch" spacing={6}>
              <HStack justify="space-between" flexWrap="wrap" gap={4}>
                <Heading size="md" color="gray.800">File Status Board</Heading>
                <HStack spacing={3} flexWrap="wrap">
                  <InputGroup maxW="250px">
                    <InputLeftElement>
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search"
                      size="sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  <Button
                    colorScheme="red"
                    size="sm"
                    leftIcon={<Icon as={FiPlus} />}
                    onClick={() => router.push('/transactions/new')}
                  >
                    Add New
                  </Button>
                </HStack>
              </HStack>

              {/* Filters */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <Select
                  placeholder="Address"
                  size="sm"
                  value={filters.address}
                  onChange={(e) => setFilters(prev => ({ ...prev, address: e.target.value }))}
                >
                  <option value="">All Addresses</option>
                  {Array.from(new Set(transactions.map(t => t.address))).map(addr => (
                    <option key={addr} value={addr}>{addr}</option>
                  ))}
                </Select>
                <Select
                  placeholder="City, State"
                  size="sm"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                >
                  <option value="">All Cities</option>
                  {Array.from(new Set(transactions.map(t => `${t.city}, ${t.state}`))).map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </Select>
                <Select
                  placeholder="Seller"
                  size="sm"
                  value={filters.seller}
                  onChange={(e) => setFilters(prev => ({ ...prev, seller: e.target.value }))}
                >
                  <option value="">All Sellers</option>
                  {Array.from(new Set(transactions.map(t => t.sellerName).filter(Boolean))).map(seller => (
                    <option key={seller} value={seller}>{seller}</option>
                  ))}
                </Select>
                <Select
                  placeholder="Coordinator"
                  size="sm"
                  value={filters.coordinator}
                  onChange={(e) => setFilters(prev => ({ ...prev, coordinator: e.target.value }))}
                >
                  <option value="">All Coordinators</option>
                  {Array.from(new Set(transactions.map(t => t.coordinatorName).filter(Boolean))).map(coord => (
                    <option key={coord} value={coord}>{coord}</option>
                  ))}
                </Select>
              </SimpleGrid>

              {/* Kanban Board */}
              <Grid 
                templateColumns={{
                  base: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(8, 1fr)"
                }}
                gap={4}
                w="full"
              >
                {statusColumns.map(column => (
                  <GridItem key={column.id}>
                    <StatusColumn column={column} />
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default TransactionStatusBoard;
