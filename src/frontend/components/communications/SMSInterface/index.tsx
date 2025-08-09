import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  Avatar,
  Badge,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Select,
  Spacer,
} from '@chakra-ui/react';
import { 
  PhoneIcon, 
  ChatIcon, 
  AttachmentIcon, 
  ChevronDownIcon,
  CheckIcon,
  TimeIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { communicationService, CommunicationLog, CommunicationTemplate } from '../../../services/communicationService';
import { formatPhoneNumber } from '../../../utils/phone';
import { formatRelativeTime } from '../../../utils/date';

interface SMSInterfaceProps {
  leadId?: string;
  buyerId?: string;
  contactPhone?: string;
  contactName?: string;
  onMessageSent?: (message: CommunicationLog) => void;
}

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed' | 'queued';
  isOutbound: boolean;
}

const SMSInterface: React.FC<SMSInterfaceProps> = ({
  leadId,
  buyerId,
  contactPhone,
  contactName,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadMessages();
    loadTemplates();
  }, [leadId, buyerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: CommunicationLog[] = [];
      
      if (leadId) {
        data = await communicationService.getCommunicationHistory(leadId);
      }
      
      // Convert CommunicationLog to Message format
      const convertedMessages: Message[] = data
        .filter(comm => comm.type === 'sms')
        .map(comm => ({
          id: comm.id,
          content: comm.content,
          direction: comm.direction,
          timestamp: new Date(comm.createdAt),
          status: comm.status,
          isOutbound: comm.direction === 'outbound',
        }))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setMessages(convertedMessages);
    } catch (err) {
      setError('Failed to load messages');
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await communicationService.getTemplates();
      setTemplates(data.filter(template => template.type === 'sms'));
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !contactPhone) return;

    try {
      setSending(true);
      
      const result = await communicationService.sendSms({
        to: contactPhone,
        from: '+1234567890', // This should come from user settings or Twilio config
        body: newMessage,
        leadId,
      });

      if (result.success) {
        const newMsg: Message = {
          id: result.messageId || Date.now().toString(),
          content: newMessage,
          direction: 'outbound',
          timestamp: new Date(),
          status: 'sent',
          isOutbound: true,
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        onMessageSent?.({
          id: newMsg.id,
          leadId: leadId || '',
          userId: '', // This should come from auth context
          tenantId: '', // This should come from auth context
          type: 'sms',
          direction: 'outbound',
          to: contactPhone,
          from: '+1234567890',
          content: newMessage,
          status: 'sent',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        toast({
          title: 'Message sent',
          description: 'Your message has been sent successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
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
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewMessage(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckIcon color="green.500" />;
      case 'sent':
        return <CheckIcon color="blue.500" />;
      case 'failed':
        return <WarningIcon color="red.500" />;
      case 'queued':
        return <TimeIcon color="yellow.500" />;
      default:
        return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <VStack spacing={4} align="stretch">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="60px" />
        ))}
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
    <Box h="600px" display="flex" flexDirection="column">
      {/* Header */}
      <Card mb={4}>
        <CardBody>
          <HStack spacing={3}>
            <Avatar size="sm" name={contactName} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">{contactName || 'Unknown Contact'}</Text>
              <Text fontSize="sm" color="gray.500">
                {contactPhone ? formatPhoneNumber(contactPhone) : 'No phone number'}
              </Text>
            </VStack>
            <Spacer />
            <IconButton
              aria-label="Call contact"
              icon={<PhoneIcon />}
              size="sm"
              variant="outline"
            />
          </HStack>
        </CardBody>
      </Card>

      {/* Messages */}
      <VStack 
        flex={1} 
        spacing={3} 
        align="stretch" 
        overflowY="auto" 
        mb={4}
        px={2}
      >
        {messages.length === 0 ? (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                No messages yet. Start a conversation!
              </Text>
            </CardBody>
          </Card>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.isOutbound ? 'flex-end' : 'flex-start'}
              maxW="70%"
            >
              <Card
                bg={message.isOutbound ? 'blue.500' : 'gray.100'}
                color={message.isOutbound ? 'white' : 'black'}
              >
                <CardBody p={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">{message.content}</Text>
                    <HStack spacing={2} justify="space-between" w="full">
                      <Text fontSize="xs" opacity={0.8}>
                        {formatRelativeTime(message.timestamp)}
                      </Text>
                      {message.isOutbound && getStatusIcon(message.status)}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Message Input */}
      <Card>
        <CardBody>
          <VStack spacing={3}>
            {/* Template Selection */}
            {templates.length > 0 && (
              <HStack w="full" spacing={2}>
                <Text fontSize="sm" color="gray.600">Template:</Text>
                <Select
                  size="sm"
                  placeholder="Select a template"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </HStack>
            )}

            {/* Message Input */}
            <HStack w="full" spacing={2}>
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                resize="none"
                rows={3}
                disabled={sending}
              />
              <VStack spacing={2}>
                <IconButton
                  aria-label="Attach file"
                  icon={<AttachmentIcon />}
                  size="sm"
                  variant="outline"
                  onClick={onOpen}
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={sendMessage}
                  isLoading={sending}
                  loadingText="Sending"
                  disabled={!newMessage.trim() || !contactPhone}
                >
                  Send
                </Button>
              </VStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Template Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Message Templates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              {templates.map(template => (
                <Card
                  key={template.id}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => {
                    handleTemplateSelect(template.id);
                    onClose();
                  }}
                >
                  <CardBody>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{template.name}</Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={3}>
                        {template.content}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SMSInterface;
