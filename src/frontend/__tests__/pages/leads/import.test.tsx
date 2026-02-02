import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import ImportLeadsPage from '../../../pages/leads/import';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the useLeads hook
jest.mock('../../../hooks/services/useLeads', () => ({
  useLeads: () => ({
    isAuthenticated: true,
    user: { firstName: 'John', lastName: 'Doe' },
    importLeads: jest.fn(),
    exportLeads: jest.fn(),
  }),
}));

// Mock layout components
jest.mock('../../../components/layout', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
  Header: () => <div data-testid="header">Header</div>,
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

const mockRouter = {
  push: jest.fn(),
  query: {},
};

describe('ImportLeadsPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the import leads page correctly', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Import Leads')).toBeInTheDocument();
    expect(screen.getByText('Upload and import leads from CSV or Excel files')).toBeInTheDocument();
    expect(screen.getByText('Download Template')).toBeInTheDocument();
    expect(screen.getByText('Import History')).toBeInTheDocument();
  });

  it('displays file upload area', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Click to select file or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('Supports CSV and Excel files (max 100MB)')).toBeInTheDocument();
  });

  it('shows import options', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Import Options')).toBeInTheDocument();
    expect(screen.getByText('Update existing leads')).toBeInTheDocument();
    expect(screen.getByText('Skip duplicates')).toBeInTheDocument();
    expect(screen.getByText('Validate only (no import)')).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Validate File')).toBeInTheDocument();
    expect(screen.getByText('Start Import')).toBeInTheDocument();
  });

  it('shows import progress section', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Import Progress')).toBeInTheDocument();
    expect(screen.getByText('Ready to import')).toBeInTheDocument();
  });

  it('displays recent imports section', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Recent Imports')).toBeInTheDocument();
    expect(screen.getByText('leads_2024_01.csv')).toBeInTheDocument();
    expect(screen.getByText('new_leads.xlsx')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByDisplayValue('');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });

  it('handles drag and drop', async () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    const file = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const dropZone = screen.getByText('Click to select file or drag and drop').closest('div');

    if (dropZone) {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });
    }
  });

  it('opens import history modal when button is clicked', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    const historyButton = screen.getByText('Import History');
    fireEvent.click(historyButton);

    expect(screen.getByText('Import History')).toBeInTheDocument();
    expect(screen.getByText('File Name')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('downloads template when button is clicked', () => {
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    const mockAppendChild = jest.fn();
    const mockClick = jest.fn();
    const mockRemoveChild = jest.fn();

    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
      writable: true,
    });

    Object.defineProperty(document, 'createElement', {
      value: jest.fn(() => ({
        href: '',
        download: '',
        click: mockClick,
      })),
      writable: true,
    });

    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true,
    });

    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true,
    });

    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    const downloadButton = screen.getByText('Download Template');
    fireEvent.click(downloadButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('navigates back to leads page when back button is clicked', () => {
    render(
      <ChakraProvider>
        <ImportLeadsPage />
      </ChakraProvider>
    );

    const backButton = screen.getByText('Back to Leads');
    fireEvent.click(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/leads');
  });
});
