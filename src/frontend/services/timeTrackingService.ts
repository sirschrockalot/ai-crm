import { apiService } from './apiService';
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

class TimeTrackingService {
  private baseUrl = '/api/time-tracking';

  // Get time tracking statistics
  async getStats(): Promise<TimeTrackingStats> {
    try {
      const response = await apiService.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching time tracking stats:', error);
      throw error;
    }
  }

  // Get weekly timesheet data
  async getWeeklyTimesheet(weekStartDate: Date): Promise<WeeklyTimesheetData> {
    try {
      const response = await apiService.get(`${this.baseUrl}/timesheet/weekly`, {
        params: { weekStartDate: weekStartDate.toISOString() }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly timesheet:', error);
      throw error;
    }
  }

  // Get available projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get tasks for a specific project
  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  // Create a new time entry
  async createTimeEntry(entry: TimeEntryFormData): Promise<TimeEntry> {
    try {
      const response = await apiService.post(`${this.baseUrl}/entries`, entry);
      return response.data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  }

  // Update an existing time entry
  async updateTimeEntry(entryId: string, entry: Partial<TimeEntryFormData>): Promise<TimeEntry> {
    try {
      const response = await apiService.put(`${this.baseUrl}/entries/${entryId}`, entry);
      return response.data;
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  }

  // Delete a time entry
  async deleteTimeEntry(entryId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/entries/${entryId}`);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  }

  // Save timesheet as draft
  async saveTimesheetDraft(timesheetData: WeeklyTimesheetData): Promise<Timesheet> {
    try {
      const response = await apiService.post(`${this.baseUrl}/timesheet/draft`, timesheetData);
      return response.data;
    } catch (error) {
      console.error('Error saving timesheet draft:', error);
      throw error;
    }
  }

  // Submit timesheet for approval
  async submitTimesheet(timesheetId: string): Promise<Timesheet> {
    try {
      const response = await apiService.post(`${this.baseUrl}/timesheet/${timesheetId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  }

  // Get approval queue (for managers)
  async getApprovalQueue(): Promise<ApprovalQueueItem[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/approval-queue`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approval queue:', error);
      throw error;
    }
  }

  // Approve timesheet
  async approveTimesheet(timesheetId: string, comments?: string): Promise<Timesheet> {
    try {
      const response = await apiService.post(`${this.baseUrl}/timesheet/${timesheetId}/approve`, {
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving timesheet:', error);
      throw error;
    }
  }

  // Reject timesheet
  async rejectTimesheet(timesheetId: string, reason: string): Promise<Timesheet> {
    try {
      const response = await apiService.post(`${this.baseUrl}/timesheet/${timesheetId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      throw error;
    }
  }

  // Get project time allocation
  async getProjectTimeAllocation(weekStartDate: Date): Promise<ProjectTimeAllocation[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/projects/allocation`, {
        params: { weekStartDate: weekStartDate.toISOString() }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project time allocation:', error);
      throw error;
    }
  }

  // Start timer
  async startTimer(projectId: string, taskId?: string): Promise<{ timerId: string; startTime: Date }> {
    try {
      const response = await apiService.post(`${this.baseUrl}/timer/start`, {
        projectId,
        taskId
      });
      return response.data;
    } catch (error) {
      console.error('Error starting timer:', error);
      throw error;
    }
  }

  // Stop timer
  async stopTimer(timerId: string, description: string): Promise<TimeEntry> {
    try {
      const response = await apiService.post(`${this.baseUrl}/timer/${timerId}/stop`, {
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error stopping timer:', error);
      throw error;
    }
  }

  // Get active timer
  async getActiveTimer(): Promise<{ timerId: string; startTime: Date; projectId: string; taskId?: string } | null> {
    try {
      const response = await apiService.get(`${this.baseUrl}/timer/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active timer:', error);
      throw error;
    }
  }

  // Get recent time entries
  async getRecentEntries(limit: number = 10): Promise<TimeEntry[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/entries/recent`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent entries:', error);
      throw error;
    }
  }
}

export const timeTrackingService = new TimeTrackingService();
