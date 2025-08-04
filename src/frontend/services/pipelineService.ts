import axios from 'axios';
import {
  Lead,
  PipelineStage,
  Pipeline,
  PipelineAnalytics,
  LeadMoveRequest,
  LeadMoveResponse,
  PipelineAnalyticsRequest,
  PipelineAnalyticsResponse,
} from '../types/pipeline';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class PipelineService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include auth token
  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Fetch pipeline stages
  async getPipelineStages(tenantId: string): Promise<PipelineStage[]> {
    try {
      const response = await this.api.get(`/pipeline/stages?tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline stages:', error);
      throw error;
    }
  }

  // Fetch leads for a specific stage
  async getLeadsForStage(stageId: string, tenantId: string): Promise<Lead[]> {
    try {
      const response = await this.api.get(`/leads?stageId=${stageId}&tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leads for stage:', error);
      throw error;
    }
  }

  // Fetch all leads for pipeline
  async getAllLeads(tenantId: string): Promise<Lead[]> {
    try {
      const response = await this.api.get(`/leads?tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all leads:', error);
      throw error;
    }
  }

  // Move lead between stages
  async moveLead(request: LeadMoveRequest): Promise<LeadMoveResponse> {
    try {
      const response = await this.api.post('/pipeline/move-lead', request);
      return response.data;
    } catch (error) {
      console.error('Error moving lead:', error);
      throw error;
    }
  }

  // Create new stage
  async createStage(stage: Partial<PipelineStage>): Promise<PipelineStage> {
    try {
      const response = await this.api.post('/pipeline/stages', stage);
      return response.data;
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  }

  // Update stage
  async updateStage(stageId: string, updates: Partial<PipelineStage>): Promise<PipelineStage> {
    try {
      const response = await this.api.patch(`/pipeline/stages/${stageId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating stage:', error);
      throw error;
    }
  }

  // Delete stage
  async deleteStage(stageId: string): Promise<void> {
    try {
      await this.api.delete(`/pipeline/stages/${stageId}`);
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  }

  // Get pipeline analytics
  async getPipelineAnalytics(request: PipelineAnalyticsRequest): Promise<PipelineAnalyticsResponse> {
    try {
      const response = await this.api.post('/pipeline/analytics', request);
      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline analytics:', error);
      throw error;
    }
  }

  // Get pipeline settings
  async getPipelineSettings(tenantId: string): Promise<any> {
    try {
      const response = await this.api.get(`/pipeline/settings?tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline settings:', error);
      throw error;
    }
  }

  // Update pipeline settings
  async updatePipelineSettings(tenantId: string, settings: any): Promise<any> {
    try {
      const response = await this.api.patch(`/pipeline/settings?tenantId=${tenantId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating pipeline settings:', error);
      throw error;
    }
  }

  // Create new lead
  async createLead(lead: Partial<Lead>): Promise<Lead> {
    try {
      const response = await this.api.post('/leads', lead);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  // Update lead
  async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    try {
      const response = await this.api.patch(`/leads/${leadId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  // Delete lead
  async deleteLead(leadId: string): Promise<void> {
    try {
      await this.api.delete(`/leads/${leadId}`);
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Get lead details
  async getLead(leadId: string): Promise<Lead> {
    try {
      const response = await this.api.get(`/leads/${leadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  }

  // Search leads
  async searchLeads(query: string, tenantId: string): Promise<Lead[]> {
    try {
      const response = await this.api.get(`/leads/search?q=${encodeURIComponent(query)}&tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      console.error('Error searching leads:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkMoveLeads(leadIds: string[], toStageId: string, tenantId: string): Promise<LeadMoveResponse[]> {
    try {
      const response = await this.api.post('/pipeline/bulk-move-leads', {
        leadIds,
        toStageId,
        tenantId,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk moving leads:', error);
      throw error;
    }
  }

  // Export pipeline data
  async exportPipelineData(pipelineId: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await this.api.get(`/pipeline/${pipelineId}/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting pipeline data:', error);
      throw error;
    }
  }
}

export const pipelineService = new PipelineService();
export default pipelineService; 