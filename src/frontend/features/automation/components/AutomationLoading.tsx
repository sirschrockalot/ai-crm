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
  useColorModeValue,
} from '@chakra-ui/react';
import { FiZap, FiSettings, FiPlay, FiPause, FiCheck } from 'react-icons/fi';

interface AutomationLoadingProps {
  variant?: 'spinner' | 'skeleton' | 'progress';
  message?: string;
  showProgress?: boolean;
  progressValue?: number;
  skeletonCount?: number;
  size?: 'sm' | 'md' | 'lg';
  type?: 'workflow' | 'execution' | 'configuration';
}

export const AutomationLoading: React.FC<AutomationLoadingProps> = ({
  variant = 'skeleton',
  message = 'Loading automation...',
  showProgress = false,
  progressValue = 0,
  skeletonCount = 3,
  size = 'md',
  type = 'workflow',
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getIcon = () => {
    switch (type) {
      case 'execution':
        return FiPlay;
      case 'configuration':
        return FiSettings;
      case 'workflow':
      default:
        return FiZap;
    }
  };

  const IconComponent = getIcon();

  const renderSpinner = () => (
    <VStack spacing={4} p={8} textAlign="center">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
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
  );

  const renderSkeleton = () => (
    <VStack spacing={6} align="stretch" p={6}>
      {/* Header skeleton */}
      <VStack align="start" spacing={3}>
        <Skeleton height="32px" width="200px" />
        <SkeletonText noOfLines={2} spacing="2" skeletonHeight="3" width="300px" />
      </VStack>

      {/* Workflow builder skeleton */}
      <Box>
        <Skeleton height="24px" width="150px" mb={4} />
        <Box
          p={4}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          minH="400px"
          position="relative"
        >
          <Skeleton height="full" width="full" />
          {/* Workflow canvas placeholder */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="gray.400"
          >
            <IconComponent size={48} />
          </Box>
        </Box>
      </Box>

      {/* Workflow components skeleton */}
      <Box>
        <Skeleton height="24px" width="180px" mb={4} />
        <HStack spacing={4} wrap="wrap">
          {Array.from({ length: 4 }).map((_, index) => (
            <Box
              key={index}
              p={3}
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              minW="150px"
              flex="1"
            >
              <VStack align="start" spacing={2}>
                <Skeleton height="16px" width="100px" />
                <Skeleton height="12px" width="80px" />
              </VStack>
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Execution status skeleton */}
      <Box>
        <Skeleton height="24px" width="140px" mb={4} />
        <Box
          p={4}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
        >
          <VStack spacing={3} align="stretch">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <HStack key={index} spacing={4}>
                <SkeletonCircle size="6" />
                <Skeleton height="16px" flex="1" />
                <Skeleton height="16px" width="60px" />
                <Skeleton height="16px" width="40px" />
              </HStack>
            ))}
          </VStack>
        </Box>
      </Box>
    </VStack>
  );

  const renderProgress = () => (
    <VStack spacing={6} p={8} textAlign="center">
      <Box
        p={6}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        maxW="400px"
        w="full"
      >
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="lg"
          />
          <Text fontWeight="medium" color="gray.700">
            {message}
          </Text>
          <Box w="full">
            <Progress
              value={progressValue}
              colorScheme="blue"
              size="lg"
              borderRadius="md"
            />
            <Text fontSize="sm" color="gray.500" mt={2}>
              {progressValue}% complete
            </Text>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );

  switch (variant) {
    case 'spinner':
      return renderSpinner();
    case 'progress':
      return renderProgress();
    case 'skeleton':
    default:
      return renderSkeleton();
  }
};

// Convenience components for specific loading scenarios
export const WorkflowBuilderLoading: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <VStack spacing={6} align="stretch" p={6}>
    <Skeleton height="32px" width="200px" />
    <Box
      p={4}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      minH="400px"
      position="relative"
    >
      <Skeleton height="full" width="full" />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        color="gray.400"
      >
        <FiZap size={48} />
      </Box>
    </Box>
    <HStack spacing={4} wrap="wrap">
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          p={3}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          minW="150px"
          flex="1"
        >
          <VStack align="start" spacing={2}>
            <Skeleton height="16px" width="100px" />
            <Skeleton height="12px" width="80px" />
          </VStack>
        </Box>
      ))}
    </HStack>
  </VStack>
);

export const WorkflowExecutionLoading: React.FC<{ type?: 'running' | 'paused' | 'completed' }> = ({ type = 'running' }) => {
  const getIcon = () => {
    switch (type) {
      case 'paused':
        return FiPause;
      case 'completed':
        return FiCheck;
      case 'running':
      default:
        return FiPlay;
    }
  };

  const IconComponent = getIcon();
  
  return (
    <Box
      p={4}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      minH="200px"
    >
      <VStack align="start" spacing={4}>
        <Skeleton height="20px" width="150px" />
        <Box w="full" h="150px" position="relative">
          <Skeleton height="full" width="full" />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="gray.400"
          >
            <IconComponent size={48} />
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export const WorkflowConfigurationLoading: React.FC = () => (
  <Box
    p={4}
    bg="white"
    border="1px solid"
    borderColor="gray.200"
    borderRadius="md"
    minH="300px"
  >
    <VStack align="start" spacing={4}>
      <Skeleton height="20px" width="150px" />
      <Box w="full" h="200px" position="relative">
        <Skeleton height="full" width="full" />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="gray.400"
        >
          <FiSettings size={48} />
        </Box>
      </Box>
    </VStack>
  </Box>
);
