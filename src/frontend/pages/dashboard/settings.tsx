import React, { useEffect, useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiSettings, FiSave, FiRefreshCw, FiLayout, FiEye, FiEyeOff } from 'react-icons/fi';
import { DashboardLayout } from '../../components/dashboard';
import { Card } from '../../components/ui';
import { useDashboard } from '../../hooks/useDashboard';

const DashboardSettingsPage: React.FC = () => {
  const {
    dashboardData,
    loading,
    error,
    isAuthenticated,
    user,
    fetchDashboardData,
    refreshDashboard,
  } = useDashboard();
  
  const toast = useToast();
  const [settings, setSettings] = useState({
    theme: 'light',
    layout: 'default',
    refreshInterval: 30,
    showNotifications: true,
    autoRefresh: true,
    compactMode: false,
    showCharts: true,
    showMetrics: true,
    showRecentActivity: true,
    defaultView: 'overview',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Settings Saved',
      description: 'Your dashboard settings have been updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setIsSaving(false);
  };

  const handleResetSettings = () => {
    setSettings({
      theme: 'light',
      layout: 'default',
      refreshInterval: 30,
      showNotifications: true,
      autoRefresh: true,
      compactMode: false,
      showCharts: true,
      showMetrics: true,
      showRecentActivity: true,
      defaultView: 'overview',
    });
    
    toast({
      title: 'Settings Reset',
      description: 'Dashboard settings have been reset to defaults',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <DashboardLayout
      loading={loading}
      error={error}
      isAuthenticated={isAuthenticated}
      loadingMessage="Loading settings..."
    >
      {/* Page Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Dashboard Settings</Heading>
          <Text color="gray.600">
            Customize your dashboard layout and preferences
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiRefreshCw />}
            variant="outline"
            onClick={handleResetSettings}
          >
            Reset
          </Button>
          <Button
            leftIcon={<FiSave />}
            colorScheme="blue"
            onClick={handleSaveSettings}
            isLoading={isSaving}
            loadingText="Saving..."
          >
            Save Settings
          </Button>
        </HStack>
      </HStack>

      {/* Settings Accordion */}
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box as={FiLayout} mr={3} />
            <Box flex="1" textAlign="left">
              <Heading size="md">Layout & Display</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel>Theme</FormLabel>
                  <Select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Layout</FormLabel>
                  <Select
                    value={settings.layout}
                    onChange={(e) => handleSettingChange('layout', e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="compact">Compact</option>
                    <option value="spacious">Spacious</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Default View</FormLabel>
                  <Select
                    value={settings.defaultView}
                    onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                  >
                    <option value="overview">Overview</option>
                    <option value="analytics">Analytics</option>
                    <option value="leads">Leads</option>
                    <option value="pipeline">Pipeline</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Refresh Interval (seconds)</FormLabel>
                  <Input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                    min={10}
                    max={300}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Compact Mode</FormLabel>
                  <Switch
                    isChecked={settings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Auto Refresh</FormLabel>
                  <Switch
                    isChecked={settings.autoRefresh}
                    onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box as={FiEye} mr={3} />
            <Box flex="1" textAlign="left">
              <Heading size="md">Visibility & Components</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Show Charts</FormLabel>
                  <Switch
                    isChecked={settings.showCharts}
                    onChange={(e) => handleSettingChange('showCharts', e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Show Metrics</FormLabel>
                  <Switch
                    isChecked={settings.showMetrics}
                    onChange={(e) => handleSettingChange('showMetrics', e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Show Recent Activity</FormLabel>
                  <Switch
                    isChecked={settings.showRecentActivity}
                    onChange={(e) => handleSettingChange('showRecentActivity', e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Show Notifications</FormLabel>
                  <Switch
                    isChecked={settings.showNotifications}
                    onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            <Box as={FiSettings} mr={3} />
            <Box flex="1" textAlign="left">
              <Heading size="md">Advanced Settings</Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack spacing={4} align="stretch">
              <Card>
                <VStack align="start" spacing={3}>
                  <Heading size="sm">Data Preferences</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Configure how data is displayed and updated
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="sm">Date Format</FormLabel>
                      <Select size="sm">
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Currency</FormLabel>
                      <Select size="sm">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Card>

              <Card>
                <VStack align="start" spacing={3}>
                  <Heading size="sm">Performance</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Optimize dashboard performance
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl>
                      <FormLabel fontSize="sm">Cache Duration</FormLabel>
                      <Select size="sm">
                        <option value="5">5 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Data Points</FormLabel>
                      <Select size="sm">
                        <option value="100">100 points</option>
                        <option value="500">500 points</option>
                        <option value="1000">1000 points</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Card>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Current Settings Summary */}
      <Card>
        <VStack align="start" spacing={4}>
          <Heading size="md">Current Settings Summary</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">Theme</Text>
              <Text fontWeight="medium">{settings.theme}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">Layout</Text>
              <Text fontWeight="medium">{settings.layout}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">Refresh Interval</Text>
              <Text fontWeight="medium">{settings.refreshInterval}s</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">Auto Refresh</Text>
              <Text fontWeight="medium">{settings.autoRefresh ? 'Enabled' : 'Disabled'}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">Compact Mode</Text>
              <Text fontWeight="medium">{settings.compactMode ? 'Enabled' : 'Disabled'}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">Default View</Text>
              <Text fontWeight="medium">{settings.defaultView}</Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Card>
    </DashboardLayout>
  );
};

export default DashboardSettingsPage;
