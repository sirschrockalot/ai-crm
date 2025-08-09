import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Grid,
  GridItem,
  Badge,
  Icon,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiInfo } from 'react-icons/fi';

export interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<any>;
  color?: string;
  tooltip?: string;
  format?: 'number' | 'currency' | 'percentage' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface DataDisplayProps {
  title?: string;
  subtitle?: string;
  metrics?: MetricData[];
  chartData?: ChartData[];
  variant?: 'metrics' | 'chart' | 'list' | 'grid';
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
  showTrends?: boolean;
  showIcons?: boolean;
  showTooltips?: boolean;
  className?: string;
}

export const DataDisplay: React.FC<DataDisplayProps> = ({
  title,
  subtitle,
  metrics = [],
  chartData = [],
  variant = 'metrics',
  columns = 4,
  size = 'md',
  showTrends = true,
  showIcons = true,
  showTooltips = true,
  className = '',
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatValue = (value: string | number, format: string = 'text') => {
    switch (format) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'currency':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
      case 'percentage':
        return typeof value === 'number' ? `${value}%` : value;
      default:
        return value;
    }
  };

  const getTrendIcon = (changeType?: string) => {
    switch (changeType) {
      case 'positive':
        return FiTrendingUp;
      case 'negative':
        return FiTrendingDown;
      default:
        return FiMinus;
    }
  };

  const getTrendColor = (changeType?: string) => {
    switch (changeType) {
      case 'positive':
        return 'green.500';
      case 'negative':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const renderMetric = (metric: MetricData, index: number) => {
    const TrendIcon = getTrendIcon(metric.changeType);
    const IconComponent = metric.icon;

    const metricContent = (
      <Box
        p={size === 'lg' ? 6 : size === 'sm' ? 3 : 4}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
        transition="all 0.2s"
      >
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <Text fontSize="sm" color="gray.500">
              {metric.label}
            </Text>
            {showIcons && IconComponent && (
              <Icon as={IconComponent} color={metric.color || 'blue.500'} />
            )}
          </HStack>
          
          <Text
            fontSize={size === 'lg' ? '3xl' : size === 'sm' ? 'lg' : '2xl'}
            fontWeight="bold"
            color={metric.color || 'gray.900'}
          >
            {formatValue(metric.value, metric.format)}
          </Text>
          
          {showTrends && metric.change !== undefined && (
            <HStack spacing={1}>
              <Icon
                as={TrendIcon}
                color={getTrendColor(metric.changeType)}
                size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16}
              />
              <Text
                fontSize="sm"
                color={getTrendColor(metric.changeType)}
                fontWeight="medium"
              >
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </Text>
            </HStack>
          )}
        </VStack>
      </Box>
    );

    if (showTooltips && metric.tooltip) {
      return (
        <Tooltip key={index} label={metric.tooltip} placement="top">
          {metricContent}
        </Tooltip>
      );
    }

    return <Box key={index}>{metricContent}</Box>;
  };

  const renderChart = () => {
    if (!chartData.length) return null;

    return (
      <VStack spacing={4} align="stretch">
        {chartData.map((item, index) => (
          <Box
            key={index}
            p={4}
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
          >
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  {item.name}
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                  {item.value.toLocaleString()}
                </Text>
              </VStack>
              <HStack spacing={2}>
                {item.percentage && (
                  <Badge colorScheme="blue" variant="subtle">
                    {item.percentage}%
                  </Badge>
                )}
                <Box
                  w="4"
                  h="4"
                  borderRadius="full"
                  bg={item.color || 'blue.500'}
                />
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    );
  };

  const renderList = () => {
    if (!chartData.length) return null;

    return (
      <VStack spacing={2} align="stretch">
        {chartData.map((item, index) => (
          <HStack
            key={index}
            justify="space-between"
            p={3}
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
          >
            <HStack spacing={3}>
              <Box
                w="3"
                h="3"
                borderRadius="full"
                bg={item.color || 'blue.500'}
              />
              <Text fontSize="sm">{item.name}</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="medium">
              {item.value.toLocaleString()}
            </Text>
          </HStack>
        ))}
      </VStack>
    );
  };

  const renderGrid = () => {
    if (!chartData.length) return null;

    return (
      <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4}>
        {chartData.map((item, index) => (
          <GridItem key={index}>
            <Box
              p={4}
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              textAlign="center"
            >
              <VStack spacing={2}>
                <Box
                  w="8"
                  h="8"
                  borderRadius="full"
                  bg={item.color || 'blue.500'}
                />
                <Text fontSize="sm" color="gray.500">
                  {item.name}
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                  {item.value.toLocaleString()}
                </Text>
              </VStack>
            </Box>
          </GridItem>
        ))}
      </Grid>
    );
  };

  return (
    <Box className={className}>
      {(title || subtitle) && (
        <VStack align="start" spacing={2} mb={6}>
          {title && (
            <Heading size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'}>
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text color="gray.600" fontSize="sm">
              {subtitle}
            </Text>
          )}
        </VStack>
      )}

      {variant === 'metrics' && metrics.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: columns }} spacing={4}>
          {metrics.map((metric, index) => renderMetric(metric, index))}
        </SimpleGrid>
      )}

      {variant === 'chart' && renderChart()}
      {variant === 'list' && renderList()}
      {variant === 'grid' && renderGrid()}
    </Box>
  );
};

// Specialized data display components for different contexts
export const MetricsDisplay: React.FC<Omit<DataDisplayProps, 'variant'> & { metrics: MetricData[] }> = (props) => (
  <DataDisplay {...props} variant="metrics" />
);

export const ChartDisplay: React.FC<Omit<DataDisplayProps, 'variant'> & { chartData: ChartData[] }> = (props) => (
  <DataDisplay {...props} variant="chart" />
);

export const ListDisplay: React.FC<Omit<DataDisplayProps, 'variant'> & { chartData: ChartData[] }> = (props) => (
  <DataDisplay {...props} variant="list" />
);

export const GridDisplay: React.FC<Omit<DataDisplayProps, 'variant'> & { chartData: ChartData[] }> = (props) => (
  <DataDisplay {...props} variant="grid" />
);

export default DataDisplay;
