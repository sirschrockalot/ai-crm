import React, { useState, useMemo } from 'react';
import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  HStack,
  Text,
  Button,
  Flex,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  selectedRow?: T | null;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  sortable = true,
  pagination = true,
  pageSize = 10,
  onSort,
  onRowClick,
  selectedRow,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection, sortable]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleRowClick = (item: T) => {
    onRowClick?.(item);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />;
  };

  return (
    <Box>
      <TableContainer>
        <ChakraTable variant="simple">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.key}
                  width={column.width}
                  cursor={column.sortable && sortable ? 'pointer' : 'default'}
                  onClick={() => column.sortable && handleSort(column.key)}
                  _hover={column.sortable && sortable ? { bg: 'gray.50' } : {}}
                >
                  <Flex align="center" gap={2}>
                    {column.header}
                    {column.sortable && sortable && getSortIcon(column.key)}
                  </Flex>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {paginatedData.map((item, index) => (
              <Tr
                key={index}
                onClick={() => handleRowClick(item)}
                cursor={onRowClick ? 'pointer' : 'default'}
                bg={selectedRow === item ? 'blue.50' : 'transparent'}
                _hover={onRowClick ? { bg: 'gray.50' } : {}}
              >
                {columns.map((column) => (
                  <Td key={column.key}>{column.accessor(item)}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </ChakraTable>
      </TableContainer>

      {pagination && totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4}>
          <Text>
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </Text>
          <HStack spacing={2}>
            <Button
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
}

export default Table; 