import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Box, HStack, VStack, Heading, Text, Button, Badge, Card, CardBody, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue } from '@chakra-ui/react';
import { FiClock, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { transactionsService, TransactionProperty } from '../../services/transactionsService';
import { ColDef, ICellRendererParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Dynamically import AgGridReact to disable SSR
const AgGridReact = dynamic(() => import('ag-grid-react').then((mod) => mod.AgGridReact), { ssr: false });

// Register AG Grid modules (only on client side)
if (typeof window !== 'undefined') {
  ModuleRegistry.registerModules([AllCommunityModule]);
}

interface TransactionMetrics {
  avgDaysToClose: number;
  monthlyAssignmentFees: number;
  titleIssuesCount: number;
}

const TransactionsListPage: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<TransactionProperty[]>([]);
  const [metrics, setMetrics] = useState<TransactionMetrics>({
    avgDaysToClose: 0,
    monthlyAssignmentFees: 0,
    titleIssuesCount: 0,
  });

  useEffect(() => {
    transactionsService.list().then(setItems);
  }, []);

  // Calculate metrics when items change
  useEffect(() => {
    if (items.length > 0) {
      const calculatedMetrics = calculateMetrics(items);
      setMetrics(calculatedMetrics);
    }
  }, [items]);

  // Calculate metrics from transactions
  const calculateMetrics = (transactions: TransactionProperty[]): TransactionMetrics => {
    // 1. Calculate average days from "gathering_docs" to "closed"
    const closedDeals = transactions.filter(t => t.status === 'closed');
    const daysToClose: number[] = [];
    
    closedDeals.forEach(deal => {
      // Look for status change in activities
      const activities = deal.activities || [];
      let gatheringDocsDate: Date | null = null;
      let closedDate: Date | null = null;
      
      // Find when status changed to gathering_docs and closed
      activities.forEach(activity => {
        const message = activity.message.toLowerCase();
        if (message.includes('gathering docs') || message.includes('status changed to gathering_docs')) {
          gatheringDocsDate = new Date(activity.timestamp);
        }
        if (message.includes('closed') || message.includes('status changed to closed')) {
          closedDate = new Date(activity.timestamp);
        }
      });
      
      // Fallback: use createdAt for gathering_docs date if not found in activities
      if (!gatheringDocsDate) {
        gatheringDocsDate = new Date(deal.createdAt);
      }
      
      // Use updatedAt for closed date if not found in activities
      if (!closedDate) {
        closedDate = new Date(deal.updatedAt);
      }
      
      if (gatheringDocsDate && closedDate) {
        const days = Math.floor((closedDate.getTime() - gatheringDocsDate.getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          daysToClose.push(days);
        }
      }
    });
    
    const avgDaysToClose = daysToClose.length > 0
      ? Math.round(daysToClose.reduce((sum, days) => sum + days, 0) / daysToClose.length)
      : 0;

    // 2. Calculate monthly assignment fees for closed deals
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const closedThisMonth = closedDeals.filter(deal => {
      const closedDate = new Date(deal.updatedAt);
      return closedDate >= startOfMonth && closedDate <= endOfMonth;
    });
    
    let monthlyAssignmentFees = 0;
    const feePattern = /\$[\d,]+|\d+[\d,]*\s*(?:assignment|fee|assignment fee)/gi;
    
    closedThisMonth.forEach(deal => {
      // Check activities for fee mentions
      const activities = deal.activities || [];
      activities.forEach(activity => {
        const message = activity.message;
        const feeMatches = message.match(feePattern);
        if (feeMatches) {
          feeMatches.forEach(match => {
            // Extract number from match
            const numbers = match.match(/[\d,]+/);
            if (numbers) {
              const amount = parseFloat(numbers[0].replace(/,/g, ''));
              if (!isNaN(amount) && amount > 0) {
                monthlyAssignmentFees += amount;
              }
            }
          });
        }
      });
      
      // Check notes for fee mentions
      if (deal.notes) {
        const noteMatches = deal.notes.match(feePattern);
        if (noteMatches) {
          noteMatches.forEach(match => {
            const numbers = match.match(/[\d,]+/);
            if (numbers) {
              const amount = parseFloat(numbers[0].replace(/,/g, ''));
              if (!isNaN(amount) && amount > 0) {
                monthlyAssignmentFees += amount;
              }
            }
          });
        }
      }
    });

    // 3. Count deals with title issues
    const titleIssueKeywords = ['title issue', 'title problem', 'title defect', 'title lien', 'title cloud', 'title exception', 'title problem'];
    const titleIssuesCount = transactions.filter(deal => {
      // Check activities
      const activities = deal.activities || [];
      const hasTitleIssueInActivities = activities.some(activity => {
        const message = activity.message.toLowerCase();
        return titleIssueKeywords.some(keyword => message.includes(keyword));
      });
      
      // Check notes
      const hasTitleIssueInNotes = deal.notes
        ? titleIssueKeywords.some(keyword => deal.notes!.toLowerCase().includes(keyword))
        : false;
      
      return hasTitleIssueInActivities || hasTitleIssueInNotes;
    }).length;

    return {
      avgDaysToClose,
      monthlyAssignmentFees,
      titleIssuesCount,
    };
  };

  const statusColor = (status: TransactionProperty['status']) => {
    switch (status) {
      case 'gathering_docs': return 'yellow';
      case 'gathering_title': return 'blue';
      case 'pending_closing': return 'purple';
      case 'closed': return 'green';
      case 'cancelled': return 'red';
      case 'client_help_needed': return 'red';
      case 'on_hold': return 'gray';
      case 'ready_to_close': return 'green';
      default: return 'gray';
    }
  };

  // Status cell renderer
  const StatusCellRenderer = (params: ICellRendererParams<TransactionProperty>) => {
    if (!params.value) return null;
    const color = statusColor(params.value);
    const displayText = params.value.replace(/_/g, ' ');
    return (
      <Badge colorScheme={color} textTransform="none">
        {displayText}
      </Badge>
    );
  };

  // Date cell renderer
  const DateCellRenderer = (params: ICellRendererParams<TransactionProperty>) => {
    if (!params.value) return null;
    return <Text>{new Date(params.value).toLocaleDateString()}</Text>;
  };

  // Column definitions
  const columnDefs = useMemo<ColDef<TransactionProperty>[]>(() => [
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: 'agTextColumnFilter',
      cellRenderer: StatusCellRenderer,
      width: 180,
    },
    {
      field: 'address',
      headerName: 'Address',
      sortable: true,
      filter: 'agTextColumnFilter',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'city',
      headerName: 'City',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      field: 'state',
      headerName: 'State',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 100,
    },
    {
      field: 'sellerName',
      headerName: 'Seller',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 200,
      valueGetter: (params) => params.data?.sellerName || '-',
    },
    {
      field: 'contractDate',
      headerName: 'Contract Date',
      sortable: true,
      filter: 'agDateColumnFilter',
      cellRenderer: DateCellRenderer,
      width: 150,
      valueGetter: (params) => params.data?.contractDate ? new Date(params.data.contractDate) : null,
      comparator: (valueA, valueB) => {
        if (!valueA && !valueB) return 0;
        if (!valueA) return 1;
        if (!valueB) return -1;
        return new Date(valueA).getTime() - new Date(valueB).getTime();
      },
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const handleRowClick = (event: any) => {
    if (event.data?.id) {
      router.push(`/transactions/${event.data.id}`);
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

            {/* Metrics Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <HStack spacing={3} mb={2}>
                      <Box color="blue.500">
                        <FiClock size={24} />
                      </Box>
                      <StatLabel>Avg Days to Close</StatLabel>
                    </HStack>
                    <StatNumber>{metrics.avgDaysToClose}</StatNumber>
                    <StatHelpText>
                      From "Gather Docs" to "Closed"
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <HStack spacing={3} mb={2}>
                      <Box color="green.500">
                        <FiDollarSign size={24} />
                      </Box>
                      <StatLabel>Monthly Assignment Fees</StatLabel>
                    </HStack>
                    <StatNumber>
                      {metrics.monthlyAssignmentFees > 0
                        ? `$${metrics.monthlyAssignmentFees.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : '$0'}
                    </StatNumber>
                    <StatHelpText>
                      Closed & funded this month
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <HStack spacing={3} mb={2}>
                      <Box color="red.500">
                        <FiAlertTriangle size={24} />
                      </Box>
                      <StatLabel>Title Issues</StatLabel>
                    </HStack>
                    <StatNumber>{metrics.titleIssuesCount}</StatNumber>
                    <StatHelpText>
                      Deals with title problems
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card>
              <Box p={4}>
                <Box
                  className="ag-theme-alpine"
                  style={{
                    height: '600px',
                    width: '100%',
                  }}
                >
                  <AgGridReact<TransactionProperty>
                    rowData={items}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    theme="legacy"
                    animateRows={true}
                    rowSelection={{ mode: 'singleRow', enableClickSelection: false }}
                    onRowClicked={handleRowClick}
                    getRowStyle={(params) => ({
                      cursor: 'pointer',
                    })}
                    pagination={true}
                    paginationPageSize={20}
                    domLayout="normal"
                    noRowsOverlayComponentParams={{
                      message: 'No transactions yet. Click "Add New" to create one.',
                    }}
                  />
                </Box>
              </Box>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default TransactionsListPage;


