import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useToast,
  Progress,
  Badge,
  Tooltip,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiFile, FiImage, FiFileText } from 'react-icons/fi';

export interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  label?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesChange: (files: UploadedFile[]) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  required?: boolean;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <FiImage size={20} />;
  }
  if (fileType.includes('pdf') || fileType.includes('text')) {
    return <FiFileText size={20} />;
  }
  return <FiFile size={20} />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload Files',
  helperText = 'Click to select files or drag and drop',
  accept = '*/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 10,
  onFilesChange,
  onUpload,
  disabled = false,
  required = false,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    // Validate files
    const validFiles: UploadedFile[] = [];
    const errors: string[] = [];

    newFiles.forEach((uploadedFile) => {
      const { file } = uploadedFile;

      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
        return;
      }

      // Check file count
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      validFiles.push(uploadedFile);
    });

    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: 'File Validation Error',
          description: error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(updatedFiles);
      onFilesChange(updatedFiles);

      // Upload files if onUpload is provided
      if (onUpload) {
        validFiles.forEach(uploadedFile => {
          uploadFile(uploadedFile);
        });
      }
    }
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    if (!onUpload) return;

    try {
      const url = await onUpload(uploadedFile.file);
      
      setUploadedFiles(prev => prev.map(file => 
        file.id === uploadedFile.id 
          ? { ...file, url, progress: 100, status: 'completed' as const }
          : file
      ));
    } catch (error) {
      setUploadedFiles(prev => prev.map(file => 
        file.id === uploadedFile.id 
          ? { ...file, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
          : file
      ));
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <FormControl isRequired={required}>
      {label && <FormLabel>{label}</FormLabel>}
      
      <VStack spacing={3} align="stretch">
        {/* Upload Area */}
        <Box
          border="2px dashed"
          borderColor={isDragOver ? 'blue.400' : 'gray.300'}
          borderRadius="md"
          p={6}
          textAlign="center"
          cursor={disabled ? 'not-allowed' : 'pointer'}
          bg={isDragOver ? 'blue.50' : 'transparent'}
          _hover={!disabled ? { borderColor: 'blue.400', bg: 'blue.50' } : {}}
          transition="all 0.2s"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FiUpload size={32} color={isDragOver ? '#3182CE' : '#718096'} />
          <Text mt={2} fontWeight="medium" color={disabled ? 'gray.400' : 'gray.700'}>
            {helperText}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max size: {formatFileSize(maxSize)}
          </Text>
        </Box>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium">
              Uploaded Files ({uploadedFiles.length})
            </Text>
            
            {uploadedFiles.map((uploadedFile) => (
              <Box
                key={uploadedFile.id}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
                bg="gray.50"
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    {getFileIcon(uploadedFile.file.type)}
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {uploadedFile.file.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatFileSize(uploadedFile.file.size)}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={2}>
                    {uploadedFile.status === 'uploading' && (
                      <Progress 
                        value={uploadedFile.progress} 
                        size="sm" 
                        width="60px" 
                        colorScheme="blue" 
                      />
                    )}
                    
                    {uploadedFile.status === 'completed' && (
                      <Badge colorScheme="green" size="sm">Complete</Badge>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <Tooltip label={uploadedFile.error}>
                        <Badge colorScheme="red" size="sm">Error</Badge>
                      </Tooltip>
                    )}
                    
                    <IconButton
                      aria-label="Remove file"
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(uploadedFile.id)}
                      isDisabled={uploadedFile.status === 'uploading'}
                    />
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
      
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
