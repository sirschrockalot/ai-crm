import React from 'react';
import { NextPage } from 'next';
import { Box, Heading, Text } from '@chakra-ui/react';
import CommunicationCenter from '../../components/communications/CommunicationCenter';
import { Layout } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

const CommunicationsCenterPageContent: React.FC = () => {
  return (
    <>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Communication Center</Heading>
        <Text color="gray.600">Unified communication interface for all channels</Text>
      </Box>
      
      <CommunicationCenter />
    </>
  );
};

const CommunicationsCenterPage: NextPage = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <CommunicationsCenterPageContent />
      </ErrorBoundary>
    </Layout>
  );
};

export default CommunicationsCenterPage;
