import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { timeTrackingService } from '../services/timeTrackingService';
import { 
  TimeEntry, 
  Timesheet, 
  Project, 
  Task, 
  WeeklyTimesheetData, 
  TimeTrackingStats,
  ApprovalQueueItem,
  TimeEntryFormData,
  ProjectTimeAllocation
} from '../types/timeTracking';

interface UseTimeTrackingReturn {
  // State
  stats: TimeTrackingStats | null;
  weeklyTimesheet: WeeklyTimesheetData | null;
  projects: Project[];
  tasks: Task[];
  approvalQueue: ApprovalQueueItem[];
  projectAllocation: ProjectTimeAllocation[];
  recentEntries: TimeEntry[];
  activeTimer: { timerId: string; startTime: Date; projectId: string; taskId?: string } | null;
  
  // Loading states
  isLoadingStats: boolean;
  isLoadingTimesheet: boolean;
  isLoadingProjects: boolean;
  isLoadingApprovalQueue: boolean;
  
  // Actions
  fetchStats: () => Promise<void>;
  fetchWeeklyTimesheet: (weekStartDate: Date) => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  createTimeEntry: (entry: TimeEntryFormData) => Promise<TimeEntry | null>;
  updateTimeEntry: (entryId: string, entry: Partial<TimeEntryFormData>) => Promise<TimeEntry | null>;
  deleteTimeEntry: (entryId: string) => Promise<boolean>;
  saveTimesheetDraft: (timesheetData: WeeklyTimesheetData) => Promise<Timesheet | null>;
  submitTimesheet: (timesheetId: string) => Promise<Timesheet | null>;
  approveTimesheet: (timesheetId: string, comments?: string) => Promise<Timesheet | null>;
  rejectTimesheet: (timesheetId: string, reason: string) => Promise<Timesheet | null>;
  startTimer: (projectId: string, taskId?: string) => Promise<boolean>;
  stopTimer: (timerId: string, description: string) => Promise<TimeEntry | null>;
  fetchApprovalQueue: () => Promise<void>;
  fetchProjectAllocation: (weekStartDate: Date) => Promise<void>;
  fetchRecentEntries: () => Promise<void>;
  
  // Utilities
  getWeekStartDate: (date?: Date) => Date;
  calculateTotalHours: (entries: DayEntry[]) => number;
  calculateBillableHours: (entries: DayEntry[]) => number;
}

export const useTimeTracking = (): UseTimeTrackingReturn => {
  const toast = useToast();
  
  // State
  const [stats, setStats] = useState<TimeTrackingStats | null>(null);
  const [weeklyTimesheet, setWeeklyTimesheet] = useState<WeeklyTimesheetData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([]);
  const [projectAllocation, setProjectAllocation] = useState<ProjectTimeAllocation[]>([]);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<{ timerId: string; startTime: Date; projectId: string; taskId?: string } | null>(null);
  
  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingTimesheet, setIsLoadingTimesheet] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingApprovalQueue, setIsLoadingApprovalQueue] = useState(false);

  // Fetch time tracking statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const data = await timeTrackingService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch time tracking statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [toast]);

  // Fetch weekly timesheet
  const fetchWeeklyTimesheet = useCallback(async (weekStartDate: Date) => {
    try {
      setIsLoadingTimesheet(true);
      const data = await timeTrackingService.getWeeklyTimesheet(weekStartDate);
      setWeeklyTimesheet(data);
    } catch (error) {
      console.error('Error fetching weekly timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch weekly timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTimesheet(false);
    }
  }, [toast]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const data = await timeTrackingService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }, [toast]);

  // Fetch project tasks
  const fetchProjectTasks = useCallback(async (projectId: string) => {
    try {
      const data = await timeTrackingService.getProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project tasks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Create time entry
  const createTimeEntry = useCallback(async (entry: TimeEntryFormData): Promise<TimeEntry | null> => {
    try {
      const data = await timeTrackingService.createTimeEntry(entry);
      toast({
        title: 'Success',
        description: 'Time entry created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create time entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Update time entry
  const updateTimeEntry = useCallback(async (entryId: string, entry: Partial<TimeEntryFormData>): Promise<TimeEntry | null> => {
    try {
      const data = await timeTrackingService.updateTimeEntry(entryId, entry);
      toast({
        title: 'Success',
        description: 'Time entry updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update time entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Delete time entry
  const deleteTimeEntry = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast({
        title: 'Success',
        description: 'Time entry deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);

  // Save timesheet draft
  const saveTimesheetDraft = useCallback(async (timesheetData: WeeklyTimesheetData): Promise<Timesheet | null> => {
    try {
      const data = await timeTrackingService.saveTimesheetDraft(timesheetData);
      toast({
        title: 'Success',
        description: 'Timesheet draft saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (error) {
      console.error('Error saving timesheet draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to save timesheet draft',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Submit timesheet
  const submitTimesheet = useCallback(async (timesheetId: string): Promise<Timesheet | null> => {
    try {
      const data = await timeTrackingService.submitTimesheet(timesheetId);
      toast({
        title: 'Success',
        description: 'Timesheet submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Approve timesheet
  const approveTimesheet = useCallback(async (timesheetId: string, comments?: string): Promise<Timesheet | null> => {
    try {
      const data = await timeTrackingService.approveTimesheet(timesheetId, comments);
      toast({
        title: 'Success',
        description: 'Timesheet approved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Reject timesheet
  const rejectTimesheet = useCallback(async (timesheetId: string, reason: string): Promise<Timesheet | null> => {
    try {
      const data = await timeTrackingService.rejectTimesheet(timesheetId, reason);
      toast({
        title: 'Success',
        description: 'Timesheet rejected',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Start timer
  const startTimer = useCallback(async (projectId: string, taskId?: string): Promise<boolean> => {
    try {
      const data = await timeTrackingService.startTimer(projectId, taskId);
      setActiveTimer(data);
      toast({
        title: 'Timer Started',
        description: 'Time tracking timer started successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to start timer',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  }, [toast]);

  // Stop timer
  const stopTimer = useCallback(async (timerId: string, description: string): Promise<TimeEntry | null> => {
    try {
      const data = await timeTrackingService.stopTimer(timerId, description);
      setActiveTimer(null);
      toast({
        title: 'Timer Stopped',
        description: 'Time tracking timer stopped successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop timer',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  // Fetch approval queue
  const fetchApprovalQueue = useCallback(async () => {
    try {
      setIsLoadingApprovalQueue(true);
      const data = await timeTrackingService.getApprovalQueue();
      setApprovalQueue(data);
    } catch (error) {
      console.error('Error fetching approval queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch approval queue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingApprovalQueue(false);
    }
  }, [toast]);

  // Fetch project allocation
  const fetchProjectAllocation = useCallback(async (weekStartDate: Date) => {
    try {
      const data = await timeTrackingService.getProjectTimeAllocation(weekStartDate);
      setProjectAllocation(data);
    } catch (error) {
      console.error('Error fetching project allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project allocation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Fetch recent entries
  const fetchRecentEntries = useCallback(async () => {
    try {
      const data = await timeTrackingService.getRecentEntries();
      setRecentEntries(data);
    } catch (error) {
      console.error('Error fetching recent entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch recent entries',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Utility functions
  const getWeekStartDate = useCallback((date: Date = new Date()): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }, []);

  const calculateTotalHours = useCallback((entries: any[]): number => {
    return entries.reduce((total, entry) => total + (entry.hours || 0), 0);
  }, []);

  const calculateBillableHours = useCallback((entries: any[]): number => {
    return entries.reduce((total, entry) => total + (entry.isBillable ? (entry.hours || 0) : 0), 0);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchStats();
    fetchProjects();
    fetchApprovalQueue();
    fetchRecentEntries();
  }, [fetchStats, fetchProjects, fetchApprovalQueue, fetchRecentEntries]);

  return {
    // State
    stats,
    weeklyTimesheet,
    projects,
    tasks,
    approvalQueue,
    projectAllocation,
    recentEntries,
    activeTimer,
    
    // Loading states
    isLoadingStats,
    isLoadingTimesheet,
    isLoadingProjects,
    isLoadingApprovalQueue,
    
    // Actions
    fetchStats,
    fetchWeeklyTimesheet,
    fetchProjects,
    fetchProjectTasks,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    saveTimesheetDraft,
    submitTimesheet,
    approveTimesheet,
    rejectTimesheet,
    startTimer,
    stopTimer,
    fetchApprovalQueue,
    fetchProjectAllocation,
    fetchRecentEntries,
    
    // Utilities
    getWeekStartDate,
    calculateTotalHours,
    calculateBillableHours,
  };
};
