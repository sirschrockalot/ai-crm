import React from 'react';
import { NextPage } from 'next';
import { Box, Heading, Text } from '@chakra-ui/react';
import CommunicationCenter from '../../components/communications/CommunicationCenter';
import { Layout } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

const CommunicationsPageContent: React.FC = () => {
  return (
    <>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Communications</Heading>
        <Text color="gray.600">Manage all your communications in one place</Text>
      </Box>
      
      <CommunicationCenter />
    </>
  );
};

const CommunicationsPage: NextPage = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <CommunicationsPageContent />
      </ErrorBoundary>
    </Layout>
  );
};

export default CommunicationsPage;
