import React from 'react';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import EmailComposer from '../../components/communications/EmailComposer';

const EmailComposerPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Email Composer</Heading>
        <Text color="gray.600">Compose and send emails</Text>
      </Box>
      
      <EmailComposer />
    </Container>
  );
};

export default EmailComposerPage;
