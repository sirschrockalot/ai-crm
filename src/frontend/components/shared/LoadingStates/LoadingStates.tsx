import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Text,
  Spinner,
  Progress,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBarChart, FiTrendingUp, FiUsers, FiDollarSign, FiActivity, FiAlertCircle } from 'react-icons/fi';

export interface LoadingStatesProps {
  variant?: 'spinner' | 'skeleton' | 'progress' | 'dots';
  message?: string;
  showProgress?: boolean;
  progressValue?: number;
  skeletonCount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'overview' | 'charts' | 'metrics' | 'activity' | 'alerts' | 'generic';
  width?: string | number;
  height?: string | number;
  skeletonLines?: number;
  skeletonHeight?: string | number;
  thickness?: number;
  speed?: string;
  color?: string;
}

export const LoadingStates: React.FC<LoadingStatesProps> = ({
  variant = 'skeleton',
  message = 'Loading...',
  showProgress = false,
  progressValue = 0,
  skeletonCount = 4,
  size = 'md',
  type = 'generic',
  width,
  height,
  skeletonLines = 3,
  skeletonHeight = '20px',
  thickness = 4,
  speed = '0.65s',
  color = 'blue.500',
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getIcon = () => {
    switch (type) {
      case 'charts':
        return FiBarChart;
      case 'metrics':
        return FiTrendingUp;
      case 'activity':
        return FiActivity;
      case 'alerts':
        return FiAlertCircle;
      case 'overview':
        return FiUsers;
      default:
        return FiUsers;
    }
  };

  const IconComponent = getIcon();

  const renderSpinner = () => (
    <Center width={width} height={height}>
      <VStack spacing={4} p={8} textAlign="center">
        <Spinner
          thickness={`${thickness}px`}
          speed={speed}
          emptyColor="gray.200"
          color={color}
          size={size === 'lg' ? 'xl' : size === 'sm' ? 'md' : 'lg'}
        />
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
        {showProgress && (
          <Box w="full" maxW="300px">
            <Progress
              value={progressValue}
              colorScheme="blue"
              size="sm"
              borderRadius="md"
            />
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              {progressValue}% complete
            </Text>
          </Box>
        )}
      </VStack>
    </Center>
  );

  const renderSkeleton = () => {
    if (type === 'generic') {
      return (
        <Box width={width} height={height}>
          <SkeletonText
            mt={4}
            noOfLines={skeletonLines}
            spacing={4}
            skeletonHeight={skeletonHeight}
          />
        </Box>
      );
    }

    return (
      <VStack spacing={6} align="stretch" p={6}>
        {/* Header skeleton */}
        <VStack align="start" spacing={3}>
          <Skeleton height="32px" width="200px" />
          <SkeletonText noOfLines={2} spacing="2" skeletonHeight="3" width="300px" />
        </VStack>

        {/* Metrics grid skeleton */}
        <Box>
          <Skeleton height="24px" width="150px" mb={4} />
          <HStack spacing={4} wrap="wrap">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <Box
                key={index}
                p={4}
                bg={bgColor}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                minW="200px"
                flex="1"
              >
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Skeleton height="16px" width="100px" />
                    <SkeletonCircle size="4" />
                  </HStack>
                  <Skeleton height="24px" width="80px" />
                  <Skeleton height="12px" width="60px" />
                </VStack>
              </Box>
            ))}
          </HStack>
        </Box>

        {/* Content skeleton */}
        <Box>
          <Skeleton height="24px" width="150px" mb={4} />
          <VStack spacing={4} align="stretch">
            {Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                p={4}
                bg={bgColor}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
              >
                <VStack align="start" spacing={2}>
                  <Skeleton height="20px" width="150px" />
                  <SkeletonText noOfLines={2} spacing="2" skeletonHeight="3" />
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
    );
  };

  const renderProgress = () => (
    <Center width={width} height={height}>
      <VStack spacing={4} p={8} textAlign="center">
        <Box
          p={4}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          minW="300px"
        >
          <VStack spacing={4}>
            <IconComponent size={32} color={color} />
            <Text fontSize="lg" fontWeight="medium">
              {message}
            </Text>
            <Box w="full">
              <Progress
                value={progressValue}
                colorScheme="blue"
                size="lg"
                borderRadius="md"
              />
              <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
                {progressValue}% complete
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Center>
  );

  const renderDots = () => (
    <Center width={width} height={height}>
      <VStack spacing={4}>
        <HStack spacing={2}>
          <Box
            width="8px"
            height="8px"
            borderRadius="full"
            bg={color}
            animation="pulse 1.5s ease-in-out infinite"
          />
          <Box
            width="8px"
            height="8px"
            borderRadius="full"
            bg={color}
            animation="pulse 1.5s ease-in-out infinite 0.2s"
          />
          <Box
            width="8px"
            height="8px"
            borderRadius="full"
            bg={color}
            animation="pulse 1.5s ease-in-out infinite 0.4s"
          />
        </HStack>
        {message && (
          <Text fontSize="sm" color="gray.600">
            {message}
          </Text>
        )}
      </VStack>
    </Center>
  );

  switch (variant) {
    case 'spinner':
      return renderSpinner();
    case 'skeleton':
      return renderSkeleton();
    case 'progress':
      return renderProgress();
    case 'dots':
      return renderDots();
    default:
      return renderSkeleton();
  }
};

// Specialized loading components for different contexts
export const DashboardLoading: React.FC<Omit<LoadingStatesProps, 'type'> & { type?: 'overview' | 'charts' | 'metrics' }> = (props) => (
  <LoadingStates {...props} type={props.type || 'overview'} />
);

export const AnalyticsLoading: React.FC<Omit<LoadingStatesProps, 'type'> & { type?: 'charts' | 'metrics' }> = (props) => (
  <LoadingStates {...props} type={props.type || 'charts'} />
);

export const AutomationLoading: React.FC<Omit<LoadingStatesProps, 'type'> & { type?: 'activity' | 'alerts' }> = (props) => (
  <LoadingStates {...props} type={props.type || 'activity'} />
);

export const GenericLoading: React.FC<Omit<LoadingStatesProps, 'type'>> = (props) => (
  <LoadingStates {...props} type="generic" />
);

export default LoadingStates;
