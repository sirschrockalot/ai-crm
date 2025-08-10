import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  useToast,
} from '@chakra-ui/react';
import {
  SearchIcon,
  TimeIcon,
  PhoneIcon,
  EmailIcon,
  EditIcon,
  CheckIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';

interface Activity {
  id: string;
  type: 'lead' | 'deal' | 'task' | 'communication' | 'system';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  timestamp: string;
  status?: 'completed' | 'pending' | 'failed';
  priority?: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  variant?: 'executive' | 'acquisitions' | 'disposition' | 'team-member' | 'mobile';
  maxItems?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: Activity) => void;
  onFilterChange?: (filters: ActivityFilters) => void;
}

interface ActivityFilters {
  type?: string;
  user?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  variant = 'executive',
  maxItems = 10,
  showFilters = true,
  onActivityClick,
  onFilterChange,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [filters, setFilters] = useState<ActivityFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const getActivityIcon = (type: string) => {
    const icons = {
              lead: <EditIcon />,
      deal: <CheckIcon />,
      task: <EditIcon />,
      communication: <PhoneIcon />,
      system: <TimeIcon />,
    };
    return (icons as any)[type] || <TimeIcon />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      lead: 'blue',
      deal: 'green',
      task: 'orange',
      communication: 'purple',
      system: 'gray',
    };
    return (colors as any)[type] || 'gray';
  };

  const getStatusColor = (status?: string) => {
    const statusColors = {
      completed: 'green',
      pending: 'yellow',
      failed: 'red',
    };
    return (statusColors as any)[status] || 'gray';
  };

  const getPriorityColor = (priority?: string) => {
    const priorityColors = {
      high: 'red',
      medium: 'orange',
      low: 'green',
    };
    return (priorityColors as any)[priority] || 'gray';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleFilterChange = (key: keyof ActivityFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    handleFilterChange('search', value);
  };

  const handleActivityClick = (activity: Activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      // Default navigation based on activity type
      switch (activity.type) {
        case 'lead':
          window.location.href = `/leads/${activity.metadata?.leadId}`;
          break;
        case 'deal':
          window.location.href = `/deals/${activity.metadata?.dealId}`;
          break;
        case 'task':
          window.location.href = `/tasks/${activity.metadata?.taskId}`;
          break;
        default:
          toast({
            title: 'Activity Details',
            description: activity.description,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
      }
    }
  };

  const filteredActivities = activities
    .filter((activity) => {
      if (filters.type && activity.type !== filters.type) return false;
      if (filters.user && activity.user.name !== filters.user) return false;
      if (filters.status && activity.status !== filters.status) return false;
      if (filters.priority && activity.priority !== filters.priority) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description.toLowerCase().includes(searchLower) ||
          activity.user.name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .slice(0, maxItems);

  const getVariantConfig = () => {
    const configs = {
      executive: {
        title: 'Recent Activity',
        description: 'High-level business activities',
        showUserInfo: true,
        showStatus: true,
      },
      acquisitions: {
        title: 'Lead Activity',
        description: 'Lead management activities',
        showUserInfo: true,
        showStatus: true,
      },
      disposition: {
        title: 'Deal Activity',
        description: 'Buyer and deal activities',
        showUserInfo: true,
        showStatus: true,
      },
      'team-member': {
        title: 'My Activity',
        description: 'Personal activity feed',
        showUserInfo: false,
        showStatus: true,
      },
      mobile: {
        title: 'Recent Updates',
        description: 'Field activity updates',
        showUserInfo: false,
        showStatus: false,
      },
    };
    return configs[variant] || configs.executive;
  };

  const config = getVariantConfig();

  return (
    <Box bg={bgColor} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={0} align="stretch">
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <VStack align="start" spacing={2}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              {config.title}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {config.description}
            </Text>
          </VStack>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box p={4} borderBottom="1px" borderColor={borderColor}>
            <VStack spacing={3} align="stretch">
              <InputGroup>
                <InputLeftElement>
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  size="sm"
                />
              </InputGroup>
              <HStack spacing={2}>
                <Select
                  size="sm"
                  placeholder="All Types"
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="lead">Leads</option>
                  <option value="deal">Deals</option>
                  <option value="task">Tasks</option>
                  <option value="communication">Communications</option>
                  <option value="system">System</option>
                </Select>
                <Select
                  size="sm"
                  placeholder="All Status"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Select>
                <Select
                  size="sm"
                  placeholder="All Priority"
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Activities List */}
        <VStack spacing={0} align="stretch">
          {filteredActivities.length === 0 ? (
            <Box p={6} textAlign="center">
              <Text color="gray.500" fontSize="sm">
                No activities found
              </Text>
            </Box>
          ) : (
            filteredActivities.map((activity, index) => (
              <Box key={activity.id}>
                <Box
                  p={4}
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  transition="background-color 0.2s"
                  onClick={() => handleActivityClick(activity)}
                >
                  <VStack spacing={3} align="stretch">
                    {/* Activity Header */}
                    <HStack justify="space-between" align="start">
                      <HStack spacing={3} flex={1}>
                        <Avatar
                          size="sm"
                          name={activity.user.name}
                          src={activity.user.avatar}
                          bg={`${getActivityColor(activity.type)}.100`}
                          color={`${getActivityColor(activity.type)}.600`}
                        >
                          {getActivityIcon(activity.type)}
                        </Avatar>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="semibold" color={textColor} fontSize="sm">
                            {activity.title}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={2}>
                            {activity.description}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={1}>
                        <Text fontSize="xs" color="gray.500">
                          {formatTime(activity.timestamp)}
                        </Text>
                        {config.showStatus && activity.status && (
                          <Badge colorScheme={getStatusColor(activity.status)} size="sm">
                            {activity.status}
                          </Badge>
                        )}
                        {activity.priority && (
                          <Badge colorScheme={getPriorityColor(activity.priority)} size="sm" variant="outline">
                            {activity.priority}
                          </Badge>
                        )}
                      </VStack>
                    </HStack>

                    {/* User Info */}
                    {config.showUserInfo && (
                      <HStack justify="space-between" fontSize="xs" color="gray.600">
                        <Text>By: {activity.user.name}</Text>
                        <Text>{activity.user.role}</Text>
                      </HStack>
                    )}

                    {/* Action Button */}
                    <HStack justify="end">
                      <Tooltip label="View details">
                        <IconButton
                          aria-label="View activity details"
                          icon={<ExternalLinkIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityClick(activity);
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>
                </Box>
                {index < filteredActivities.length - 1 && (
                  <Divider borderColor={borderColor} />
                )}
              </Box>
            ))
          )}
        </VStack>

        {/* View All Button */}
        {activities.length > maxItems && (
          <Box p={3} borderTop="1px" borderColor={borderColor}>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={<ExternalLinkIcon />}
              w="full"
              onClick={() => {
                window.location.href = '/activities';
              }}
            >
              View All Activities ({activities.length})
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
