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
  Select,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FiSave, FiEdit2 } from 'react-icons/fi';

interface GeneralSettingsData {
  companyName: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  currency: string;
  language: string;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState<GeneralSettingsData>({
    companyName: 'Test Company',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York',
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast({
        title: 'Settings saved',
        description: 'General settings have been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
  };

  const updateField = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md" color={textColor}>
              General Settings
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Company Information */}
              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input
                  value={settings.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  isDisabled={!isEditing}
                  placeholder="Enter company name"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    value={settings.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    isDisabled={!isEditing}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Date Format</FormLabel>
                  <Select
                    value={settings.dateFormat}
                    onChange={(e) => updateField('dateFormat', e.target.value)}
                    isDisabled={!isEditing}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    value={settings.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    isDisabled={!isEditing}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => updateField('language', e.target.value)}
                    isDisabled={!isEditing}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </Select>
                </FormControl>
              </HStack>

              <Divider />

              {/* Business Hours */}
              <Box>
                <Heading size="sm" mb={4} color={textColor}>
                  Business Hours
                </Heading>
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Start Time</FormLabel>
                    <Input
                      type="time"
                      value={settings.businessHours.start}
                      onChange={(e) => updateField('businessHours.start', e.target.value)}
                      isDisabled={!isEditing}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      type="time"
                      value={settings.businessHours.end}
                      onChange={(e) => updateField('businessHours.end', e.target.value)}
                      isDisabled={!isEditing}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Business Hours Timezone</FormLabel>
                    <Select
                      value={settings.businessHours.timezone}
                      onChange={(e) => updateField('businessHours.timezone', e.target.value)}
                      isDisabled={!isEditing}
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </Select>
                  </FormControl>
                </HStack>
              </Box>

              <Divider />

              {/* Notification Preferences */}
              <Box>
                <Heading size="sm" mb={4} color={textColor}>
                  Notification Preferences
                </Heading>
                <VStack spacing={3} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="email-notifications" mb="0">
                      Email Notifications
                    </FormLabel>
                    <Switch
                      id="email-notifications"
                      isChecked={settings.notifications.email}
                      onChange={(e) => updateField('notifications.email', e.target.checked)}
                      isDisabled={!isEditing}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="sms-notifications" mb="0">
                      SMS Notifications
                    </FormLabel>
                    <Switch
                      id="sms-notifications"
                      isChecked={settings.notifications.sms}
                      onChange={(e) => updateField('notifications.sms', e.target.checked)}
                      isDisabled={!isEditing}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="push-notifications" mb="0">
                      Push Notifications
                    </FormLabel>
                    <Switch
                      id="push-notifications"
                      isChecked={settings.notifications.push}
                      onChange={(e) => updateField('notifications.push', e.target.checked)}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack spacing={4} justify="flex-end">
          {!isEditing ? (
            <Button
              leftIcon={<FiEdit2 />}
              onClick={() => setIsEditing(true)}
              colorScheme="blue"
            >
              Edit Settings
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                isDisabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<FiSave />}
                onClick={handleSave}
                colorScheme="blue"
                isLoading={isSaving}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default GeneralSettings;
