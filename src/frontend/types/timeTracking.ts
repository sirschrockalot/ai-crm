// Time Tracking Types

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in hours
  description: string;
  isBillable: boolean;
  hourlyRate?: number;
  status: TimeEntryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  billableRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timesheet {
  id: string;
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalHours: number;
  billableHours: number;
  status: TimesheetStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  entries: TimeEntry[];
}

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface WeeklyTimesheetData {
  weekStartDate: Date;
  weekEndDate: Date;
  days: DayEntry[];
  totalHours: number;
  billableHours: number;
  status: TimesheetStatus;
}

export interface DayEntry {
  date: Date;
  dayOfWeek: string;
  isToday: boolean;
  hours: number;
  projectId?: string;
  taskId?: string;
  description?: string;
  isBillable: boolean;
}

export interface TimeTrackingStats {
  thisWeek: number;
  billableHours: number;
  activeProjects: number;
  timesheetStatus: TimesheetStatus;
  weeklyTrend: number;
  billablePercentage: number;
  pendingApprovals: number;
}

export interface ApprovalQueueItem {
  id: string;
  userId: string;
  userName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalHours: number;
  status: TimesheetStatus;
  submittedAt: Date;
}

export interface TimeEntryFormData {
  projectId: string;
  taskId?: string;
  startTime: string;
  endTime: string;
  description: string;
  isBillable: boolean;
  hourlyRate?: number;
}

export interface ProjectTimeAllocation {
  projectId: string;
  projectName: string;
  totalHours: number;
  billableHours: number;
  percentage: number;
}
