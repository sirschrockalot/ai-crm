import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiBarChart3,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiGrid,
  FiPieChart,
  FiTarget,
  FiActivity,
} from 'react-icons/fi';
import { useRouter } from 'next/router';

interface AnalyticsNavItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  href: string;
  color: string;
}

const analyticsNavItems: AnalyticsNavItem[] = [
  {
    id: 'overview',
    title: 'Analytics Overview',
    description: 'Main dashboard with key metrics and insights',
    icon: FiBarChart3,
    href: '/analytics',
    color: 'blue',
  },
  {
    id: 'performance',
    title: 'Performance Analytics',
    description: 'Track performance metrics and trends over time',
    icon: FiTrendingUp,
    href: '/analytics/performance',
    color: 'green',
  },
  {
    id: 'conversions',
    title: 'Conversion Analytics',
    description: 'Analyze conversion funnels and rates',
    icon: FiTarget,
    href: '/analytics/conversions',
    color: 'purple',
  },
  {
    id: 'team',
    title: 'Team Performance',
    description: 'Monitor individual and team performance metrics',
    icon: FiUsers,
    href: '/analytics/team',
    color: 'orange',
  },
  {
    id: 'reports',
    title: 'Custom Reports',
    description: 'Create and manage custom analytics reports',
    icon: FiFileText,
    href: '/analytics/reports',
    color: 'teal',
  },
  {
    id: 'dashboard',
    title: 'Dashboard Builder',
    description: 'Create and configure custom dashboards',
    icon: FiGrid,
    href: '/analytics/dashboard/new',
    color: 'pink',
  },
];

interface AnalyticsNavigationProps {
  title?: string;
  description?: string;
}

export const AnalyticsNavigation: React.FC<AnalyticsNavigationProps> = ({
  title = 'Analytics Center',
  description = 'Access all analytics features and reports',
}) => {
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <VStack align="start" spacing={2}>
        <Heading size="lg">{title}</Heading>
        <Text color="gray.600">{description}</Text>
      </VStack>

      {/* Navigation Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {analyticsNavItems.map((item) => (
          <Card
            key={item.id}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              borderColor: `${item.color}.300`,
            }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={() => handleNavClick(item.href)}
          >
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack spacing={3}>
                  <Box
                    p={2}
                    borderRadius="md"
                    bg={`${item.color}.100`}
                    color={`${item.color}.600`}
                  >
                    <Icon as={item.icon} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{item.title}</Heading>
                    <Text color="gray.600" fontSize="sm">
                      {item.description}
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  colorScheme={item.color}
                  variant="outline"
                  rightIcon={<Icon as={FiActivity} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavClick(item.href);
                  }}
                >
                  Open
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick Actions */}
      <Card bg={cardBg} border="1px solid" borderColor={cardBorder}>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Quick Actions</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Button
                leftIcon={<Icon as={FiPieChart} />}
                colorScheme="blue"
                variant="outline"
                onClick={() => handleNavClick('/analytics/performance')}
              >
                View Performance Metrics
              </Button>
              <Button
                leftIcon={<Icon as={FiTarget} />}
                colorScheme="purple"
                variant="outline"
                onClick={() => handleNavClick('/analytics/conversions')}
              >
                Analyze Conversions
              </Button>
              <Button
                leftIcon={<Icon as={FiUsers} />}
                colorScheme="orange"
                variant="outline"
                onClick={() => handleNavClick('/analytics/team')}
              >
                Team Performance
              </Button>
              <Button
                leftIcon={<Icon as={FiFileText} />}
                colorScheme="teal"
                variant="outline"
                onClick={() => handleNavClick('/analytics/reports')}
              >
                Create Report
              </Button>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};
