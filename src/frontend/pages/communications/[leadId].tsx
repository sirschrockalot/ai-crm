import React from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Heading, Text, VStack, HStack, Badge, Avatar } from '@chakra-ui/react';
import CommunicationThread from '../../components/communications/CommunicationThread';
import CommunicationHistory from '../../components/communications/CommunicationHistory';
import SMSInterface from '../../components/communications/SMSInterface';
import CallLog from '../../components/communications/CallLog';
import EmailComposer from '../../components/communications/EmailComposer';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

const LeadCommunicationsPage: React.FC = () => {
  const router = useRouter();
  const { leadId } = router.query;

  // Mock lead data - in real implementation, this would come from API
  const mockLead = {
    id: leadId as string,
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john.doe@example.com',
    status: 'active',
  };

  if (!leadId) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <HStack spacing={4} mb={4}>
          <Avatar size="lg" name={mockLead.name} />
          <VStack align="start" spacing={1}>
            <Heading size="lg">{mockLead.name}</Heading>
            <Text color="gray.600">Lead Communications</Text>
            <HStack spacing={2}>
              <Badge colorScheme="blue">{mockLead.phone}</Badge>
              <Badge colorScheme="green">{mockLead.email}</Badge>
            </HStack>
          </VStack>
        </HStack>
      </Box>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Thread</Tab>
          <Tab>SMS</Tab>
          <Tab>Calls</Tab>
          <Tab>Email</Tab>
          <Tab>History</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <CommunicationThread
              leadId={leadId as string}
              contactName={mockLead.name}
              contactPhone={mockLead.phone}
              contactEmail={mockLead.email}
            />
          </TabPanel>
          
          <TabPanel>
            <SMSInterface
              leadId={leadId as string}
              contactPhone={mockLead.phone}
              contactName={mockLead.name}
            />
          </TabPanel>
          
          <TabPanel>
            <CallLog
              leadId={leadId as string}
              showCallActions={true}
            />
          </TabPanel>
          
          <TabPanel>
            <EmailComposer
              leadId={leadId as string}
              contactEmail={mockLead.email}
              contactName={mockLead.name}
            />
          </TabPanel>
          
          <TabPanel>
            <CommunicationHistory
              leadId={leadId as string}
              showFilters={true}
              showSearch={true}
              maxHeight="600px"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default LeadCommunicationsPage;
