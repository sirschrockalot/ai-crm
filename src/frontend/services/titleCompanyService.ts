/**
 * Title Company and Closing Attorney Service
 * Manages title companies and closing attorneys for transactions
 */

export interface TitleCompany {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  officeAddress: string;
  type: 'title_company' | 'closing_attorney';
  notes?: string;
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
  const url = `${API_BASE_URL}/api/title-companies${endpoint}`;
  
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
        // Clear token and redirect to login
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

class TitleCompanyService {
  async list(type?: 'title_company' | 'closing_attorney'): Promise<TitleCompany[]> {
    const query = type ? `?type=${type}` : '';
    const data = await apiCall(query);
    // Normalize _id to id for frontend consistency
    return (data || []).map((item: any) => ({
      ...item,
      id: item._id || item.id,
    }));
  }

  async getById(id: string): Promise<TitleCompany | null> {
    const data = await apiCall(`/${id}`);
    if (!data) return null;
    return {
      ...data,
      id: data._id || data.id,
    };
  }

  async create(company: Omit<TitleCompany, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<TitleCompany> {
    const data = await apiCall('', {
      method: 'POST',
      body: JSON.stringify(company),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  }

  async update(id: string, updates: Partial<Omit<TitleCompany, 'id' | '_id' | 'createdAt'>>): Promise<TitleCompany> {
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

  async getByType(type: 'title_company' | 'closing_attorney'): Promise<TitleCompany[]> {
    return this.list(type);
  }
}

export const titleCompanyService = new TitleCompanyService();

