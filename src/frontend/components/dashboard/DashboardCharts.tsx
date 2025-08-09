import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  Badge,
  useColorModeValue,
  Progress,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast
} from '@chakra-ui/react';
import { SettingsIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import { Card } from '../../components/ui';
import { Chart } from '../../features/analytics/components/Chart';
import { ChartDataPoint } from '../../features/analytics/types/analytics';

interface ChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface DashboardChartsProps {
  leadPipelineData: ChartData[];
  monthlyGrowthData: ChartData[];
  conversionTrendData: ChartData[];
  revenueData: ChartData[];
  loading?: boolean;
  onChartInteraction?: (chartType: string, data: any) => void;
  onExportChart?: (chartType: string, format: 'png' | 'svg' | 'pdf') => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  leadPipelineData,
  monthlyGrowthData,
  conversionTrendData,
  revenueData,
  loading = false,
  onChartInteraction,
  onExportChart,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleChartExport = (chartType: string, format: 'png' | 'svg' | 'pdf') => {
    if (onExportChart) {
      onExportChart(chartType, format);
      toast({
        title: 'Chart Export',
        description: `${chartType} chart exported as ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
      });
    }
  };

  const handleChartClick = (chartType: string, data: any) => {
    if (onChartInteraction) {
      onChartInteraction(chartType, data);
    }
  };

  // Convert ChartData to ChartDataPoint for the Chart component
  const convertToChartDataPoint = (data: ChartData[]): ChartDataPoint[] => {
    return data.map(item => ({
      name: item.name,
      value: item.value,
      color: item.color,
    }));
  };

  if (loading) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor}>
        <VStack spacing={4} align="center" justify="center" minH="200px">
          <Text color={textColor}>Loading charts...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor}>
      <VStack align="stretch" spacing={6}>
        {/* Charts Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(450px, 1fr))" gap={6}>
          {/* Lead Pipeline */}
          <Card
            header={
              <HStack justify="space-between" w="100%">
                <Text fontWeight="semibold" color={textColor}>Lead Pipeline</Text>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Chart options"
                    icon={<SettingsIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem icon={<ViewIcon />} onClick={() => handleChartClick('pipeline', leadPipelineData)}>
                      View Details
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('pipeline', 'png')}>
                      Export PNG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('pipeline', 'svg')}>
                      Export SVG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('pipeline', 'pdf')}>
                      Export PDF
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            }
          >
            <VStack align="stretch" spacing={4}>
              {leadPipelineData.map((item, index) => (
                <VStack key={item.name} align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <HStack>
                      <Box w={3} h={3} borderRadius="full" bg={item.color || '#3182CE'} />
                      <Text color={textColor}>{item.name}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge variant="subtle" colorScheme="blue">
                        {item.value.toLocaleString()}
                      </Badge>
                      {item.percentage && (
                        <Text fontSize="sm" color="gray.500">
                          {item.percentage.toFixed(1)}%
                        </Text>
                      )}
                    </HStack>
                  </HStack>
                  <Progress
                    value={item.percentage || 0}
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                  />
                </VStack>
              ))}
            </VStack>
          </Card>

          {/* Monthly Growth */}
          <Card
            header={
              <HStack justify="space-between" w="100%">
                <Text fontWeight="semibold" color={textColor}>Monthly Lead Growth</Text>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Chart options"
                    icon={<SettingsIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem icon={<ViewIcon />} onClick={() => handleChartClick('growth', monthlyGrowthData)}>
                      View Details
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('growth', 'png')}>
                      Export PNG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('growth', 'svg')}>
                      Export SVG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('growth', 'pdf')}>
                      Export PDF
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            }
          >
            <Chart
              type="line"
              data={convertToChartDataPoint(monthlyGrowthData)}
              height={250}
              options={{
                xAxisLabel: 'Month',
                yAxisLabel: 'Leads',
                showGrid: true,
                animate: true,
                title: 'Lead Growth Trend',
              }}
            />
          </Card>

          {/* Conversion Trend */}
          <Card
            header={
              <HStack justify="space-between" w="100%">
                <Text fontWeight="semibold" color={textColor}>Conversion Rate Trend</Text>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Chart options"
                    icon={<SettingsIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem icon={<ViewIcon />} onClick={() => handleChartClick('conversion', conversionTrendData)}>
                      View Details
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('conversion', 'png')}>
                      Export PNG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('conversion', 'svg')}>
                      Export SVG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('conversion', 'pdf')}>
                      Export PDF
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            }
          >
            <Chart
              type="area"
              data={convertToChartDataPoint(conversionTrendData)}
              height={250}
              options={{
                xAxisLabel: 'Month',
                yAxisLabel: 'Conversion Rate (%)',
                showGrid: true,
                animate: true,
                title: 'Conversion Rate Trend',
              }}
            />
          </Card>

          {/* Revenue Chart */}
          <Card
            header={
              <HStack justify="space-between" w="100%">
                <Text fontWeight="semibold" color={textColor}>Revenue Overview</Text>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Chart options"
                    icon={<SettingsIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuItem icon={<ViewIcon />} onClick={() => handleChartClick('revenue', revenueData)}>
                      View Details
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('revenue', 'png')}>
                      Export PNG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('revenue', 'svg')}>
                      Export SVG
                    </MenuItem>
                    <MenuItem icon={<DownloadIcon />} onClick={() => handleChartExport('revenue', 'pdf')}>
                      Export PDF
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            }
          >
            <Chart
              type="bar"
              data={convertToChartDataPoint(revenueData)}
              height={250}
              options={{
                xAxisLabel: 'Month',
                yAxisLabel: 'Revenue ($)',
                showGrid: true,
                animate: true,
                title: 'Monthly Revenue',
              }}
            />
          </Card>
        </Grid>

        {/* Performance Summary */}
        <Card header="Performance Summary">
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <VStack align="start" spacing={3}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Top Performing Month</Text>
              <Text fontWeight="bold" fontSize="xl" color={textColor}>March 2024</Text>
              <HStack spacing={2}>
                <Badge colorScheme="green" variant="subtle">+15.3%</Badge>
                <Text fontSize="sm" color="green.500">growth</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">75 leads generated</Text>
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Best Conversion Rate</Text>
              <Text fontWeight="bold" fontSize="xl" color={textColor}>May 2024</Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle">13.5%</Badge>
                <Text fontSize="sm" color="blue.500">conversion</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">38 leads converted</Text>
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Highest Revenue</Text>
              <Text fontWeight="bold" fontSize="xl" color={textColor}>June 2024</Text>
              <HStack spacing={2}>
                <Badge colorScheme="purple" variant="subtle">$52,000</Badge>
                <Text fontSize="sm" color="purple.500">revenue</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">Generated from 75 leads</Text>
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Pipeline Health</Text>
              <Text fontWeight="bold" fontSize="xl" color={textColor}>Excellent</Text>
              <HStack spacing={2}>
                <Badge colorScheme="green" variant="subtle">85%</Badge>
                <Text fontSize="sm" color="green.500">efficiency</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">Strong lead flow</Text>
            </VStack>
          </Grid>
        </Card>

        {/* Quick Insights */}
        <Card header="Quick Insights">
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
            <VStack align="start" spacing={2} p={4} bg="blue.50" borderRadius="md">
              <Text fontWeight="semibold" color="blue.700">Lead Generation</Text>
              <Text fontSize="sm" color="blue.600">
                Lead generation is up 23.4% this month. Consider increasing marketing spend to capitalize on this trend.
              </Text>
            </VStack>

            <VStack align="start" spacing={2} p={4} bg="green.50" borderRadius="md">
              <Text fontWeight="semibold" color="green.700">Conversion Rate</Text>
              <Text fontSize="sm" color="green.600">
                Conversion rate improved by 5.2%. Your lead qualification process is working effectively.
              </Text>
            </VStack>

            <VStack align="start" spacing={2} p={4} bg="orange.50" borderRadius="md">
              <Text fontWeight="semibold" color="orange.700">Buyer Engagement</Text>
              <Text fontSize="sm" color="orange.600">
                Buyer engagement is down 2.1%. Consider reviewing your follow-up process and communication strategy.
              </Text>
            </VStack>

            <VStack align="start" spacing={2} p={4} bg="purple.50" borderRadius="md">
              <Text fontWeight="semibold" color="purple.700">Revenue Growth</Text>
              <Text fontSize="sm" color="purple.600">
                Revenue growth of 18.7% is strong. Focus on maintaining lead quality while scaling operations.
              </Text>
            </VStack>
          </Grid>
        </Card>
      </VStack>
    </Box>
  );
}; 