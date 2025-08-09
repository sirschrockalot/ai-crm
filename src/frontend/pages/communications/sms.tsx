import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import SMSInterface from '../../components/communications/SMSInterface';

const SMSInterfacePage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>SMS Interface</Heading>
        <Text color="gray.600">Send and receive SMS messages</Text>
      </Box>
      
      <SMSInterface />
    </Container>
  );
};

export default SMSInterfacePage;
