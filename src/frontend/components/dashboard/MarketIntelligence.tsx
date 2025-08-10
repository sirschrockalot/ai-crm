import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  Button,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ViewIcon, 
  ExternalLinkIcon,
  InfoIcon,
  WarningIcon,
  CheckCircleIcon,
  TriangleUpIcon,
  TriangleDownIcon,
} from '@chakra-ui/icons';

interface MarketTrend {
  id: string;
  category: 'property' | 'economic' | 'demographic' | 'regulatory';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timeframe: string;
  source: string;
  lastUpdated: string;
}

interface CompetitorAnalysis {
  id: string;
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recentActivity: string;
  competitivePosition: 'leader' | 'challenger' | 'follower' | 'niche';
}

interface MarketOpportunity {
  id: string;
  title: string;
  description: string;
  marketSize: number;
  growthRate: number;
  entryBarriers: 'low' | 'medium' | 'high';
  competitiveIntensity: 'low' | 'medium' | 'high';
  estimatedROI: number;
  timeline: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MarketIntelligenceProps {
  trends: MarketTrend[];
  competitors: CompetitorAnalysis[];
  opportunities: MarketOpportunity[];
  variant?: 'executive' | 'detailed';
  onTrendClick?: (trend: MarketTrend) => void;
  onCompetitorClick?: (competitor: CompetitorAnalysis) => void;
  onOpportunityClick?: (opportunity: MarketOpportunity) => void;
  onViewDetails?: () => void;
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({
  trends,
  competitors,
  opportunities,
  variant = 'executive',
  onTrendClick,
  onCompetitorClick,
  onOpportunityClick,
  onViewDetails,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const getImpactColor = (impact: string) => {
    const colors = {
      positive: 'green',
      negative: 'red',
      neutral: 'gray',
    };
    return (colors as any)[impact] || 'gray';
  };

  const getImpactIcon = (impact: string) => {
    const icons = {
      positive: <TriangleUpIcon color="green.500" />,
      negative: <TriangleDownIcon color="red.500" />,
      neutral: <InfoIcon color="gray.500" />,
    };
    return (icons as any)[impact] || <InfoIcon />;
  };

  const getCompetitivePositionColor = (position: string) => {
    const colors = {
      leader: 'green',
      challenger: 'blue',
      follower: 'yellow',
      niche: 'purple',
    };
    return (colors as any)[position] || 'gray';
  };

  const getEntryBarrierColor = (barrier: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'red',
    };
    return (colors as any)[barrier] || 'gray';
  };

  const getCompetitiveIntensityColor = (intensity: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'red',
    };
    return (colors as any)[intensity] || 'gray';
  };

  const getRiskLevelColor = (risk: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'red',
    };
    return (colors as any)[risk] || 'gray';
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleTrendClick = (trend: MarketTrend) => {
    if (onTrendClick) {
      onTrendClick(trend);
    }
  };

  const handleCompetitorClick = (competitor: CompetitorAnalysis) => {
    if (onCompetitorClick) {
      onCompetitorClick(competitor);
    }
  };

  const handleOpportunityClick = (opportunity: MarketOpportunity) => {
    if (onOpportunityClick) {
      onOpportunityClick(opportunity);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const positiveTrends = trends.filter(t => t.impact === 'positive');
  const negativeTrends = trends.filter(t => t.impact === 'negative');
  const highGrowthOpportunities = opportunities.filter(o => o.growthRate > 20);

  return (
    <Box bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor} p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          Market Intelligence
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<ViewIcon />}
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </HStack>
      </HStack>

      <VStack spacing={6} align="stretch">
        {/* Market Trends */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('trends')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <HStack>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Market Trends & Analysis
              </Text>
              <HStack spacing={2}>
                {positiveTrends.length > 0 && (
                  <Badge colorScheme="green" variant="subtle">
                    {positiveTrends.length} Positive
                  </Badge>
                )}
                {negativeTrends.length > 0 && (
                  <Badge colorScheme="red" variant="subtle">
                    {negativeTrends.length} Negative
                  </Badge>
                )}
              </HStack>
            </HStack>
            {expandedSection === 'trends' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'trends'}>
            <Box mt={4}>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(350px, 1fr))',
                }}
                gap={4}
              >
                {(showAllTrends ? trends : trends.slice(0, 4)).map((trend) => (
                  <Box
                    key={trend.id}
                    bg={hoverBg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      shadow: 'md',
                      borderColor: 'blue.300',
                    }}
                    onClick={() => handleTrendClick(trend)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <HStack>
                        {getImpactIcon(trend.impact)}
                        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                          {trend.title}
                        </Text>
                      </HStack>
                      <Badge colorScheme={getImpactColor(trend.impact)} variant="subtle">
                        {trend.impact.toUpperCase()}
                      </Badge>
                    </HStack>
                    
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        {trend.description}
                      </Text>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          <strong>Category:</strong> {trend.category}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          <strong>Timeframe:</strong> {trend.timeframe}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          <strong>Source:</strong> {trend.source}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          <strong>Confidence:</strong> {trend.confidence}%
                        </Text>
                      </HStack>
                      
                      <Progress
                        value={trend.confidence}
                        colorScheme={trend.confidence >= 80 ? 'green' : trend.confidence >= 60 ? 'yellow' : 'red'}
                        size="xs"
                        borderRadius="full"
                      />
                      
                      <Text fontSize="xs" color="gray.400" textAlign="right">
                        Updated: {trend.lastUpdated}
                      </Text>
                    </VStack>
                  </Box>
                ))}
                
                {trends.length > 4 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllTrends(!showAllTrends)}
                  >
                    {showAllTrends ? 'Show Less' : `Show All ${trends.length} Trends`}
                  </Button>
                )}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* Competitor Analysis */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('competitors')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <Text fontSize="md" fontWeight="semibold" color={textColor}>
              Competitor Analysis
            </Text>
            {expandedSection === 'competitors' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'competitors'}>
            <Box mt={4}>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(400px, 1fr))',
                }}
                gap={4}
              >
                {(showAllCompetitors ? competitors : competitors.slice(0, 3)).map((competitor) => (
                  <Box
                    key={competitor.id}
                    bg={hoverBg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      shadow: 'md',
                      borderColor: 'blue.300',
                    }}
                    onClick={() => handleCompetitorClick(competitor)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {competitor.name}
                      </Text>
                      <Badge colorScheme={getCompetitivePositionColor(competitor.competitivePosition)} variant="solid">
                        {competitor.competitivePosition.toUpperCase()}
                      </Badge>
                    </HStack>
                    
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          <strong>Market Share:</strong>
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                          {competitor.marketShare.toFixed(1)}%
                        </Text>
                      </HStack>
                      
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          <strong>Strengths:</strong>
                        </Text>
                        <HStack flexWrap="wrap" spacing={1}>
                          {competitor.strengths.slice(0, 3).map((strength, index) => (
                            <Badge key={index} colorScheme="green" variant="subtle" size="sm">
                              {strength}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                      
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          <strong>Weaknesses:</strong>
                        </Text>
                        <HStack flexWrap="wrap" spacing={1}>
                          {competitor.weaknesses.slice(0, 2).map((weakness, index) => (
                            <Badge key={index} colorScheme="red" variant="subtle" size="sm">
                              {weakness}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                      
                      <Text fontSize="xs" color="gray.500">
                        <strong>Recent Activity:</strong> {competitor.recentActivity}
                      </Text>
                    </VStack>
                  </Box>
                ))}
                
                {competitors.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllCompetitors(!showAllCompetitors)}
                  >
                    {showAllCompetitors ? 'Show Less' : `Show All ${competitors.length} Competitors`}
                  </Button>
                )}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* Market Opportunities */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('opportunities')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <HStack>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Market Opportunities
              </Text>
              {highGrowthOpportunities.length > 0 && (
                <Badge colorScheme="green" variant="solid">
                  {highGrowthOpportunities.length} High Growth
                </Badge>
              )}
            </HStack>
            {expandedSection === 'opportunities' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'opportunities'}>
            <Box mt={4}>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(400px, 1fr))',
                }}
                gap={4}
              >
                {(showAllOpportunities ? opportunities : opportunities.slice(0, 3)).map((opportunity) => (
                  <Box
                    key={opportunity.id}
                    bg={hoverBg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      shadow: 'md',
                      borderColor: 'blue.300',
                    }}
                    onClick={() => handleOpportunityClick(opportunity)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {opportunity.title}
                      </Text>
                      <Badge colorScheme={getRiskLevelColor(opportunity.riskLevel)} variant="solid">
                        {opportunity.riskLevel.toUpperCase()}
                      </Badge>
                    </HStack>
                    
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        {opportunity.description}
                      </Text>
                      
                      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Market Size
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            {formatCurrency(opportunity.marketSize)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Growth Rate
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            {formatPercentage(opportunity.growthRate)}
                          </Text>
                        </Box>
                      </Grid>
                      
                      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Entry Barriers
                          </Text>
                          <Badge colorScheme={getEntryBarrierColor(opportunity.entryBarriers)} variant="subtle">
                            {opportunity.entryBarriers.toUpperCase()}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Competition
                          </Text>
                          <Badge colorScheme={getCompetitiveIntensityColor(opportunity.competitiveIntensity)} variant="subtle">
                            {opportunity.competitiveIntensity.toUpperCase()}
                          </Badge>
                        </Box>
                      </Grid>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          <strong>ROI:</strong> {formatPercentage(opportunity.estimatedROI)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <strong>Timeline:</strong> {opportunity.timeline}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
                
                {opportunities.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllOpportunities(!showAllOpportunities)}
                  >
                    {showAllOpportunities ? 'Show Less' : `Show All ${opportunities.length} Opportunities`}
                  </Button>
                )}
              </Grid>
            </Box>
          </Collapse>
        </Box>
      </VStack>
    </Box>
  );
};
