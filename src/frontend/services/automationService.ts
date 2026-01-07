/**
 * Automation Service
 * Manages automation rules for transactions
 */

export interface AutomationRule {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  trigger: 'status_change' | 'document_uploaded' | 'deadline_approaching' | 'custom_field_change' | 'manual';
  triggerConditions: {
    status?: string;
    field?: string;
    value?: any;
    daysBefore?: number;
    [key: string]: any;
  };
  action: 'send_email' | 'send_sms' | 'create_task' | 'create_appointment' | 'update_status' | 'notify_user';
  actionConfig: {
    templateId?: string;
    subject?: string;
    message?: string;
    recipient?: 'seller' | 'buyer' | 'title_company' | 'lender' | 'coordinator' | 'custom';
    customRecipient?: string;
    delay?: number;
    [key: string]: any;
  };
  enabled: boolean;
  createdBy: string;
  transactionTypes?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  const url = `${API_BASE_URL}/api/automation${endpoint}`;
  
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

class AutomationService {
  async list(): Promise<AutomationRule[]> {
    const data = await apiCall('');
    return (data || []).map((item: any) => ({
      ...item,
      id: item._id || item.id,
    }));
  }

  async getById(id: string): Promise<AutomationRule | null> {
    const data = await apiCall(`/${id}`);
    if (!data) return null;
    return {
      ...data,
      id: data._id || data.id,
    };
  }

  async create(rule: Omit<AutomationRule, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<AutomationRule> {
    const data = await apiCall('', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  }

  async update(id: string, updates: Partial<Omit<AutomationRule, 'id' | '_id' | 'createdAt'>>): Promise<AutomationRule> {
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
}

export const automationService = new AutomationService();

