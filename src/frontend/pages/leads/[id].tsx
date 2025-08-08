import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, VStack, HStack, Heading, Text, useToast, Divider, Avatar, Grid } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { LeadForm } from '../../components/forms';
import { useLeads } from '../../hooks/services/useLeads';
import { Lead, LeadStatus, PropertyType } from '../../types';

const LeadDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { leads, loading, error, fetchLeads, updateLead } = useLeads();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (id && leads.length > 0) {
      const foundLead = leads.find(l => l.id === id);
      setLead(foundLead || null);
    }
  }, [id, leads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleUpdateLead = async (data: any) => {
    if (!lead) return;
    try {
      await updateLead(lead.id, data);
      toast({
        title: 'Lead updated successfully',
        status: 'success',
        duration: 3000,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error updating lead',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'qualified': return 'green';
      case 'converted': return 'purple';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const getPropertyTypeColor = (type: PropertyType) => {
    switch (type) {
      case 'single_family': return 'blue';
      case 'multi_family': return 'green';
      case 'commercial': return 'purple';
      case 'land': return 'orange';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text>Loading lead details...</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text color="red.500">Error loading lead: {error}</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text>Lead not found</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="lg">
                  {lead.firstName} {lead.lastName}
                </Heading>
                <HStack spacing={4}>
                  <Badge colorScheme={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <Badge colorScheme={getPropertyTypeColor(lead.propertyType)}>
                    {lead.propertyType.replace('_', ' ')}
                  </Badge>
                  <Text color="gray.500">ID: {lead.id}</Text>
                </HStack>
              </VStack>
              <HStack spacing={3}>
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                  Edit Lead
                </Button>
                <Button variant="primary">
                  Send Communication
                </Button>
              </HStack>
            </HStack>

            <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
              {/* Lead Information */}
              <Card header="Lead Information">
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Contact Information</Text>
                  </HStack>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontWeight="medium">Email:</Text>
                      <Text>{lead.email}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">Phone:</Text>
                      <Text>{lead.phone}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">Address:</Text>
                      <Text>{lead.address}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">City:</Text>
                      <Text>{lead.city}, {lead.state} {lead.zipCode}</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontWeight="medium">Property Type:</Text>
                      <Badge colorScheme={getPropertyTypeColor(lead.propertyType)}>
                        {lead.propertyType.replace('_', ' ')}
                      </Badge>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">Estimated Value:</Text>
                      <Text>${lead.estimatedValue.toLocaleString()}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">Status:</Text>
                      <Badge colorScheme={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </HStack>
                    {lead.assignedTo && (
                      <HStack>
                        <Text fontWeight="medium">Assigned To:</Text>
                        <Text>{lead.assignedTo}</Text>
                      </HStack>
                    )}
                  </VStack>

                  {lead.notes && (
                    <>
                      <Divider />
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="medium">Notes:</Text>
                        <Text>{lead.notes}</Text>
                      </VStack>
                    </>
                  )}
                </VStack>
              </Card>

              {/* Timeline & Activity */}
              <Card header="Timeline & Activity">
                <VStack align="stretch" spacing={4}>
                  <VStack align="stretch" spacing={3}>
                    {[
                      { action: 'Lead created', time: lead.createdAt.toLocaleDateString(), type: 'created' },
                      { action: 'Initial contact made', time: '2024-01-15', type: 'contact' },
                      { action: 'Property details updated', time: '2024-01-16', type: 'update' },
                      { action: 'Follow-up email sent', time: '2024-01-17', type: 'communication' },
                      { action: 'Status changed to contacted', time: '2024-01-18', type: 'status' },
                    ].map((activity, index) => (
                      <HStack key={index} spacing={3} p={3} bg="gray.50" borderRadius="md">
                        <Avatar size="sm" name={activity.action} />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="medium">{activity.action}</Text>
                          <Text fontSize="sm" color="gray.500">{activity.time}</Text>
                        </VStack>
                        <Badge colorScheme="blue" size="sm">
                          {activity.type}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Card>

              {/* Communication History */}
              <Card header="Communication History">
                <VStack align="stretch" spacing={4}>
                  <VStack align="stretch" spacing={3}>
                    {[
                      { type: 'Email', subject: 'Welcome to DealCycle', status: 'Sent', time: '2 hours ago' },
                      { type: 'Phone', subject: 'Initial contact call', status: 'Completed', time: '1 day ago' },
                      { type: 'SMS', subject: 'Follow-up reminder', status: 'Delivered', time: '2 days ago' },
                      { type: 'Email', subject: 'Property information', status: 'Opened', time: '3 days ago' },
                    ].map((comm, index) => (
                      <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Badge colorScheme="blue" size="sm">{comm.type}</Badge>
                            <Text fontWeight="medium">{comm.subject}</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">{comm.time}</Text>
                        </VStack>
                        <Badge colorScheme={comm.status === 'Completed' || comm.status === 'Opened' ? 'green' : 'yellow'}>
                          {comm.status}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                  <Button variant="outline" size="sm">
                    View All Communications
                  </Button>
                </VStack>
              </Card>

              {/* Quick Actions */}
              <Card header="Quick Actions">
                <VStack align="stretch" spacing={3}>
                  <Button variant="outline" justifyContent="start">
                    Send Email
                  </Button>
                  <Button variant="outline" justifyContent="start">
                    Make Phone Call
                  </Button>
                  <Button variant="outline" justifyContent="start">
                    Send SMS
                  </Button>
                  <Button variant="outline" justifyContent="start">
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" justifyContent="start">
                    Add Note
                  </Button>
                  <Button variant="outline" justifyContent="start">
                    Change Status
                  </Button>
                  <Button variant="outline" justifyContent="start">
                    Assign to Agent
                  </Button>
                </VStack>
              </Card>

              {/* Related Information */}
              <Card header="Related Information">
                <VStack align="stretch" spacing={4}>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="medium">Similar Properties</Text>
                    <Text fontSize="sm" color="gray.500">No similar properties found</Text>
                  </VStack>

                  <Divider />

                  <VStack align="start" spacing={2}>
                    <Text fontWeight="medium">Potential Buyers</Text>
                    <Text fontSize="sm" color="gray.500">No matching buyers found</Text>
                  </VStack>

                  <Divider />

                  <VStack align="start" spacing={2}>
                    <Text fontWeight="medium">Documents</Text>
                    <Text fontSize="sm" color="gray.500">No documents attached</Text>
                  </VStack>
                </VStack>
              </Card>
            </Grid>
          </VStack>
        </Box>
      </HStack>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead"
        size="lg"
      >
        <LeadForm
          onSubmit={handleUpdateLead}
          initialData={lead}
          isLoading={loading}
        />
      </Modal>
    </Box>
  );
};

export default LeadDetailPage; 