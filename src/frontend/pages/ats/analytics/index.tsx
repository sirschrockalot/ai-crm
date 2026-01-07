import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiBriefcase,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiMoreVertical,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

const COLORS = ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5', '#ED64A6', '#48BB78', '#F6AD55'];

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
  
  const [timeRange, setTimeRange] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalApplications: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    hireRate: 0,
    timeToHire: 0,
    interviewCompletionRate: 0,
    applicationToInterviewRate: 0,
  });
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  
  // Chart data
  const [applicationsOverTime, setApplicationsOverTime] = useState<any[]>([]);
  const [interviewsOverTime, setInterviewsOverTime] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [interviewerPerformance, setInterviewerPerformance] = useState<any[]>([]);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [jobPostingPerformance, setJobPostingPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const getDateRange = () => {
    const days = parseInt(timeRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return { startDate, endDate };
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      // Load all data
      const [candidatesRes, applicationsRes, interviewsRes, jobPostingsRes] = await Promise.all([
        atsService.listCandidates({ limit: 1000 }),
        atsService.listApplications({ limit: 1000 }),
        atsService.listInterviews({ limit: 1000 }),
        atsService.listJobPostings({ limit: 1000 }),
      ]);

      const candidatesData = candidatesRes.candidates || [];
      const applicationsData = applicationsRes.applications || [];
      const interviewsData = interviewsRes.interviews || [];
      const jobPostingsData = jobPostingsRes.jobPostings || [];

      setCandidates(candidatesData);
      setApplications(applicationsData);
      setInterviews(interviewsData);
      setJobPostings(jobPostingsData);

      // Filter by date range
      const filteredApplications = applicationsData.filter((app: any) => {
        const appDate = new Date(app.applicationDate || app.createdAt);
        return appDate >= startDate && appDate <= endDate;
      });

      const filteredInterviews = interviewsData.filter((int: any) => {
        const intDate = new Date(int.scheduledStartTime || int.createdAt);
        return intDate >= startDate && intDate <= endDate;
      });

      // Calculate stats
      const completedInterviews = interviewsData.filter((i: any) => i.status === 'completed');
      const hiredCandidates = candidatesData.filter((c: any) => c.status === 'hired');

      const totalScores = completedInterviews
        .map((i: any) => i.totalScore || 0)
        .filter((s: number) => s > 0);
      const averageScore =
        totalScores.length > 0
          ? Math.round((totalScores.reduce((a: number, b: number) => a + b, 0) / totalScores.length) * 10) / 10
          : 0;

      const hireRate =
        completedInterviews.length > 0
          ? Math.round((hiredCandidates.length / completedInterviews.length) * 100)
          : 0;

      const interviewCompletionRate =
        interviewsData.length > 0
          ? Math.round((completedInterviews.length / interviewsData.length) * 100)
          : 0;

      const applicationToInterviewRate =
        applicationsData.length > 0
          ? Math.round((interviewsData.length / applicationsData.length) * 100)
          : 0;

      // Calculate time to hire (average days from application to hire)
      let totalDaysToHire = 0;
      let hireCount = 0;
      hiredCandidates.forEach((candidate: any) => {
        const application = applicationsData.find((app: any) => app.candidateId === candidate.id);
        if (application && candidate.hiredDate) {
          const appDate = new Date(application.applicationDate || application.createdAt);
          const hireDate = new Date(candidate.hiredDate);
          const days = Math.floor((hireDate.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
          if (days > 0) {
            totalDaysToHire += days;
            hireCount++;
          }
        }
      });
      const timeToHire = hireCount > 0 ? Math.round(totalDaysToHire / hireCount) : 0;

      setStats({
        totalCandidates: candidatesData.length,
        totalApplications: filteredApplications.length,
        totalInterviews: filteredInterviews.length,
        completedInterviews: completedInterviews.length,
        averageScore,
        hireRate,
        timeToHire,
        interviewCompletionRate,
        applicationToInterviewRate,
      });

      // Generate chart data
      generateApplicationsOverTime(filteredApplications, startDate, endDate);
      generateInterviewsOverTime(filteredInterviews, startDate, endDate);
      generateScoreDistribution(completedInterviews);
      generateSourceBreakdown(applicationsData);
      generatePipelineData(candidatesData, applicationsData, interviewsData);
      generateInterviewerPerformance(interviewsData);
      generateTopCandidates(completedInterviews);
      generateJobPostingPerformance(jobPostingsData, applicationsData);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load analytics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateApplicationsOverTime = (apps: any[], startDate: Date, endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const interval = days <= 7 ? 1 : days <= 30 ? 1 : days <= 90 ? 7 : 30;
    const data: any[] = [];
    
    for (let i = 0; i <= days; i += interval) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = apps.filter((app: any) => {
        const appDate = new Date(app.applicationDate || app.createdAt);
        return appDate.toDateString() === date.toDateString();
      }).length;
      
      data.push({ date: dateStr, applications: count });
    }
    
    setApplicationsOverTime(data);
  };

  const generateInterviewsOverTime = (ints: any[], startDate: Date, endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const interval = days <= 7 ? 1 : days <= 30 ? 1 : days <= 90 ? 7 : 30;
    const data: any[] = [];
    
    for (let i = 0; i <= days; i += interval) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const scheduled = ints.filter((int: any) => {
        const intDate = new Date(int.scheduledStartTime || int.createdAt);
        return intDate.toDateString() === date.toDateString();
      }).length;
      
      const completed = ints.filter((int: any) => {
        const intDate = new Date(int.scheduledStartTime || int.createdAt);
        return intDate.toDateString() === date.toDateString() && int.status === 'completed';
      }).length;
      
      data.push({ date: dateStr, scheduled, completed });
    }
    
    setInterviewsOverTime(data);
  };

  const generateScoreDistribution = (completedInterviews: any[]) => {
    const ranges = [
      { range: '0-9', min: 0, max: 9 },
      { range: '10-14', min: 10, max: 14 },
      { range: '15-19', min: 15, max: 19 },
      { range: '20-24', min: 20, max: 24 },
      { range: '25-27', min: 25, max: 27 },
    ];
    
    const data = ranges.map((r) => {
      const count = completedInterviews.filter(
        (int: any) => (int.totalScore || 0) >= r.min && (int.totalScore || 0) <= r.max
      ).length;
      return { range: r.range, count, percentage: completedInterviews.length > 0 ? Math.round((count / completedInterviews.length) * 100) : 0 };
    });
    
    setScoreDistribution(data);
  };

  const generateSourceBreakdown = (apps: any[]) => {
    const sourceMap: Record<string, number> = {};
    apps.forEach((app: any) => {
      const source = app.source || 'unknown';
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });
    
    const data = Object.entries(sourceMap)
      .map(([source, count]) => ({ 
        name: source.charAt(0).toUpperCase() + source.slice(1), 
        value: count,
        percentage: apps.length > 0 ? Math.round((count / apps.length) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
    
    setSourceBreakdown(data);
  };

  const generatePipelineData = (candidates: any[], applications: any[], interviews: any[]) => {
    const applied = applications.length;
    const phoneScreen = interviews.filter((i: any) => i.type === 'phone_screen').length;
    const videoInterview = interviews.filter((i: any) => i.type === 'video_interview').length;
    const offer = candidates.filter((c: any) => c.status === 'offer_extended').length;
    const hired = candidates.filter((c: any) => c.status === 'hired').length;
    
    setPipelineData([
      { stage: 'Applied', count: applied, percentage: 100 },
      { stage: 'Phone Screen', count: phoneScreen, percentage: applied > 0 ? Math.round((phoneScreen / applied) * 100) : 0 },
      { stage: 'Video Interview', count: videoInterview, percentage: phoneScreen > 0 ? Math.round((videoInterview / phoneScreen) * 100) : 0 },
      { stage: 'Offer', count: offer, percentage: videoInterview > 0 ? Math.round((offer / videoInterview) * 100) : 0 },
      { stage: 'Hired', count: hired, percentage: offer > 0 ? Math.round((hired / offer) * 100) : 0 },
    ]);
  };

  const generateInterviewerPerformance = (interviews: any[]) => {
    const interviewerMap: Record<string, { total: number; completed: number; avgScore: number; scores: number[] }> = {};
    
    interviews.forEach((int: any) => {
      const interviewerId = int.primaryInterviewer?.userId || int.primaryInterviewer?.name || 'Unknown';
      if (!interviewerMap[interviewerId]) {
        interviewerMap[interviewerId] = { total: 0, completed: 0, avgScore: 0, scores: [] };
      }
      interviewerMap[interviewerId].total++;
      if (int.status === 'completed') {
        interviewerMap[interviewerId].completed++;
        if (int.totalScore) {
          interviewerMap[interviewerId].scores.push(int.totalScore);
        }
      }
    });
    
    const data = Object.entries(interviewerMap)
      .map(([name, data]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        total: data.total,
        completed: data.completed,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        avgScore: data.scores.length > 0 
          ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10 
          : 0,
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10);
    
    setInterviewerPerformance(data);
  };

  const generateTopCandidates = (completedInterviews: any[]) => {
    const data = completedInterviews
      .filter((i: any) => i.totalScore)
      .sort((a: any, b: any) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, 10)
      .map((interview: any) => ({
        interviewId: interview.id,
        candidateId: interview.candidateId,
        score: interview.totalScore,
        recommendation: interview.recommendation,
        date: interview.completedAt || interview.updatedAt,
      }));
    
    setTopCandidates(data);
  };

  const generateJobPostingPerformance = (postings: any[], applications: any[]) => {
    const data = postings.map((posting: any) => {
      const postingApps = applications.filter((app: any) => app.jobPostingId === posting.id);
      return {
        title: posting.title,
        applications: postingApps.length,
        views: posting.metrics?.views || 0,
        clicks: posting.metrics?.clicks || 0,
        conversionRate: posting.metrics?.views 
          ? Math.round((postingApps.length / posting.metrics.views) * 100) 
          : 0,
      };
    })
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 10);
    
    setJobPostingPerformance(data);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: 'Export Started',
      description: `Exporting analytics data as ${format.toUpperCase()}...`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    // TODO: Implement actual export functionality
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <VStack spacing={4} align="center" py={20}>
              <Spinner size="xl" />
              <Text>Loading analytics...</Text>
            </VStack>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="lg">ATS Analytics Dashboard</Heading>
                <Text color="gray.600">Comprehensive hiring metrics and performance insights</Text>
              </VStack>
              <HStack>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  width="150px"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="all">All time</option>
                </Select>
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<FiDownload />}
                    variant="outline"
                  >
                    Export
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
                    <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>

            {/* Key Metrics */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Candidates</StatLabel>
                    <StatNumber>{stats.totalCandidates}</StatNumber>
                    <StatHelpText>
                      <FiUsers style={{ display: 'inline', marginRight: '4px' }} />
                      All time
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Applications</StatLabel>
                    <StatNumber>{stats.totalApplications}</StatNumber>
                    <StatHelpText>
                      <FiBriefcase style={{ display: 'inline', marginRight: '4px' }} />
                      In selected period
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Interviews Completed</StatLabel>
                    <StatNumber>{stats.completedInterviews}</StatNumber>
                    <StatHelpText>
                      <FiCheckCircle style={{ display: 'inline', marginRight: '4px' }} />
                      {stats.interviewCompletionRate}% completion rate
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Average Score</StatLabel>
                    <StatNumber>{stats.averageScore}</StatNumber>
                    <StatHelpText>
                      <FiTrendingUp style={{ display: 'inline', marginRight: '4px' }} />
                      Out of 27
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Secondary Metrics */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Hire Rate</StatLabel>
                    <StatNumber>{stats.hireRate}%</StatNumber>
                    <StatHelpText>
                      {stats.completedInterviews > 0
                        ? `${stats.completedInterviews} interviews completed`
                        : 'No data'}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Time to Hire</StatLabel>
                    <StatNumber>{stats.timeToHire}</StatNumber>
                    <StatHelpText>
                      <FiClock style={{ display: 'inline', marginRight: '4px' }} />
                      Average days
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Interview Completion Rate</StatLabel>
                    <StatNumber>{stats.interviewCompletionRate}%</StatNumber>
                    <StatHelpText>
                      {stats.completedInterviews} of {stats.totalInterviews} completed
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Application to Interview</StatLabel>
                    <StatNumber>{stats.applicationToInterviewRate}%</StatNumber>
                    <StatHelpText>
                      {stats.totalInterviews} interviews from {stats.totalApplications} applications
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Charts Section */}
            <Tabs colorScheme="blue">
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Pipeline</Tab>
                <Tab>Performance</Tab>
                <Tab>Sources</Tab>
              </TabList>

              <TabPanels>
                {/* Overview Tab */}
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    {/* Applications Over Time */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Applications Over Time</Heading>
                          <Divider />
                          <Box h="300px">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={applicationsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="date" stroke={textColor} fontSize={12} />
                                <YAxis stroke={textColor} fontSize={12} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: cardBg,
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="applications"
                                  stroke="#3182CE"
                                  fill="#3182CE"
                                  fillOpacity={0.3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Interviews Over Time */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Interviews Over Time</Heading>
                          <Divider />
                          <Box h="300px">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={interviewsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="date" stroke={textColor} fontSize={12} />
                                <YAxis stroke={textColor} fontSize={12} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: cardBg,
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                  }}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="scheduled"
                                  stroke="#3182CE"
                                  strokeWidth={2}
                                  name="Scheduled"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="completed"
                                  stroke="#38A169"
                                  strokeWidth={2}
                                  name="Completed"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Score Distribution */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Score Distribution</Heading>
                          <Divider />
                          <Box h="300px">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="range" stroke={textColor} fontSize={12} />
                                <YAxis stroke={textColor} fontSize={12} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: cardBg,
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                  }}
                                />
                                <Bar dataKey="count" fill="#3182CE" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Application Sources */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Application Sources</Heading>
                          <Divider />
                          <Box h="300px">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={sourceBreakdown}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {sourceBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: cardBg,
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>

                {/* Pipeline Tab */}
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    {/* Pipeline Funnel */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Hiring Pipeline</Heading>
                          <Divider />
                          <VStack align="stretch" spacing={4}>
                            {pipelineData.map((stage, index) => (
                              <Box key={stage.stage}>
                                <HStack justify="space-between" mb={2}>
                                  <Text fontWeight="bold">{stage.stage}</Text>
                                  <HStack>
                                    <Text fontSize="sm" color="gray.600">
                                      {stage.count} candidates
                                    </Text>
                                    {index > 0 && (
                                      <Text fontSize="xs" color="gray.500">
                                        ({stage.percentage}%)
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>
                                <Progress
                                  value={stage.percentage}
                                  colorScheme={index === pipelineData.length - 1 ? 'green' : 'blue'}
                                  size="lg"
                                  borderRadius="md"
                                />
                              </Box>
                            ))}
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Top Candidates */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Top Candidates</Heading>
                          <Divider />
                          {topCandidates.length === 0 ? (
                            <Text color="gray.500">No interview data available</Text>
                          ) : (
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Score</Th>
                                  <Th>Recommendation</Th>
                                  <Th>Date</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {topCandidates.map((item, index) => (
                                  <Tr
                                    key={index}
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.50' }}
                                    onClick={() => router.push(`/ats/interviews/${item.interviewId}`)}
                                  >
                                    <Td fontWeight="bold">{item.score}/27</Td>
                                    <Td>
                                      <Badge
                                        colorScheme={
                                          item.recommendation === 'strong_yes'
                                            ? 'green'
                                            : item.recommendation === 'maybe'
                                            ? 'yellow'
                                            : 'red'
                                        }
                                      >
                                        {item.recommendation?.replace('_', ' ').toUpperCase() || 'N/A'}
                                      </Badge>
                                    </Td>
                                    <Td fontSize="sm">
                                      {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>

                {/* Performance Tab */}
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    {/* Interviewer Performance */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Interviewer Performance</Heading>
                          <Divider />
                          <Box h="400px">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={interviewerPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis type="number" stroke={textColor} fontSize={12} />
                                <YAxis dataKey="name" type="category" stroke={textColor} fontSize={12} width={120} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: cardBg,
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                  }}
                                />
                                <Legend />
                                <Bar dataKey="completed" fill="#3182CE" name="Completed" />
                                <Bar dataKey="total" fill="#E2E8F0" name="Total" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Job Posting Performance */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Top Job Postings</Heading>
                          <Divider />
                          {jobPostingPerformance.length === 0 ? (
                            <Text color="gray.500">No job posting data available</Text>
                          ) : (
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Job Title</Th>
                                  <Th isNumeric>Applications</Th>
                                  <Th isNumeric>Views</Th>
                                  <Th isNumeric>Conversion</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {jobPostingPerformance.map((item, index) => (
                                  <Tr key={index}>
                                    <Td>{item.title}</Td>
                                    <Td isNumeric fontWeight="bold">{item.applications}</Td>
                                    <Td isNumeric>{item.views}</Td>
                                    <Td isNumeric>
                                      <Badge colorScheme={item.conversionRate > 5 ? 'green' : 'yellow'}>
                                        {item.conversionRate}%
                                      </Badge>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>

                {/* Sources Tab */}
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    {/* Source Breakdown Table */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Application Sources</Heading>
                          <Divider />
                          {sourceBreakdown.length === 0 ? (
                            <Text color="gray.500">No data available</Text>
                          ) : (
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Source</Th>
                                  <Th isNumeric>Count</Th>
                                  <Th isNumeric>%</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {sourceBreakdown.map((item, index) => (
                                  <Tr key={index}>
                                    <Td>{item.name}</Td>
                                    <Td isNumeric>{item.value}</Td>
                                    <Td isNumeric>
                                      <Badge colorScheme="blue">{item.percentage}%</Badge>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Source Effectiveness Chart */}
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Source Effectiveness</Heading>
                          <Divider />
                          <Box h="300px">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={sourceBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="name" stroke={textColor} fontSize={12} />
                                <YAxis stroke={textColor} fontSize={12} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: cardBg,
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                  }}
                                />
                                <Bar dataKey="value" fill="#3182CE" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default AnalyticsPage;
