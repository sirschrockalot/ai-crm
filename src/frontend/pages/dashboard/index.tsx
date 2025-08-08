import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const DashboardPage: React.FC = () => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Dashboard
      </Heading>
      <Text>Welcome to the DealCycle CRM Dashboard</Text>
    </Box>
  );
};

export default DashboardPage; 