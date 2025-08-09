import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  useColorModeValue,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { FiActivity, FiX } from 'react-icons/fi';
import { usePerformanceMonitor } from '../../../utils/performance';

interface PerformanceMonitorProps {
  componentName: string;
  showDetails?: boolean;
  onMetricsUpdate?: (metrics: any) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  showDetails = false,
  onMetricsUpdate,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const { measureRender, getMetrics, memoryUsage } = usePerformanceMonitor(componentName);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const stopMeasure = measureRender();
    
    // Update metrics after render
    const updateMetrics = () => {
      const currentMetrics = getMetrics();
      setMetrics(currentMetrics);
      onMetricsUpdate?.(currentMetrics);
    };

    // Update metrics after a short delay to ensure render is complete
    const timer = setTimeout(updateMetrics, 100);
    
    return () => {
      if (typeof stopMeasure === 'function') {
        stopMeasure();
      }
      clearTimeout(timer);
    };
  }, [componentName, measureRender, getMetrics, onMetricsUpdate]);

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.5) return 'green';
    if (value <= threshold) return 'yellow';
    return 'red';
  };

  const formatTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };

  const formatMemory = (memory: number) => {
    return `${memory.toFixed(2)}MB`;
  };

  if (!showDetails && !isVisible) {
    return (
      <IconButton
        aria-label="Show performance monitor"
        icon={<FiActivity />}
        size="sm"
        position="fixed"
        bottom={4}
        right={4}
        zIndex={1000}
        onClick={() => setIsVisible(true)}
      />
    );
  }

  return (
    <Collapse in={isVisible || showDetails}>
      <Box
        position="fixed"
        bottom={4}
        right={4}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        boxShadow="lg"
        zIndex={1000}
        maxW="300px"
      >
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold">
              Performance Monitor
            </Text>
            <IconButton
              aria-label="Close performance monitor"
              icon={<FiX />}
              size="xs"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            />
          </HStack>

          {metrics && (
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="xs">Render Time</Text>
                <Badge
                  colorScheme={getPerformanceColor(metrics.renderTime, 16)}
                  size="sm"
                >
                  {formatTime(metrics.renderTime)}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="xs">Load Time</Text>
                <Badge
                  colorScheme={getPerformanceColor(metrics.loadTime, 1000)}
                  size="sm"
                >
                  {formatTime(metrics.loadTime)}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="xs">Memory Usage</Text>
                <Badge
                  colorScheme={getPerformanceColor(memoryUsage, 50)}
                  size="sm"
                >
                  {formatMemory(memoryUsage)}
                </Badge>
              </HStack>

              <Progress
                value={(metrics.renderTime / 16) * 100}
                size="sm"
                colorScheme={getPerformanceColor(metrics.renderTime, 16)}
              />
            </VStack>
          )}

          <Text fontSize="xs" color="gray.500">
            Component: {componentName}
          </Text>
        </VStack>
      </Box>
    </Collapse>
  );
};
