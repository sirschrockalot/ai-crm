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
  useColorModeValue,
  Progress,
} from '@chakra-ui/react';
import { SettingsIcon, ViewIcon } from '@chakra-ui/icons';

interface AutomationSystem {
  id: string;
  name: string;
  status: 'running' | 'warning' | 'error' | 'stopped';
  accuracy: number;
  activeCount?: number;
  generatedCount?: number;
  lastRun: string;
  performance: number;
  target: number;
}

interface AutomationStatusProps {
  systems: AutomationSystem[];
  variant?: 'executive' | 'detailed';
  onConfigure?: () => void;
  onSystemClick?: (system: AutomationSystem) => void;
  onViewDetails?: () => void;
}

export const AutomationStatus: React.FC<AutomationStatusProps> = ({
  systems,
  variant = 'executive',
  onConfigure,
  onSystemClick,
  onViewDetails,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'green',
      warning: 'yellow',
      error: 'red',
      stopped: 'gray',
    };
    return (colors as any)[status] || 'gray';
  };

  const getStatusText = (status: string) => {
    const texts = {
      running: 'Running',
      warning: 'Warning',
      error: 'Error',
      stopped: 'Stopped',
    };
    return (texts as any)[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      running: '🟢',
      warning: '🟡',
      error: '🔴',
      stopped: '⚫',
    };
    return (icons as any)[status] || '⚪';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'green.500';
    if (accuracy >= 85) return 'yellow.500';
    return 'red.500';
  };

  const getPerformanceColor = (performance: number, target: number) => {
    const percentage = (performance / target) * 100;
    if (percentage >= 100) return 'green.500';
    if (percentage >= 80) return 'yellow.500';
    return 'red.500';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const overallPerformance = systems.reduce((acc, system) => {
    return acc + (system.performance / system.target);
  }, 0) / systems.length * 100;

  const activeSystems = systems.filter(s => s.status === 'running').length;
  const totalSystems = systems.length;

  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure();
    }
  };

  const handleSystemClick = (system: AutomationSystem) => {
    if (onSystemClick) {
      onSystemClick(system);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <Box bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor} p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          Automation Status
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<SettingsIcon />}
            onClick={handleConfigure}
          >
            Configure
          </Button>
          <IconButton
            size="sm"
            icon={<ViewIcon />}
            aria-label="View automation details"
            variant="ghost"
            onClick={handleViewDetails}
          />
        </HStack>
      </HStack>

      {/* Overall Performance Summary */}
      <Box mb={6} p={4} bg={hoverBg} borderRadius="md" border="1px" borderColor={borderColor}>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="md" fontWeight="semibold" color={textColor}>
            Overall Performance
          </Text>
          <Badge colorScheme={overallPerformance >= 100 ? 'green' : overallPerformance >= 80 ? 'yellow' : 'red'}>
            {overallPerformance.toFixed(1)}%
          </Badge>
        </HStack>
        <Progress
          value={overallPerformance}
          colorScheme={overallPerformance >= 100 ? 'green' : overallPerformance >= 80 ? 'yellow' : 'red'}
          size="sm"
          borderRadius="full"
        />
        <HStack justify="space-between" mt={2}>
          <Text fontSize="sm" color="gray.500">
            {activeSystems} of {totalSystems} systems active
          </Text>
          <Text fontSize="sm" color="gray.500">
            Target: 100%
          </Text>
        </HStack>
      </Box>

      {/* Automation Systems Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(auto-fit, minmax(250px, 1fr))',
        }}
        gap={4}
      >
        {systems.map((system) => (
          <Box
            key={system.id}
            bg={hoverBg}
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            p={4}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              shadow: 'md',
              borderColor: 'blue.300',
            }}
            onClick={() => handleSystemClick(system)}
          >
            <HStack justify="space-between" mb={3}>
              <HStack>
                <Text fontSize="lg">{getStatusIcon(system.status)}</Text>
                <Text fontWeight="semibold" color={textColor}>
                  {system.name}
                </Text>
              </HStack>
              <Badge
                colorScheme={getStatusColor(system.status)}
                variant="subtle"
                px={2}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                {getStatusText(system.status)}
              </Badge>
            </HStack>

            <VStack spacing={3} align="stretch">
              {/* Accuracy */}
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" color="gray.500">
                    Accuracy
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={getAccuracyColor(system.accuracy)}
                  >
                    {system.accuracy}%
                  </Text>
                </HStack>
                <Progress
                  value={system.accuracy}
                  colorScheme={system.accuracy >= 95 ? 'green' : system.accuracy >= 85 ? 'yellow' : 'red'}
                  size="xs"
                  borderRadius="full"
                />
              </Box>

              {/* Performance vs Target */}
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" color="gray.500">
                    Performance
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={getPerformanceColor(system.performance, system.target)}
                  >
                    {system.performance}/{system.target}
                  </Text>
                </HStack>
                <Progress
                  value={(system.performance / system.target) * 100}
                  colorScheme={(system.performance / system.target) >= 1 ? 'green' : (system.performance / system.target) >= 0.8 ? 'yellow' : 'red'}
                  size="xs"
                  borderRadius="full"
                />
              </Box>

              {/* Additional Metrics */}
              {variant === 'detailed' && (
                <>
                  {system.activeCount !== undefined && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">
                        Active
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {system.activeCount}
                      </Text>
                    </HStack>
                  )}
                  {system.generatedCount !== undefined && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">
                        Generated Today
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                        {system.generatedCount}
                      </Text>
                    </HStack>
                  )}
                </>
              )}

              {/* Last Run */}
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  Last Run
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatTime(system.lastRun)}
                </Text>
              </HStack>
            </VStack>
          </Box>
        ))}
      </Grid>

      {/* Quick Actions */}
      <HStack justify="center" mt={6} spacing={4}>
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorScheme="green"
          onClick={handleViewDetails}
        >
          View All Systems
        </Button>
      </HStack>
    </Box>
  );
};
