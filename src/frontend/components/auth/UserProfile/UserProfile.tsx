import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Button,
  Input,
  Textarea,
  Select,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../../../contexts/AuthContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  picture?: string;
  settings: {
    theme: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

const UserProfile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    picture: '',
    settings: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        picture: user.picture || '',
        settings: {
          theme: user.settings?.theme || 'light',
          language: user.settings?.language || 'en',
          timezone: user.settings?.timezone || 'UTC',
          notifications: {
            email: user.settings?.notifications?.email ?? true,
            sms: user.settings?.notifications?.sms ?? false,
            push: user.settings?.notifications?.push ?? true,
          },
        },
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProfileFormData],
          [child]: value,
        },
      }));
    } else if (field.includes('notifications.')) {
      const notificationType = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          notifications: {
            ...prev.settings.notifications,
            [notificationType]: value,
          },
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.picture && !isValidUrl(formData.picture)) {
      newErrors.picture = 'Please enter a valid URL for profile picture';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        picture: formData.picture,
        settings: formData.settings,
      });

      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        picture: user.picture || '',
        settings: {
          theme: user.settings?.theme || 'light',
          language: user.settings?.language || 'en',
          timezone: user.settings?.timezone || 'UTC',
          notifications: {
            email: user.settings?.notifications?.email ?? true,
            sms: user.settings?.notifications?.sms ?? false,
            push: user.settings?.notifications?.push ?? true,
          },
        },
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: 'red',
      manager: 'blue',
      agent: 'green',
      user: 'gray',
      viewer: 'purple',
      acquisitions: 'orange',
      dispositions: 'teal',
    };
    return colors[role] || 'gray';
  };

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading profile...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            User Profile
          </Heading>
          <Text color="gray.600">
            Manage your profile information and preferences
          </Text>
        </Box>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Profile Information</Heading>
              {!isEditing ? (
                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <HStack>
                  <IconButton
                    aria-label="Save changes"
                    icon={<CheckIcon />}
                    colorScheme="green"
                    onClick={handleSave}
                    isLoading={isLoading}
                  />
                  <IconButton
                    aria-label="Cancel changes"
                    icon={<CloseIcon />}
                    colorScheme="gray"
                    onClick={handleCancel}
                  />
                </HStack>
              )}
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Profile Picture and Basic Info */}
              <HStack spacing={6} align="start">
                <VStack>
                  <Avatar
                    size="2xl"
                    src={formData.picture || user.picture}
                    name={`${formData.firstName} ${formData.lastName}`}
                  />
                  {isEditing && (
                    <FormControl isInvalid={!!errors.picture}>
                      <FormLabel fontSize="sm">Profile Picture URL</FormLabel>
                      <Input
                        size="sm"
                        value={formData.picture}
                        onChange={(e) => handleInputChange('picture', e.target.value)}
                        placeholder="Enter image URL"
                      />
                      <FormErrorMessage>{errors.picture}</FormErrorMessage>
                    </FormControl>
                  )}
                </VStack>

                <VStack flex={1} align="stretch" spacing={4}>
                  {/* Name Fields */}
                  <HStack spacing={4}>
                    <FormControl isInvalid={!!errors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      {isEditing ? (
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="First Name"
                        />
                      ) : (
                        <Text>{user.firstName}</Text>
                      )}
                      <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      {isEditing ? (
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Last Name"
                        />
                      ) : (
                        <Text>{user.lastName}</Text>
                      )}
                      <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                    </FormControl>
                  </HStack>

                  {/* Email and Status */}
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Text color="gray.600">{user.email}</Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Badge
                        colorScheme={user.status === 'active' ? 'green' : 'red'}
                        variant="subtle"
                      >
                        {user.status}
                      </Badge>
                    </FormControl>
                  </HStack>

                  {/* Roles */}
                  <FormControl>
                    <FormLabel>Roles</FormLabel>
                    <HStack spacing={2}>
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          colorScheme={getRoleBadgeColor(role)}
                          variant="solid"
                        >
                          {role}
                        </Badge>
                      ))}
                    </HStack>
                  </FormControl>
                </VStack>
              </HStack>

              <Divider />

              {/* Settings Section */}
              <Box>
                <Heading size="sm" mb={4}>
                  Preferences & Settings
                </Heading>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Theme</FormLabel>
                      {isEditing ? (
                        <Select
                          value={formData.settings.theme}
                          onChange={(e) => handleInputChange('settings.theme', e.target.value)}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </Select>
                      ) : (
                        <Text>{user.settings?.theme || 'light'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Language</FormLabel>
                      {isEditing ? (
                        <Select
                          value={formData.settings.language}
                          onChange={(e) => handleInputChange('settings.language', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </Select>
                      ) : (
                        <Text>{user.settings?.language || 'en'}</Text>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Timezone</FormLabel>
                      {isEditing ? (
                        <Select
                          value={formData.settings.timezone}
                          onChange={(e) => handleInputChange('settings.timezone', e.target.value)}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </Select>
                      ) : (
                        <Text>{user.settings?.timezone || 'UTC'}</Text>
                      )}
                    </FormControl>
                  </HStack>

                  {/* Notification Preferences */}
                  <Box>
                    <FormLabel>Notification Preferences</FormLabel>
                    <HStack spacing={6}>
                      <FormControl>
                        <FormLabel fontSize="sm">Email</FormLabel>
                        {isEditing ? (
                          <Select
                            size="sm"
                            value={formData.settings.notifications.email ? 'true' : 'false'}
                            onChange={(e) => handleInputChange('notifications.email', e.target.value === 'true')}
                          >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                          </Select>
                        ) : (
                          <Text fontSize="sm">
                            {user.settings?.notifications?.email ? 'Enabled' : 'Disabled'}
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">SMS</FormLabel>
                        {isEditing ? (
                          <Select
                            size="sm"
                            value={formData.settings.notifications.sms ? 'true' : 'false'}
                            onChange={(e) => handleInputChange('notifications.sms', e.target.value === 'true')}
                          >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                          </Select>
                        ) : (
                          <Text fontSize="sm">
                            {user.settings?.notifications?.sms ? 'Enabled' : 'Disabled'}
                          </Text>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Push</FormLabel>
                        {isEditing ? (
                          <Select
                            size="sm"
                            value={formData.settings.notifications.push ? 'true' : 'false'}
                            onChange={(e) => handleInputChange('notifications.push', e.target.value === 'true')}
                          >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                          </Select>
                        ) : (
                          <Text fontSize="sm">
                            {user.settings?.notifications?.push ? 'Enabled' : 'Disabled'}
                          </Text>
                        )}
                      </FormControl>
                    </HStack>
                  </Box>
                </VStack>
              </Box>

              {/* Account Information */}
              <Divider />
              <Box>
                <Heading size="sm" mb={4}>
                  Account Information
                </Heading>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.600">User ID</Text>
                    <Text fontFamily="mono" fontSize="sm">{user.id}</Text>
                  </HStack>
                  {user.tenantId && (
                    <HStack justify="space-between">
                      <Text color="gray.600">Tenant ID</Text>
                      <Text fontFamily="mono" fontSize="sm">{user.tenantId}</Text>
                    </HStack>
                  )}
                  <HStack justify="space-between">
                    <Text color="gray.600">Last Active</Text>
                    <Text>
                      {user.lastActive
                        ? new Date(user.lastActive).toLocaleString()
                        : 'Never'}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default UserProfile;
