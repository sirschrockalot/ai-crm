import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Icon,
  Box,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { MetricCardProps } from '../types/analytics';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  format = 'number',
  color,
  icon,
  onClick,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <Icon as={FiTrendingUp} color="green.500" />;
      case 'down':
        return <Icon as={FiTrendingDown} color="red.500" />;
      case 'neutral':
      default:
        return <Icon as={FiMinus} color="gray.500" />;
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return 'gray.500';
    return change >= 0 ? 'green.500' : 'red.500';
  };

  const getChangeText = () => {
    if (change === undefined) return '';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { shadow: 'md' } : {}}
      transition="all 0.2s"
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="100%">
          <HStack spacing={2}>
            {icon && <Box color={color}>{icon}</Box>}
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              {title}
            </Text>
          </HStack>
          {trend !== 'neutral' && getTrendIcon()}
        </HStack>

        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color={color}>
            {formatValue(value)}
          </Text>
          
          {change !== undefined && (
            <HStack spacing={1}>
              {getTrendIcon()}
              <Text fontSize="sm" color={getChangeColor()}>
                {getChangeText()}
              </Text>
            </HStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};
