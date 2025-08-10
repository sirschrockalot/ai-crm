import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  Badge,
  Icon,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaExclamationTriangle, FaCalendarAlt, FaPhone, FaClock } from 'react-icons/fa';

export interface PriorityAlert {
  id: string;
  title: string;
  count: number;
  details: string;
  urgency: 'urgent' | 'warning' | 'info';
  type: 'inspection' | 'closing' | 'followup' | 'other';
  expiresAt?: Date;
}

interface PriorityAlertsProps {
  alerts: PriorityAlert[];
  loading?: boolean;
  onAlertClick?: (alert: PriorityAlert) => void;
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({
  alerts,
  loading = false,
  onAlertClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const getAlertIcon = (type: PriorityAlert['type']) => {
    switch (type) {
      case 'inspection':
        return FaExclamationTriangle;
      case 'closing':
        return FaCalendarAlt;
      case 'followup':
        return FaPhone;
      default:
        return FaClock;
    }
  };

  const getAlertColors = (urgency: PriorityAlert['urgency']) => {
    switch (urgency) {
      case 'urgent':
        return {
          bg: 'red.50',
          border: 'red.200',
          iconBg: 'red.500',
          text: 'red.800',
        };
      case 'warning':
        return {
          bg: 'orange.50',
          border: 'orange.200',
          iconBg: 'orange.500',
          text: 'orange.800',
        };
      default:
        return {
          bg: 'blue.50',
          border: 'blue.200',
          iconBg: 'blue.500',
          text: 'blue.800',
        };
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text>Loading alerts...</Text>
        </VStack>
      </Box>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text color="gray.500">No priority alerts at this time</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon as={FaExclamationTriangle} color="red.500" boxSize={6} />
            <Heading size="md" color={textColor}>
              Priority Alerts
            </Heading>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {formatDate(new Date())}
          </Text>
        </HStack>

        {/* Alerts Grid */}
        <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
          {alerts.map((alert) => {
            const colors = getAlertColors(alert.urgency);
            const AlertIcon = getAlertIcon(alert.type);

            return (
              <Box
                key={alert.id}
                p={4}
                borderRadius="lg"
                bg={colors.bg}
                border="1px"
                borderColor={colors.border}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                onClick={() => onAlertClick?.(alert)}
              >
                <HStack spacing={4} align="start">
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg={colors.iconBg}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={AlertIcon} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={2} flex={1}>
                    <Text fontWeight="semibold" color={colors.text} fontSize="sm">
                      {alert.title}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color={colors.text}>
                      {alert.count} {alert.count === 1 ? 'item' : 'items'}
                    </Text>
                    <Text fontSize="sm" color={colors.text} opacity={0.8}>
                      {alert.details}
                    </Text>
                    {alert.expiresAt && (
                      <Badge
                        colorScheme={alert.urgency === 'urgent' ? 'red' : 'orange'}
                        variant="subtle"
                        size="sm"
                      >
                        Expires: {formatDate(alert.expiresAt)}
                      </Badge>
                    )}
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </Grid>
      </VStack>
    </Box>
  );
};
