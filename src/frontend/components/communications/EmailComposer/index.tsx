import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
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
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { 
  EmailIcon,
  AttachmentIcon,
  ChevronRightIcon,
  DownloadIcon,
  EditIcon,
  CheckIcon,
  TimeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';

interface EmailComposerProps {
  leadId?: string;
  buyerId?: string;
  contactEmail?: string;
  contactName?: string;
  onEmailSent?: (email: any) => void;
  initialSubject?: string;
  initialBody?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  leadId,
  buyerId,
  contactEmail,
  contactName,
  onEmailSent,
  initialSubject = '',
  initialBody = '',
}) => {
  const [to, setTo] = useState(contactEmail || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Mock templates - in real implementation, these would come from API
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Follow-up Email',
          subject: 'Follow-up on your property inquiry',
          body: 'Dear {{name}},\n\nThank you for your interest in our property services. I wanted to follow up on your inquiry and see if you have any questions.\n\nBest regards,\n{{sender_name}}',
          variables: ['name', 'sender_name'],
        },
        {
          id: '2',
          name: 'Property Update',
          subject: 'Update on your property listing',
          body: 'Hello {{name}},\n\nI wanted to provide you with an update on your property listing. {{update_details}}\n\nPlease let me know if you need any clarification.\n\nRegards,\n{{sender_name}}',
          variables: ['name', 'update_details', 'sender_name'],
        },
        {
          id: '3',
          name: 'Meeting Request',
          subject: 'Meeting request for property discussion',
          body: 'Dear {{name}},\n\nI would like to schedule a meeting to discuss your property needs in detail. Please let me know your availability.\n\nBest regards,\n{{sender_name}}',
          variables: ['name', 'sender_name'],
        },
      ];
      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setSelectedTemplate(templateId);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sendEmail = async () => {
    if (!to || !subject || !body) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSending(true);
      setError(null);

      // Mock email sending - in real implementation, this would call the email service
      await new Promise(resolve => setTimeout(resolve, 2000));

      const emailData = {
        id: Date.now().toString(),
        to,
        cc,
        bcc,
        subject,
        body,
        attachments: attachments.map(f => ({ name: f.name, size: f.size })),
        leadId,
        buyerId,
        sentAt: new Date(),
      };

      onEmailSent?.(emailData);

      toast({
        title: 'Email sent',
        description: 'Your email has been sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setTo(contactEmail || '');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      setAttachments([]);
      setSelectedTemplate('');

    } catch (err) {
      setError('Failed to send email');
      toast({
        title: 'Error',
        description: 'Failed to send email',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      
      // Mock draft saving - in real implementation, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Draft saved',
        description: 'Your email draft has been saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const placeholder = `{{${variable}}}`;
    setBody(prev => prev + placeholder);
  };

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
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">Compose Email</Text>
              <HStack spacing={2}>
                <Button
                  leftIcon={<DownloadIcon />}
                  variant="outline"
                  size="sm"
                  onClick={saveDraft}
                  isLoading={saving}
                  loadingText="Saving"
                >
                  Save Draft
                </Button>
                <Button
                  leftIcon={<EditIcon />}
                  variant="outline"
                  size="sm"
                  onClick={onOpen}
                >
                  Templates
                </Button>
              </HStack>
            </HStack>

            <Divider />

            {/* Template Selection */}
            {templates.length > 0 && (
              <FormControl>
                <FormLabel>Email Template</FormLabel>
                <Select
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
              </FormControl>
            )}

            {/* Recipients */}
            <FormControl isRequired>
              <FormLabel>To</FormLabel>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>CC</FormLabel>
                <Input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>BCC</FormLabel>
                <Input
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                />
              </FormControl>
            </HStack>

            {/* Subject */}
            <FormControl isRequired>
              <FormLabel>Subject</FormLabel>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </FormControl>

            {/* Body */}
            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <VStack spacing={2} align="stretch">
                {/* Rich Text Toolbar */}
                <HStack spacing={1} p={2} bg="gray.50" borderRadius="md">
                  <IconButton
                    aria-label="Bold"
                    icon={<CheckIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <IconButton
                    aria-label="Italic"
                    icon={<TimeIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <IconButton
                    aria-label="Underline"
                    icon={<ChevronDownIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <Divider orientation="vertical" />
                  <IconButton
                    aria-label="Bullet List"
                    icon={<ChevronUpIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <IconButton
                    aria-label="Insert Link"
                    icon={<ExternalLinkIcon />}
                    size="sm"
                    variant="ghost"
                  />
                </HStack>
                
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message here..."
                  rows={8}
                  resize="vertical"
                />
              </VStack>
            </FormControl>

            {/* Attachments */}
            <FormControl>
              <FormLabel>Attachments</FormLabel>
              <VStack spacing={2} align="stretch">
                <HStack>
                  <Button
                    leftIcon={<AttachmentIcon />}
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Add Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </HStack>
                
                {attachments.length > 0 && (
                  <VStack spacing={1} align="stretch">
                    {attachments.map((file, index) => (
                      <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <HStack spacing={2}>
                          <AttachmentIcon />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">{file.name}</Text>
                            <Text fontSize="xs" color="gray.500">{formatFileSize(file.size)}</Text>
                          </VStack>
                        </HStack>
                        <IconButton
                          aria-label="Remove attachment"
                          icon={<Text>×</Text>}
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAttachment(index)}
                        />
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
            </FormControl>

            {/* Send Button */}
            <HStack justify="flex-end" spacing={3}>
              <Button variant="outline" onClick={() => {
                setTo(contactEmail || '');
                setCc('');
                setBcc('');
                setSubject('');
                setBody('');
                setAttachments([]);
                setSelectedTemplate('');
              }}>
                Clear
              </Button>
              <Button
                leftIcon={<ChevronRightIcon />}
                colorScheme="blue"
                onClick={sendEmail}
                isLoading={sending}
                loadingText="Sending"
                disabled={!to || !subject || !body}
              >
                Send Email
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Template Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Templates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
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
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="semibold">{template.name}</Text>
                        <Badge colorScheme="blue" size="sm">
                          {template.variables.length} variables
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Subject: {template.subject}
                      </Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={3}>
                        {template.body}
                      </Text>
                      {template.variables.length > 0 && (
                        <HStack spacing={1}>
                          <Text fontSize="xs" color="gray.500">Variables:</Text>
                          {template.variables.map(variable => (
                            <Badge key={variable} size="sm" variant="outline">
                              {variable}
                            </Badge>
                          ))}
                        </HStack>
                      )}
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

export default EmailComposer;
