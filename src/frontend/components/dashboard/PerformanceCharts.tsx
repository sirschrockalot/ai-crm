import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  useToast,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import {
  DownloadIcon,
  SettingsIcon,
  ChevronDownIcon,
  ViewIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
  target?: number;
}

interface PerformanceChartsProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  height?: number;
  color?: string;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showExport?: boolean;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  onExport?: (format: 'pdf' | 'png' | 'csv') => void;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  data,
  type,
  height = 300,
  color = 'blue',
  title,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showExport = true,
  onDataPointClick,
  onExport,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  const chartColors = useMemo(() => {
    const defaultColors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#F97316', // orange
      '#84CC16', // lime
    ];

    if (type === 'pie' || type === 'doughnut') {
      return data.map((item, index) => item.color || defaultColors[index % defaultColors.length]);
    }

    return [color];
  }, [data, type, color]);

  const handleExport = (format: 'pdf' | 'png' | 'csv') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export handling
      toast({
        title: 'Export Started',
        description: `Exporting chart as ${format.toUpperCase()}`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDataPointClick = (dataPoint: ChartDataPoint) => {
    if (onDataPointClick) {
      onDataPointClick(dataPoint);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data,
      height,
      onClick: (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
          handleDataPointClick(data.activePayload[0].payload);
        }
      },
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                dataKey="name" 
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                stroke={textColor}
                fontSize={12}
              />
              {showTooltip && (
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: bgColor,
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              )}
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColors[0]}
                strokeWidth={2}
                dot={{ fill: chartColors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartColors[0], strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                dataKey="name" 
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                stroke={textColor}
                fontSize={12}
              />
              {showTooltip && (
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: bgColor,
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              )}
              {showLegend && <Legend />}
              <Bar dataKey="value" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                dataKey="name" 
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                stroke={textColor}
                fontSize={12}
              />
              {showTooltip && (
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: bgColor,
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              )}
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColors[0]}
                fill={chartColors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart {...commonProps}>
              {showTooltip && (
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: bgColor,
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              )}
              {showLegend && <Legend />}
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={type === 'doughnut' ? 60 : 0}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                onClick={(data) => handleDataPointClick(data)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <Box
            height={height}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="gray.500"
          >
            <Text>Chart type not supported</Text>
          </Box>
        );
    }
  };

  return (
    <Box>
      {/* Chart Container */}
      <Box
        bg={bgColor}
        borderRadius="lg"
        p={4}
        border="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        {/* Chart Header */}
        {(title || showExport) && (
          <HStack justify="space-between" mb={4}>
            {title && (
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                {title}
              </Text>
            )}
            {showExport && (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  size="sm"
                  variant="outline"
                >
                  Export
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<DownloadIcon />} onClick={() => handleExport('png')}>
                    Export as PNG
                  </MenuItem>
                  <MenuItem icon={<DownloadIcon />} onClick={() => handleExport('pdf')}>
                    Export as PDF
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<DownloadIcon />} onClick={() => handleExport('csv')}>
                    Export Data (CSV)
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        )}

        {/* Chart */}
        <Box position="relative">
          {renderChart()}
        </Box>

        {/* Chart Footer */}
        {data.length > 0 && (
          <Box mt={4} pt={4} borderTop="1px" borderColor={gridColor}>
            <HStack justify="space-between" fontSize="sm" color="gray.500">
              <Text>
                {data.length} data point{data.length !== 1 ? 's' : ''}
              </Text>
              <Text>
                Total: {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </Text>
            </HStack>
          </Box>
        )}
      </Box>
    </Box>
  );
};
