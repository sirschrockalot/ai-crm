import React from 'react';
import {
  Spinner,
  Text,
  VStack,
  HStack,
  Box,
  SkeletonText,
  Center,
} from '@chakra-ui/react';

export interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'dots';
  color?: string;
  thickness?: number;
  speed?: string;
  width?: string | number;
  height?: string | number;
  skeletonLines?: number;
  skeletonHeight?: string | number;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  variant = 'spinner',
  color = 'primary.500',
  thickness = 4,
  speed = '0.65s',
  width,
  height,
  skeletonLines = 3,
  skeletonHeight = '20px',
}) => {
  if (variant === 'skeleton') {
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

  if (variant === 'dots') {
    return (
      <Center width={width} height={height}>
        <HStack spacing={2}>
          <Box
            width="8px"
            height="8px"
            borderRadius="full"
            bg={color}
            animation={`pulse 1.5s ease-in-out infinite`}
          />
          <Box
            width="8px"
            height="8px"
            borderRadius="full"
            bg={color}
            animation={`pulse 1.5s ease-in-out infinite 0.2s`}
          />
          <Box
            width="8px"
            height="8px"
            borderRadius="full"
            bg={color}
            animation={`pulse 1.5s ease-in-out infinite 0.4s`}
          />
        </HStack>
      </Center>
    );
  }

  return (
    <Center width={width} height={height}>
      <VStack spacing={3}>
        <Spinner
          size={size}
          color={color}
          thickness={`${thickness}px`}
          speed={speed}
        />
        {text && (
          <Text fontSize="sm" color="gray.600">
            {text}
          </Text>
        )}
      </VStack>
    </Center>
  );
};

export default Loading; 