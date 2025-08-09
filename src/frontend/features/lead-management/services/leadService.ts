import { useApi } from '../../../hooks/useApi';
import { Lead, LeadMoveRequest, LeadMoveResponse, PipelineStage, LeadFormData } from '../types/lead';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const leadService = {
  // Get all leads with optional filtering
  async getLeads(filters?: Record<string, any>): Promise<Lead[]> {
    const api = useApi<Lead[]>();
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return await api.execute({
      method: 'GET',
      url: `/leads${params.toString() ? `?${params.toString()}` : ''}`,
    });
  },

  // Get a single lead by ID
  async getLead(id: string): Promise<Lead> {
    const api = useApi<Lead>();
    return await api.execute({
      method: 'GET',
      url: `/leads/${id}`,
    });
  },

  // Create a new lead
  async createLead(leadData: LeadFormData): Promise<Lead> {
    const api = useApi<Lead>();
    return await api.execute({
      method: 'POST',
      url: '/leads',
      data: {
        ...leadData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  // Update an existing lead
  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    const api = useApi<Lead>();
    return await api.execute({
      method: 'PUT',
      url: `/leads/${id}`,
      data: leadData,
    });
  },

  // Delete a lead
  async deleteLead(id: string): Promise<void> {
    const api = useApi<void>();
    return await api.execute({
      method: 'DELETE',
      url: `/leads/${id}`,
    });
  },

  // Get pipeline stages and leads
  async getPipeline(): Promise<{ stages: PipelineStage[]; leads: Lead[] }> {
    const api = useApi<{ stages: PipelineStage[]; leads: Lead[] }>();
    return await api.execute({
      method: 'GET',
      url: '/leads/pipeline',
    });
  },

  // Move lead between stages
  async moveLead(request: LeadMoveRequest): Promise<LeadMoveResponse> {
    const api = useApi<LeadMoveResponse>();
    return await api.execute({
      method: 'POST',
      url: '/leads/pipeline/move',
      data: request,
    });
  },

  // Bulk operations
  async bulkUpdateLeads(leadIds: string[], updates: Partial<Lead>): Promise<Lead[]> {
    const api = useApi<Lead[]>();
    return await api.execute({
      method: 'PUT',
      url: '/leads/bulk',
      data: { leadIds, updates },
    });
  },

  async bulkDeleteLeads(leadIds: string[]): Promise<void> {
    const api = useApi<void>();
    return await api.execute({
      method: 'DELETE',
      url: '/leads/bulk',
      data: { leadIds },
    });
  },

  // Import/Export operations
  async importLeads(file: File, options?: { updateExisting?: boolean; skipDuplicates?: boolean }): Promise<{ success: boolean; imported: number; errors: string[] }> {
    const api = useApi<{ success: boolean; imported: number; errors: string[] }>();
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.updateExisting) {
      formData.append('updateExisting', 'true');
    }
    if (options?.skipDuplicates) {
      formData.append('skipDuplicates', 'true');
    }

    return await api.execute({
      method: 'POST',
      url: '/leads/import',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async exportLeads(filters?: Record<string, any>, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const api = useApi<Blob>();
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    params.append('format', format);

    return await api.execute({
      method: 'GET',
      url: `/leads/export?${params.toString()}`,
      responseType: 'blob',
    });
  },
};
