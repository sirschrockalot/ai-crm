import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Icon,
  useColorModeValue,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiUpload,
  FiDownload,
  FiMessageCircle,
  FiClock,
  FiTarget,
  FiUsers,
  FiSettings,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';

interface QuickActionsProps {
  user?: any;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  permissions: string[];
  colorScheme?: string;
  variant?: string;
  size?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  user,
  isMobile = false,
  isCollapsed = false,
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  
  const bg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Define quick actions based on user role and permissions
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'add-lead',
      label: 'Add Lead',
      icon: FiPlus,
      action: () => router.push('/leads/new'),
      permissions: ['leads:create'],
      colorScheme: 'blue',
      variant: 'solid',
    },
    {
      id: 'add-buyer',
      label: 'Add Buyer',
      icon: FiUsers,
      action: () => router.push('/buyers/new'),
      permissions: ['buyers:create'],
      colorScheme: 'green',
      variant: 'solid',
    },
    {
      id: 'import-leads',
      label: 'Import Leads',
      icon: FiUpload,
      action: () => router.push('/leads/import'),
      permissions: ['leads:create'],
      colorScheme: 'purple',
      variant: 'outline',
    },
    {
      id: 'search',
      label: 'Search',
      icon: FiSearch,
      action: () => router.push('/search'),
      permissions: ['leads:read', 'buyers:read'],
      colorScheme: 'gray',
      variant: 'ghost',
    },
    {
      id: 'send-message',
      label: 'Send Message',
      icon: FiMessageCircle,
      action: () => router.push('/communications/new'),
      permissions: ['communications:send'],
      colorScheme: 'teal',
      variant: 'outline',
    },
    {
      id: 'time-entry',
      label: 'Time Entry',
      icon: FiClock,
      action: () => router.push('/time-tracking/entry'),
      permissions: ['time-tracking:create'],
      colorScheme: 'orange',
      variant: 'outline',
    },
    {
      id: 'export-data',
      label: 'Export',
      icon: FiDownload,
      action: () => router.push('/export'),
      permissions: ['leads:export', 'reports:export'],
      colorScheme: 'gray',
      variant: 'ghost',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FiSettings,
      action: () => router.push('/settings'),
      permissions: ['system:settings'],
      colorScheme: 'gray',
      variant: 'ghost',
    },
  ], [router]);

  // Filter quick actions based on user permissions
  const filteredQuickActions = useMemo(() => {
    if (!user) return quickActions;
    
    return quickActions.filter(action => {
      return action.permissions.some(permission => {
        // Basic role checking - in real implementation, check actual permissions
        if (user.role === 'admin' || user.role === 'SUPER_ADMIN') return true;
        if (user.role === 'manager' || user.role === 'MANAGER') {
          return !permission.includes('system:settings');
        }
        if (user.role === 'agent' || user.role === 'AGENT') {
          return !permission.includes('system:settings') && !permission.includes('users:');
        }
        return true;
      });
    });
  }, [quickActions, user]);

  // Render collapsed quick actions (icon only)
  if (isCollapsed) {
    return (
      <VStack align="stretch" spacing={1} p={2}>
        {filteredQuickActions.slice(0, 4).map(action => (
          <Tooltip
            key={action.id}
            label={action.label}
            placement="right"
            hasArrow
          >
            <Button
              onClick={action.action}
              variant={action.variant || 'ghost'}
              colorScheme={action.colorScheme || 'blue'}
              size="sm"
              p={2}
              minH="44px"
              minW="44px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={action.icon} boxSize={4} />
            </Button>
          </Tooltip>
        ))}
      </VStack>
    );
  }

  // Render full quick actions
  return (
    <Box p={3} bg={bg} borderRadius="md" border="1px solid" borderColor={borderColor}>
      <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
        Quick Actions
      </Text>
      
      <VStack align="stretch" spacing={2}>
        {filteredQuickActions.map(action => (
          <Button
            key={action.id}
            onClick={action.action}
            variant={action.variant || 'ghost'}
            colorScheme={action.colorScheme || 'blue'}
            size="sm"
            justifyContent="flex-start"
            leftIcon={<Icon as={action.icon} />}
            minH="44px"
          >
            {action.label}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default QuickActions;
