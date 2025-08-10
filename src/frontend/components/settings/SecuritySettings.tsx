import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiShield, FiLock, FiClock, FiMapPin, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { settingsService, SecuritySettings as SecuritySettingsType } from '../../services/settingsService';

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SecuritySettingsType | null>(null);
  
  // Password change modal
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  // 2FA modal
  const { isOpen: is2FAOpen, onOpen: on2FAOpen, onClose: on2FAClose } = useDisclosure();
  const [twoFactorMethod, setTwoFactorMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Session management
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadSecuritySettings();
    loadActiveSessions();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSecuritySettings();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      toast({
        title: 'Error loading settings',
        description: 'Failed to load security settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    // Mock data - replace with actual API call
    setActiveSessions([
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'New York, NY',
        ip: '192.168.1.1',
        lastActive: '2024-01-15T10:30:00Z',
        isCurrent: true,
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'San Francisco, CA',
        ip: '192.168.1.2',
        lastActive: '2024-01-14T15:45:00Z',
        isCurrent: false,
      },
    ]);
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setIsSaving(true);
      const updatedSettings = await settingsService.updateSecuritySettings(formData);
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      toast({
        title: 'Settings saved',
        description: 'Your security settings have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save security settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    const errors: string[] = [];
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.push('New passwords do not match');
    }
    if (passwordForm.newPassword.length < (formData?.passwordPolicy.minLength || 8)) {
      errors.push(`Password must be at least ${formData?.passwordPolicy.minLength || 8} characters`);
    }
    
    setPasswordErrors(errors);
    if (errors.length > 0) return;

    try {
      await settingsService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onPasswordClose();
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({
        title: 'Password change failed',
        description: 'Failed to change password. Please check your current password.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handle2FAEnable = async () => {
    try {
      const result = await settingsService.enableTwoFactor(twoFactorMethod);
      if (result.qrCode) {
        setQrCode(result.qrCode);
      }
      setBackupCodes(result.backupCodes);
    } catch (error) {
      toast({
        title: '2FA setup failed',
        description: 'Failed to enable two-factor authentication',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handle2FAVerify = async () => {
    try {
      const verified = await settingsService.verifyTwoFactor(verificationCode);
      if (verified) {
        toast({
          title: '2FA enabled',
          description: 'Two-factor authentication has been enabled successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        on2FAClose();
        loadSecuritySettings();
      } else {
        toast({
          title: 'Verification failed',
          description: 'Invalid verification code',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Failed to verify two-factor authentication',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handle2FADisable = async () => {
    try {
      await settingsService.disableTwoFactor();
      toast({
        title: '2FA disabled',
        description: 'Two-factor authentication has been disabled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadSecuritySettings();
    } catch (error) {
      toast({
        title: 'Disable failed',
        description: 'Failed to disable two-factor authentication',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const terminateSession = async (sessionId: string) => {
    // Mock implementation - replace with actual API call
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({
      title: 'Session terminated',
      description: 'The selected session has been terminated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const updateFormData = (path: string, value: any) => {
    if (!formData) return;
    
    const keys = path.split('.');
    const newData = { ...formData };
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setFormData(newData);
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Text>Loading security settings...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color={textColor}>
        Security Settings
      </Heading>
      
      {/* Password Management */}
      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiLock} color="blue.500" />
            <Heading size="md">Password Management</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Button colorScheme="blue" onClick={onPasswordOpen} leftIcon={<FiLock />}>
              Change Password
            </Button>
            
            {formData?.passwordPolicy && (
              <Box>
                <Text fontWeight="medium" mb={2}>Password Requirements:</Text>
                <SimpleGrid columns={2} spacing={2}>
                  <Text fontSize="sm">• Minimum length: {formData.passwordPolicy.minLength} characters</Text>
                  <Text fontSize="sm">• Uppercase letters: {formData.passwordPolicy.requireUppercase ? 'Required' : 'Optional'}</Text>
                  <Text fontSize="sm">• Lowercase letters: {formData.passwordPolicy.requireLowercase ? 'Required' : 'Optional'}</Text>
                  <Text fontSize="sm">• Numbers: {formData.passwordPolicy.requireNumbers ? 'Required' : 'Optional'}</Text>
                  <Text fontSize="sm">• Special characters: {formData.passwordPolicy.requireSpecialChars ? 'Required' : 'Optional'}</Text>
                  <Text fontSize="sm">• Expires after: {formData.passwordPolicy.expirationDays} days</Text>
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiShield} color="blue.500" />
            <Heading size="md">Two-Factor Authentication</Heading>
            <Badge colorScheme={formData?.twoFactorEnabled ? 'green' : 'gray'}>
              {formData?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {!formData?.twoFactorEnabled ? (
              <Button colorScheme="blue" onClick={on2FAOpen} leftIcon={<FiShield />}>
                Enable 2FA
              </Button>
            ) : (
              <VStack spacing={3} align="stretch">
                <Text>Method: {formData.twoFactorMethod.toUpperCase()}</Text>
                <Button colorScheme="red" variant="outline" onClick={handle2FADisable}>
                  Disable 2FA
                </Button>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiClock} color="blue.500" />
            <Heading size="md">Session Management</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text>Session timeout: {formData?.sessionTimeout || 30} minutes</Text>
              <Button size="sm" onClick={loadActiveSessions} leftIcon={<FiRefreshCw />}>
                Refresh
              </Button>
            </HStack>
            
            <Box>
              <Text fontWeight="medium" mb={2}>Active Sessions:</Text>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Device</Th>
                    <Th>Location</Th>
                    <Th>IP Address</Th>
                    <Th>Last Active</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activeSessions.map((session) => (
                    <Tr key={session.id}>
                      <Td>
                        <HStack>
                          <Text>{session.device}</Text>
                          {session.isCurrent && <Badge colorScheme="green" size="sm">Current</Badge>}
                        </HStack>
                      </Td>
                      <Td>{session.location}</Td>
                      <Td>{session.ip}</Td>
                      <Td>{new Date(session.lastActive).toLocaleString()}</Td>
                      <Td>
                        {!session.isCurrent && (
                          <Tooltip label="Terminate session">
                            <IconButton
                              aria-label="Terminate session"
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => terminateSession(session.id)}
                            />
                          </Tooltip>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <HStack>
            <Icon as={FiShield} color="blue.500" />
            <Heading size="md">Security Preferences</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Track login history</FormLabel>
              <Switch
                isChecked={formData?.loginHistory}
                onChange={(e) => updateFormData('loginHistory', e.target.checked)}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Session timeout (minutes)</FormLabel>
              <NumberInput
                value={formData?.sessionTimeout || 30}
                onChange={(_, value) => updateFormData('sessionTimeout', value)}
                min={5}
                max={480}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <Button colorScheme="blue" onClick={handleSave} isLoading={isSaving}>
              Save Security Preferences
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Password Change Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              {passwordErrors.length > 0 && (
                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Password validation errors:</AlertTitle>
                    {passwordErrors.map((error, index) => (
                      <AlertDescription key={index}>{error}</AlertDescription>
                    ))}
                  </Box>
                </Alert>
              )}
              
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password visibility"
                      icon={showPasswords.current ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password visibility"
                      icon={showPasswords.new ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password visibility"
                      icon={showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handlePasswordChange}>
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal isOpen={is2FAOpen} onClose={on2FAClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enable Two-Factor Authentication</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Authentication Method</FormLabel>
                <Select
                  value={twoFactorMethod}
                  onChange={(e) => setTwoFactorMethod(e.target.value as 'totp' | 'sms' | 'email')}
                >
                  <option value="totp">Authenticator App (TOTP)</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </Select>
              </FormControl>
              
              {twoFactorMethod === 'totp' && (
                <Box textAlign="center">
                  <Text mb={2}>Scan this QR code with your authenticator app:</Text>
                  {qrCode && (
                    <Box p={4} border="1px" borderColor={borderColor} borderRadius="md">
                      <img src={qrCode} alt="QR Code" style={{ maxWidth: '200px' }} />
                    </Box>
                  )}
                </Box>
              )}
              
              {backupCodes.length > 0 && (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Backup Codes</AlertTitle>
                    <AlertDescription>
                      Save these backup codes in a secure location. You can use them to access your account if you lose your 2FA device.
                    </AlertDescription>
                    <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                      {backupCodes.map((code, index) => (
                        <Text key={index} fontFamily="mono" fontSize="sm">{code}</Text>
                      ))}
                    </Box>
                  </Box>
                </Alert>
              )}
              
              <FormControl>
                <FormLabel>Verification Code</FormLabel>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={on2FAClose}>
              Cancel
            </Button>
            {!qrCode ? (
              <Button colorScheme="blue" onClick={handle2FAEnable}>
                Setup 2FA
              </Button>
            ) : (
              <Button colorScheme="blue" onClick={handle2FAVerify}>
                Verify & Enable
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default SecuritySettings;
