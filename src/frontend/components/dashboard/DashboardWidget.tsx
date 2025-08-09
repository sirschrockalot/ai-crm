import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useToast,
  Badge,
  Progress,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import {
  SettingsIcon,
  RepeatIcon,
  ViewIcon,
  DownloadIcon,
  CloseIcon,
  ExternalLinkIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';
import { Card, Chart } from '../../components/ui';
import { ChartDataPoint } from '../../features/analytics/types/analytics';

interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: any;
  refreshInterval?: number;
  dataSource?: string;
}

interface DashboardWidgetProps {
  config: WidgetConfig;
  data?: any;
  loading?: boolean;
  error?: string;
  onRefresh?: (widgetId: string) => void;
  onConfigure?: (widgetId: string) => void;
  onRemove?: (widgetId: string) => void;
  onResize?: (widgetId: string, size: 'small' | 'medium' | 'large') => void;
  onExport?: (widgetId: string, format: 'png' | 'svg' | 'pdf') => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  config,
  data,
  loading = false,
  error,
  onRefresh,
  onConfigure,
  onRemove,
  onResize,
  onExport,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const [isMinimized, setIsMinimized] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh functionality
  useEffect(() => {
    if (config.refreshInterval && config.refreshInterval > 0) {
      const interval = setInterval(() => {
        if (onRefresh) {
          onRefresh(config.id);
          setLastUpdated(new Date());
        }
      }, config.refreshInterval * 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [config.refreshInterval, config.id, onRefresh]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(config.id);
      setLastUpdated(new Date());
      toast({
        title: 'Widget Refreshed',
        description: `${config.title} data has been updated`,
        status: 'success',
        duration: 2000,
      });
    }
  };

  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure(config.id);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(config.id);
      toast({
        title: 'Widget Removed',
        description: `${config.title} has been removed from dashboard`,
        status: 'info',
        duration: 3000,
      });
    }
  };

  const handleResize = (size: 'small' | 'medium' | 'large') => {
    if (onResize) {
      onResize(config.id, size);
    }
  };

  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    if (onExport) {
      onExport(config.id, format);
      toast({
        title: 'Widget Exported',
        description: `${config.title} exported as ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
      });
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getSizeDimensions = () => {
    switch (config.size) {
      case 'small':
        return { width: '300px', height: '200px' };
      case 'medium':
        return { width: '450px', height: '300px' };
      case 'large':
        return { width: '600px', height: '400px' };
      default:
        return { width: '450px', height: '300px' };
    }
  };

  const renderWidgetContent = () => {
    if (loading) {
      return (
        <VStack spacing={4} align="center" justify="center" minH="150px">
          <Spinner size="md" />
          <Text fontSize="sm" color="gray.500">Loading...</Text>
        </VStack>
      );
    }

    if (error) {
      return (
        <VStack spacing={2} align="center" justify="center" minH="150px">
          <Text fontSize="sm" color="red.500">Error loading widget</Text>
          <Text fontSize="xs" color="gray.500" textAlign="center">{error}</Text>
        </VStack>
      );
    }

    switch (config.type) {
      case 'metric':
        return renderMetricWidget();
      case 'chart':
        return renderChartWidget();
      case 'table':
        return renderTableWidget();
      case 'list':
        return renderListWidget();
      case 'custom':
        return renderCustomWidget();
      default:
        return (
          <VStack spacing={2} align="center" justify="center" minH="150px">
            <Text fontSize="sm" color="gray.500">Unknown widget type</Text>
          </VStack>
        );
    }
  };

  const renderMetricWidget = () => {
    const metric = data?.value || 0;
    const change = data?.change || 0;
    const format = data?.format || 'number';
    const prefix = data?.prefix || '';
    const suffix = data?.suffix || '';

    const formatValue = (value: number) => {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(value);
        case 'percentage':
          return `${value.toFixed(1)}%`;
        case 'number':
        default:
          return `${prefix}${value.toLocaleString()}${suffix}`;
      }
    };

    return (
      <VStack spacing={3} align="center" justify="center" minH="150px">
        <Text fontSize="3xl" fontWeight="bold" color={textColor}>
          {formatValue(metric)}
        </Text>
        {change !== 0 && (
          <HStack spacing={1}>
            <Badge
              colorScheme={change >= 0 ? 'green' : 'red'}
              variant="subtle"
              fontSize="xs"
            >
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </Badge>
            <Text fontSize="xs" color="gray.500">vs last period</Text>
          </HStack>
        )}
        {data?.target && (
          <VStack spacing={1} w="100%">
            <HStack justify="space-between" w="100%">
              <Text fontSize="xs" color="gray.500">Progress</Text>
              <Text fontSize="xs" color="gray.500">
                {Math.min((metric / data.target) * 100, 100).toFixed(1)}%
              </Text>
            </HStack>
            <Progress
              value={Math.min((metric / data.target) * 100, 100)}
              size="sm"
              w="100%"
              colorScheme={metric >= data.target ? 'green' : 'blue'}
            />
          </VStack>
        )}
      </VStack>
    );
  };

  const renderChartWidget = () => {
    const chartData = data?.chartData || [];
    const chartType = data?.chartType || 'line';
    const chartOptions = data?.chartOptions || {};

    return (
      <Box h="100%" w="100%">
        <Chart
          type={chartType}
          data={chartData}
          height={getSizeDimensions().height}
        />
      </Box>
    );
  };

  const renderTableWidget = () => {
    const tableData = data?.tableData || [];
    const columns = data?.columns || [];

    return (
      <VStack spacing={2} align="stretch" w="100%" h="100%" overflow="auto">
        {tableData.map((row: any, index: number) => (
          <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
            {columns.map((column: any) => (
              <Text key={column.key} fontSize="sm" color={textColor}>
                {row[column.key]}
              </Text>
            ))}
          </HStack>
        ))}
      </VStack>
    );
  };

  const renderListWidget = () => {
    const listData = data?.listData || [];

    return (
      <VStack spacing={2} align="stretch" w="100%" h="100%" overflow="auto">
        {listData.map((item: any, index: number) => (
          <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" color={textColor}>{item.label}</Text>
            <Badge variant="subtle" colorScheme={item.color || 'blue'}>
              {item.value}
            </Badge>
          </HStack>
        ))}
      </VStack>
    );
  };

  const renderCustomWidget = () => {
    return (
      <VStack spacing={2} align="center" justify="center" minH="150px">
        <Text fontSize="sm" color="gray.500">Custom Widget</Text>
        <Text fontSize="xs" color="gray.400">Configure custom content</Text>
      </VStack>
    );
  };

  if (isMinimized) {
    return (
      <Card
        header={
          <HStack justify="space-between" w="100%">
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              {config.title}
            </Text>
            <IconButton
              aria-label="Maximize widget"
                              icon={<ExternalLinkIcon />}
              size="xs"
              variant="ghost"
              onClick={toggleMinimize}
            />
          </HStack>
        }
      >
        <Box h="50px" />
      </Card>
    );
  }

  return (
    <Card
      header={
        <HStack justify="space-between" w="100%">
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" color={textColor}>
              {config.title}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          </VStack>
          <HStack spacing={1}>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Widget options"
                icon={<SettingsIcon />}
                size="sm"
                variant="ghost"
              />
              <MenuList>
                <MenuItem icon={<ViewIcon />} onClick={handleConfigure}>
                  Configure
                </MenuItem>
                <MenuItem icon={<RepeatIcon />} onClick={handleRefresh}>
                  Refresh
                </MenuItem>
                <MenuItem icon={<DownloadIcon />} onClick={() => handleExport('png')}>
                  Export PNG
                </MenuItem>
                <MenuItem icon={<DownloadIcon />} onClick={() => handleExport('svg')}>
                  Export SVG
                </MenuItem>
                <MenuItem icon={<DownloadIcon />} onClick={() => handleExport('pdf')}>
                  Export PDF
                </MenuItem>
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Resize widget"
                icon={<ExternalLinkIcon />}
                size="sm"
                variant="ghost"
              />
              <MenuList>
                <MenuItem onClick={() => handleResize('small')}>Small</MenuItem>
                <MenuItem onClick={() => handleResize('medium')}>Medium</MenuItem>
                <MenuItem onClick={() => handleResize('large')}>Large</MenuItem>
              </MenuList>
            </Menu>
            <IconButton
              aria-label="Minimize widget"
                              icon={<ChevronUpIcon />}
              size="sm"
              variant="ghost"
              onClick={toggleMinimize}
            />
            <IconButton
              aria-label="Remove widget"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              onClick={handleRemove}
            />
          </HStack>
        </HStack>
      }
    >
      <Box {...getSizeDimensions()}>
        {renderWidgetContent()}
      </Box>
    </Card>
  );
};
