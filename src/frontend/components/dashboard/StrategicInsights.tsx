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
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ViewIcon, 
  ExternalLinkIcon,
  InfoIcon,
  WarningIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';

interface TrendData {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

interface RiskIndicator {
  id: string;
  category: 'financial' | 'operational' | 'market' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  mitigation: string;
  status: 'active' | 'mitigated' | 'monitoring';
}

interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
  category: 'growth' | 'efficiency' | 'risk' | 'opportunity';
  estimatedROI: number;
  timeline: string;
}

interface StrategicInsightsProps {
  trends: TrendData[];
  risks: RiskIndicator[];
  recommendations: StrategicRecommendation[];
  variant?: 'executive' | 'detailed';
  onInsightClick?: (insight: any) => void;
  onViewDetails?: () => void;
}

export const StrategicInsights: React.FC<StrategicInsightsProps> = ({
  trends,
  risks,
  recommendations,
  variant = 'executive',
  onInsightClick,
  onViewDetails,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAllRisks, setShowAllRisks] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const getTrendIcon = (trend: string) => {
    const icons = {
      up: '↗️',
      down: '↘️',
      stable: '→',
    };
    return (icons as any)[trend] || '→';
  };

  const getTrendColor = (trend: string, changePercent: number) => {
    if (trend === 'up' && changePercent > 0) return 'green.500';
    if (trend === 'down' && changePercent < 0) return 'red.500';
    return 'gray.500';
  };

  const getRiskColor = (severity: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return (colors as any)[severity] || 'gray';
  };

  const getRiskIcon = (severity: string) => {
    const icons = {
      low: <CheckCircleIcon />,
      medium: <InfoIcon />,
      high: <WarningIcon />,
      critical: <WarningIcon />,
    };
    return (icons as any)[severity] || <InfoIcon />;
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'green',
    };
    return (colors as any)[impact] || 'gray';
  };

  const getEffortColor = (effort: string) => {
    const colors = {
      high: 'red',
      medium: 'yellow',
      low: 'green',
    };
    return (colors as any)[effort] || 'gray';
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'red.500';
    if (priority <= 6) return 'orange.500';
    return 'green.500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleInsightClick = (insight: any) => {
    if (onInsightClick) {
      onInsightClick(insight);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const criticalRisks = risks.filter(r => r.severity === 'critical' || r.severity === 'high');
  const highPriorityRecommendations = recommendations.filter(r => r.priority <= 3);

  return (
    <Box bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor} p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          Strategic Insights
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
        {/* Business Trends */}
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
            <Text fontSize="md" fontWeight="semibold" color={textColor}>
              Business Trends & Forecasting
            </Text>
            {expandedSection === 'trends' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'trends'}>
            <Box mt={4}>
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(auto-fit, minmax(300px, 1fr))',
                }}
                gap={4}
              >
                {trends.map((trend) => (
                  <Box
                    key={trend.metric}
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
                    onClick={() => handleInsightClick(trend)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {trend.metric}
                      </Text>
                      <Text fontSize="lg">{getTrendIcon(trend.trend)}</Text>
                    </HStack>
                    
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold" color={textColor}>
                          {formatCurrency(trend.currentValue)}
                        </Text>
                        <Text
                          fontSize="sm"
                          color={getTrendColor(trend.trend, trend.changePercent)}
                          fontWeight="semibold"
                        >
                          {formatPercentage(trend.changePercent)}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">
                          Previous: {formatCurrency(trend.previousValue)}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Confidence: {trend.confidence}%
                        </Text>
                      </HStack>
                      
                      <Progress
                        value={trend.confidence}
                        colorScheme={trend.confidence >= 80 ? 'green' : trend.confidence >= 60 ? 'yellow' : 'red'}
                        size="xs"
                        borderRadius="full"
                      />
                    </VStack>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {/* Risk Assessment */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('risks')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <HStack>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Risk Assessment
              </Text>
              {criticalRisks.length > 0 && (
                <Badge colorScheme="red" variant="solid">
                  {criticalRisks.length} Critical
                </Badge>
              )}
            </HStack>
            {expandedSection === 'risks' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'risks'}>
            <Box mt={4}>
              {criticalRisks.length > 0 && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Critical Risks Detected!</AlertTitle>
                    <AlertDescription>
                      {criticalRisks.length} high-priority risks require immediate attention.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              <VStack spacing={3} align="stretch">
                {(showAllRisks ? risks : risks.slice(0, 3)).map((risk) => (
                  <Box
                    key={risk.id}
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
                    onClick={() => handleInsightClick(risk)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <HStack>
                        {getRiskIcon(risk.severity)}
                        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                          {risk.description}
                        </Text>
                      </HStack>
                      <Badge colorScheme={getRiskColor(risk.severity)} variant="subtle">
                        {risk.severity.toUpperCase()}
                      </Badge>
                    </HStack>
                    
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        <strong>Impact:</strong> {risk.impact}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </Text>
                      <HStack justify="space-between">
                        <Badge
                          colorScheme={risk.status === 'mitigated' ? 'green' : risk.status === 'monitoring' ? 'yellow' : 'red'}
                          variant="subtle"
                        >
                          {risk.status}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {risk.category}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
                
                {risks.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllRisks(!showAllRisks)}
                  >
                    {showAllRisks ? 'Show Less' : `Show All ${risks.length} Risks`}
                  </Button>
                )}
              </VStack>
            </Box>
          </Collapse>
        </Box>

        {/* Strategic Recommendations */}
        <Box>
          <HStack 
            justify="space-between" 
            cursor="pointer"
            onClick={() => toggleSection('recommendations')}
            p={3}
            bg={hoverBg}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            <HStack>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Strategic Recommendations
              </Text>
              {highPriorityRecommendations.length > 0 && (
                <Badge colorScheme="blue" variant="solid">
                  {highPriorityRecommendations.length} High Priority
                </Badge>
              )}
            </HStack>
            {expandedSection === 'recommendations' ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </HStack>
          
          <Collapse in={expandedSection === 'recommendations'}>
            <Box mt={4}>
              <VStack spacing={3} align="stretch">
                {(showAllRecommendations ? recommendations : recommendations.slice(0, 3)).map((rec) => (
                  <Box
                    key={rec.id}
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
                    onClick={() => handleInsightClick(rec)}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {rec.title}
                      </Text>
                      <Badge colorScheme={getPriorityColor(rec.priority)} variant="solid">
                        P{rec.priority}
                      </Badge>
                    </HStack>
                    
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        {rec.description}
                      </Text>
                      
                      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Impact
                          </Text>
                          <Badge colorScheme={getImpactColor(rec.impact)} variant="subtle">
                            {rec.impact.toUpperCase()}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Effort
                          </Text>
                          <Badge colorScheme={getEffortColor(rec.effort)} variant="subtle">
                            {rec.effort.toUpperCase()}
                          </Badge>
                        </Box>
                      </Grid>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          <strong>ROI:</strong> {formatPercentage(rec.estimatedROI)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <strong>Timeline:</strong> {rec.timeline}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Badge colorScheme="purple" variant="subtle">
                          {rec.category}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          Priority {rec.priority}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
                
                {recommendations.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  >
                    {showAllRecommendations ? 'Show Less' : `Show All ${recommendations.length} Recommendations`}
                  </Button>
                )}
              </VStack>
            </Box>
          </Collapse>
        </Box>
      </VStack>
    </Box>
  );
};
