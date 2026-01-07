import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Link as ChakraLink,
  Text,
  Icon,
  Collapse,
  IconButton,
  useColorModeValue,
  Tooltip,
  Badge,
  Divider,
} from '@chakra-ui/react';
import NextLink from 'next/link';
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
  FiUpload,
  FiSettings,
  FiShield,
  FiMessageCircle,
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiPlus,
  FiBriefcase,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';

interface NavigationMenuProps {
  user?: any;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  description: string;
  permissions: string[];
  children?: NavigationItem[];
  badge?: string;
  badgeColor?: string;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  user,
  isMobile = false,
  isCollapsed = false,
}) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const activeBg = useColorModeValue('blue.100', 'blue.800');
  const activeColor = useColorModeValue('blue.700', 'blue.200');

  // Define navigation structure with permissions
  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: FiBarChart,
      description: 'Choose your dashboard type',
      permissions: ['dashboard:read'],
      children: [
        {
          id: 'dashboard-overview',
          label: 'Overview',
          href: '/dashboard',
          icon: FiBarChart,
          description: 'Main dashboard overview',
          permissions: ['dashboard:read'],
        },
        {
          id: 'dashboard-executive',
          label: 'Executive',
          href: '/dashboard/executive',
          icon: FiTrendingUp,
          description: 'Executive dashboard',
          permissions: ['dashboard:read', 'analytics:read'],
        },
        {
          id: 'dashboard-acquisitions',
          label: 'Acquisitions',
          href: '/dashboard/acquisitions',
          icon: FiTarget,
          description: 'Acquisitions dashboard',
          permissions: ['dashboard:read', 'leads:read'],
        },
        {
          id: 'dashboard-disposition',
          label: 'Dispositions',
          href: '/dashboard/disposition',
          icon: FiDollarSign,
          description: 'Dispositions dashboard',
          permissions: ['dashboard:read', 'buyers:read'],
        },
        {
          id: 'dashboard-team-member',
          label: 'Team Member',
          href: '/dashboard/team-member',
          icon: FiUsers,
          description: 'Team member dashboard',
          permissions: ['dashboard:read'],
        },
        {
          id: 'dashboard-mobile',
          label: 'Mobile',
          href: '/dashboard/mobile',
          icon: FiSmartphone,
          description: 'Mobile dashboard',
          permissions: ['dashboard:read'],
        },
        {
          id: 'dashboard-time-tracking',
          label: 'Time Tracking',
          href: '/dashboard/time-tracking',
          icon: FiClock,
          description: 'Time tracking dashboard',
          permissions: ['dashboard:read', 'time-tracking:read'],
        },
      ],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      href: '/transactions',
      icon: FiFileText,
      description: 'Under-contract deals and closing coordination',
      permissions: ['transactions:read'],
      children: [
        {
          id: 'transactions-board',
          label: 'Status Board',
          href: '/transactions/board',
          icon: FiBarChart,
          description: 'Kanban board for managing contract status',
          permissions: ['transactions:read'],
        },
        {
          id: 'transactions-new',
          label: 'Add New',
          href: '/transactions/new',
          icon: FiPlus,
          description: 'Create a new under-contract property',
          permissions: ['transactions:create'],
        },
      ],
    },
    {
      id: 'leads',
      label: 'Leads',
      href: '/leads',
      icon: FiTarget,
      description: 'Lead management',
      permissions: ['leads:read'],
      children: [
        {
          id: 'leads-import',
          label: 'Import Leads',
          href: '/leads/import',
          icon: FiUpload,
          description: 'Import leads from various sources',
          permissions: ['leads:create'],
        },
      ],
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
      id: 'ats',
      label: 'ATS',
      href: '/ats',
      icon: FiBriefcase,
      description: 'Application Tracking System',
      permissions: ['ats:read'],
      children: [
        {
          id: 'ats-candidates',
          label: 'Candidates',
          href: '/ats/candidates',
          icon: FiUsers,
          description: 'Manage candidates',
          permissions: ['ats:candidates:read'],
        },
        {
          id: 'ats-interviews',
          label: 'Interviews',
          href: '/ats/interviews',
          icon: FiMessageCircle,
          description: 'Manage interviews',
          permissions: ['ats:interviews:read'],
        },
        {
          id: 'ats-scripts',
          label: 'Scripts',
          href: '/ats/scripts',
          icon: FiFileText,
          description: 'Interview scripts',
          permissions: ['ats:scripts:read'],
        },
        {
          id: 'ats-job-postings',
          label: 'Job Postings',
          href: '/ats/job-postings',
          icon: FiTarget,
          description: 'Manage job postings',
          permissions: ['ats:job-postings:read'],
        },
      ],
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
      // Check if user has any of the required permissions
      const hasPermission = item.permissions.some(permission => {
        // For now, we'll do basic role checking
        // In a real implementation, this would check against the user's actual permissions
        if (user.role === 'admin' || user.role === 'SUPER_ADMIN') return true;
        if (user.role === 'manager' || user.role === 'MANAGER') {
          return !permission.includes('system:admin') && !permission.includes('system:settings');
        }
        if (user.role === 'agent' || user.role === 'AGENT') {
          return !permission.includes('system:admin') && !permission.includes('system:settings') && !permission.includes('users:');
        }
        return true; // Default to showing for other roles
      });
      
      if (!hasPermission) return false;
      
      // Filter children if they exist
      if (item.children) {
        item.children = item.children.filter(child => {
          return child.permissions.some(permission => {
            if (user.role === 'admin' || user.role === 'SUPER_ADMIN') return true;
            if (user.role === 'manager' || user.role === 'MANAGER') {
              return !permission.includes('system:admin') && !permission.includes('system:settings');
            }
            if (user.role === 'agent' || user.role === 'AGENT') {
              return !permission.includes('system:admin') && !permission.includes('system:settings') && !permission.includes('users:');
            }
            return true;
          });
        });
        
        // Only show parent if it has visible children or no children
        return item.children.length > 0 || item.href !== '#';
      }
      
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

  // Render navigation item
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isItemActive = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const showLabel = !isCollapsed || level === 0;

    return (
      <Box key={item.id}>
        <ChakraLink
          as={NextLink}
          href={item.href}
          _hover={{ textDecoration: 'none' }}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.id);
            }
          }}
        >
          <HStack
            p={3}
            spacing={3}
            borderRadius="md"
            bg={isItemActive ? activeBg : 'transparent'}
            color={isItemActive ? activeColor : textColor}
            _hover={{
              bg: isItemActive ? activeBg : hoverBg,
              textDecoration: 'none',
            }}
            transition="all 0.2s"
            ml={level * 4}
            minH="44px" // Touch-friendly target size
          >
            <Icon as={item.icon} boxSize={5} />
            
            {showLabel && (
              <>
                <Text
                  fontWeight="medium"
                  fontSize="sm"
                  flex={1}
                  noOfLines={1}
                >
                  {item.label}
                </Text>
                
                {item.badge && (
                  <Badge
                    colorScheme={item.badgeColor || 'blue'}
                    size="sm"
                    variant="subtle"
                  >
                    {item.badge}
                  </Badge>
                )}
                
                {hasChildren && (
                  <Icon
                    as={isExpanded ? FiChevronDown : FiChevronRight}
                    boxSize={4}
                    transition="transform 0.2s"
                    transform={isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'}
                  />
                )}
              </>
            )}
          </HStack>
        </ChakraLink>

        {/* Render children */}
        {hasChildren && (
          <Collapse in={isExpanded}>
            <VStack align="stretch" spacing={0}>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  };

  // Render collapsed navigation (icon only)
  if (isCollapsed) {
    return (
      <VStack align="stretch" spacing={1} p={2}>
        {filteredNavigationItems.map(item => {
          const isItemActive = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          
          return (
            <Tooltip
              key={item.id}
              label={item.label}
              placement="right"
              hasArrow
            >
              <Box>
                <ChakraLink
                  as={NextLink}
                  href={item.href}
                  _hover={{ textDecoration: 'none' }}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      toggleExpanded(item.id);
                    }
                  }}
                >
                  <Box
                    p={2}
                    borderRadius="md"
                    bg={isItemActive ? activeBg : 'transparent'}
                    color={isItemActive ? activeColor : textColor}
                    _hover={{
                      bg: isItemActive ? activeBg : hoverBg,
                    }}
                    transition="all 0.2s"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minH="44px"
                    minW="44px"
                  >
                    <Icon as={item.icon} boxSize={5} />
                  </Box>
                </ChakraLink>
              </Box>
            </Tooltip>
          );
        })}
      </VStack>
    );
  }

  // Render full navigation
  return (
    <VStack align="stretch" spacing={0} p={2}>
      {filteredNavigationItems.map(item => renderNavigationItem(item))}
    </VStack>
  );
};

export default NavigationMenu;
