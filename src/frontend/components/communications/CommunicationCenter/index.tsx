import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { 
  ChatIcon, 
  PhoneIcon, 
  EmailIcon,
  AddIcon,
  SearchIcon,
  DownloadIcon,
  BellIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { communicationService, CommunicationLog, CommunicationTemplate } from '../../../services/communicationService';
import { formatPhoneNumber } from '../../../utils/phone';
import { formatRelativeTime } from '../../../utils/date';
import SMSInterface from '../SMSInterface';
import CallLog from '../CallLog';
import CommunicationHistory from '../CommunicationHistory';

interface CommunicationCenterProps {
  leadId?: string;
  buyerId?: string;
  contactPhone?: string;
  contactName?: string;
  contactEmail?: string;
}

interface CommunicationStats {
  totalSms: number;
  totalVoice: number;
  totalEmail: number;
  totalCost: number;
  successRate: number;
  recentActivity: number;
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  leadId,
  buyerId,
  contactPhone,
  contactName,
  contactEmail,
}) => {
  const [stats, setStats] = useState<CommunicationStats>({
    totalSms: 0,
    totalVoice: 0,
    totalEmail: 0,
    totalCost: 0,
    successRate: 0,
    recentActivity: 0,
  });
  const [recentCommunications, setRecentCommunications] = useState<CommunicationLog[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'voice' | 'email'>('sms');
  const [quickMessage, setQuickMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadData();
  }, [leadId, buyerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load communication statistics
      const statsData = await communicationService.getCommunicationStats();
      setStats({
        totalSms: statsData.totalSms,
        totalVoice: statsData.totalVoice,
        totalEmail: 0, // Email stats would come from email service
        totalCost: statsData.totalCost,
        successRate: statsData.successRate,
        recentActivity: 0, // This would be calculated from recent communications
      });

      // Load recent communications
      if (leadId) {
        const communications = await communicationService.getCommunicationHistory(leadId);
        setRecentCommunications(communications.slice(0, 5)); // Show last 5
      }

      // Load templates
      const templatesData = await communicationService.getTemplates();
      setTemplates(templatesData);

    } catch (err) {
      setError('Failed to load communication data');
      toast({
        title: 'Error',
        description: 'Failed to load communication data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendQuickMessage = async () => {
    if (!quickMessage.trim() || !contactPhone) return;

    try {
      let result;
      
      switch (selectedChannel) {
        case 'sms':
          result = await communicationService.sendSms({
            to: contactPhone,
            from: '+1234567890',
            body: quickMessage,
            leadId,
          });
          break;
        case 'voice':
          result = await communicationService.makeVoiceCall({
            to: contactPhone,
            from: '+1234567890',
            twiml: `<Response><Say>${quickMessage}</Say></Response>`,
            leadId,
          });
          break;
        case 'email':
          // Email sending would be implemented here
          result = { success: true };
          break;
      }

      if (result.success) {
        toast({
          title: 'Message sent',
          description: `Your ${selectedChannel} message has been sent successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setQuickMessage('');
        onClose();
        loadData(); // Refresh data
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setQuickMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <ChatIcon />;
      case 'voice':
        return <PhoneIcon />;
      case 'email':
        return <EmailIcon />;
      default:
        return <ChatIcon />;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'sms':
        return 'blue';
      case 'voice':
        return 'green';
      case 'email':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <VStack spacing={4} align="stretch">
        <Skeleton height="200px" />
        <Skeleton height="400px" />
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with Stats */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="xl" fontWeight="bold">Communication Center</Text>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Settings"
                  icon={<SettingsIcon />}
                  size="sm"
                  variant="outline"
                />
                <IconButton
                  aria-label="Notifications"
                  icon={<BellIcon />}
                  size="sm"
                  variant="outline"
                />
              </HStack>
            </HStack>
            
            <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4} w="full">
              <Stat>
                <StatLabel>SMS Sent</StatLabel>
                <StatNumber>{stats.totalSms}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.5%
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Calls Made</StatLabel>
                <StatNumber>{stats.totalVoice}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8.2%
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Emails Sent</StatLabel>
                <StatNumber>{stats.totalEmail}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  3.1%
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Total Cost</StatLabel>
                <StatNumber>${stats.totalCost.toFixed(2)}</StatNumber>
                <StatHelpText>This month</StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Success Rate</StatLabel>
                <StatNumber>{(stats.successRate * 100).toFixed(1)}%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  2.3%
                </StatHelpText>
              </Stat>
            </Grid>
          </VStack>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <Text fontWeight="semibold">Quick Actions</Text>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="sm"
                onClick={onOpen}
              >
                Send Message
              </Button>
            </HStack>
            
            <HStack spacing={3} w="full">
              <Button
                leftIcon={<ChatIcon />}
                variant="outline"
                onClick={() => setSelectedChannel('sms')}
                isActive={selectedChannel === 'sms'}
              >
                Send SMS
              </Button>
              <Button
                leftIcon={<PhoneIcon />}
                variant="outline"
                onClick={() => setSelectedChannel('voice')}
                isActive={selectedChannel === 'voice'}
              >
                Make Call
              </Button>
              <Button
                leftIcon={<EmailIcon />}
                variant="outline"
                onClick={() => setSelectedChannel('email')}
                isActive={selectedChannel === 'email'}
              >
                Send Email
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Main Communication Interface */}
      <Tabs variant="enclosed">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <ChatIcon />
              <Text>SMS</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <PhoneIcon />
              <Text>Calls</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <EmailIcon />
              <Text>Email</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <SearchIcon />
              <Text>History</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SMSInterface
              leadId={leadId}
              buyerId={buyerId}
              contactPhone={contactPhone}
              contactName={contactName}
            />
          </TabPanel>
          
          <TabPanel>
            <CallLog
              leadId={leadId}
              buyerId={buyerId}
              showCallActions={false}
            />
          </TabPanel>
          
          <TabPanel>
            <Card>
              <CardBody>
                <Text>Email interface will be implemented here</Text>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <CommunicationHistory
              leadId={leadId}
              buyerId={buyerId}
              showFilters={true}
              showSearch={true}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Quick Message Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Quick Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack w="full" spacing={3}>
                <Select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as 'sms' | 'voice' | 'email')}
                >
                  <option value="sms">SMS</option>
                  <option value="voice">Voice Call</option>
                  <option value="email">Email</option>
                </Select>
                
                <Select
                  placeholder="Select a template"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                >
                  {templates
                    .filter(t => t.type === selectedChannel)
                    .map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </Select>
              </HStack>
              
              <Textarea
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder={`Type your ${selectedChannel} message...`}
                rows={4}
              />
              
              <HStack spacing={3} w="full">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={sendQuickMessage}
                  disabled={!quickMessage.trim()}
                >
                  Send {selectedChannel.toUpperCase()}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CommunicationCenter;
