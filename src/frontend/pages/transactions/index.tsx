import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Box, HStack, VStack, Heading, Text, Button, Badge, Card } from '@chakra-ui/react';
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


