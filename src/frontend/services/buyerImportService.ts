import { apiService } from './apiService';

export interface BuyerImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  defaultStatus?: boolean;
  fieldMapping?: Record<string, string>;
}

export interface BuyerImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors?: string[];
}

export interface BuyerExportOptions {
  format?: 'csv' | 'json';
  filters?: Record<string, any>;
  includeInactive?: boolean;
}

class BuyerImportService {
  private api = apiService;

  constructor() {
    // Interceptors are handled by the ApiService class
  }

  /**
   * Import buyers from CSV file
   */
  async importBuyers(
    file: File,
    options: BuyerImportOptions = {},
  ): Promise<BuyerImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add options to form data
      if (options.skipDuplicates !== undefined) {
        formData.append('skipDuplicates', options.skipDuplicates.toString());
      }
      if (options.updateExisting !== undefined) {
        formData.append('updateExisting', options.updateExisting.toString());
      }
      if (options.defaultStatus !== undefined) {
        formData.append('defaultStatus', options.defaultStatus.toString());
      }
      if (options.fieldMapping) {
        formData.append('fieldMapping', JSON.stringify(options.fieldMapping));
      }

      const response = await this.api.post('/api/buyers/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Buyer import failed:', error);
      throw error;
    }
  }

  /**
   * Export buyers to CSV file
   */
  async exportBuyers(options: BuyerExportOptions = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (options.format) {
        params.append('format', options.format);
      }
      if (options.includeInactive !== undefined) {
        params.append('includeInactive', options.includeInactive.toString());
      }
      if (options.filters) {
        params.append('filters', JSON.stringify(options.filters));
      }

      const response = await this.api.get(`/api/buyers/export?${params.toString()}`, {
        responseType: 'blob' as any,
      });

      return response.data;
    } catch (error) {
      console.error('Buyer export failed:', error);
      throw error;
    }
  }

  /**
   * Download buyer import template
   */
  async downloadTemplate(): Promise<Blob> {
    try {
      const response = await this.api.get('/api/buyers/template', {
        responseType: 'blob' as any,
      });

      return response.data;
    } catch (error) {
      console.error('Template download failed:', error);
      throw error;
    }
  }

  /**
   * Validate CSV file before import
   */
  async validateCSV(file: File): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    totalRows: number;
    preview: any[];
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('validateOnly', 'true');

      const response = await this.api.post('/api/buyers/validate-csv', formData, {
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
   * Get field mapping suggestions based on CSV headers
   */
  async getFieldMappingSuggestions(headers: string[]): Promise<Record<string, string>> {
    try {
      const response = await this.api.post('/api/buyers/field-mapping', {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Field mapping suggestions failed:', error);
      throw error;
    }
  }
}

export const buyerImportService = new BuyerImportService();
