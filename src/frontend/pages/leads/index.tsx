import React from 'react';
import { Box } from '@chakra-ui/react';
import { Sidebar, Header } from '../../components/layout';
import { LeadList } from '../../components/leads';

const LeadsPage: React.FC = () => {
  return (
    <Box>
      <Header />
      <Sidebar />
      <Box ml="250px" p={6}>
        <LeadList />
      </Box>
    </Box>
  );
};

export default LeadsPage; 