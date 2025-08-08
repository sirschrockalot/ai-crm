import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Table from './Table';
import theme from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

interface TestData {
  id: number;
  name: string;
  email: string;
  status: string;
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
];

const mockColumns = [
  {
    key: 'name',
    header: 'Name',
    accessor: (item: TestData) => item.name,
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    accessor: (item: TestData) => item.email,
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (item: TestData) => item.status,
    sortable: false,
  },
];

describe('Table Component', () => {
  it('renders table with data', () => {
    renderWithTheme(<Table data={mockData} columns={mockColumns} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('handles row click', () => {
    const onRowClick = jest.fn();
    renderWithTheme(
      <Table data={mockData} columns={mockColumns} onRowClick={onRowClick} />
    );
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow!);
    
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('handles sorting', () => {
    const onSort = jest.fn();
    renderWithTheme(
      <Table data={mockData} columns={mockColumns} onSort={onSort} />
    );
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('shows pagination when enabled', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'Active',
    }));

    renderWithTheme(
      <Table data={largeData} columns={mockColumns} pagination={true} pageSize={10} />
    );
    
    expect(screen.getByText('Showing 1 to 10 of 25 results')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('handles pagination navigation', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'Active',
    }));

    renderWithTheme(
      <Table data={largeData} columns={mockColumns} pagination={true} pageSize={10} />
    );
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Showing 11 to 20 of 25 results')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('highlights selected row', () => {
    renderWithTheme(
      <Table 
        data={mockData} 
        columns={mockColumns} 
        selectedRow={mockData[0]}
        onRowClick={() => {}}
      />
    );
    
    const selectedRow = screen.getByText('John Doe').closest('tr');
    expect(selectedRow).toBeInTheDocument();
  });

  it('disables sorting when sortable is false', () => {
    const onSort = jest.fn();
    renderWithTheme(
      <Table data={mockData} columns={mockColumns} sortable={false} onSort={onSort} />
    );
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    expect(onSort).not.toHaveBeenCalled();
  });

  it('disables pagination when pagination is false', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'Active',
    }));

    renderWithTheme(
      <Table data={largeData} columns={mockColumns} pagination={false} />
    );
    
    expect(screen.queryByText('Showing 1 to 10 of 25 results')).not.toBeInTheDocument();
    expect(screen.queryByText('Page 1 of 3')).not.toBeInTheDocument();
  });
}); 