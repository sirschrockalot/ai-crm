import { useState, useEffect, useCallback, useRef } from 'react';
import { timesheetService, TimeEntry } from '../services/timesheetService';
import { useToast } from '@chakra-ui/react';

interface UseTimesheetOptions {
  userId: string;
  autoLoad?: boolean;
}

interface UseTimesheetReturn {
  // Data
  timesheet: TimeEntry | null;
  drafts: TimeEntry[];
  approvedTimesheets: TimeEntry[];
  weekDates: { start: Date; end: Date; days: Date[] };
  totalHours: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTimesheet: () => Promise<void>;
  loadDrafts: () => Promise<void>;
  loadApprovedTimesheets: (params?: { page?: number; limit?: number; weekStart?: string; weekEnd?: string }) => Promise<void>;
  saveTimesheet: (hours: number[], notes?: string) => Promise<void>;
  submitTimesheet: () => Promise<void>;
  submitDraft: (id: string) => Promise<void>;
  deleteTimesheet: (id: string) => Promise<void>;
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
  const [drafts, setDrafts] = useState<TimeEntry[]>([]);
  const [approvedTimesheets, setApprovedTimesheets] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  
  // Track last API call time to prevent rate limiting
  const lastApiCallRef = useRef<number>(0);
  const isLoadingRef = useRef<boolean>(false);

  // Get current week dates
  const weekDates = timesheetService.getWeekDates(new Date());
  const today = new Date();
  const isCurrentWeek = today >= weekDates.start && today <= weekDates.end;

  // Load timesheet data
  const loadTimesheet = useCallback(async () => {
    if (!userId) return;
    
    // Prevent concurrent calls
    if (isLoadingRef.current) {
      return;
    }
    
    // Throttle API calls - wait at least 500ms between calls
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallRef.current;
    if (timeSinceLastCall < 500) {
      await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLastCall));
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);
    lastApiCallRef.current = Date.now();

    try {
      const data = await timesheetService.getCurrentWeekTimesheet(userId);
      setTimesheet(data);
      // Don't show error if no timesheet exists - that's a valid state
      if (!data) {
        setError(null); // Clear any previous errors
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load timesheet';
      
      // Silently handle rate limiting - don't show error or toast
      if (err?.response?.status === 429 || errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        setError(null);
        setTimesheet(null); // Keep current state
        return; // Don't show error for rate limits
      }
      
      // Only show error if it's not a "not found" type error
      if (errorMessage.includes('No timesheet found') || err?.response?.status === 404) {
        // This is a valid state - no timesheet exists yet
        setTimesheet(null);
        setError(null);
      } else {
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [userId, toast]);

  const loadDrafts = useCallback(async () => {
    if (!userId) return;
    
    // Throttle API calls - wait at least 1000ms between calls to prevent rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallRef.current;
    if (timeSinceLastCall < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastCall));
    }
    lastApiCallRef.current = Date.now();
    
    try {
      const entries = await timesheetService.getDraftsForUser(userId);
      setDrafts(entries);
    } catch (err: any) {
      // Silently handle rate limiting - don't log or show errors
      if (err?.response?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Too many requests')) {
        // Don't update state on rate limit - keep existing drafts
        return; // Silently fail for rate limits
      }
      // Other errors are silenced to avoid noisy UI
    }
  }, [userId]);

  const loadApprovedTimesheets = useCallback(async (params?: { page?: number; limit?: number; weekStart?: string; weekEnd?: string }) => {
    if (!userId) return;
    
    // Throttle API calls - wait at least 1000ms between calls to prevent rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallRef.current;
    if (timeSinceLastCall < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastCall));
    }
    lastApiCallRef.current = Date.now();
    
    try {
      const response = await timesheetService.getApprovedTimesheets(userId, params);
      setApprovedTimesheets(response.data || []);
    } catch (err: any) {
      // Silently handle rate limiting - don't log or show errors
      if (err?.response?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Too many requests')) {
        return; // Silently fail for rate limits
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to load approved timesheets';
      console.error('Error loading approved timesheets:', errorMessage);
      // Don't show toast for this as it's a background operation
    }
  }, [userId]);

  // Save timesheet
  const saveTimesheet = useCallback(async (hours: number[], notes?: string, existingTimesheetId?: string) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const data = await timesheetService.saveCurrentWeekTimesheet(userId, hours, notes, existingTimesheetId);
      setTimesheet(data);
      setError(null); // Ensure error is cleared on success
      
      // Update drafts list locally if this is a draft (status is draft)
      // This avoids an extra API call and prevents rate limiting
      // IMPORTANT: Always update drafts state to trigger re-render, even if data structure seems correct
      if (data && data.status === 'draft') {
        // Use functional update to ensure we get the latest state
        setDrafts(prevDrafts => {
          // Check if this timesheet is already in the list
          const existingIndex = prevDrafts.findIndex(d => d._id === data._id);
          if (existingIndex >= 0) {
            // Update existing draft - create new array to ensure React detects the change
            const updated = [...prevDrafts];
            updated[existingIndex] = { ...data }; // Create new object reference
            return updated;
          } else {
            // Add new draft to the list - create new array
            return [{ ...data }, ...prevDrafts];
          }
        });
      } else if (data && data.status !== 'draft' && existingTimesheetId) {
        // If timesheet status changed from draft to something else, remove it from drafts list
        setDrafts(prevDrafts => prevDrafts.filter(d => d._id !== data._id));
      }
      
      // Don't call loadDrafts() - we've updated the list locally
      // This prevents rate limiting issues
      
      toast({
        title: 'Success',
        description: 'Timesheet saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save timesheet';
      
      // Don't set error for "No timesheet found" - that's from submitTimesheet, not save
      // Only set error for actual save failures
      if (!errorMessage.includes('No timesheet found')) {
        setError(errorMessage);
      } else {
        setError(null); // Clear error if it's not relevant to save operation
      }
      
      // Handle rate limiting specifically
      if (err?.response?.status === 429 || errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        toast({
          title: 'Rate Limit',
          description: 'Too many requests. Please wait a moment before trying again.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else if (!errorMessage.includes('No timesheet found')) {
        // Only show toast for actual save errors, not "not found" errors
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const submitDraft = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await timesheetService.submitEntry(id);
      
      // Update drafts list locally by removing the submitted draft
      setDrafts(prevDrafts => prevDrafts.filter(d => d._id !== id));
      
      // Reload timesheet and drafts with delays to prevent rate limiting
      setTimeout(async () => {
        try {
          await loadTimesheet();
        } catch (loadError) {
          // Silently handle
        }
      }, 500);
      
      setTimeout(async () => {
        try {
          await loadDrafts();
        } catch (loadError) {
          // Silently handle - we've already updated locally
        }
      }, 1000);
      
      toast({
        title: 'Submitted',
        description: 'Timesheet submitted for approval',
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
  }, [loadDrafts, loadTimesheet, toast]);

  // Delete timesheet (only for drafts)
  const deleteTimesheet = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await timesheetService.deleteTimeEntry(id);
      
      // Update drafts list locally by removing the deleted draft
      setDrafts(prevDrafts => prevDrafts.filter(d => d._id !== id));
      
      // Don't call loadDrafts() immediately - update locally to prevent rate limiting
      // Reload drafts after a delay if needed (silently)
      setTimeout(async () => {
        try {
          await loadDrafts();
        } catch (loadError) {
          // Silently handle - we've already updated locally
        }
      }, 2000);
      
      toast({
        title: 'Deleted',
        description: 'Timesheet deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete timesheet';
      
      // Handle rate limiting specifically
      if (err?.response?.status === 429 || errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        setError('Too many requests. Please wait a moment and try again.');
        toast({
          title: 'Rate Limit',
          description: 'Too many requests. Please wait a moment before trying again.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [loadDrafts, toast]);

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
    if (!timesheet || !timesheet.hours || timesheet.hours[dayIndex] === undefined) return 0;
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
      // Stagger the initial loads with much longer delays to prevent rate limiting
      // Only load essential data immediately, defer non-critical loads
      setTimeout(() => {
        loadTimesheet();
      }, 1000);
      // Load drafts after a longer delay - not critical for initial render
      setTimeout(() => {
        loadDrafts();
      }, 3000);
      // Load approved timesheets last - least critical
      setTimeout(() => {
        loadApprovedTimesheets({ limit: 10 }); // Load recent approved timesheets
      }, 5000);
    }
  }, [autoLoad, userId, loadTimesheet, loadDrafts, loadApprovedTimesheets]);

  return {
    // Data
    timesheet,
    drafts,
    approvedTimesheets,
    weekDates,
    totalHours,
    isLoading,
    error,
    
    // Actions
    loadTimesheet,
    loadDrafts,
    loadApprovedTimesheets,
    saveTimesheet,
    submitTimesheet,
    submitDraft,
    deleteTimesheet,
    updateHours,
    getHoursForDay,
    
    // Computed values
    isCurrentWeek,
    weekDisplayText,
    statusColor,
    canSubmit,
  };
};
