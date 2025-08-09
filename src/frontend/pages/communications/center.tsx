import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import CommunicationCenter from '../../components/communications/CommunicationCenter';

const CommunicationsCenterPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Communication Center</Heading>
        <Text color="gray.600">Unified communication interface for all channels</Text>
      </Box>
      
      <CommunicationCenter />
    </Container>
  );
};

export default CommunicationsCenterPage;
