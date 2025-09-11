import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, HStack, VStack, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, Card } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { transactionsService, TransactionProperty } from '../../services/transactionsService';

const TransactionsListPage: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<TransactionProperty[]>([]);

  useEffect(() => {
    transactionsService.list().then(setItems);
  }, []);

  const statusColor = (status: TransactionProperty['status']) => {
    switch (status) {
      case 'gathering_docs': return 'yellow';
      case 'gathering_title': return 'blue';
      case 'pending_closing': return 'purple';
      case 'closed': return 'green';
      case 'cancelled': return 'red';
      case 'holding_for_funding': return 'orange';
      case 'client_help_needed': return 'red';
      case 'on_hold': return 'gray';
      case 'ready_to_close': return 'green';
      default: return 'gray';
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
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="lg">Transactions</Heading>
                <Text color="gray.600">Under-contract properties and closing coordination</Text>
              </VStack>
              <HStack spacing={3}>
                <Button variant="outline" onClick={() => router.push('/transactions/board')}>
                  Status Board
                </Button>
                <Button colorScheme="blue" onClick={() => router.push('/transactions/new')}>Add New</Button>
              </HStack>
            </HStack>

            <Card>
              <Box p={4}>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Status</Th>
                      <Th>Address</Th>
                      <Th>City</Th>
                      <Th>State</Th>
                      <Th>Seller</Th>
                      <Th>Contract Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map(item => (
                      <Tr key={item.id} onClick={() => router.push(`/transactions/${item.id}`)} style={{ cursor: 'pointer' }}>
                        <Td><Badge colorScheme={statusColor(item.status)} textTransform="none">{item.status.replace('_',' ')}</Badge></Td>
                        <Td>{item.address}</Td>
                        <Td>{item.city}</Td>
                        <Td>{item.state}</Td>
                        <Td>{item.sellerName || '-'}</Td>
                        <Td>{new Date(item.contractDate).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                    {items.length === 0 && (
                      <Tr>
                        <Td colSpan={6}>
                          <Text color="gray.600">No transactions yet. Click &quot;Add New&quot; to create one.</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default TransactionsListPage;


