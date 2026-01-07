/**
 * Appointments Service
 * Manages appointments and calendar entries for transaction coordinators
 */

export interface Appointment {
  _id?: string;
  id?: string;
  transactionId: string;
  title: string;
  description?: string;
  type: 'call_back_buyer' | 'call_back_seller' | 'call_back_title_company' | 'call_back_lender' | 'document_follow_up' | 'closing_date_reminder' | 'inspection_deadline' | 'emd_deadline' | 'meeting' | 'custom';
  startDate: string;
  endDate?: string;
  duration?: number;
  contactPerson?: string;
  contactMethod: 'phone' | 'email' | 'in_person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderSettings: {
    enabled: boolean;
    timings: number[];
  };
  notes?: string;
  coordinatorId: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryAppointmentsParams {
  transactionId?: string;
  coordinatorId?: string;
  status?: Appointment['status'];
  type?: Appointment['type'];
  priority?: Appointment['priority'];
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  limit?: number;
}

const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

const getLiveAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

const apiCall = async (endpoint: string, options: any = {}) => {
  const url = `${API_BASE_URL}/api/appointments${endpoint}`;
  
  const token = getLiveAuthToken();
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  if (!token && !bypassAuth) {
    console.error('Authentication token not found for API call to:', url);
    throw new Error('Authentication token not found. Please log in again.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body,
    });

    if (response.status === 401) {
      console.error('API call received 401 Unauthorized:', url);
      if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'true') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
      throw new Error('Authentication failed. Please log in again.');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`API call failed to ${url} with status ${response.status}:`, errorBody);
      throw new Error(`API call failed: ${response.status} ${errorBody.message || response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error during API call:', error);
    throw error;
  }
};

class AppointmentsService {
  async list(params?: QueryAppointmentsParams): Promise<{ appointments: Appointment[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    const data = await apiCall(query ? `?${query}` : '');
    // Normalize _id to id
    if (data.appointments) {
      data.appointments = data.appointments.map((item: any) => ({
        ...item,
        id: item._id || item.id,
      }));
    }
    return data;
  }

  async getById(id: string): Promise<Appointment | null> {
    const data = await apiCall(`/${id}`);
    if (!data) return null;
    return {
      ...data,
      id: data._id || data.id,
    };
  }

  async create(appointment: Omit<Appointment, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'coordinatorId'>): Promise<Appointment> {
    const data = await apiCall('', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  }

  async update(id: string, updates: Partial<Omit<Appointment, 'id' | '_id' | 'createdAt'>>): Promise<Appointment> {
    const data = await apiCall(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  }

  async delete(id: string): Promise<void> {
    await apiCall(`/${id}`, {
      method: 'DELETE',
    });
  }

  async getCalendar(startDate: string, endDate: string): Promise<Appointment[]> {
    const data = await apiCall(`/calendar?startDate=${startDate}&endDate=${endDate}`);
    return (data || []).map((item: any) => ({
      ...item,
      id: item._id || item.id,
    }));
  }

  async getUpcoming(limit: number = 10): Promise<Appointment[]> {
    const data = await apiCall(`/upcoming?limit=${limit}`);
    return (data || []).map((item: any) => ({
      ...item,
      id: item._id || item.id,
    }));
  }
}

export const appointmentsService = new AppointmentsService();

