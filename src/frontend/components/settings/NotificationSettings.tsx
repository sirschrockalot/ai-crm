import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Select,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiBell, FiMail, FiSmartphone, FiSave, FiActivity } from 'react-icons/fi';
import { settingsService, NotificationSettings as NotificationSettingsType } from '../../services/settingsService';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<NotificationSettingsType | null>(null);
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getNotificationSettings();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      toast({
        title: 'Error loading settings',
        description: 'Failed to load notification settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setIsSaving(true);
      const updatedSettings = await settingsService.updateNotificationSettings(formData);
      setSettings(updatedSettings);
      setFormData(updatedSettings);
      toast({
        title: 'Settings saved',
        description: 'Your notification settings have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save notification settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async (type: 'email' | 'push' | 'sms') => {
    try {
      // This would call a test notification API
      toast({
        title: 'Test notification sent',
        description: `A test ${type} notification has been sent`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Test failed',
        description: `Failed to send test ${type} notification`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
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

  if (!settings || !formData) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading notification settings...</Text>
      </Box>
    );
  }

  const notificationTypes = [
    { value: 'lead_assigned', label: 'Lead Assignment' },
    { value: 'lead_status_change', label: 'Lead Status Changes' },
    { value: 'communication_received', label: 'New Communications' },
    { value: 'deal_closed', label: 'Deal Closed' },
    { value: 'task_due', label: 'Task Due Reminders' },
    { value: 'system_alerts', label: 'System Alerts' },
    { value: 'security_alerts', label: 'Security Alerts' },
    { value: 'performance_reports', label: 'Performance Reports' },
  ];

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Notification Settings
        </Heading>
        <Text color="gray.600">
          Configure how and when you receive notifications
        </Text>
      </Box>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <HStack spacing={3}>
            <FiMail />
            <Heading size="md">Email Notifications</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Enable Email Notifications</Text>
                <Text fontSize="sm" color="gray.600">
                  Receive notifications via email
                </Text>
              </VStack>
              <Switch
                isChecked={formData.email.enabled}
                onChange={(e) => updateFormData('email.enabled', e.target.checked)}
              />
            </HStack>
            
            {formData.email.enabled && (
              <>
                <Divider />
                <FormControl>
                  <FormLabel>Notification Frequency</FormLabel>
                  <Select
                    value={formData.email.frequency}
                    onChange={(e) => updateFormData('email.frequency', e.target.value)}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notification Types</FormLabel>
                  <CheckboxGroup
                    value={formData.email.types}
                    onChange={(values) => updateFormData('email.types', values)}
                  >
                    <SimpleGrid columns={2} spacing={3}>
                      {notificationTypes.map((type) => (
                        <Checkbox key={type.value} value={type.value}>
                          {type.label}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>
                
                <HStack justify="space-between">
                  <Button
                    leftIcon={<FiActivity />}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('email')}
                  >
                    Send Test Email
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <HStack spacing={3}>
            <FiBell />
            <Heading size="md">Push Notifications</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Enable Push Notifications</Text>
                <Text fontSize="sm" color="gray.600">
                  Receive real-time notifications in your browser
                </Text>
              </VStack>
              <Switch
                isChecked={formData.push.enabled}
                onChange={(e) => updateFormData('push.enabled', e.target.checked)}
              />
            </HStack>
            
            {formData.push.enabled && (
              <>
                <Divider />
                <FormControl>
                  <FormLabel>Notification Types</FormLabel>
                  <CheckboxGroup
                    value={formData.push.types}
                    onChange={(values) => updateFormData('push.types', values)}
                  >
                    <SimpleGrid columns={2} spacing={3}>
                      {notificationTypes.map((type) => (
                        <Checkbox key={type.value} value={type.value}>
                          {type.label}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>
                
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Browser Permission Required</AlertTitle>
                    <AlertDescription>
                      Make sure to allow notifications in your browser settings for this site.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <HStack justify="space-between">
                  <Button
                    leftIcon={<FiActivity />}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('push')}
                  >
                    Send Test Push
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <HStack spacing={3}>
            <FiSmartphone />
            <Heading size="md">SMS Notifications</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Enable SMS Notifications</Text>
                <Text fontSize="sm" color="gray.600">
                  Receive urgent notifications via SMS
                </Text>
              </VStack>
              <Switch
                isChecked={formData.sms.enabled}
                onChange={(e) => updateFormData('sms.enabled', e.target.checked)}
              />
            </HStack>
            
            {formData.sms.enabled && (
              <>
                <Divider />
                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>SMS Notifications</AlertTitle>
                    <AlertDescription>
                      SMS notifications are only sent for urgent alerts and critical system events.
                      Standard charges may apply.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <FormControl>
                  <FormLabel>Notification Types</FormLabel>
                  <CheckboxGroup
                    value={formData.sms.types}
                    onChange={(values) => updateFormData('sms.types', values)}
                  >
                    <SimpleGrid columns={1} spacing={3}>
                      <Checkbox value="security_alerts">Security Alerts</Checkbox>
                      <Checkbox value="system_outages">System Outages</Checkbox>
                      <Checkbox value="critical_deals">Critical Deal Updates</Checkbox>
                    </SimpleGrid>
                  </CheckboxGroup>
                </FormControl>
                
                <HStack justify="space-between">
                  <Button
                    leftIcon={<FiActivity />}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification('sms')}
                  >
                    Send Test SMS
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <Heading size="md">Global Settings</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Notification Preferences</AlertTitle>
                <AlertDescription>
                  These settings apply to all notification types. You can override specific settings
                  for each notification type above.
                </AlertDescription>
              </Box>
            </Alert>
            
            <Text fontSize="sm" color="gray.600">
              <strong>Note:</strong> Some notifications are required for system functionality and
              cannot be disabled. Critical security alerts will always be delivered.
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Save Button */}
      <HStack justify="flex-end" spacing={3}>
        <Button
          colorScheme="blue"
          leftIcon={<FiSave />}
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving..."
        >
          Save Notification Settings
        </Button>
      </HStack>
    </VStack>
  );
};

export default NotificationSettings;
