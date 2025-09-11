import { useState, useEffect, useCallback } from 'react';
import { timesheetService, TimeEntry } from '../services/timesheetService';
import { useToast } from '@chakra-ui/react';

interface UseTimesheetOptions {
  userId: string;
  autoLoad?: boolean;
}

interface UseTimesheetReturn {
  // Data
  timesheet: TimeEntry | null;
  weekDates: { start: Date; end: Date; days: Date[] };
  totalHours: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTimesheet: () => Promise<void>;
  saveTimesheet: (hours: number[], notes?: string, dayNotes?: string[]) => Promise<void>;
  submitTimesheet: () => Promise<void>;
  updateHours: (dayIndex: number, hours: number) => void;
  getHoursForDay: (dayIndex: number) => number;
  
  // Computed values
  isCurrentWeek: boolean;
  weekDisplayText: string;
  statusColor: string;
  canSubmit: boolean;
}

export const useTimesheet = ({ userId, autoLoad = true }: UseTimesheetOptions): UseTimesheetReturn => {
  const [timesheet, setTimesheet] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Get current week dates
  const weekDates = timesheetService.getWeekDates(new Date());
  const today = new Date();
  const isCurrentWeek = today >= weekDates.start && today <= weekDates.end;

  // Load timesheet data
  const loadTimesheet = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await timesheetService.getCurrentWeekTimesheet(userId);
      setTimesheet(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load timesheet';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Save timesheet
  const saveTimesheet = useCallback(async (hours: number[], notes?: string, dayNotes?: string[]) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await timesheetService.saveCurrentWeekTimesheet(userId, hours, notes, dayNotes);
      setTimesheet(data);
      toast({
        title: 'Success',
        description: 'Timesheet saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save timesheet';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Submit timesheet
  const submitTimesheet = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await timesheetService.submitTimesheet(userId);
      setTimesheet(data);
      toast({
        title: 'Success',
        description: 'Timesheet submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit timesheet';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  // Update hours for a specific day
  const updateHours = useCallback((dayIndex: number, hours: number) => {
    if (!timesheet) return;

    const newHours = [...timesheet.hours];
    newHours[dayIndex] = Math.max(0, Math.min(24, hours)); // Clamp between 0 and 24

    setTimesheet({
      ...timesheet,
      hours: newHours,
    });
  }, [timesheet]);

  // Get hours for a specific day
  const getHoursForDay = useCallback((dayIndex: number): number => {
    if (!timesheet || !timesheet.hours[dayIndex]) return 0;
    return timesheet.hours[dayIndex];
  }, [timesheet]);

  // Calculate total hours
  const totalHours = timesheet ? timesheetService.calculateTotalHours(timesheet.hours) : 0;

  // Computed values
  const weekDisplayText = `Week of ${timesheetService.formatDate(weekDates.start)}`;

  const statusColor = (() => {
    if (!timesheet) return 'gray';
    switch (timesheet.status) {
      case 'draft': return 'blue';
      case 'submitted': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  })();

  const canSubmit = timesheet && timesheet.status === 'draft' && totalHours > 0;

  // Auto-load timesheet on mount
  useEffect(() => {
    if (autoLoad && userId) {
      loadTimesheet();
    }
  }, [autoLoad, userId, loadTimesheet]);

  return {
    // Data
    timesheet,
    weekDates,
    totalHours,
    isLoading,
    error,
    
    // Actions
    loadTimesheet,
    saveTimesheet,
    submitTimesheet,
    updateHours,
    getHoursForDay,
    
    // Computed values
    isCurrentWeek,
    weekDisplayText,
    statusColor,
    canSubmit,
  };
};
