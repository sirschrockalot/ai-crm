import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { 
  RepeatIcon as RefreshIcon, 
  DownloadIcon, 
  SettingsIcon,
  TriangleUpIcon as TrendingUpIcon,
  TriangleDownIcon as TrendingDownIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { NextPage } from 'next';
import { DashboardLayout } from '../../components/dashboard';
import {
  DashboardStats,
  PerformanceCharts,
  ActivityFeed,
  TeamPerformance,
  AutomationStatus,
  StrategicInsights,
  MarketIntelligence,
  ComplianceOverview,
} from '../../components/dashboard';

// Mock data for executive dashboard
const mockTeamData = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Acquisitions Manager',
    avatar: '/avatars/sarah.jpg',
    status: 'active',
    metrics: {
      callsMade: 45,
      offersMade: 12,
      contractsLeads: '8/12',
      conversionRate: 67,
      dialsMade: 180,
      newBuyersAdded: 15,
      dealsAssigned: 8,
      avgBuyersPerDeal: 1.9,
    },
    team: 'acquisitions',
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Disposition Specialist',
    avatar: '/avatars/mike.jpg',
    status: 'active',
    metrics: {
      callsMade: 38,
      offersMade: 9,
      contractsLeads: '6/9',
      conversionRate: 67,
      dialsMade: 152,
      newBuyersAdded: 12,
      dealsAssigned: 6,
      avgBuyersPerDeal: 2.0,
    },
    team: 'disposition',
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    role: 'Support Coordinator',
    avatar: '/avatars/lisa.jpg',
    status: 'active',
    metrics: {
      callsMade: 22,
      offersMade: 5,
      contractsLeads: '4/5',
      conversionRate: 80,
      dialsMade: 88,
      newBuyersAdded: 8,
      dealsAssigned: 4,
      avgBuyersPerDeal: 2.0,
    },
    team: 'support',
  },
];

const mockAutomationData = [
  {
    id: '1',
    name: 'Lead Scoring AI',
    status: 'running',
    accuracy: 94,
    activeCount: 156,
    generatedCount: 234,
    lastRun: '2 hours ago',
    performance: 87,
    target: 90,
  },
  {
    id: '2',
    name: 'Email Automation',
    status: 'running',
    accuracy: 89,
    activeCount: 89,
    generatedCount: 156,
    lastRun: '1 hour ago',
    performance: 92,
    target: 85,
  },
  {
    id: '3',
    name: 'Follow-up Reminders',
    status: 'warning',
    accuracy: 76,
    activeCount: 67,
    generatedCount: 98,
    lastRun: '4 hours ago',
    performance: 68,
    target: 80,
  },
];

const mockTrendsData = [
  {
    metric: 'Monthly Revenue',
    currentValue: 1250000,
    previousValue: 1180000,
    change: 70000,
    changePercent: 5.9,
    trend: 'up',
    confidence: 92,
  },
  {
    metric: 'Lead Conversion Rate',
    currentValue: 23.4,
    previousValue: 21.8,
    change: 1.6,
    changePercent: 7.3,
    trend: 'up',
    confidence: 88,
  },
  {
    metric: 'Average Deal Size',
    currentValue: 45000,
    previousValue: 42000,
    change: 3000,
    changePercent: 7.1,
    trend: 'up',
    confidence: 85,
  },
];

const mockRisksData = [
  {
    id: '1',
    category: 'financial',
    severity: 'medium',
    description: 'Cash flow volatility in Q4',
    impact: 'Potential 15% revenue fluctuation',
    mitigation: 'Implement cash reserve strategy',
    status: 'monitoring',
  },
  {
    id: '2',
    category: 'operational',
    severity: 'low',
    description: 'Team capacity constraints',
    impact: 'May affect lead response times',
    mitigation: 'Hire additional staff',
    status: 'active',
  },
];

const mockRecommendationsData = [
  {
    id: '1',
    title: 'Expand to Secondary Markets',
    description: 'Enter 3 new metropolitan areas with high growth potential',
    impact: 'high',
    effort: 'medium',
    priority: 2,
    category: 'growth',
    estimatedROI: 35,
    timeline: '6-12 months',
  },
  {
    id: '2',
    title: 'Implement Advanced Analytics',
    description: 'Deploy predictive analytics for lead scoring and deal forecasting',
    impact: 'high',
    effort: 'high',
    priority: 3,
    category: 'efficiency',
    estimatedROI: 28,
    timeline: '4-6 months',
  },
];

const mockMarketTrends = [
  {
    id: '1',
    category: 'property',
    title: 'Rising Property Values',
    description: 'Continued appreciation in target markets driving higher deal values',
    impact: 'positive',
    confidence: 87,
    timeframe: '6-12 months',
    source: 'Market Analysis',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    category: 'economic',
    title: 'Interest Rate Stability',
    description: 'Federal Reserve maintaining current rates through Q2 2024',
    impact: 'positive',
    confidence: 78,
    timeframe: '3-6 months',
    source: 'Economic Indicators',
    lastUpdated: '2024-01-14',
  },
];

const mockCompetitors = [
  {
    id: '1',
    name: 'Property Solutions Inc.',
    marketShare: 18.5,
    strengths: ['Strong brand recognition', 'Large sales team', 'Established relationships'],
    weaknesses: ['Slow technology adoption', 'High operational costs'],
    opportunities: ['Digital transformation', 'Market expansion'],
    threats: ['New market entrants', 'Regulatory changes'],
    recentActivity: 'Launched new mobile app',
    competitivePosition: 'leader',
  },
  {
    id: '2',
    name: 'Real Estate Partners',
    marketShare: 12.3,
    strengths: ['Innovative technology', 'Agile operations'],
    weaknesses: ['Limited market presence', 'Smaller team'],
    opportunities: ['Market expansion', 'Partnerships'],
    threats: ['Competition from larger players'],
    recentActivity: 'Acquired smaller competitor',
    competitivePosition: 'challenger',
  },
];

const mockOpportunities = [
  {
    id: '1',
    title: 'Secondary Market Expansion',
    description: 'Enter 3 new metropolitan areas with high growth potential',
    marketSize: 25000000,
    growthRate: 28,
    entryBarriers: 'medium',
    competitiveIntensity: 'medium',
    estimatedROI: 35,
    timeline: '6-12 months',
    riskLevel: 'medium',
  },
  {
    id: '2',
    title: 'Technology Platform Enhancement',
    description: 'Develop advanced analytics and automation capabilities',
    marketSize: 15000000,
    growthRate: 42,
    entryBarriers: 'high',
    competitiveIntensity: 'low',
    estimatedROI: 45,
    timeline: '8-12 months',
    riskLevel: 'low',
  },
];

const mockComplianceRequirements = [
  {
    id: '1',
    name: 'Financial Reporting Standards',
    category: 'financial',
    status: 'compliant',
    priority: 'high',
    dueDate: '2024-03-31',
    lastAudit: '2024-01-10',
    nextAudit: '2024-07-10',
    description: 'Quarterly financial reporting compliance',
    requirements: ['Accurate revenue reporting', 'Expense documentation'],
    risks: ['Financial penalties', 'Regulatory scrutiny'],
  },
  {
    id: '2',
    name: 'Data Privacy Compliance',
    category: 'data',
    status: 'non-compliant',
    priority: 'critical',
    dueDate: '2024-02-15',
    lastAudit: '2024-01-05',
    nextAudit: '2024-04-05',
    description: 'GDPR and CCPA compliance requirements',
    requirements: ['Data consent management', 'Privacy policy updates'],
    risks: ['Legal action', 'Reputational damage'],
  },
];

const mockAuditFindings = [
  {
    id: '1',
    title: 'Data Encryption Gap',
    severity: 'critical',
    category: 'Security',
    description: 'Customer data not properly encrypted in transit',
    recommendation: 'Implement end-to-end encryption for all data transfers',
    status: 'open',
    assignedTo: 'IT Security Team',
    dueDate: '2024-02-28',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    title: 'Documentation Inconsistencies',
    severity: 'medium',
    category: 'Operations',
    description: 'Inconsistent documentation practices across teams',
    recommendation: 'Standardize documentation templates and procedures',
    status: 'in-progress',
    assignedTo: 'Operations Manager',
    dueDate: '2024-03-15',
    lastUpdated: '2024-01-14',
  },
];

const mockRegulatoryUpdates = [
  {
    id: '1',
    title: 'New Financial Disclosure Requirements',
    description: 'Updated SEC requirements for real estate investment disclosures',
    impact: 'high',
    effectiveDate: '2024-04-01',
    complianceDeadline: '2024-03-31',
    affectedAreas: ['Financial reporting', 'Investor communications'],
    actionRequired: 'Update disclosure documents and train staff',
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Data Privacy Regulation Updates',
    description: 'Enhanced requirements for customer data protection',
    impact: 'medium',
    effectiveDate: '2024-06-01',
    complianceDeadline: '2024-05-31',
    affectedAreas: ['Data handling', 'Privacy policies'],
    actionRequired: 'Review and update privacy procedures',
    status: 'pending',
  },
];

const ExecutiveDashboard: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
    // In a real app, this would trigger data refetch
  };

  const handleInsightClick = (insight: any) => {
    console.log('Insight clicked:', insight);
    // Handle insight click - could open modal, navigate to detail page, etc.
  };

  const handleViewDetails = () => {
    console.log('View details clicked');
    // Handle view details - could navigate to detailed view
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading Executive Dashboard...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box bg={bgColor} minH="100vh" py={6}>
        <Container maxW="container.xl">
          {/* Header */}
          <Box mb={8}>
            <HStack justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                  Executive Dashboard
                </Text>
                <Text fontSize="md" color="gray.600">
                  Strategic overview and business intelligence
                </Text>
              </Box>
              <HStack spacing={3}>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant={timeRange === '7d' ? 'solid' : 'outline'}
                    onClick={() => handleTimeRangeChange('7d')}
                  >
                    7D
                  </Button>
                  <Button
                    size="sm"
                    variant={timeRange === '30d' ? 'solid' : 'outline'}
                    onClick={() => handleTimeRangeChange('30d')}
                  >
                    30D
                  </Button>
                  <Button
                    size="sm"
                    variant={timeRange === '90d' ? 'solid' : 'outline'}
                    onClick={() => handleTimeRangeChange('90d')}
                  >
                    90D
                  </Button>
                  <Button
                    size="sm"
                    variant={timeRange === '1y' ? 'solid' : 'outline'}
                    onClick={() => handleTimeRangeChange('1y')}
                  >
                    1Y
                  </Button>
                </HStack>
                <IconButton
                  aria-label="Refresh data"
                  icon={<RefreshIcon />}
                  onClick={handleRefresh}
                  size="sm"
                />
                <IconButton
                  aria-label="Export data"
                  icon={<DownloadIcon />}
                  size="sm"
                />
                <IconButton
                  aria-label="Dashboard settings"
                  icon={<SettingsIcon />}
                  size="sm"
                />
              </HStack>
            </HStack>
            
            <HStack justify="space-between" align="center">
              <HStack spacing={4}>
                <Badge colorScheme="green" variant="subtle">
                  <TrendingUpIcon mr={1} />
                  Revenue: +5.9% vs last period
                </Badge>
                <Badge colorScheme="blue" variant="subtle">
                  <InfoIcon mr={1} />
                  {mockComplianceRequirements.filter(r => r.status === 'compliant').length}/{mockComplianceRequirements.length} Compliant
                </Badge>
                <Badge colorScheme="purple" variant="subtle">
                  <TrendingUpIcon mr={1} />
                  Market Share: +2.1%
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            </HStack>
          </Box>

          {/* Main Dashboard Grid */}
          <Grid
            templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
            gap={6}
            mb={6}
          >
            {/* Left Column - Main Metrics */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Key Performance Metrics */}
                <DashboardStats 
                  variant="executive"
                  stats={{
                    totalRevenue: 1560000,
                    totalDeals: 45,
                    averageDealValue: 34667,
                    conversionRate: 67.5,
                    pipelineValue: 2800000,
                    teamPerformance: 89.2,
                    leadQuality: 8.7
                  }}
                />
                
                {/* Performance Charts */}
                <PerformanceCharts 
                  data={[
                    { name: 'Q1', value: 1250000 },
                    { name: 'Q2', value: 1380000 },
                    { name: 'Q3', value: 1420000 },
                    { name: 'Q4', value: 1560000 }
                  ]}
                  type="line"
                  title="Revenue Trend"
                  height={300}
                />
                
                {/* Team Performance */}
                <TeamPerformance
                  teamMembers={mockTeamData}
                  variant="executive"
                  onMemberClick={(member) => console.log('Member clicked:', member)}
                  onViewDetails={handleViewDetails}
                />
              </VStack>
            </GridItem>

            {/* Right Column - Sidebar */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Automation Status */}
                <AutomationStatus
                  systems={mockAutomationData}
                  variant="executive"
                  onConfigure={() => console.log('Configure automation')}
                  onSystemClick={(system) => console.log('System clicked:', system)}
                />
                
                {/* Activity Feed */}
                <ActivityFeed 
                  variant="executive"
                  activities={[
                    {
                      id: '1',
                      type: 'lead',
                      title: 'New Lead: 123 Main St',
                      description: 'High-value property lead added to pipeline',
                      user: { name: 'Sarah Johnson', role: 'Acquisitions Manager' },
                      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                      status: 'pending',
                      priority: 'high'
                    },
                    {
                      id: '2',
                      type: 'deal',
                      title: 'Deal Closed: Oak Avenue',
                      description: 'Property sold for $450,000',
                      user: { name: 'Mike Chen', role: 'Disposition Specialist' },
                      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                      status: 'completed',
                      priority: 'high'
                    },
                    {
                      id: '3',
                      type: 'communication',
                      title: 'Follow-up Call Scheduled',
                      description: 'Follow-up call with buyer scheduled for tomorrow',
                      user: { name: 'Lisa Rodriguez', role: 'Support Coordinator' },
                      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                      status: 'pending',
                      priority: 'medium'
                    }
                  ]}
                />
              </VStack>
            </GridItem>
          </Grid>

          {/* Strategic Insights Row */}
          <Box mb={6}>
            <StrategicInsights
              trends={mockTrendsData}
              risks={mockRisksData}
              recommendations={mockRecommendationsData}
              variant="executive"
              onInsightClick={handleInsightClick}
              onViewDetails={handleViewDetails}
            />
          </Box>

          {/* Market Intelligence and Compliance Row */}
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={6}
            mb={6}
          >
            <GridItem>
              <MarketIntelligence
                trends={mockMarketTrends}
                competitors={mockCompetitors}
                opportunities={mockOpportunities}
                variant="executive"
                onTrendClick={(trend) => console.log('Trend clicked:', trend)}
                onCompetitorClick={(competitor) => console.log('Competitor clicked:', competitor)}
                onOpportunityClick={(opportunity) => console.log('Opportunity clicked:', opportunity)}
                onViewDetails={handleViewDetails}
              />
            </GridItem>
            
            <GridItem>
              <ComplianceOverview
                requirements={mockComplianceRequirements}
                findings={mockAuditFindings}
                updates={mockRegulatoryUpdates}
                variant="executive"
                onRequirementClick={(req) => console.log('Requirement clicked:', req)}
                onFindingClick={(finding) => console.log('Finding clicked:', finding)}
                onUpdateClick={(update) => console.log('Update clicked:', update)}
                onViewDetails={handleViewDetails}
              />
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default ExecutiveDashboard;
