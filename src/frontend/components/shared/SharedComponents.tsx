import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Progress,
  Spinner,
  Skeleton,
  SkeletonText,
  Divider,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash, FiEye, FiDownload, FiUpload } from 'react-icons/fi';

// Shared Button Components
export const PrimaryButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
  <Button colorScheme="primary" {...props}>
    {children}
  </Button>
);

export const SecondaryButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
  <Button variant="outline" {...props}>
    {children}
  </Button>
);

export const DangerButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
  <Button colorScheme="red" {...props}>
    {children}
  </Button>
);

export const IconButton = ({ icon, children, ...props }: React.ComponentProps<typeof Button> & { icon: React.ComponentType }) => (
  <Button leftIcon={<Icon as={icon} />} {...props}>
    {children}
  </Button>
);

// Shared Card Components
export const InfoCard = ({ title, children, ...props }: React.ComponentProps<typeof Card> & { title: string }) => (
  <Card {...props}>
    <CardHeader>
      <Heading size="md">{title}</Heading>
    </CardHeader>
    <CardBody>{children}</CardBody>
  </Card>
);

export const ActionCard = ({ title, children, actions, ...props }: React.ComponentProps<typeof Card> & { title: string; actions: React.ReactNode }) => (
  <Card {...props}>
    <CardHeader>
      <HStack justify="space-between">
        <Heading size="md">{title}</Heading>
        <HStack>{actions}</HStack>
      </HStack>
    </CardHeader>
    <CardBody>{children}</CardBody>
  </Card>
);

// Shared Form Components
export const FormField = ({ label, error, children, ...props }: React.ComponentProps<typeof Box> & { label: string; error?: string }) => (
  <Box {...props}>
    <Text mb={2} fontWeight="medium">
      {label}
    </Text>
    {children}
    {error && (
      <Text color="red.500" fontSize="sm" mt={1}>
        {error}
      </Text>
    )}
  </Box>
);

export const TextInput = ({ label, error, ...props }: React.ComponentProps<typeof Input> & { label: string; error?: string }) => (
  <FormField label={label} error={error}>
    <Input {...props} />
  </FormField>
);

export const SelectInput = ({ label, error, options, ...props }: React.ComponentProps<typeof Select> & { label: string; error?: string; options: Array<{ value: string; label: string }> }) => (
  <FormField label={label} error={error}>
    <Select {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </FormField>
);

// Shared Status Components
export const StatusBadge = ({ status, ...props }: React.ComponentProps<typeof Badge> & { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'success':
      case 'completed':
        return 'green';
      case 'pending':
      case 'warning':
        return 'yellow';
      case 'error':
      case 'failed':
        return 'red';
      case 'inactive':
      case 'draft':
        return 'gray';
      default:
        return 'blue';
    }
  };

  return (
    <Badge colorScheme={getStatusColor(status)} {...props}>
      {status}
    </Badge>
  );
};

export const LoadingSpinner = ({ size = 'md', ...props }: React.ComponentProps<typeof Spinner> & { size?: string }) => (
  <Box textAlign="center" py={4}>
    <Spinner size={size} {...props} />
  </Box>
);

export const LoadingSkeleton = ({ lines = 3, ...props }: React.ComponentProps<typeof Box> & { lines?: number }) => (
  <Box {...props}>
    <Skeleton height="20px" mb={2} />
    <SkeletonText noOfLines={lines} spacing={2} />
  </Box>
);

// Shared Alert Components
export const SuccessAlert = ({ title, description, ...props }: React.ComponentProps<typeof Alert> & { title?: string; description?: string }) => (
  <Alert status="success" {...props}>
    <AlertIcon />
    <Box>
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Box>
  </Alert>
);

export const ErrorAlert = ({ title, description, ...props }: React.ComponentProps<typeof Alert> & { title?: string; description?: string }) => (
  <Alert status="error" {...props}>
    <AlertIcon />
    <Box>
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Box>
  </Alert>
);

export const WarningAlert = ({ title, description, ...props }: React.ComponentProps<typeof Alert> & { title?: string; description?: string }) => (
  <Alert status="warning" {...props}>
    <AlertIcon />
    <Box>
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Box>
  </Alert>
);

// Shared Layout Components
export const PageHeader = ({ title, subtitle, actions, ...props }: React.ComponentProps<typeof Box> & { 
  title: string; 
  subtitle?: string; 
  actions?: React.ReactNode; 
}) => (
  <Box mb={6} {...props}>
    <HStack justify="space-between" align="flex-start">
      <Box>
        <Heading size="lg" mb={2}>
          {title}
        </Heading>
        {subtitle && (
          <Text color="gray.600" fontSize="md">
            {subtitle}
          </Text>
        )}
      </Box>
      {actions && <HStack>{actions}</HStack>}
    </HStack>
  </Box>
);

export const SectionHeader = ({ title, subtitle, actions, ...props }: React.ComponentProps<typeof Box> & { 
  title: string; 
  subtitle?: string; 
  actions?: React.ReactNode; 
}) => (
  <Box mb={4} {...props}>
    <HStack justify="space-between" align="flex-start">
      <Box>
        <Heading size="md" mb={1}>
          {title}
        </Heading>
        {subtitle && (
          <Text color="gray.500" fontSize="sm">
            {subtitle}
          </Text>
        )}
      </Box>
      {actions && <HStack>{actions}</HStack>}
    </HStack>
  </Box>
);

// Shared Data Display Components
export const MetricCard = ({ title, value, change, changeType, ...props }: React.ComponentProps<typeof Card> & { 
  title: string; 
  value: string | number; 
  change?: string; 
  changeType?: 'positive' | 'negative'; 
}) => (
  <Card {...props}>
    <CardBody>
      <VStack align="start" spacing={2}>
        <Text fontSize="sm" color="gray.500">
          {title}
        </Text>
        <Text fontSize="2xl" fontWeight="bold">
          {value}
        </Text>
        {change && (
          <HStack>
            <Text
              fontSize="sm"
              color={changeType === 'positive' ? 'green.500' : 'red.500'}
            >
              {change}
            </Text>
          </HStack>
        )}
      </VStack>
    </CardBody>
  </Card>
);

export const EmptyState = ({ title, description, action, ...props }: React.ComponentProps<typeof Box> & { 
  title: string; 
  description: string; 
  action?: React.ReactNode; 
}) => (
  <Box textAlign="center" py={8} {...props}>
    <VStack spacing={4}>
      <Text fontSize="lg" fontWeight="medium" color="gray.600">
        {title}
      </Text>
      <Text color="gray.500" maxW="md">
        {description}
      </Text>
      {action && action}
    </VStack>
  </Box>
);

// Shared Action Components
export const ActionButtons = ({ onEdit, onDelete, onView, onDownload, ...props }: React.ComponentProps<typeof HStack> & { 
  onEdit?: () => void; 
  onDelete?: () => void; 
  onView?: () => void; 
  onDownload?: () => void; 
}) => (
  <HStack spacing={2} {...props}>
    {onView && (
      <Button size="sm" variant="ghost" onClick={onView}>
        <Icon as={FiEye} />
      </Button>
    )}
    {onEdit && (
      <Button size="sm" variant="ghost" onClick={onEdit}>
        <Icon as={FiEdit} />
      </Button>
    )}
    {onDownload && (
      <Button size="sm" variant="ghost" onClick={onDownload}>
        <Icon as={FiDownload} />
      </Button>
    )}
    {onDelete && (
      <Button size="sm" variant="ghost" colorScheme="red" onClick={onDelete}>
        <Icon as={FiTrash} />
      </Button>
    )}
  </HStack>
);

// Export all components
export default {
  // Buttons
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  IconButton,
  
  // Cards
  InfoCard,
  ActionCard,
  
  // Forms
  FormField,
  TextInput,
  SelectInput,
  
  // Status
  StatusBadge,
  LoadingSpinner,
  LoadingSkeleton,
  
  // Alerts
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  
  // Layout
  PageHeader,
  SectionHeader,
  
  // Data Display
  MetricCard,
  EmptyState,
  
  // Actions
  ActionButtons,
};
