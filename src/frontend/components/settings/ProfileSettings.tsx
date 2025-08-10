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
  Select,
  Switch,
  Avatar,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  IconButton,
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
} from '@chakra-ui/react';
import { FiEdit2, FiCamera, FiSave, FiX } from 'react-icons/fi';
import { settingsService, UserProfile, UserPreferences } from '../../services/settingsService';

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [preferencesForm, setPreferencesForm] = useState<Partial<UserPreferences>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const [profileData, preferencesData] = await Promise.all([
        settingsService.getUserProfile(),
        settingsService.getUserPreferences(),
      ]);
      setProfile(profileData);
      setPreferences(preferencesData);
      setEditForm(profileData);
      setPreferencesForm(preferencesData);
    } catch (error) {
      toast({
        title: 'Error loading profile',
        description: 'Failed to load profile data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      const updatedProfile = await settingsService.updateUserProfile(editForm);
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setIsLoading(true);
      const updatedPreferences = await settingsService.updateUserPreferences(preferencesForm);
      setPreferences(updatedPreferences);
      setPreferencesForm(updatedPreferences);
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update preferences',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      toast({
        title: 'Avatar updated',
        description: 'Your avatar has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!profile || !preferences) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading profile...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Profile Settings
        </Heading>
        <Text color="gray.600">
          Manage your personal information and preferences
        </Text>
      </Box>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Personal Information</Heading>
            <Button
              leftIcon={<FiEdit2 />}
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Avatar Section */}
            <HStack spacing={6}>
              <VStack spacing={3}>
                <Avatar
                  size="xl"
                  name={`${profile.firstName} ${profile.lastName}`}
                  src={profile.avatar}
                />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <Button
                  as="label"
                  htmlFor="avatar-upload"
                  leftIcon={<FiCamera />}
                  variant="outline"
                  size="sm"
                  cursor="pointer"
                >
                  Change Photo
                </Button>
              </VStack>
              
              <VStack spacing={4} align="stretch" flex={1}>
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                </HStack>
                
                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    isDisabled={!isEditing}
                  />
                </FormControl>
                
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job Title</FormLabel>
                    <Input
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      isDisabled={!isEditing}
                    />
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={editForm.department || ''}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    isDisabled={!isEditing}
                  >
                    <option value="">Select Department</option>
                    <option value="acquisition">Acquisition</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                    <option value="finance">Finance</option>
                    <option value="legal">Legal</option>
                  </Select>
                </FormControl>
              </VStack>
            </HStack>
            
            {isEditing && (
              <HStack justify="flex-end" spacing={3}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(profile);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiSave />}
                  onClick={handleProfileUpdate}
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <Heading size="md">Preferences</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack spacing={6}>
              <FormControl>
                <FormLabel>Theme</FormLabel>
                <Select
                  value={preferencesForm.theme || 'light'}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value as any })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Language</FormLabel>
                <Select
                  value={preferencesForm.language || 'en'}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </Select>
              </FormControl>
            </HStack>
            
            <HStack spacing={6}>
              <FormControl>
                <FormLabel>Timezone</FormLabel>
                <Select
                  value={preferencesForm.timezone || 'UTC'}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, timezone: e.target.value })}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Date Format</FormLabel>
                <Select
                  value={preferencesForm.dateFormat || 'MM/DD/YYYY'}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, dateFormat: e.target.value as any })}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </FormControl>
            </HStack>
            
            <HStack spacing={6}>
              <FormControl>
                <FormLabel>Time Format</FormLabel>
                <Select
                  value={preferencesForm.timeFormat || '12h'}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, timeFormat: e.target.value as any })}
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Dashboard Layout</FormLabel>
                <Select
                  value={preferencesForm.dashboard?.layout || 'grid'}
                  onChange={(e) => setPreferencesForm({
                    ...preferencesForm,
                    dashboard: { ...preferencesForm.dashboard, layout: e.target.value as any }
                  })}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </Select>
              </FormControl>
            </HStack>
            
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handlePreferencesUpdate}
              isLoading={isLoading}
              alignSelf="flex-end"
            >
              Save Preferences
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ProfileSettings;
