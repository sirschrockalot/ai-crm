import axios, { AxiosInstance } from 'axios';

// Types matching the backend DTOs
export interface ImportOptions {
  updateExisting?: boolean;
  skipDuplicates?: boolean;
  batchSize?: number;
  defaultSource?: string;
  defaultStatus?: string;
  defaultPriority?: string;
  defaultTags?: string[];
  fieldMapping?: FieldMapping[];
}

export interface FieldMapping {
  csvColumn: string;
  dbField: string;
}

export interface ImportResult {
  importId: string;
  totalRecords: number;
  successfulRows: number;
  failedRows: number;
  status: 'processing' | 'completed' | 'failed';
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface ExportRequest {
  filters: {
    status?: string[];
    priority?: string[];
    source?: string[];
    assignedTo?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    minLeadScore?: number;
    maxLeadScore?: number;
    searchTerm?: string;
  };
  options: {
    format: 'csv' | 'xlsx' | 'json';
    fields?: string[];
    includeHeaders?: boolean;
    csvDelimiter?: string;
    includeEmptyFields?: boolean;
    filename?: string;
  };
}

export interface ExportResult {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  downloadUrl?: string;
  error?: string;
}

export interface ValidationResult {
  totalRows: number;
  headers: string[];
  validation: {
    validRows: number;
    invalidRows: number;
    errors: Array<{
      row: number;
      field: string;
      value: string;
      message: string;
    }>;
  };
  sampleData: any[];
}

class LeadImportExportService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_LEAD_IMPORT_SERVICE_URL || 'http://localhost:3003';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Start importing leads from a file
   */
  async importLeads(
    file: File,
    options: ImportOptions = {},
    tenantId: string = 'default',
    userId: string = 'default'
  ): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    // Add options to form data
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'fieldMapping' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await this.api.post(
      `/leads/import-export/import?tenantId=${tenantId}&userId=${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Get import progress
   */
  async getImportProgress(importId: string): Promise<ImportResult | null> {
    try {
      const response = await this.api.get(`/leads/import-export/import/${importId}/progress`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Validate file structure without importing
   */
  async validateFile(file: File): Promise<ValidationResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post('/leads/import-export/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Download import template
   */
  async downloadTemplate(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await this.api.get(`/leads/import-export/template?format=${format}`, {
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Start exporting leads
   */
  async exportLeads(exportRequest: ExportRequest): Promise<ExportResult> {
    const response = await this.api.post('/leads/import-export/export', exportRequest);
    return response.data;
  }

  /**
   * Get export status
   */
  async getExportStatus(exportId: string): Promise<ExportResult> {
    const response = await this.api.get(`/leads/import-export/export/${exportId}/status`);
    return response.data;
  }

  /**
   * Download completed export
   */
  async downloadExport(downloadUrl: string): Promise<Blob> {
    const response = await this.api.get(downloadUrl, {
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Poll import progress until completion
   */
  async pollImportProgress(
    importId: string,
    onProgress?: (progress: ImportResult) => void,
    pollInterval: number = 2000
  ): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const progress = await this.getImportProgress(importId);
          
          if (!progress) {
            reject(new Error('Import not found'));
            return;
          }

          if (onProgress) {
            onProgress(progress);
          }

          if (progress.status === 'completed' || progress.status === 'failed') {
            resolve(progress);
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Poll export status until completion
   */
  async pollExportStatus(
    exportId: string,
    onProgress?: (progress: ExportResult) => void,
    pollInterval: number = 2000
  ): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const progress = await this.getExportStatus(exportId);
          
          if (onProgress) {
            onProgress(progress);
          }

          if (progress.status === 'completed' || progress.status === 'failed') {
            resolve(progress);
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

// Export singleton instance
export const leadImportExportService = new LeadImportExportService();
export default leadImportExportService;
