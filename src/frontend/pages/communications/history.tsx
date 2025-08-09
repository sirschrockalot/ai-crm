import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import CommunicationHistory from '../../components/communications/CommunicationHistory';

const CommunicationHistoryPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Communication History</Heading>
        <Text color="gray.600">View and search all communications</Text>
      </Box>
      
      <CommunicationHistory 
        showFilters={true}
        showSearch={true}
        maxHeight="800px"
      />
    </Container>
  );
};

export default CommunicationHistoryPage;
