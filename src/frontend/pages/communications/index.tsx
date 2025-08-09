import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import CommunicationCenter from '../../components/communications/CommunicationCenter';

const CommunicationsPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Communications</Heading>
        <Text color="gray.600">Manage all your communications in one place</Text>
      </Box>
      
      <CommunicationCenter />
    </Container>
  );
};

export default CommunicationsPage;
