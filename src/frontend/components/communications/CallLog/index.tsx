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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Select,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';
import { 
  PhoneIcon, 
  PhoneIcon as PhoneIncomingIcon,
  PhoneIcon as PhoneOutgoingIcon,
  DownloadIcon,
  EditIcon,
  CalendarIcon,
  TimeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { communicationService, CommunicationLog } from '../../../services/communicationService';
import { formatPhoneNumber } from '../../../utils/phone';
import { formatDateTime, formatRelativeTime } from '../../../utils/date';

interface CallLogProps {
  leadId?: string;
  buyerId?: string;
  onCallInitiated?: (call: CommunicationLog) => void;
  showCallActions?: boolean;
}

interface CallRecord {
  id: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  duration: number; // in seconds
  status: 'completed' | 'missed' | 'failed' | 'busy' | 'no-answer';
  timestamp: Date;
  recordingUrl?: string;
  notes?: string;
  cost?: number;
}

const CallLog: React.FC<CallLogProps> = ({
  leadId,
  buyerId,
  onCallInitiated,
  showCallActions = true,
}) => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initiatingCall, setInitiatingCall] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadCallLog();
  }, [leadId, buyerId]);

  const loadCallLog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: CommunicationLog[] = [];
      
      if (leadId) {
        data = await communicationService.getCommunicationHistory(leadId);
      }
      
      // Convert CommunicationLog to CallRecord format
      const convertedCalls: CallRecord[] = data
        .filter(comm => comm.type === 'voice')
        .map(comm => ({
          id: comm.id,
          phoneNumber: comm.to,
          direction: comm.direction,
          duration: 0, // This would come from call analytics
          status: (comm.status === 'delivered' ? 'completed' : 
                 comm.status === 'failed' ? 'failed' : 'missed') as 'completed' | 'missed' | 'failed' | 'busy' | 'no-answer',
          timestamp: new Date(comm.createdAt),
          cost: comm.cost,
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setCalls(convertedCalls);
    } catch (err) {
      setError('Failed to load call log');
      toast({
        title: 'Error',
        description: 'Failed to load call log',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateCall = async (phoneNumber: string) => {
    if (!phoneNumber) return;

    try {
      setInitiatingCall(true);
      
      const result = await communicationService.makeVoiceCall({
        to: phoneNumber,
        from: '+1234567890', // This should come from user settings or Twilio config
        twiml: '<Response><Say>Hello from DealCycle CRM</Say></Response>',
        leadId,
      });

      if (result.success) {
        const newCall: CallRecord = {
          id: result.messageId || Date.now().toString(),
          phoneNumber,
          direction: 'outbound',
          duration: 0,
          status: 'completed',
          timestamp: new Date(),
          cost: result.cost,
        };

        setCalls(prev => [newCall, ...prev]);
        onCallInitiated?.({
          id: newCall.id,
          leadId: leadId || '',
          userId: '', // This should come from auth context
          tenantId: '', // This should come from auth context
          type: 'voice',
          direction: 'outbound',
          to: phoneNumber,
          from: '+1234567890',
          content: 'Voice call',
          status: 'sent',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        toast({
          title: 'Call initiated',
          description: 'Your call has been initiated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Failed to initiate call');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to initiate call',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setInitiatingCall(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'missed':
        return 'red';
      case 'failed':
        return 'red';
      case 'busy':
        return 'yellow';
      case 'no-answer':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? <PhoneIncomingIcon color="green.500" /> : <PhoneOutgoingIcon color="blue.500" />;
  };

  const handlePlayRecording = (recordingUrl: string) => {
    setPlayingRecording(recordingUrl);
    // Here you would implement actual audio playback
    // For now, we'll just show a toast
    toast({
      title: 'Playing recording',
      description: 'Audio playback would start here',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleEditNotes = (call: CallRecord) => {
    setSelectedCall(call);
    onOpen();
  };

  const saveNotes = async () => {
    if (!selectedCall) return;

    try {
      // Here you would save the notes to the backend
      const updatedCalls = calls.map(call =>
        call.id === selectedCall.id
          ? { ...call, notes: selectedCall.notes }
          : call
      );
      setCalls(updatedCalls);
      
      toast({
        title: 'Notes saved',
        description: 'Call notes have been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <VStack spacing={4} align="stretch">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="80px" />
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
      {/* Call Actions */}
      {showCallActions && (
        <Card mb={4}>
          <CardBody>
            <VStack spacing={3}>
              <Text fontWeight="semibold">Quick Actions</Text>
              <HStack spacing={3}>
                <Button
                  leftIcon={<PhoneIcon />}
                  colorScheme="green"
                  onClick={() => initiateCall('+1234567890')} // This should be the contact's phone
                  isLoading={initiatingCall}
                  loadingText="Initiating..."
                >
                  Call Contact
                </Button>
                <Button
                  leftIcon={<CalendarIcon />}
                  variant="outline"
                >
                  Schedule Call
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Call Log */}
      <VStack spacing={3} align="stretch">
        {calls.length === 0 ? (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                No calls found
              </Text>
            </CardBody>
          </Card>
        ) : (
          calls.map((call) => (
            <Card key={call.id}>
              <CardBody>
                <HStack spacing={3} align="start">
                  <Box>
                    {getDirectionIcon(call.direction)}
                  </Box>
                  
                  <VStack align="start" flex={1} spacing={1}>
                    <HStack justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Text fontWeight="semibold">
                          {formatPhoneNumber(call.phoneNumber)}
                        </Text>
                        <Badge colorScheme={getStatusColor(call.status)} size="sm">
                          {call.status}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {call.direction}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {formatDateTime(call.timestamp)}
                      </Text>
                    </HStack>
                    
                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <TimeIcon />
                        <Text>{formatDuration(call.duration)}</Text>
                      </HStack>
                      {call.cost && (
                        <Text>Cost: ${call.cost.toFixed(4)}</Text>
                      )}
                    </HStack>
                    
                    {call.notes && (
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {call.notes}
                      </Text>
                    )}
                  </VStack>
                  
                  <VStack spacing={1}>
                    {call.recordingUrl && (
                      <IconButton
                        aria-label="Play recording"
                        icon={playingRecording === call.recordingUrl ? <ChevronDownIcon /> : <ChevronRightIcon />}
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayRecording(call.recordingUrl!)}
                      />
                    )}
                    <IconButton
                      aria-label="Edit notes"
                      icon={<EditIcon />}
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditNotes(call)}
                    />
                    {call.recordingUrl && (
                      <IconButton
                        aria-label="Download recording"
                        icon={<DownloadIcon />}
                        size="sm"
                        variant="outline"
                      />
                    )}
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>

      {/* Notes Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Call Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Call Details</FormLabel>
                <Text fontSize="sm" color="gray.600">
                  {selectedCall && (
                    <>
                      {formatPhoneNumber(selectedCall.phoneNumber)} - {formatDateTime(selectedCall.timestamp)}
                    </>
                  )}
                </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={selectedCall?.notes || ''}
                  onChange={(e) => setSelectedCall(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="Add notes about this call..."
                  rows={4}
                />
                <FormHelperText>
                  Add any important details or follow-up actions from this call.
                </FormHelperText>
              </FormControl>
              
              <HStack spacing={3} w="full">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={saveNotes}>
                  Save Notes
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CallLog;
