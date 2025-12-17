import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Switch,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { useNurtureCampaigns } from '../../features/automation/hooks/useNurtureCampaigns';
import { useAuth } from '../../hooks/useAuth';
import { NurtureCampaign } from '../../features/automation/types/nurture';

const NurtureAutomationPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const { campaigns, schedule, loading, error, updateSchedule, updateCampaigns } = useNurtureCampaigns();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const [activeTab, setActiveTab] = useState(0);

  const sortedCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => a.name.localeCompare(b.name)),
    [campaigns],
  );

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleToggleDay = async (day: keyof NonNullable<typeof schedule>['activeDays']) => {
    if (!schedule) return;
    const next = {
      ...schedule,
      activeDays: {
        ...schedule.activeDays,
        [day]: !schedule.activeDays[day],
      },
    };
    try {
      await updateSchedule(next);
      toast({
        title: 'Schedule updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      // error state already handled in hook
    }
  };

  const handleToggleCampaign = async (campaign: NurtureCampaign) => {
    const nextCampaigns = campaigns.map((c) =>
      c.id === campaign.id ? { ...c, isActive: !c.isActive } : c,
    );
    try {
      await updateCampaigns(nextCampaigns);
      toast({
        title: 'Campaign updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      // error already surfaced
    }
  };

  const currentCampaign = sortedCampaigns[activeTab] || null;

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1}>
          <Navigation />
          <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
            <Card bg={cardBg} shadow="sm">
              <CardHeader>
                <Heading size="lg" color={textColor}>
                  Nurture SMS Campaigns
                </Heading>
                <Text mt={2} color={subTextColor}>
                  Configure long-term SMS follow-up campaigns by lead status to keep leads warm.
                </Text>
              </CardHeader>
              <CardBody>
                {error && (
                  <Text color="red.500" mb={4}>
                    {error}
                  </Text>
                )}
                <Heading size="md" mb={4}>
                  Set Days Nurture Robot is Active
                </Heading>
                <Table size="sm" variant="simple" mb={4}>
                  <Thead>
                    <Tr>
                      <Th>Week Day</Th>
                      <Th textAlign="right">Active</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {schedule && (
                      <>
                        {(
                          [
                            ['Sunday', 'sunday'],
                            ['Monday', 'monday'],
                            ['Tuesday', 'tuesday'],
                            ['Wednesday', 'wednesday'],
                            ['Thursday', 'thursday'],
                            ['Friday', 'friday'],
                            ['Saturday', 'saturday'],
                          ] as const
                        ).map(([label, key]) => (
                          <Tr key={key}>
                            <Td>{label}</Td>
                            <Td textAlign="right">
                              <Switch
                                isChecked={schedule.activeDays[key]}
                                onChange={() => handleToggleDay(key)}
                                isDisabled={loading}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </>
                    )}
                  </Tbody>
                </Table>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!schedule) return;
                      const next = {
                        ...schedule,
                        activeDays: {
                          sunday: false,
                          monday: false,
                          tuesday: false,
                          wednesday: false,
                          thursday: false,
                          friday: false,
                          saturday: false,
                        },
                      };
                      updateSchedule(next);
                    }}
                    isDisabled={loading || !schedule}
                  >
                    Deactivate All
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => {
                      if (!schedule) return;
                      const next = {
                        ...schedule,
                        activeDays: {
                          sunday: true,
                          monday: true,
                          tuesday: true,
                          wednesday: true,
                          thursday: true,
                          friday: true,
                          saturday: true,
                        },
                      };
                      updateSchedule(next);
                    }}
                    isDisabled={loading || !schedule}
                  >
                    Activate All
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="sm">
              <CardBody>
                <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
                  <TabList>
                    {sortedCampaigns.map((campaign) => (
                      <Tab key={campaign.id}>
                        <HStack spacing={2}>
                          <Text>{campaign.name}</Text>
                          <Badge colorScheme={campaign.isActive ? 'green' : 'gray'}>
                            {campaign.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels>
                    {sortedCampaigns.map((campaign) => (
                      <TabPanel key={campaign.id} p={4}>
                        <HStack justify="space-between" mb={4}>
                          <VStack align="flex-start" spacing={1}>
                            <Heading size="md" color={textColor}>
                              {campaign.name}
                            </Heading>
                            {campaign.description && (
                              <Text color={subTextColor}>{campaign.description}</Text>
                            )}
                          </VStack>
                          <HStack>
                            <Text color={subTextColor}>Campaign Active</Text>
                            <Switch
                              isChecked={campaign.isActive}
                              onChange={() => handleToggleCampaign(campaign)}
                              isDisabled={loading}
                            />
                          </HStack>
                        </HStack>

                        <Heading size="sm" mb={3}>
                          Steps (Day Offsets & SMS Templates)
                        </Heading>
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Reason</Th>
                              <Th isNumeric>Days After</Th>
                              <Th>SMS Template</Th>
                              <Th textAlign="right">Active</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {campaign.steps.length === 0 ? (
                              <Tr>
                                <Td colSpan={4}>
                                  <Text fontSize="sm" color={subTextColor}>
                                    No steps defined yet. We’ll import your existing templates in the next
                                    step.
                                  </Text>
                                </Td>
                              </Tr>
                            ) : (
                              campaign.steps.map((step) => (
                                <Tr key={step.id}>
                                  <Td>{step.reason}</Td>
                                  <Td isNumeric>{step.dayOffset}</Td>
                                  <Td>
                                    <Text fontSize="sm" noOfLines={2}>
                                      {step.smsTemplate}
                                    </Text>
                                  </Td>
                                  <Td textAlign="right">
                                    <Switch isChecked={step.isActive} isDisabled />
                                  </Td>
                                </Tr>
                              ))
                            )}
                          </Tbody>
                        </Table>
                        <Button mt={4} size="sm" colorScheme="blue" isDisabled>
                          Add Step (Coming Soon)
                        </Button>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default NurtureAutomationPage;


