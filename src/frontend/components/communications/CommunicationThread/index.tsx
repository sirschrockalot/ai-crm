import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Avatar,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  IconButton,
  Divider,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Spacer,
} from '@chakra-ui/react';
import { 
  ChatIcon,
  PhoneIcon,
  EmailIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
  TimeIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { communicationService, CommunicationLog } from '../../../services/communicationService';
import { formatPhoneNumber } from '../../../utils/phone';
import { formatRelativeTime, formatDateTime } from '../../../utils/date';

interface CommunicationThreadProps {
  leadId?: string;
  buyerId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  onReply?: (message: CommunicationLog, reply: string) => void;
  onForward?: (message: CommunicationLog) => void;
}

interface ThreadMessage {
  id: string;
  type: 'sms' | 'voice' | 'email';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed' | 'queued' | 'read';
  sender: string;
  recipient: string;
  threadId: string;
  parentId?: string;
  replies: ThreadMessage[];
  metadata?: {
    subject?: string;
    attachments?: string[];
    duration?: number;
    cost?: number;
  };
}

const CommunicationThread: React.FC<CommunicationThreadProps> = ({
  leadId,
  buyerId,
  contactName,
  contactPhone,
  contactEmail,
  onReply,
  onForward,
}) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ThreadMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadThread();
  }, [leadId, buyerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadThread = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: CommunicationLog[] = [];
      
      if (leadId) {
        data = await communicationService.getCommunicationHistory(leadId);
      }
      
      // Convert CommunicationLog to ThreadMessage format and organize into threads
      const convertedMessages: ThreadMessage[] = data.map(comm => ({
        id: comm.id,
        type: comm.type as 'sms' | 'voice' | 'email',
        direction: comm.direction,
        content: comm.content,
        timestamp: new Date(comm.createdAt),
        status: comm.status,
        sender: comm.from,
        recipient: comm.to,
        threadId: comm.id, // In a real implementation, this would be a thread identifier
        replies: [] as ThreadMessage[],
        metadata: {
          cost: comm.cost,
        },
      }));
      
      // Sort by timestamp
      const sortedMessages = convertedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setMessages(sortedMessages);
    } catch (err) {
      setError('Failed to load communication thread');
      toast({
        title: 'Error',
        description: 'Failed to load communication thread',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setReplying(true);
      
      // Mock reply sending - in real implementation, this would call the appropriate service
      await new Promise(resolve => setTimeout(resolve, 1000));

      const replyMessage: ThreadMessage = {
        id: Date.now().toString(),
        type: selectedMessage.type,
        direction: 'outbound',
        content: replyText,
        timestamp: new Date(),
        status: 'sent',
        sender: selectedMessage.recipient,
        recipient: selectedMessage.sender,
        threadId: selectedMessage.threadId,
        parentId: selectedMessage.id,
        replies: [] as ThreadMessage[],
      };

      setMessages(prev => [...prev, replyMessage]);
      setReplyText('');
      onClose();
      
      onReply?.({
        id: replyMessage.id,
        leadId: leadId || '',
        userId: '',
        tenantId: '',
        type: replyMessage.type,
        direction: replyMessage.direction,
        to: replyMessage.recipient,
        from: replyMessage.sender,
        content: replyMessage.content,
        status: replyMessage.status === 'read' ? 'delivered' : replyMessage.status,
        createdAt: replyMessage.timestamp,
        updatedAt: replyMessage.timestamp,
      }, replyText);

      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setReplying(false);
    }
  };

  const handleForward = (message: ThreadMessage) => {
    onForward?.({
      id: message.id,
      leadId: leadId || '',
      userId: '',
      tenantId: '',
      type: message.type,
      direction: message.direction,
      to: message.recipient,
      from: message.sender,
      content: message.content,
      status: message.status === 'read' ? 'delivered' : message.status,
      createdAt: message.timestamp,
      updatedAt: message.timestamp,
    });
  };

  const getTypeIcon = (type: string) => {
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
      case 'read':
        return <CheckIcon color="green.500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return 'green';
      case 'sent':
        return 'blue';
      case 'failed':
        return 'red';
      case 'queued':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatContact = (contact: string, type: string) => {
    if (type === 'sms' || type === 'voice') {
      return formatPhoneNumber(contact);
    }
    return contact;
  };

  if (loading) {
    return (
      <VStack spacing={4} align="stretch">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="100px" />
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
    <Box>
      {/* Thread Header */}
      <Card mb={4}>
        <CardBody>
          <HStack spacing={3}>
            <Avatar size="md" name={contactName} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">{contactName || 'Unknown Contact'}</Text>
              <HStack spacing={2} fontSize="sm" color="gray.500">
                {contactPhone && (
                  <Text>{formatPhoneNumber(contactPhone)}</Text>
                )}
                {contactEmail && (
                  <Text>{contactEmail}</Text>
                )}
              </HStack>
            </VStack>
            <Spacer />
            <Badge colorScheme="blue" variant="outline">
              {messages.length} messages
            </Badge>
          </HStack>
        </CardBody>
      </Card>

      {/* Messages */}
      <VStack spacing={3} align="stretch" maxH="600px" overflowY="auto">
        {messages.length === 0 ? (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                No messages in this thread
              </Text>
            </CardBody>
          </Card>
        ) : (
          messages.map((message, index) => (
            <Box key={message.id}>
              <Card
                bg={message.direction === 'outbound' ? 'blue.50' : 'gray.50'}
                borderLeft={message.direction === 'outbound' ? '4px solid blue.500' : '4px solid gray.500'}
              >
                <CardBody>
                  <VStack align="start" spacing={2}>
                    {/* Message Header */}
                    <HStack justify="space-between" w="full">
                      <HStack spacing={2}>
                        {getTypeIcon(message.type)}
                        <Text fontSize="sm" fontWeight="medium">
                          {message.direction === 'outbound' ? 'You' : contactName || 'Contact'}
                        </Text>
                        <Badge colorScheme={getStatusColor(message.status)} size="sm">
                          {message.status}
                        </Badge>
                        {message.direction === 'outbound' && getStatusIcon(message.status)}
                      </HStack>
                      <HStack spacing={1}>
                        <Text fontSize="xs" color="gray.500">
                          {formatRelativeTime(message.timestamp)}
                        </Text>
                        <IconButton
                          aria-label="Reply"
                          icon={<ChevronRightIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setSelectedMessage(message);
                            onOpen();
                          }}
                        />
                        <IconButton
                          aria-label="Forward"
                          icon={<ChevronUpIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={() => handleForward(message)}
                        />
                        <IconButton
                          aria-label="More options"
                          icon={<ChevronDownIcon />}
                          size="xs"
                          variant="ghost"
                        />
                      </HStack>
                    </HStack>

                    {/* Contact Info */}
                    <HStack spacing={4} fontSize="xs" color="gray.600">
                      <Text>
                        <strong>From:</strong> {formatContact(message.sender, message.type)}
                      </Text>
                      <Text>
                        <strong>To:</strong> {formatContact(message.recipient, message.type)}
                      </Text>
                    </HStack>

                    {/* Message Content */}
                    <Box w="full">
                      {message.metadata?.subject && (
                        <Text fontSize="sm" fontWeight="semibold" mb={1}>
                          Subject: {message.metadata.subject}
                        </Text>
                      )}
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {message.content}
                      </Text>
                    </Box>

                    {/* Message Metadata */}
                    <HStack spacing={4} fontSize="xs" color="gray.500">
                      <Text>{formatDateTime(message.timestamp)}</Text>
                      {message.metadata?.duration && (
                        <Text>Duration: {Math.floor(message.metadata.duration / 60)}:{(message.metadata.duration % 60).toString().padStart(2, '0')}</Text>
                      )}
                      {message.metadata?.cost && (
                        <Text>Cost: ${message.metadata.cost.toFixed(4)}</Text>
                      )}
                    </HStack>

                    {/* Attachments */}
                    {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" fontWeight="medium" color="gray.600">
                          Attachments:
                        </Text>
                        {message.metadata.attachments.map((attachment, idx) => (
                          <Text key={idx} fontSize="xs" color="blue.500" cursor="pointer">
                            📎 {attachment}
                          </Text>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Thread connector */}
              {index < messages.length - 1 && (
                <Box textAlign="center" py={2}>
                  <Divider />
                </Box>
              )}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Reply Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reply to Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {selectedMessage && (
                <Card w="full">
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>
                        {getTypeIcon(selectedMessage.type)}
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedMessage.direction === 'outbound' ? 'You' : contactName || 'Contact'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatDateTime(selectedMessage.timestamp)}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {selectedMessage.content}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}
              
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
              />
              
              <HStack spacing={3} w="full">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleReply}
                  isLoading={replying}
                  loadingText="Sending"
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CommunicationThread;
