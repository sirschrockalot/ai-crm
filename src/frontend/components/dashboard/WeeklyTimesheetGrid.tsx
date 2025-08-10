import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Text,
  Input,
  Select,
  Button,
  HStack,
  VStack,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { DayEntry, Project } from '../../types/timeTracking';

interface WeeklyTimesheetGridProps {
  days: DayEntry[];
  projects: Project[];
  isLoading: boolean;
  onDayUpdate: (dayIndex: number, updates: Partial<DayEntry>) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

const WeeklyTimesheetGrid: React.FC<WeeklyTimesheetGridProps> = ({
  days,
  projects,
  isLoading,
  onDayUpdate,
  onSaveDraft,
  onSubmit,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const todayBgColor = useColorModeValue('blue.50', 'blue.900');
  const todayBorderColor = useColorModeValue('blue.300', 'blue.600');

  const [localDays, setLocalDays] = useState<DayEntry[]>(days);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalDays(days);
    setHasChanges(false);
  }, [days]);

  const handleDayUpdate = (dayIndex: number, field: keyof DayEntry, value: any) => {
    const updatedDays = [...localDays];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    setLocalDays(updatedDays);
    setHasChanges(true);
    onDayUpdate(dayIndex, { [field]: value });
  };

  const handleSaveDraft = () => {
    onSaveDraft();
    setHasChanges(false);
  };

  const handleSubmit = () => {
    onSubmit();
    setHasChanges(false);
  };

  const calculateTotalHours = () => {
    return localDays.reduce((total, day) => total + (day.hours || 0), 0);
  };

  const calculateBillableHours = () => {
    return localDays.reduce((total, day) => total + (day.isBillable ? (day.hours || 0) : 0), 0);
  };

  if (isLoading) {
    return (
      <Box>
        <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={4}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Box key={i} textAlign="center">
              <Skeleton height="20px" mb={2} />
            </Box>
          ))}
        </Grid>
        <Grid templateColumns="repeat(7, 1fr)" gap={2}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Box key={i} p={3} border="1px" borderColor={borderColor} borderRadius="md">
              <Skeleton height="60px" />
            </Box>
          ))}
        </Grid>
      </Box>
    );
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <VStack spacing={4} align="stretch">
      {/* Quick Actions */}
      <HStack spacing={4} justify="flex-end">
        <Button
          colorScheme="blue"
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          isDisabled={!hasChanges}
        >
          💾 Save Draft
        </Button>
        <Button
          colorScheme="green"
          size="sm"
          onClick={handleSubmit}
          isDisabled={!hasChanges}
        >
          📤 Submit for Approval
        </Button>
      </HStack>

      {/* Day Headers */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {dayNames.map((dayName) => (
          <Box key={dayName} textAlign="center">
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              {dayName}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Day Cells */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {localDays.map((day, index) => (
          <Box
            key={index}
            p={3}
            border="1px"
            borderColor={day.isToday ? todayBorderColor : borderColor}
            borderRadius="md"
            bg={day.isToday ? todayBgColor : bgColor}
            _hover={{ boxShadow: 'md', transition: 'all 0.2s' }}
          >
            <VStack spacing={2} align="stretch">
              {/* Hours Input */}
              <Input
                size="sm"
                type="number"
                step="0.25"
                min="0"
                max="24"
                value={day.hours || ''}
                onChange={(e) => handleDayUpdate(index, 'hours', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                textAlign="center"
                fontWeight="medium"
              />

              {/* Project Selection */}
              <Select
                size="sm"
                value={day.projectId || ''}
                onChange={(e) => handleDayUpdate(index, 'projectId', e.target.value)}
                placeholder="Select Project"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>

              {/* Billable Toggle */}
              <Button
                size="xs"
                variant={day.isBillable ? 'solid' : 'outline'}
                colorScheme={day.isBillable ? 'green' : 'gray'}
                onClick={() => handleDayUpdate(index, 'isBillable', !day.isBillable)}
                width="100%"
              >
                {day.isBillable ? '✓ Billable' : 'Billable'}
              </Button>
            </VStack>
          </Box>
        ))}
      </Grid>

      {/* Summary */}
      <Box
        p={4}
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        textAlign="center"
      >
        <HStack justify="center" spacing={8}>
          <Text fontSize="lg" fontWeight="semibold">
            Total Hours: <Text as="span" color="blue.600">{calculateTotalHours()}h</Text>
          </Text>
          <Text fontSize="lg" fontWeight="semibold">
            Billable: <Text as="span" color="green.600">{calculateBillableHours()}h</Text>
          </Text>
        </HStack>
      </Box>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have unsaved changes. Remember to save your draft or submit for approval.
          </AlertDescription>
        </Alert>
      )}
    </VStack>
  );
};

export default WeeklyTimesheetGrid;
