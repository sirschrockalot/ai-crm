import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  Badge,
  useToast,
} from '@chakra-ui/react';
import {
  AddIcon,
  PhoneIcon,
  EmailIcon,
  SearchIcon,
  DownloadIcon,
  SettingsIcon,
  ChartBarIcon,
  CameraIcon,
  LocationIcon,
  EditIcon,
  PlayIcon,
  TargetIcon,
  HandshakeIcon,
  MailIcon,
  UploadIcon,
} from '@chakra-ui/icons';

interface Action {
  name: string;
  action: string;
  icon: string;
  description?: string;
  shortcut?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: Action[];
  variant?: 'executive' | 'acquisitions' | 'disposition' | 'team-member' | 'mobile';
  onAction?: (action: string) => void;
  showShortcuts?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  variant = 'executive',
  onAction,
  showShortcuts = false,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      'plus': <AddIcon />,
      'phone': <PhoneIcon />,
      'email': <EmailIcon />,
      'search': <SearchIcon />,
      'download': <DownloadIcon />,
      'settings': <SettingsIcon />,
      'chart': <ChartBarIcon />,
      'camera': <CameraIcon />,
      'location': <LocationIcon />,
      'edit': <EditIcon />,
      'play': <PlayIcon />,
      'target': <TargetIcon />,
      'handshake': <HandshakeIcon />,
      'mail': <MailIcon />,
      'upload': <UploadIcon />,
    };
    return icons[iconName] || <AddIcon />;
  };

  const handleAction = (action: Action) => {
    if (action.disabled) {
      toast({
        title: 'Action Disabled',
        description: 'This action is not available at the moment',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (onAction) {
      onAction(action.action);
    }

    // Default action handling
    switch (action.action) {
      case 'add-lead':
        window.location.href = '/leads/new';
        break;
      case 'add-buyer':
        window.location.href = '/buyers/new';
        break;
      case 'create-deal':
        window.location.href = '/deals/new';
        break;
      case 'send-proposal':
        window.location.href = '/proposals/new';
        break;
      case 'import-leads':
        window.location.href = '/leads/import';
        break;
      case 'follow-up':
        window.location.href = '/leads/follow-up';
        break;
      case 'report':
        window.location.href = '/reports';
        break;
      case 'start-timer':
        toast({
          title: 'Timer Started',
          description: 'Time tracking has been started',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        break;
      case 'add-task':
        window.location.href = '/tasks/new';
        break;
      case 'log-activity':
        window.location.href = '/activities/new';
        break;
      case 'view-goals':
        window.location.href = '/goals';
        break;
      case 'take-photo':
        toast({
          title: 'Camera',
          description: 'Camera functionality would open here',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        break;
      case 'update-location':
        toast({
          title: 'Location Update',
          description: 'Location would be updated here',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        break;
      default:
        toast({
          title: 'Action Executed',
          description: `${action.name} action completed`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
    }
  };

  const getVariantConfig = () => {
    const configs = {
      executive: {
        title: 'Executive Actions',
        description: 'High-level business actions',
        layout: 'horizontal' as const,
      },
      acquisitions: {
        title: 'Acquisition Actions',
        description: 'Lead management actions',
        layout: 'horizontal' as const,
      },
      disposition: {
        title: 'Disposition Actions',
        description: 'Buyer and deal actions',
        layout: 'horizontal' as const,
      },
      'team-member': {
        title: 'Team Actions',
        description: 'Individual productivity actions',
        layout: 'horizontal' as const,
      },
      mobile: {
        title: 'Mobile Actions',
        description: 'Field operations actions',
        layout: 'grid' as const,
      },
    };
    return configs[variant] || configs.executive;
  };

  const config = getVariantConfig();

  if (actions.length === 0) {
    return null;
  }

  return (
    <Box bg={bgColor} p={4} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <VStack align="start" spacing={1}>
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            {config.title}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {config.description}
          </Text>
        </VStack>

        {/* Actions */}
        {config.layout === 'horizontal' ? (
          <HStack spacing={3} flexWrap="wrap">
            {actions.map((action) => (
              <Tooltip
                key={action.action}
                label={
                  <VStack spacing={1} align="start">
                    <Text fontWeight="medium">{action.name}</Text>
                    {action.description && (
                      <Text fontSize="xs">{action.description}</Text>
                    )}
                    {showShortcuts && action.shortcut && (
                      <Text fontSize="xs" color="gray.300">
                        Shortcut: {action.shortcut}
                      </Text>
                    )}
                  </VStack>
                }
                placement="top"
              >
                <Button
                  leftIcon={getIcon(action.icon)}
                  size="sm"
                  variant={action.disabled ? "outline" : "solid"}
                  colorScheme="blue"
                  onClick={() => handleAction(action)}
                  isDisabled={action.disabled}
                  _hover={{
                    transform: 'translateY(-1px)',
                    shadow: 'md',
                  }}
                  transition="all 0.2s"
                >
                  {action.name}
                </Button>
              </Tooltip>
            ))}
          </HStack>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
            gap={3}
          >
            {actions.map((action) => (
              <Tooltip
                key={action.action}
                label={
                  <VStack spacing={1} align="start">
                    <Text fontWeight="medium">{action.name}</Text>
                    {action.description && (
                      <Text fontSize="xs">{action.description}</Text>
                    )}
                  </VStack>
                }
                placement="top"
              >
                <Button
                  leftIcon={getIcon(action.icon)}
                  size="sm"
                  variant={action.disabled ? "outline" : "solid"}
                  colorScheme="blue"
                  onClick={() => handleAction(action)}
                  isDisabled={action.disabled}
                  h="auto"
                  py={3}
                  flexDirection="column"
                  _hover={{
                    transform: 'translateY(-1px)',
                    shadow: 'md',
                  }}
                  transition="all 0.2s"
                >
                  <VStack spacing={1}>
                    {getIcon(action.icon)}
                    <Text fontSize="xs">{action.name}</Text>
                  </VStack>
                </Button>
              </Tooltip>
            ))}
          </Box>
        )}

        {/* Action History (Optional) */}
        {variant === 'team-member' && (
          <Box pt={2} borderTop="1px" borderColor={borderColor}>
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.500">
                Recent actions: 12 today
              </Text>
              <Badge colorScheme="green" size="sm">
                Active
              </Badge>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
