import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  IconButton,
  useColorModeValue,
  Divider,
  Badge,
  Avatar,
  Textarea,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { FiSend, FiPhone, FiMail, FiMessageSquare, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { Lead, CommunicationMessage } from '../types/lead';
import { useLeadCommunication } from '../hooks/useLeadCommunication';

interface CommunicationPanelProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

export const CommunicationPanel: React.FC<CommunicationPanelProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email' | 'call'>('sms');
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
    markAsRead,
    deleteMessage,
  } = useLeadCommunication(lead.id);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const messageBgColor = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage(messageType, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'sms': return <FiMessageSquare />;
      case 'email': return <FiMail />;
      case 'call': return <FiPhone />;
      default: return <FiMessageSquare />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'blue';
      case 'delivered': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      right={4}
      bottom={4}
      w={isExpanded ? "400px" : "300px"}
      h={isExpanded ? "600px" : "400px"}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="lg"
      zIndex={1000}
      transition="all 0.3s"
    >
      {/* Header */}
      <Box
        p={4}
        borderBottom="1px solid"
        borderColor={borderColor}
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Avatar size="sm" name={`${lead.firstName} ${lead.lastName}`} />
            <VStack spacing={0} align="start">
              <Text fontWeight="semibold" fontSize="sm">
                {lead.firstName} {lead.lastName}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {lead.email}
              </Text>
            </VStack>
          </HStack>
          <HStack spacing={2}>
            <IconButton
              icon={<FiMoreVertical />}
              variant="ghost"
              size="sm"
              aria-label="More options"
            />
            <IconButton
              icon={<FiTrash2 />}
              variant="ghost"
              size="sm"
              aria-label="Close"
              onClick={onClose}
            />
          </HStack>
        </HStack>
      </Box>

      {/* Messages Area */}
      <Box
        flex={1}
        overflowY="auto"
        p={4}
        h={isExpanded ? "450px" : "250px"}
      >
        {loading ? (
          <VStack spacing={4} justify="center" h="100%">
            <Spinner size="md" />
            <Text fontSize="sm" color="gray.500">Loading messages...</Text>
          </VStack>
        ) : error ? (
          <Alert status="error" size="sm">
            <AlertIcon />
            <Box>
              <AlertTitle>Error loading messages</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        ) : messages.length === 0 ? (
          <VStack spacing={4} justify="center" h="100%">
            <FiMessageSquare size={24} />
            <Text fontSize="sm" color="gray.500" textAlign="center">
              No messages yet
            </Text>
            <Text fontSize="xs" color="gray.400" textAlign="center">
              Start a conversation with {lead.firstName}
            </Text>
          </VStack>
        ) : (
          <VStack spacing={3} align="stretch">
            {messages.map((message) => (
              <Box
                key={message.id}
                bg={messageBgColor}
                p={3}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <HStack justify="space-between" align="start" mb={2}>
                  <HStack spacing={2}>
                    {getMessageIcon(message.type)}
                    <Badge size="sm" colorScheme={getStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                  </HStack>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="xs"
                      aria-label="Message options"
                    />
                    <MenuList>
                      <MenuItem onClick={() => markAsRead(message.id)}>
                        Mark as Read
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        color="red.500"
                        onClick={() => deleteMessage(message.id)}
                      >
                        Delete Message
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                <Text fontSize="sm" mb={2}>
                  {message.content}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatTimestamp(message.timestamp)}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Message Input */}
      <Box p={4} borderTop="1px solid" borderColor={borderColor}>
        <VStack spacing={3}>
          <HStack spacing={2} w="100%">
            <Button
              size="sm"
              variant={messageType === 'sms' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setMessageType('sms')}
            >
              <FiMessageSquare />
            </Button>
            <Button
              size="sm"
              variant={messageType === 'email' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setMessageType('email')}
            >
              <FiMail />
            </Button>
            <Button
              size="sm"
              variant={messageType === 'call' ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setMessageType('call')}
            >
              <FiPhone />
            </Button>
          </HStack>
          
          <HStack spacing={2} w="100%">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type your ${messageType} message...`}
              size="sm"
              resize="none"
              rows={2}
            />
            <IconButton
              icon={<FiSend />}
              colorScheme="blue"
              size="sm"
              onClick={handleSendMessage}
              isDisabled={!newMessage.trim()}
              aria-label="Send message"
            />
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};
