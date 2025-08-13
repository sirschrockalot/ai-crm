import React from 'react';
import { Box } from '@chakra-ui/react';
import { LeadQueue } from '../../components/leads';
import { Layout } from '../../components/layout';

const LeadQueuePage: React.FC = () => {
  return (
    <Layout>
      <LeadQueue />
    </Layout>
  );
};

export default LeadQueuePage;
