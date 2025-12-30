/**
 * Service Health Status Component
 * 
 * Displays the health status of all backend services.
 * Useful for debugging integration issues and monitoring service availability.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
} from '@chakra-ui/react';
import Card from '../ui/Card/Card';
import { checkAllServicesHealth, ServiceHealthStatus as ServiceHealthStatusType } from '../../utils/serviceHealthCheck';

interface ServiceHealthStatusProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const ServiceHealthStatus: React.FC<ServiceHealthStatusProps> = ({
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [services, setServices] = useState<ServiceHealthStatusType[]>([]);
  const [overall, setOverall] = useState<'healthy' | 'unhealthy' | 'partial' | 'loading'>('loading');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const result = await checkAllServicesHealth();
      setServices(result.services);
      setOverall(result.overall);
      setLastChecked(result.timestamp);
    } catch (error: any) {
      console.error('Failed to check service health:', error);
      // Don't show error toast for health checks - just log it
      setOverall('unhealthy');
      // Set empty services array if we have an error
      if (services.length === 0) {
        setServices([]);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(checkHealth, refreshInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, refreshInterval]);

  const getStatusBadge = (status: ServiceHealthStatusType['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge colorScheme="green">Healthy</Badge>;
      case 'unhealthy':
        return <Badge colorScheme="red">Unhealthy</Badge>;
      default:
        return <Badge colorScheme="gray">Unknown</Badge>;
    }
  };

  const getOverallAlert = () => {
    switch (overall) {
      case 'healthy':
        return (
          <Alert status="success">
            <AlertIcon />
            All services are healthy and responding correctly.
          </Alert>
        );
      case 'partial':
        return (
          <Alert status="warning">
            <AlertIcon />
            Some services are experiencing issues. Check the table below for details.
          </Alert>
        );
      case 'unhealthy':
        return (
          <Alert status="error">
            <AlertIcon />
            Multiple services are unavailable. Please check your backend services and network connectivity.
          </Alert>
        );
      default:
        return null;
    }
  };

  if (overall === 'loading' && services.length === 0) {
    return (
      <Card variant="elevated" p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Checking service health...</Text>
        </VStack>
      </Card>
    );
  }

  return (
    <Card variant="elevated" p={6}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Service Health Status</Heading>
          <HStack>
            <Button
              size="sm"
              onClick={checkHealth}
              isLoading={isRefreshing}
              loadingText="Checking..."
            >
              Refresh
            </Button>
            {lastChecked && (
              <Text fontSize="sm" color="gray.500">
                Last checked: {lastChecked.toLocaleTimeString()}
              </Text>
            )}
          </HStack>
        </HStack>

        {getOverallAlert()}

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Service</Th>
                <Th>URL</Th>
                <Th>Status</Th>
                <Th>Response Time</Th>
                <Th>Error</Th>
              </Tr>
            </Thead>
            <Tbody>
              {services.map((service) => (
                <Tr key={service.service}>
                  <Td fontWeight="medium">{service.service}</Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600" fontFamily="mono">
                      {service.url}
                    </Text>
                  </Td>
                  <Td>{getStatusBadge(service.status)}</Td>
                  <Td>
                    {service.responseTime !== undefined
                      ? `${service.responseTime}ms`
                      : '-'}
                  </Td>
                  <Td>
                    {service.error ? (
                      <Text fontSize="sm" color="red.500">
                        {service.error}
                      </Text>
                    ) : (
                      '-'
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.600">
            <strong>Note:</strong> This component checks the health endpoints of all configured
            backend services. Ensure that all services are running and accessible at the URLs
            specified in your environment configuration.
          </Text>
        </Box>
      </VStack>
    </Card>
  );
};

export default ServiceHealthStatus;

