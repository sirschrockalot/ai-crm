import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { FileUpload, UploadedFile } from '../FileUpload';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('FileUpload', () => {
  const mockOnFilesChange = jest.fn();
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    renderWithChakra(
      <FileUpload
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    expect(screen.getByText('File Upload')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here or click to browse')).toBeInTheDocument();
  });

  it('renders with custom label and helper text', () => {
    renderWithChakra(
      <FileUpload
        label="Custom Label"
        helperText="Custom helper text"
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom helper text')).toBeInTheDocument();
  });

  it('handles file selection via click', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    renderWithChakra(
      <FileUpload
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFilesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          file,
          status: 'uploading',
        })
      ]);
    });
  });

  it('handles drag and drop', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    renderWithChakra(
      <FileUpload
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const dropZone = screen.getByTestId('drop-zone');
    
    fireEvent.dragEnter(dropZone);
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFilesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          file,
          status: 'uploading',
        })
      ]);
    });
  });

  it('filters files by accepted types', async () => {
    const validFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    renderWithChakra(
      <FileUpload
        accept=".jpg,.jpeg,.png"
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [validFile, invalidFile] } });

    await waitFor(() => {
      expect(mockOnFilesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          file: validFile,
          status: 'uploading',
        })
      ]);
    });
  });

  it('enforces file size limit', async () => {
    const largeFile = new File(['x'.repeat(1024 * 1024)], 'large.txt', { type: 'text/plain' });
    
    renderWithChakra(
      <FileUpload
        maxSize={1024} // 1KB
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'File too large',
          status: 'error',
        })
      );
    });
  });

  it('enforces file count limit', async () => {
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    const file3 = new File(['content3'], 'file3.txt', { type: 'text/plain' });
    
    renderWithChakra(
      <FileUpload
        maxFiles={2}
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file1, file2, file3] } });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Too many files',
          status: 'error',
        })
      );
    });
  });

  it('removes files when remove button is clicked', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    renderWithChakra(
      <FileUpload
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFilesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          file,
          status: 'uploading',
        })
      ]);
    });

    // Simulate file removal
    const removeButton = screen.getByTestId('remove-file');
    fireEvent.click(removeButton);

    expect(mockOnFilesChange).toHaveBeenCalledWith([]);
  });

  it('shows progress for uploading files', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    renderWithChakra(
      <FileUpload
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
    });
  });

  it('disables when disabled prop is true', () => {
    renderWithChakra(
      <FileUpload
        disabled={true}
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toBeDisabled();
  });

  it('shows required indicator when required prop is true', () => {
    renderWithChakra(
      <FileUpload
        required={true}
        onFilesChange={mockOnFilesChange}
        onUpload={mockOnUpload}
      />
    );

    expect(screen.getByText('File Upload *')).toBeInTheDocument();
  });
});
