import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    county?: string;
    full_address?: string;
  };
  property_details?: {
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: number;
    year_built?: number;
  };
  estimated_value?: number;
  asking_price?: number;
  source?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  tags: string[];
  notes?: string;
  communication_count: number;
  last_contacted?: Date;
  next_follow_up?: Date;
  custom_fields?: Record<string, any>;
  ai_summary?: string;
  ai_tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateLeadData {
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    county?: string;
    full_address?: string;
  };
  property_details?: {
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: number;
    year_built?: number;
  };
  estimated_value?: number;
  asking_price?: number;
  source?: string;
  notes?: string;
  tags?: string[];
  assigned_to?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: string;
  priority?: string;
  communication_count?: number;
  last_contacted?: Date;
  next_follow_up?: Date;
  custom_fields?: Record<string, any>;
}

export interface PipelineData {
  pipeline: {
    new: Lead[];
    contacted: Lead[];
    under_contract: Lead[];
    closed: Lead[];
    lost: Lead[];
  };
  total: number;
  stats: {
    new: number;
    contacted: number;
    under_contract: number;
    closed: number;
    lost: number;
  };
}

class LeadService {
  private getAuthHeaders() {
    const { accessToken } = useAuthStore.getState();
    return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  async getLeads(filters?: any): Promise<Lead[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/leads?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  async getPipelineData(filters?: any): Promise<PipelineData> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/leads/pipeline?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pipeline data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      throw error;
    }
  }

  async getLead(leadId: string): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  }

  async createLead(leadData: CreateLeadData): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lead');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async updateLead(leadId: string, leadData: UpdateLeadData): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lead');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  async deleteLead(leadId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  async assignLead(leadId: string, assignedTo: string): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/assign`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ assigned_to: assignedTo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign lead');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw error;
    }
  }

  async updateLeadStatus(leadId: string, status: string): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update lead status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  }

  async moveLeadInPipeline(leadId: string, newStatus: string): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/move`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to move lead in pipeline');
      }

      return await response.json();
    } catch (error) {
      console.error('Error moving lead in pipeline:', error);
      throw error;
    }
  }

  async addTag(leadId: string, tag: string): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/tags`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ tag }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add tag');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  }

  async removeTag(leadId: string, tag: string): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/tags/${encodeURIComponent(tag)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove tag');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing tag:', error);
      throw error;
    }
  }

  async recordContact(leadId: string): Promise<Lead> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${leadId}/contact`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record contact');
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording contact:', error);
      throw error;
    }
  }

  async getLeadStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lead stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      throw error;
    }
  }
}

export const leadService = new LeadService(); 