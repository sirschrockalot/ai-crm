import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Link as ChakraLink,
  Text,
  Icon,
  useColorModeValue,
  Badge,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiHome,
  FiSmartphone,
  FiDollarSign,
  FiTarget,
  FiActivity,
  FiClock,
  FiSettings,
  FiShield,
  FiMessageCircle,
  FiFileText,
  FiUpload,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  description: string;
  permissions: string[];
  badge?: string;
  badgeColor?: string;
  children?: NavigationItem[];
}

interface UnifiedNavigationProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
}

const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
  isCollapsed = false,
  isMobile = false,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const activeBg = useColorModeValue('blue.100', 'blue.800');
  const activeColor = useColorModeValue('blue.700', 'blue.200');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  // Define navigation structure - simplified and flat
  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: FiBarChart,
      description: 'Main dashboard overview',
      permissions: ['dashboard:read'],
    },
    {
      id: 'leads',
      label: 'Leads',
      href: '/leads',
      icon: FiTarget,
      description: 'Lead management',
      permissions: ['leads:read'],
    },
    {
      id: 'buyers',
      label: 'Buyers',
      href: '/buyers',
      icon: FiUsers,
      description: 'Buyer management',
      permissions: ['buyers:read'],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      href: '/transactions',
      icon: FiDollarSign,
      description: 'Under-contract deals & closings',
      permissions: ['transactions:read'],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: FiTrendingUp,
      description: 'Business analytics',
      permissions: ['analytics:read'],
    },
    {
      id: 'automation',
      label: 'Automation',
      href: '/automation',
      icon: FiActivity,
      description: 'Workflow automation',
      permissions: ['automation:read'],
    },
    {
      id: 'communications',
      label: 'Communications',
      href: '/communications',
      icon: FiMessageCircle,
      description: 'Communication tools',
      permissions: ['communications:read'],
    },
    {
      id: 'time-tracking',
      label: 'Time Tracking',
      href: '/time-tracking',
      icon: FiClock,
      description: 'Time tracking and reporting',
      permissions: ['time-tracking:read'],
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: FiSettings,
      description: 'System settings',
      permissions: ['system:settings'],
    },
    {
      id: 'admin',
      label: 'Administration',
      href: '/admin',
      icon: FiShield,
      description: 'System administration',
      permissions: ['system:admin'],
      badge: 'Admin',
      badgeColor: 'red',
    },
  ], []);

  // Filter navigation items based on user permissions
  const filteredNavigationItems = useMemo(() => {
    if (!user) return navigationItems;
    
    return navigationItems.filter(item => {
      const hasPermission = item.permissions.some(permission => {
        if (user.role === 'admin' || user.role === 'SUPER_ADMIN') return true;
        if (user.role === 'manager' || user.role === 'MANAGER') {
          return !permission.includes('system:admin') && !permission.includes('system:settings');
        }
        if (user.role === 'agent' || user.role === 'AGENT') {
          return !permission.includes('system:admin') && !permission.includes('system:settings') && !permission.includes('users:');
        }
        return true;
      });
      
      return hasPermission;
    });
  }, [navigationItems, user]);

  // Check if item is active
  const isActive = (href: string) => {
    if (href === '/dashboard' && router.pathname === '/dashboard') return true;
    if (href !== '/dashboard' && router.pathname.startsWith(href)) return true;
    return false;
  };

  // Toggle expanded state
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Auto-expand active section
  useEffect(() => {
    const activeItem = filteredNavigationItems.find(item => isActive(item.href));
    if (activeItem && activeItem.children) {
      setExpandedItems(prev => new Set([...prev, activeItem.id]));
    }
  }, [router.pathname, filteredNavigationItems]);

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isItemActive = isActive(item.href);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const indent = level * 16;

    return (
      <Box key={item.id}>
        <ChakraLink
          as={NextLink}
          href={item.href}
          display="flex"
          alignItems="center"
          p={2}
          pl={`${indent + 8}px`}
          borderRadius="md"
          bg={isItemActive ? activeBg : 'transparent'}
          color={isItemActive ? activeColor : textColor}
          _hover={{
            bg: isItemActive ? activeBg : hoverBg,
            color: isItemActive ? activeColor : 'blue.500',
          }}
          transition="all 0.2s"
          fontWeight={isItemActive ? 'semibold' : 'medium'}
          fontSize="sm"
          textDecoration="none"
        >
          <Icon as={item.icon} mr={3} boxSize={4} />
          {!isCollapsed && (
            <>
              <Text flex={1} noOfLines={1}>
                {item.label}
              </Text>
              {item.badge && (
                <Badge
                  colorScheme={item.badgeColor || 'blue'}
                  size="sm"
                  ml={2}
                >
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <IconButton
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  size="xs"
                  variant="ghost"
                  ml={2}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleExpanded(item.id);
                  }}
                />
              )}
            </>
          )}
        </ChakraLink>

        {/* Render children if expanded */}
        {hasChildren && !isCollapsed && (
          <Collapse in={isExpanded}>
            <VStack align="stretch" spacing={1} mt={1}>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <VStack align="stretch" spacing={0} h="full">
      {/* Navigation Items */}
      <Box flex={1} overflowY="auto" p={2}>
        <VStack align="stretch" spacing={1}>
          {filteredNavigationItems.map(item => renderNavigationItem(item))}
        </VStack>
      </Box>
    </VStack>
  );
};

export default UnifiedNavigation;
