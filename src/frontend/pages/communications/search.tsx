import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import CommunicationSearch from '../../components/communications/CommunicationSearch';

const CommunicationSearchPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Communication Search</Heading>
        <Text color="gray.600">Advanced search and filtering for communications</Text>
      </Box>
      
      <CommunicationSearch />
    </Container>
  );
};

export default CommunicationSearchPage;
