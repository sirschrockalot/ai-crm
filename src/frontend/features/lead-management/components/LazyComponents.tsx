import React, { Suspense, lazy } from 'react';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';

// Lazy load heavy components
const LeadDetail = lazy(() => import('./LeadDetail').then(module => ({ default: module.LeadDetail })));
const LeadForm = lazy(() => import('./LeadForm').then(module => ({ default: module.LeadForm })));
const CommunicationPanel = lazy(() => import('./CommunicationPanel').then(module => ({ default: module.CommunicationPanel })));
const ImportExportPanel = lazy(() => import('./ImportExportPanel').then(module => ({ default: module.ImportExportPanel })));

// Loading fallback component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
    <VStack spacing={4}>
      <Spinner size="lg" />
      <Text fontSize="sm" color="gray.500">{message}</Text>
    </VStack>
  </Box>
);

// Lazy component wrappers
export const LazyLeadDetail: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading lead details..." />}>
    <LeadDetail {...props} />
  </Suspense>
);

export const LazyLeadForm: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading form..." />}>
    <LeadForm {...props} />
  </Suspense>
);

export const LazyCommunicationPanel: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading communication..." />}>
    <CommunicationPanel {...props} />
  </Suspense>
);

export const LazyImportExportPanel: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading import/export..." />}>
    <ImportExportPanel {...props} />
  </Suspense>
);
