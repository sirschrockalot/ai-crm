import axios, { AxiosInstance } from 'axios';

// Types matching the timesheet-service API
export interface TimeEntry {
  _id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  hours: number[];
  notes?: string;
  dayNotes?: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntryCreate {
  userId: string;
  weekStart: string;
  weekEnd: string;
  hours: number[];
  notes?: string;
  dayNotes?: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface TimeEntryUpdate {
  hours?: number[];
  notes?: string;
  dayNotes?: string[];
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface TimeEntryListResponse {
  success: boolean;
  data: TimeEntry[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TimeEntryResponse {
  success: boolean;
  data: TimeEntry;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: string[];
}

class TimesheetService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_TIMESHEET_SERVICE_URL || 'http://localhost:3007';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[TimesheetService] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[TimesheetService] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('[TimesheetService] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string; environment: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Get all time entries with optional filtering
  async getTimeEntries(params?: {
    userId?: string;
    status?: string;
    weekStart?: string;
    weekEnd?: string;
    page?: number;
    limit?: number;
  }): Promise<TimeEntryListResponse> {
    const response = await this.api.get('/api/time-entries', { params });
    return response.data;
  }

  // Get time entry by ID
  async getTimeEntryById(id: string): Promise<TimeEntryResponse> {
    const response = await this.api.get(`/api/time-entries/${id}`);
    return response.data;
  }

  // Get time entry for specific user and week
  async getTimeEntryForWeek(userId: string, weekStart: string): Promise<TimeEntryResponse> {
    const response = await this.api.get('/api/time-entries/week', {
      params: { userId, weekStart }
    });
    return response.data;
  }

  // Create new time entry
  async createTimeEntry(entry: TimeEntryCreate): Promise<TimeEntryResponse> {
    const response = await this.api.post('/api/time-entries', entry);
    return response.data;
  }

  // Update existing time entry
  async updateTimeEntry(id: string, updates: TimeEntryUpdate): Promise<TimeEntryResponse> {
    const response = await this.api.put(`/api/time-entries/${id}`, updates);
    return response.data;
  }

  // Delete time entry
  async deleteTimeEntry(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete(`/api/time-entries/${id}`);
    return response.data;
  }

  // Helper method to get current week's timesheet for a user
  async getCurrentWeekTimesheet(userId: string): Promise<TimeEntry | null> {
    try {
      const today = new Date();
      const weekStart = this.getWeekStart(today);
      const response = await this.getTimeEntryForWeek(userId, weekStart.toISOString());
      return response.data || null;
    } catch (error) {
      console.error('Error getting current week timesheet:', error);
      return null;
    }
  }

  // Helper method to create or update current week's timesheet
  async saveCurrentWeekTimesheet(userId: string, hours: number[], notes?: string): Promise<TimeEntry> {
    try {
      const today = new Date();
      const weekStart = this.getWeekStart(today);
      const weekEnd = this.getWeekEnd(today);

      // Normalize hours: ensure exactly 7 finite numbers between 0 and 24
      const normalizedHours = Array.from({ length: 7 }, (_, idx) => {
        const value = Array.isArray(hours) ? hours[idx] : undefined;
        const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
        // Clamp to [0, 24]
        return Math.max(0, Math.min(24, num));
      });

      // Try to get existing timesheet for this week
      const existing = await this.getCurrentWeekTimesheet(userId);

      if (existing) {
        // Update existing timesheet
        const updateData: Record<string, any> = {
          hours: normalizedHours,
          status: 'draft'
        };
        if (notes && notes.trim().length > 0) {
          updateData.notes = notes;
        }
        
        console.log('Updating existing timesheet with data:', updateData);
        
        const response = await this.updateTimeEntry(existing._id, updateData);
        return response.data;
      } else {
        // Create new timesheet
        const createData: Record<string, any> = {
          userId,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          hours: normalizedHours,
          status: 'draft'
        };
        if (notes && notes.trim().length > 0) {
          createData.notes = notes;
        }
        
        console.log('Creating new timesheet with data:', createData);
        
        const response = await this.createTimeEntry(createData);
        return response.data;
      }
    } catch (error) {
      // Surface server-side validation details if present
      // @ts-ignore
      const details = error?.response?.data?.details;
      if (details) {
        console.error('Error saving current week timesheet: validation details ->', details);
      } else {
        console.error('Error saving current week timesheet:', error);
      }
      throw error;
    }
  }

  // Helper method to submit timesheet
  async submitTimesheet(userId: string): Promise<TimeEntry> {
    try {
      const existing = await this.getCurrentWeekTimesheet(userId);
      if (!existing) {
        throw new Error('No timesheet found for current week');
      }

      const response = await this.updateTimeEntry(existing._id, {
        status: 'submitted'
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  }

  // Helper methods for date calculations
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd;
  }

  // Helper method to format week dates for display
  getWeekDates(date: Date): { start: Date; end: Date; days: Date[] } {
    const start = this.getWeekStart(date);
    const end = this.getWeekEnd(date);
    const days: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return { start, end, days };
  }

  // Helper method to calculate total hours
  calculateTotalHours(hours: number[]): number {
    return hours.reduce((sum, hour) => sum + hour, 0);
  }

  // Helper method to get day name
  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Helper method to format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export const timesheetService = new TimesheetService();
