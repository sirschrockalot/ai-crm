import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import CallLog from '../../components/communications/CallLog';

const CallsPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Call Management</Heading>
        <Text color="gray.600">Manage calls and view call history</Text>
      </Box>
      
      <CallLog showCallActions={true} />
    </Container>
  );
};

export default CallsPage;
