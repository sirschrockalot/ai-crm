import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { PhoneIcon, ChatIcon, DownloadIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import communicationService, {
  CommunicationTemplate,
  CommunicationResult,
  CommunicationLog,
} from '../../../services/communicationService';

interface CommunicationPanelProps {
  leadId?: string;
  leadPhone?: string;
  leadName?: string;
  onCommunicationSent?: (result: CommunicationResult) => void;
}

const CommunicationPanel: React.FC<CommunicationPanelProps> = ({
  leadId,
  leadPhone,
  leadName,
  onCommunicationSent,
}) => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twilioStatus, setTwilioStatus] = useState<{
    isConfigured: boolean;
    accountInfo?: any;
  } | null>(null);
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationLog[]>([]);

  const { isOpen: isSmsModalOpen, onOpen: onSmsModalOpen, onClose: onSmsModalClose } = useDisclosure();
  const { isOpen: isVoiceModalOpen, onOpen: onVoiceModalOpen, onClose: onVoiceModalClose } = useDisclosure();
  const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    loadTemplates();
    checkTwilioStatus();
    if (leadId) {
      loadCommunicationHistory();
    }
  }, [leadId]);

  const loadTemplates = async () => {
    try {
      const templates = await communicationService.getTemplates();
      setTemplates(templates);
    } catch (error) {
      toast({
        title: 'Failed to load templates',
        description: 'Could not load communication templates',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const checkTwilioStatus = async () => {
    try {
      const status = await communicationService.getTwilioStatus();
      setTwilioStatus(status);
    } catch (error) {
      console.error('Failed to check Twilio status:', error);
    }
  };

  const loadCommunicationHistory = async () => {
    if (!leadId) return;

    try {
      const history = await communicationService.getCommunicationHistory(leadId);
      setCommunicationHistory(history);
    } catch (error) {
      console.error('Failed to load communication history:', error);
    }
  };

  const handleSendSms = async () => {
    if (!leadId || !message.trim()) return;

    setIsLoading(true);
    try {
      const result = await communicationService.sendSmsToLead(leadId, message);
      
      if (result.success) {
        toast({
          title: 'SMS sent successfully',
          description: 'Message has been sent to the lead',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onCommunicationSent?.(result);
        onSmsModalClose();
        setMessage('');
        loadCommunicationHistory();
      } else {
        toast({
          title: 'SMS failed',
          description: result.error || 'Failed to send SMS',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'SMS failed',
        description: 'Failed to send SMS to lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeVoiceCall = async () => {
    if (!leadId || !message.trim()) return;

    setIsLoading(true);
    try {
      const result = await communicationService.makeVoiceCallToLead(leadId, message);
      
      if (result.success) {
        toast({
          title: 'Voice call initiated',
          description: 'Call has been initiated to the lead',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onCommunicationSent?.(result);
        onVoiceModalClose();
        setMessage('');
        loadCommunicationHistory();
      } else {
        toast({
          title: 'Voice call failed',
          description: result.error || 'Failed to make voice call',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Voice call failed',
        description: 'Failed to make voice call to lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const variables: Record<string, string> = {};
      template.variables.forEach(variable => {
        variables[variable] = '';
      });
      setTemplateVariables(variables);
    }
  };

  const handleSendWithTemplate = async () => {
    if (!leadId || !selectedTemplate) return;

    setIsLoading(true);
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      let result: CommunicationResult;
      if (template.type === 'sms') {
        result = await communicationService.sendSmsWithTemplate(
          leadId,
          selectedTemplate,
          templateVariables,
        );
      } else {
        result = await communicationService.makeVoiceCallWithTemplate(
          leadId,
          selectedTemplate,
          templateVariables,
        );
      }

      if (result.success) {
        toast({
          title: `${template.type.toUpperCase()} sent successfully`,
          description: `Message has been sent using ${template.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onCommunicationSent?.(result);
        onTemplateModalClose();
        setSelectedTemplate('');
        setTemplateVariables({});
        loadCommunicationHistory();
      } else {
        toast({
          title: `${template.type.toUpperCase()} failed`,
          description: result.error || `Failed to send ${template.type}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Template communication failed',
        description: 'Failed to send message using template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'sent':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <ChatIcon />;
      case 'voice':
        return <PhoneIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Twilio Status */}
        {twilioStatus && (
          <Alert
            status={twilioStatus.isConfigured ? 'success' : 'warning'}
            borderRadius="md"
          >
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">
                Twilio {twilioStatus.isConfigured ? 'Configured' : 'Not Configured'}
              </Text>
              {twilioStatus.accountInfo && (
                <Text fontSize="sm">
                  Balance: ${twilioStatus.accountInfo.balance}
                </Text>
              )}
            </VStack>
          </Alert>
        )}

        {/* Communication Actions */}
        <HStack spacing={4}>
          <Button
            leftIcon={<ChatIcon />}
            colorScheme="blue"
            onClick={onSmsModalOpen}
            isDisabled={!twilioStatus?.isConfigured || !leadPhone}
          >
            Send SMS
          </Button>
          <Button
            leftIcon={<PhoneIcon />}
            colorScheme="green"
            onClick={onVoiceModalOpen}
            isDisabled={!twilioStatus?.isConfigured || !leadPhone}
          >
            Make Call
          </Button>
          <Button
            variant="outline"
            onClick={onTemplateModalOpen}
            isDisabled={!twilioStatus?.isConfigured || !leadPhone}
          >
            Use Template
          </Button>
        </HStack>

        {/* Communication History */}
        {communicationHistory.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={3}>
              Communication History
            </Text>
            <VStack spacing={2} align="stretch">
              {communicationHistory.map((log) => (
                <Box
                  key={log.id}
                  p={3}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                >
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      {getTypeIcon(log.type)}
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="semibold">
                          {log.type.toUpperCase()} - {log.direction}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(log.createdAt).toLocaleString()}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </HStack>
                  {log.content && (
                    <Text fontSize="sm" mt={2} color="gray.600">
                      {log.content}
                    </Text>
                  )}
                  {log.cost && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Cost: ${log.cost}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* SMS Modal */}
        <Modal isOpen={isSmsModalOpen} onClose={onSmsModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Send SMS to {leadName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={leadPhone ? communicationService.formatPhoneNumber(leadPhone) : ''}
                    isReadOnly
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onSmsModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSendSms}
                isLoading={isLoading}
                isDisabled={!message.trim()}
              >
                Send SMS
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Voice Call Modal */}
        <Modal isOpen={isVoiceModalOpen} onClose={onVoiceModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Make Voice Call to {leadName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={leadPhone ? communicationService.formatPhoneNumber(leadPhone) : ''}
                    isReadOnly
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Message to Say</FormLabel>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter the message to say during the call..."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onVoiceModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleMakeVoiceCall}
                isLoading={isLoading}
                isDisabled={!message.trim()}
              >
                Make Call
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Template Modal */}
        <Modal isOpen={isTemplateModalOpen} onClose={onTemplateModalClose}>
          <ModalOverlay />
          <ModalContent maxW="2xl">
            <ModalHeader>Send Message Using Template</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Select Template</FormLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    placeholder="Choose a template"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.type})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedTemplate && (
                  <FormControl>
                    <FormLabel>Template Variables</FormLabel>
                    <VStack spacing={2}>
                      {templateVariables && Object.keys(templateVariables).map((variable) => (
                        <Input
                          key={variable}
                          placeholder={variable}
                          value={templateVariables[variable]}
                          onChange={(e) =>
                            setTemplateVariables(prev => ({
                              ...prev,
                              [variable]: e.target.value,
                            }))
                          }
                        />
                      ))}
                    </VStack>
                  </FormControl>
                )}

                {selectedTemplate && (
                  <FormControl>
                    <FormLabel>Preview</FormLabel>
                    <Box
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      fontSize="sm"
                    >
                      {(() => {
                        const template = templates.find(t => t.id === selectedTemplate);
                        if (!template) return '';
                        return communicationService.replaceTemplateVariables(
                          template.content,
                          templateVariables,
                        );
                      })()}
                    </Box>
                  </FormControl>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onTemplateModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSendWithTemplate}
                isLoading={isLoading}
                isDisabled={!selectedTemplate}
              >
                Send Message
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CommunicationPanel; 