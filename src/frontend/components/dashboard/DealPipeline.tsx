import React, { useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  IconButton,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FaEdit, FaFilter } from 'react-icons/fa';

export interface Deal {
  id: string;
  address: string;
  status: 'new-contract' | 'active-disposition' | 'assigned' | 'closing' | 'closed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  buyer?: string;
  price: number;
  profit: number;
  inspectionEnds?: Date;
  closingDate?: Date;
  lastUpdated: Date;
  assignedTo?: string;
  notes?: string;
}

interface DealPipelineProps {
  deals: Deal[];
  loading?: boolean;
  onDealClick?: (deal: Deal) => void;
  onStatusChange?: (dealId: string, status: Deal['status']) => void;
  onAssignDeal?: (dealId: string, userId: string) => void;
}

// Register AG Grid modules (only on client side since component has SSR disabled)
if (typeof window !== 'undefined') {
  ModuleRegistry.registerModules([AllCommunityModule]);
}

const getStatusColors = (status: Deal['status']) => {
  switch (status) {
    case 'new-contract':
      return { bg: 'blue.100', text: 'blue.800', border: 'blue.200' };
    case 'active-disposition':
      return { bg: 'yellow.100', text: 'yellow.800', border: 'yellow.200' };
    case 'assigned':
      return { bg: 'pink.100', text: 'pink.800', border: 'pink.200' };
    case 'closing':
      return { bg: 'green.100', text: 'green.800', border: 'green.200' };
    case 'closed':
      return { bg: 'green.100', text: 'green.800', border: 'green.200' };
    case 'cancelled':
      return { bg: 'red.100', text: 'red.800', border: 'red.200' };
    default:
      return { bg: 'gray.100', text: 'gray.800', border: 'gray.200' };
  }
};

const getPriorityColors = (priority: Deal['priority']) => {
  switch (priority) {
    case 'high':
      return { bg: 'red.500', text: 'white' };
    case 'medium':
      return { bg: 'orange.500', text: 'white' };
    case 'low':
      return { bg: 'gray.500', text: 'white' };
    default:
      return { bg: 'gray.500', text: 'white' };
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date?: Date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const getTimeRemaining = (date?: Date) => {
  if (!date) return '';
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
};

// Cell renderers
const AddressCellRenderer = (params: ICellRendererParams<Deal>) => {
  const textColor = useColorModeValue('gray.800', 'white');
  return (
    <Box>
      <Text fontWeight="semibold" color={textColor}>
        {params.value}
      </Text>
      {params.data?.notes && (
        <Text fontSize="xs" color="gray.500" noOfLines={1}>
          {params.data.notes}
        </Text>
      )}
    </Box>
  );
};

const StatusCellRenderer = (params: ICellRendererParams<Deal>) => {
  if (!params.value) return null;
  const colors = getStatusColors(params.value);
  const displayText = params.value.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  return (
    <Badge
      size="sm"
      bg={colors.bg}
      color={colors.text}
      border="1px"
      borderColor={colors.border}
    >
      {displayText}
    </Badge>
  );
};

const PriorityCellRenderer = (params: ICellRendererParams<Deal>) => {
  if (!params.value) return null;
  const colors = getPriorityColors(params.value);
  return (
    <Badge size="sm" bg={colors.bg} color={colors.text}>
      {params.value.toUpperCase()}
    </Badge>
  );
};

const CurrencyCellRenderer = (params: ICellRendererParams<Deal>) => {
  return <Text>{formatCurrency(params.value || 0)}</Text>;
};

const InspectionCellRenderer = (params: ICellRendererParams<Deal>) => {
  if (!params.data?.inspectionEnds) return null;
  return (
    <Text fontSize="xs" color="gray.600">
      {getTimeRemaining(params.data.inspectionEnds)}
    </Text>
  );
};

const ClosingCellRenderer = (params: ICellRendererParams<Deal>) => {
  if (!params.data?.closingDate) return null;
  return (
    <Text fontSize="xs" color="gray.600">
      {getTimeRemaining(params.data.closingDate)}
    </Text>
  );
};

const DateCellRenderer = (params: ICellRendererParams<Deal>) => {
  if (!params.value) return null;
  return <Text>{formatDate(params.value)}</Text>;
};

const ActionsCellRenderer = (params: ICellRendererParams<Deal>) => {
  const deal = params.data;
  if (!deal) return null;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
      padding="4px"
    >
      <Tooltip label="Edit deal">
        <IconButton
          aria-label="Edit deal"
          icon={<FaEdit />}
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onClick={() => params.context?.onDealClick?.(deal)}
        />
      </Tooltip>
    </Box>
  );
};

export const DealPipeline: React.FC<DealPipelineProps> = ({
  deals,
  loading = false,
  onDealClick,
  onStatusChange,
  onAssignDeal,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  // Ensure AG Grid modules are registered
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ModuleRegistry.registerModules([AllCommunityModule]);
    }
  }, []);

  // AG Grid column definitions with sorting and filtering enabled
  const columnDefs = useMemo<ColDef<Deal>[]>(() => [
    {
      field: 'address',
      headerName: 'Address',
      sortable: true,
      filter: 'agTextColumnFilter',
      cellRenderer: AddressCellRenderer,
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: 'agTextColumnFilter',
      cellRenderer: StatusCellRenderer,
      width: 150,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      sortable: true,
      filter: 'agTextColumnFilter',
      cellRenderer: PriorityCellRenderer,
      width: 120,
    },
    {
      field: 'buyer',
      headerName: 'Buyer',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
      valueGetter: (params) => params.data?.buyer || '-',
    },
    {
      field: 'price',
      headerName: 'Price',
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellRenderer: CurrencyCellRenderer,
      type: 'numericColumn',
      width: 120,
      valueGetter: (params) => params.data?.price || 0,
    },
    {
      field: 'profit',
      headerName: 'Profit',
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellRenderer: CurrencyCellRenderer,
      type: 'numericColumn',
      width: 120,
      valueGetter: (params) => params.data?.profit || 0,
    },
    {
      headerName: 'Inspection',
      sortable: true,
      filter: 'agDateColumnFilter',
      cellRenderer: InspectionCellRenderer,
      width: 130,
      valueGetter: (params) => params.data?.inspectionEnds,
      comparator: (valueA, valueB) => {
        if (!valueA && !valueB) return 0;
        if (!valueA) return 1;
        if (!valueB) return -1;
        return new Date(valueA).getTime() - new Date(valueB).getTime();
      },
    },
    {
      headerName: 'Closing',
      sortable: true,
      filter: 'agDateColumnFilter',
      cellRenderer: ClosingCellRenderer,
      width: 130,
      valueGetter: (params) => params.data?.closingDate,
      comparator: (valueA, valueB) => {
        if (!valueA && !valueB) return 0;
        if (!valueA) return 1;
        if (!valueB) return -1;
        return new Date(valueA).getTime() - new Date(valueB).getTime();
      },
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
      valueGetter: (params) => params.data?.assignedTo || '-',
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      sortable: true,
      filter: 'agDateColumnFilter',
      cellRenderer: DateCellRenderer,
      width: 130,
      valueGetter: (params) => params.data?.lastUpdated,
    },
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      cellRenderer: ActionsCellRenderer,
      width: 120,
      pinned: 'right',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' },
      headerClass: 'ag-center-header',
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const gridOptions = useMemo(() => ({
    context: {
      onDealClick,
      onStatusChange,
      onAssignDeal,
    },
  }), [onDealClick, onStatusChange, onAssignDeal]);

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text>Loading deals...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack spacing={3}>
          <Icon as={FaFilter} color="blue.500" boxSize={5} />
          <Heading size="md" color={textColor}>
            Deal Pipeline
          </Heading>
        </HStack>

        {/* AG Grid */}
        <Box
          className="ag-theme-alpine"
          style={{
            height: '600px',
            width: '100%',
          }}
        >
          <AgGridReact<Deal>
            rowData={deals}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            theme="legacy"
            animateRows={true}
            rowSelection={{ mode: 'singleRow', enableClickSelection: false }}
            pagination={true}
            paginationPageSize={20}
            domLayout="normal"
          />
        </Box>

        {deals.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No deals available</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
