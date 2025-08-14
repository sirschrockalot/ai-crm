import { useApi } from '../../../hooks/useApi';
import { Lead, LeadMoveRequest, LeadMoveResponse, PipelineStage, LeadFormData } from '../types/lead';
import { leadImportExportService, ImportOptions, ExportRequest } from './leadImportExportService';

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

  // Import/Export operations using the dedicated service
  async importLeads(
    file: File, 
    options?: ImportOptions,
    tenantId: string = 'default',
    userId: string = 'default'
  ): Promise<{ success: boolean; imported: number; errors: string[] }> {
    try {
      const result = await leadImportExportService.importLeads(file, options, tenantId, userId);
      
      // Poll for completion
      const finalResult = await leadImportExportService.pollImportProgress(
        result.importId,
        (progress) => {
          console.log('Import progress:', progress);
        }
      );

      return {
        success: finalResult.status === 'completed',
        imported: finalResult.successfulRows,
        errors: finalResult.errors.map(err => `${err.row}: ${err.message}`),
      };
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  },

  async exportLeads(filters?: Record<string, any>, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      // Convert filters to the expected format
      const exportRequest: ExportRequest = {
        filters: {
          status: filters?.status ? [filters.status] : undefined,
          priority: filters?.priority ? [filters.priority] : undefined,
          source: filters?.source ? [filters.source] : undefined,
          assignedTo: filters?.assignedTo,
          tags: filters?.tags ? [filters.tags] : undefined,
          dateFrom: filters?.dateFrom,
          dateTo: filters?.dateTo,
          minLeadScore: filters?.minLeadScore,
          maxLeadScore: filters?.maxLeadScore,
          searchTerm: filters?.search,
        },
        options: {
          format,
          includeHeaders: true,
          csvDelimiter: ',',
          includeEmptyFields: false,
        },
      };

      const result = await leadImportExportService.exportLeads(exportRequest);
      
      // Poll for completion
      const finalResult = await leadImportExportService.pollExportStatus(
        result.exportId,
        (progress) => {
          console.log('Export progress:', progress);
        }
      );

      if (finalResult.status === 'completed' && finalResult.downloadUrl) {
        return await leadImportExportService.downloadExport(finalResult.downloadUrl);
      } else {
        throw new Error(finalResult.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  // Additional import/export methods
  async validateImportFile(file: File) {
    return await leadImportExportService.validateFile(file);
  },

  async downloadImportTemplate(format: 'csv' | 'xlsx' = 'csv') {
    return await leadImportExportService.downloadTemplate(format);
  },

  async getImportProgress(importId: string) {
    return await leadImportExportService.getImportProgress(importId);
  },

  async getExportStatus(exportId: string) {
    return await leadImportExportService.getExportStatus(exportId);
  },
};
