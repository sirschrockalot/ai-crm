import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  IconButton,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { FiMoreVertical, FiMaximize2, FiMinimize2, FiSettings } from 'react-icons/fi';
import { Card, Chart } from '../../../components/ui';
import { ChartDataPoint } from '../types/analytics';

interface DashboardWidgetProps {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'heatmap' | 'progress';
  data?: any;
  config?: {
    chartType?: 'line' | 'bar' | 'pie';
    metricValue?: string | number;
    metricChange?: number;
    metricTrend?: 'up' | 'down' | 'neutral';
    showLegend?: boolean;
    showGrid?: boolean;
    animate?: boolean;
  };
  onEdit?: (widgetId: string) => void;
  onDelete?: (widgetId: string) => void;
  onExport?: (widgetId: string) => void;
  isResizable?: boolean;
  isDraggable?: boolean;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  type,
  data,
  config = {},
  onEdit,
  onDelete,
  onExport,
  isResizable = true,
  isDraggable = true,
}) => {
  const { isOpen, onToggle } = useDisclosure();

  const renderWidgetContent = () => {
    switch (type) {
      case 'metric':
        return (
          <VStack align="stretch" spacing={2}>
            <Heading size="md">{title}</Heading>
            <Text fontSize="2xl" fontWeight="bold">
              {config.metricValue || '0'}
            </Text>
            {config.metricChange && (
              <Text fontSize="sm" color={config.metricTrend === 'up' ? 'green.500' : 'red.500'}>
                {config.metricChange > 0 ? '+' : ''}{config.metricChange}%
              </Text>
            )}
          </VStack>
        );

      case 'chart':
        return (
          <Chart
            type={config.chartType || 'line'}
            data={data || []}
            title={title}
            showLegend={config.showLegend}
            showGrid={config.showGrid}
            colors={['#3182ce', '#38a169', '#d69e2e']}
          />
        );

      case 'table':
        return (
          <VStack align="stretch" spacing={4}>
            <Heading size="md">{title}</Heading>
            <Box
              bg="gray.50"
              p={4}
              borderRadius="md"
              border="1px dashed"
              borderColor="gray.300"
            >
              <Text color="gray.500">Table Widget: {data?.length || 0} rows</Text>
            </Box>
          </VStack>
        );

      case 'heatmap':
        return (
          <VStack align="stretch" spacing={4}>
            <Heading size="md">{title}</Heading>
            <Box
              bg="gray.50"
              p={4}
              borderRadius="md"
              border="1px dashed"
              borderColor="gray.300"
            >
              <Text color="gray.500">Heatmap Widget</Text>
            </Box>
          </VStack>
        );

      case 'progress':
        return (
          <VStack align="stretch" spacing={4}>
            <Heading size="md">{title}</Heading>
            <Box
              bg="gray.50"
              p={4}
              borderRadius="md"
              border="1px dashed"
              borderColor="gray.300"
            >
              <Text color="gray.500">Progress Widget</Text>
            </Box>
          </VStack>
        );

      default:
        return (
          <Box
            bg="gray.50"
            p={4}
            borderRadius="md"
            border="1px dashed"
            borderColor="gray.300"
          >
            <Text color="gray.500">Unknown widget type: {type}</Text>
          </Box>
        );
    }
  };

  return (
    <Card>
      <VStack align="stretch" spacing={4}>
        {/* Widget Header */}
        <HStack justify="space-between" align="center">
          <Heading size="md">{title}</Heading>
          <HStack spacing={2}>
            <IconButton
              size="sm"
              icon={<FiSettings />}
              aria-label="Widget settings"
              variant="ghost"
              onClick={() => onEdit?.(id)}
            />
            <IconButton
              size="sm"
              icon={isOpen ? <FiMinimize2 /> : <FiMaximize2 />}
              aria-label="Toggle widget"
              variant="ghost"
              onClick={onToggle}
            />
            <IconButton
              size="sm"
              icon={<FiMoreVertical />}
              aria-label="More options"
              variant="ghost"
            />
          </HStack>
        </HStack>

        {/* Widget Content */}
        <Collapse in={isOpen} animateOpacity>
          <Box>
            {renderWidgetContent()}
          </Box>
        </Collapse>
      </VStack>
    </Card>
  );
};
