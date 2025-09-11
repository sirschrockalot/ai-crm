import axios from 'axios';
import { Lead } from '../types/pipeline';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ImportOptions {
  updateExisting?: boolean;
  skipDuplicates?: boolean;
  fieldMapping?: Record<string, string>;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ExportOptions {
  fields?: string[];
  filters?: Record<string, any>;
  format?: 'csv' | 'excel';
}

export interface BulkOperationRequest {
  leadIds: string[];
  operation: 'update' | 'delete' | 'assign' | 'changeStatus' | 'changeStage';
  data?: Record<string, any>;
}

export interface BulkOperationResult {
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors: BulkOperationError[];
  warnings: string[];
}

export interface BulkOperationError {
  leadId: string;
  operation: string;
  message: string;
  data?: any;
}

class ImportExportService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Import leads from CSV file
   */
  async importLeads(
    file: File,
    options: ImportOptions = {},
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add options to form data
      if (options.updateExisting) {
        formData.append('updateExisting', 'true');
      }
      if (options.skipDuplicates) {
        formData.append('skipDuplicates', 'true');
      }
      if (options.fieldMapping) {
        formData.append('fieldMapping', JSON.stringify(options.fieldMapping));
      }

      const response = await this.api.post('/leads/import-export/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  /**
   * Export leads to CSV file
   */
  async exportLeads(options: ExportOptions = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (options.fields) {
        params.append('fields', options.fields.join(','));
      }
      if (options.filters) {
        params.append('filters', JSON.stringify(options.filters));
      }
      if (options.format) {
        params.append('format', options.format);
      }

      const response = await this.api.get(`/leads/import-export/export?${params}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Get import template
   */
  async getImportTemplate(): Promise<Blob> {
    try {
      const response = await this.api.get('/leads/import-export/template', {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get import template:', error);
      throw error;
    }
  }

  /**
   * Validate CSV file structure
   */
  async validateCsvFile(file: File): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post('/leads/import-export/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('CSV validation failed:', error);
      throw error;
    }
  }

  /**
   * Execute bulk operation
   */
  async executeBulkOperation(request: BulkOperationRequest): Promise<BulkOperationResult> {
    try {
      const response = await this.api.post('/leads/bulk/execute', request);
      return response.data;
    } catch (error) {
      console.error('Bulk operation failed:', error);
      throw error;
    }
  }

  /**
   * Get bulk operation statistics
   */
  async getBulkOperationStats(leadIds: string[]): Promise<{
    totalLeads: number;
    validLeads: number;
    invalidLeads: number;
    leadStatuses: Record<string, number>;
    leadStages: Record<string, number>;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('leadIds', leadIds.join(','));

      const response = await this.api.get(`/leads/bulk/stats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get bulk operation stats:', error);
      throw error;
    }
  }

  /**
   * Validate lead IDs for bulk operations
   */
  async validateLeadIds(leadIds: string[]): Promise<{
    validIds: string[];
    invalidIds: string[];
    totalIds: number;
    validCount: number;
    invalidCount: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('leadIds', leadIds.join(','));

      const response = await this.api.get(`/leads/bulk/validate?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to validate lead IDs:', error);
      throw error;
    }
  }

  /**
   * Bulk update leads
   */
  async bulkUpdate(leadIds: string[], data: Record<string, any>): Promise<BulkOperationResult> {
    try {
      const response = await this.api.post('/leads/bulk/update', {
        leadIds,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Bulk update failed:', error);
      throw error;
    }
  }

  /**
   * Bulk delete leads
   */
  async bulkDelete(leadIds: string[]): Promise<BulkOperationResult> {
    try {
      const response = await this.api.post('/leads/bulk/delete', {
        leadIds,
      });
      return response.data;
    } catch (error) {
      console.error('Bulk delete failed:', error);
      throw error;
    }
  }

  /**
   * Bulk assign leads
   */
  async bulkAssign(leadIds: string[], assignedTo: string): Promise<BulkOperationResult> {
    try {
      const response = await this.api.post('/leads/bulk/assign', {
        leadIds,
        assignedTo,
      });
      return response.data;
    } catch (error) {
      console.error('Bulk assign failed:', error);
      throw error;
    }
  }

  /**
   * Bulk change lead status
   */
  async bulkChangeStatus(leadIds: string[], status: string): Promise<BulkOperationResult> {
    try {
      const response = await this.api.post('/leads/bulk/change-status', {
        leadIds,
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Bulk status change failed:', error);
      throw error;
    }
  }

  /**
   * Bulk change lead stage
   */
  async bulkChangeStage(leadIds: string[], stageId: string): Promise<BulkOperationResult> {
    try {
      const response = await this.api.post('/leads/bulk/change-stage', {
        leadIds,
        stageId,
      });
      return response.data;
    } catch (error) {
      console.error('Bulk stage change failed:', error);
      throw error;
    }
  }

  /**
   * Download file from blob
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const importExportService = new ImportExportService();
export default importExportService; 