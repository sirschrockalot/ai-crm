import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  Button,
  IconButton,
  useColorModeValue,
  useBreakpointValue,
  Icon,
  Tooltip,
  Badge,
  Divider,
} from '@chakra-ui/react';
import {
  FaPlus,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaFileContract,
  FaUserPlus,
  FaChartLine,
  FaCog,
  FaBell,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUpload,
  FaSync,
  FaEye,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  category: 'deal' | 'buyer' | 'communication' | 'report' | 'system';
  priority: 'high' | 'medium' | 'low';
  badge?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  loading?: boolean;
  onActionClick?: (action: QuickAction) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  loading = false,
  onActionClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColumns = useBreakpointValue({ base: 2, md: 3, lg: 4 });

  const getCategoryColor = (category: QuickAction['category']) => {
    switch (category) {
      case 'deal':
        return 'blue.500';
      case 'buyer':
        return 'green.500';
      case 'communication':
        return 'purple.500';
      case 'report':
        return 'orange.500';
      case 'system':
        return 'gray.500';
      default:
        return 'gray.500';
    }
  };

  const getPriorityColor = (priority: QuickAction['priority']) => {
    switch (priority) {
      case 'high':
        return 'red.500';
      case 'medium':
        return 'orange.500';
      case 'low':
        return 'gray.500';
      default:
        return 'gray.500';
    }
  };

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  const categoryLabels = {
    deal: 'Deal Management',
    buyer: 'Buyer Management',
    communication: 'Communication',
    report: 'Reports & Analytics',
    system: 'System',
  };

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text>Loading quick actions...</Text>
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
            <Icon as={FaCog} color="blue.500" boxSize={5} />
            <Heading size="md" color={textColor}>
              Quick Actions
            </Heading>
          </HStack>
          
          <Badge colorScheme="blue" variant="subtle">
            {actions.length} Actions
          </Badge>
        </HStack>

        {/* Quick Actions Grid */}
        {Object.entries(groupedActions).map(([category, categoryActions]) => (
          <Box key={category}>
            <HStack spacing={3} mb={4}>
              <Icon
                as={getCategoryIcon(category as QuickAction['category'])}
                color={getCategoryColor(category as QuickAction['category'])}
                boxSize={4}
              />
              <Heading size="sm" color={textColor}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </Heading>
              <Badge
                colorScheme="gray"
                variant="outline"
                fontSize="xs"
              >
                {categoryActions.length}
              </Badge>
            </HStack>

            <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4} mb={6}>
              {categoryActions.map((action) => (
                <Tooltip
                  key={action.id}
                  label={action.description}
                  placement="top"
                  hasArrow
                >
                  <Button
                    w="100%"
                    h="auto"
                    p={4}
                    variant="outline"
                    onClick={() => {
                      onActionClick?.(action);
                      action.action();
                    }}
                    disabled={action.disabled}
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'md',
                    }}
                    transition="all 0.2s"
                  >
                    <VStack spacing={3} align="center">
                      <Icon
                        as={action.icon}
                        color={getCategoryColor(action.category)}
                        boxSize={6}
                      />
                      
                      <VStack spacing={1} align="center">
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color={textColor}
                          textAlign="center"
                          noOfLines={2}
                        >
                          {action.title}
                        </Text>
                        
                        {action.badge && (
                          <Badge
                            size="sm"
                            colorScheme={action.priority === 'high' ? 'red' : 
                                        action.priority === 'medium' ? 'orange' : 'gray'}
                            variant="solid"
                          >
                            {action.badge}
                          </Badge>
                        )}
                      </VStack>
                    </VStack>
                  </Button>
                </Tooltip>
              ))}
            </Grid>
            
            {category !== Object.keys(groupedActions)[Object.keys(groupedActions).length - 1] && (
              <Divider />
            )}
          </Box>
        ))}

        {/* Recently Used Actions */}
        <Box>
          <Heading size="sm" color={textColor} mb={4}>
            Recently Used
          </Heading>
          <HStack spacing={3} flexWrap="wrap">
            {actions.slice(0, 6).map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant="ghost"
                leftIcon={<Icon as={action.icon} />}
                onClick={() => {
                  onActionClick?.(action);
                  action.action();
                }}
                disabled={action.disabled}
              >
                {action.title}
              </Button>
            ))}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

const getCategoryIcon = (category: QuickAction['category']) => {
  switch (category) {
    case 'deal':
      return FaFileContract;
    case 'buyer':
      return FaUserPlus;
    case 'communication':
      return FaPhone;
    case 'report':
      return FaChartLine;
    case 'system':
      return FaCog;
    default:
      return FaCog;
  }
};

// Default actions for the dispositions dashboard
export const getDefaultDispositionActions = (): QuickAction[] => [
  // Deal Management
  {
    id: 'add-deal',
    title: 'Add New Deal',
    description: 'Create a new disposition deal',
    icon: FaPlus,
    action: () => console.log('Add new deal'),
    category: 'deal',
    priority: 'high',
  },
  {
    id: 'view-deals',
    title: 'View All Deals',
    description: 'Browse and manage all deals',
    icon: FaEye,
    action: () => console.log('View all deals'),
    category: 'deal',
    priority: 'medium',
  },
  {
    id: 'edit-deal',
    title: 'Edit Deal',
    description: 'Modify existing deal details',
    icon: FaEdit,
    action: () => console.log('Edit deal'),
    category: 'deal',
    priority: 'medium',
  },
  {
    id: 'delete-deal',
    title: 'Delete Deal',
    description: 'Remove a deal from the system',
    icon: FaTrash,
    action: () => console.log('Delete deal'),
    category: 'deal',
    priority: 'low',
  },

  // Buyer Management
  {
    id: 'add-buyer',
    title: 'Add Buyer',
    description: 'Add a new buyer to the system',
    icon: FaUserPlus,
    action: () => console.log('Add buyer'),
    category: 'buyer',
    priority: 'high',
  },
  {
    id: 'search-buyers',
    title: 'Search Buyers',
    description: 'Find buyers by criteria',
    icon: FaSearch,
    action: () => console.log('Search buyers'),
    category: 'buyer',
    priority: 'medium',
  },
  {
    id: 'filter-buyers',
    title: 'Filter Buyers',
    description: 'Apply filters to buyer list',
    icon: FaFilter,
    action: () => console.log('Filter buyers'),
    category: 'buyer',
    priority: 'low',
  },

  // Communication
  {
    id: 'make-call',
    title: 'Make Call',
    description: 'Initiate a phone call',
    icon: FaPhone,
    action: () => console.log('Make call'),
    category: 'communication',
    priority: 'high',
  },
  {
    id: 'send-email',
    title: 'Send Email',
    description: 'Send an email message',
    icon: FaEnvelope,
    action: () => console.log('Send email'),
    category: 'communication',
    priority: 'high',
  },
  {
    id: 'schedule-meeting',
    title: 'Schedule Meeting',
    description: 'Book a meeting or appointment',
    icon: FaCalendar,
    action: () => console.log('Schedule meeting'),
    category: 'communication',
    priority: 'medium',
  },

  // Reports & Analytics
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create a new report',
    icon: FaChartLine,
    action: () => console.log('Generate report'),
    category: 'report',
    priority: 'medium',
  },
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Export data to CSV/Excel',
    icon: FaDownload,
    action: () => console.log('Export data'),
    category: 'report',
    priority: 'low',
  },
  {
    id: 'import-data',
    title: 'Import Data',
    description: 'Import data from file',
    icon: FaUpload,
    action: () => console.log('Import data'),
    category: 'report',
    priority: 'low',
  },

  // System
  {
    id: 'refresh-data',
    title: 'Refresh Data',
    description: 'Update all data from server',
    icon: FaSync,
    action: () => console.log('Refresh data'),
    category: 'system',
    priority: 'medium',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage notification settings',
    icon: FaBell,
    action: () => console.log('Notifications'),
    category: 'system',
    priority: 'low',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure system settings',
    icon: FaCog,
    action: () => console.log('Settings'),
    category: 'system',
    priority: 'low',
  },
];
