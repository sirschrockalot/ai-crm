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
  Select,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  BellIcon,
  CheckIcon,
  CloseIcon,
  SettingsIcon,
  ChevronDownIcon,
  InfoIcon,
  WarningIcon,
  CheckCircleIcon,
  TimeIcon,
} from '@chakra-ui/icons';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'lead' | 'deal' | 'task' | 'system' | 'communication';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  notifications: Notification[];
  variant?: 'executive' | 'acquisitions' | 'disposition' | 'team-member' | 'mobile';
  maxItems?: number;
  showFilters?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onFilterChange?: (filters: NotificationFilters) => void;
}

interface NotificationFilters {
  type?: string;
  category?: string;
  priority?: string;
  read?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  variant = 'executive',
  maxItems = 10,
  showFilters = true,
  onNotificationClick,
  onMarkAsRead,
  onDismiss,
  onFilterChange,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [filters, setFilters] = useState<NotificationFilters>({});
  const [showRead, setShowRead] = useState(true);

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: <InfoIcon />,
      warning: <WarningIcon />,
      error: <CloseIcon />,
      success: <CheckCircleIcon />,
      system: <SettingsIcon />,
    };
    return icons[type] || <InfoIcon />;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      info: 'blue',
      warning: 'orange',
      error: 'red',
      success: 'green',
      system: 'gray',
    };
    return colors[type] || 'blue';
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      urgent: 'red',
    };
    return priorityColors[priority] || 'gray';
  };

  const getCategoryColor = (category: string) => {
    const categoryColors = {
      lead: 'blue',
      deal: 'green',
      task: 'orange',
      system: 'gray',
      communication: 'purple',
    };
    return categoryColors[category] || 'gray';
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

  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    } else {
      toast({
        title: notification.title,
        description: notification.message,
        status: getNotificationColor(notification.type),
        duration: 5000,
        isClosable: true,
      });
    }

    // Mark as read if not already read
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
      toast({
        title: 'Marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDismiss = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(notificationId);
      toast({
        title: 'Notification dismissed',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const filteredNotifications = notifications
    .filter((notification) => {
      if (filters.type && notification.type !== filters.type) return false;
      if (filters.category && notification.category !== filters.category) return false;
      if (filters.priority && notification.priority !== filters.priority) return false;
      if (filters.read !== undefined && notification.read !== filters.read) return false;
      if (!showRead && notification.read) return false;
      return true;
    })
    .slice(0, maxItems);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const getVariantConfig = () => {
    const configs = {
      executive: {
        title: 'Executive Notifications',
        description: 'High-priority business alerts',
        showPriority: true,
        showCategory: true,
      },
      acquisitions: {
        title: 'Acquisition Alerts',
        description: 'Lead and acquisition notifications',
        showPriority: true,
        showCategory: true,
      },
      disposition: {
        title: 'Disposition Notifications',
        description: 'Buyer and deal alerts',
        showPriority: true,
        showCategory: true,
      },
      'team-member': {
        title: 'My Notifications',
        description: 'Personal notifications and alerts',
        showPriority: true,
        showCategory: false,
      },
      mobile: {
        title: 'Notifications',
        description: 'Important updates and alerts',
        showPriority: false,
        showCategory: false,
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
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <HStack spacing={2}>
                <BellIcon color={`${getNotificationColor('info')}.500`} />
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  {config.title}
                </Text>
                {unreadCount > 0 && (
                  <Badge colorScheme="red" variant="solid" borderRadius="full">
                    {unreadCount}
                  </Badge>
                )}
              </HStack>
              <Text fontSize="sm" color="gray.500">
                {config.description}
              </Text>
            </VStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<SettingsIcon />}
                variant="ghost"
                size="sm"
                aria-label="Notification settings"
              />
              <MenuList>
                <MenuItem onClick={() => setShowRead(!showRead)}>
                  {showRead ? 'Hide Read' : 'Show Read'}
                </MenuItem>
                <MenuDivider />
                <MenuItem>Mark all as read</MenuItem>
                <MenuItem>Clear all</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        {/* Urgent Alert */}
        {urgentCount > 0 && (
          <Alert status="error" variant="subtle" p={3}>
            <AlertIcon />
            <Box>
              <AlertTitle>Urgent Notifications!</AlertTitle>
              <AlertDescription>
                You have {urgentCount} urgent notification{urgentCount !== 1 ? 's' : ''} requiring immediate attention.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Filters */}
        {showFilters && (
          <Box p={4} borderBottom="1px" borderColor={borderColor}>
            <HStack spacing={2}>
              <Select
                size="sm"
                placeholder="All Types"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
                <option value="system">System</option>
              </Select>
              {config.showCategory && (
                <Select
                  size="sm"
                  placeholder="All Categories"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="lead">Leads</option>
                  <option value="deal">Deals</option>
                  <option value="task">Tasks</option>
                  <option value="system">System</option>
                  <option value="communication">Communication</option>
                </Select>
              )}
              {config.showPriority && (
                <Select
                  size="sm"
                  placeholder="All Priorities"
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              )}
            </HStack>
          </Box>
        )}

        {/* Notifications List */}
        <VStack spacing={0} align="stretch">
          {filteredNotifications.length === 0 ? (
            <Box p={6} textAlign="center">
              <VStack spacing={2}>
                <BellIcon color="gray.400" boxSize={8} />
                <Text color="gray.500" fontSize="sm">
                  No notifications
                </Text>
              </VStack>
            </Box>
          ) : (
            filteredNotifications.map((notification, index) => (
              <Box key={notification.id}>
                <Box
                  p={4}
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  transition="background-color 0.2s"
                  onClick={() => handleNotificationClick(notification)}
                  bg={notification.read ? 'transparent' : useColorModeValue('blue.50', 'blue.900')}
                >
                  <VStack spacing={3} align="stretch">
                    {/* Notification Header */}
                    <HStack justify="space-between" align="start">
                      <HStack spacing={3} flex={1}>
                        <Avatar
                          size="sm"
                          bg={`${getNotificationColor(notification.type)}.100`}
                          color={`${getNotificationColor(notification.type)}.600`}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text 
                            fontWeight={notification.read ? "normal" : "semibold"} 
                            color={textColor} 
                            fontSize="sm"
                          >
                            {notification.title}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={2}>
                            {notification.message}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing={1}>
                        <Text fontSize="xs" color="gray.500">
                          {formatTime(notification.timestamp)}
                        </Text>
                        <HStack spacing={1}>
                          {config.showPriority && (
                            <Badge colorScheme={getPriorityColor(notification.priority)} size="sm">
                              {notification.priority}
                            </Badge>
                          )}
                          {config.showCategory && (
                            <Badge colorScheme={getCategoryColor(notification.category)} size="sm" variant="outline">
                              {notification.category}
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>

                    {/* Action Buttons */}
                    <HStack justify="end" spacing={1}>
                      {!notification.read && (
                        <Tooltip label="Mark as read">
                          <IconButton
                            aria-label="Mark as read"
                            icon={<CheckIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          />
                        </Tooltip>
                      )}
                      <Tooltip label="Dismiss">
                        <IconButton
                          aria-label="Dismiss notification"
                          icon={<CloseIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => handleDismiss(notification.id, e)}
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>
                </Box>
                {index < filteredNotifications.length - 1 && (
                  <Divider borderColor={borderColor} />
                )}
              </Box>
            ))
          )}
        </VStack>

        {/* View All Button */}
        {notifications.length > maxItems && (
          <Box p={3} borderTop="1px" borderColor={borderColor}>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              w="full"
              onClick={() => {
                window.location.href = '/notifications';
              }}
            >
              View All Notifications ({notifications.length})
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
