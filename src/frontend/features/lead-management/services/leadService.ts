import { Lead, LeadMoveRequest, LeadMoveResponse, PipelineStage, LeadFormData } from '../types/lead';
import { leadImportExportService, ImportOptions, ExportRequest } from './leadImportExportService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Mock data for development/testing
const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    propertyType: 'single_family',
    estimatedValue: 350000,
    status: 'contacted',
    notes: 'Owner is very motivated to sell quickly. Mentioned they\'re relocating for work and need to close by end of January. This could be a great opportunity for a quick flip.',
    source: 'Direct Mail Campaign',
    company: 'Smith Properties LLC',
    score: 85,
    assignedTo: 'Sarah Johnson',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Williams',
    email: 'jane.williams@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Avenue',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    propertyType: 'multi_family',
    estimatedValue: 500000,
    status: 'qualified',
    notes: 'Looking for investment properties. Property is in good condition overall. Minor cosmetic updates needed but nothing major. Perfect for our buyer pool.',
    source: 'Referral',
    company: 'Williams Investment Group',
    score: 92,
    assignedTo: 'Mike Rodriguez',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    phone: '(555) 456-7890',
    address: '789 Pine Street',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    propertyType: 'single_family',
    estimatedValue: 280000,
    status: 'new',
    notes: 'First-time seller, needs guidance through the process. Property needs some updates but has good bones.',
    source: 'Online Lead',
    company: 'Johnson Family Trust',
    score: 78,
    assignedTo: 'Sarah Johnson',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@example.com',
    phone: '(555) 321-0987',
    address: '321 Elm Drive',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78201',
    propertyType: 'commercial',
    estimatedValue: 750000,
    status: 'converted',
    notes: 'Commercial property owner looking to downsize. Property is well-maintained and in a prime location.',
    source: 'Cold Call',
    company: 'Garcia Commercial LLC',
    score: 95,
    assignedTo: 'David Chen',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    phone: '(555) 654-3210',
    address: '654 Maple Lane',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    propertyType: 'single_family',
    estimatedValue: 420000,
    status: 'contacted',
    notes: 'Retirement sale. Owner moving to Florida. Property is in excellent condition with recent updates.',
    source: 'Direct Mail Campaign',
    company: 'Brown Family Trust',
    score: 88,
    assignedTo: 'Sarah Johnson',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '6',
    firstName: 'Lisa',
    lastName: 'Davis',
    email: 'lisa.davis@example.com',
    phone: '(555) 789-0123',
    address: '987 Cedar Court',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75202',
    propertyType: 'multi_family',
    estimatedValue: 650000,
    status: 'qualified',
    notes: 'Investment property owner looking to liquidate portfolio. Multiple units, good rental history.',
    source: 'Referral',
    company: 'Davis Investment Properties',
    score: 90,
    assignedTo: 'Mike Rodriguez',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '7',
    firstName: 'Michael',
    lastName: 'Wilson',
    email: 'michael.wilson@example.com',
    phone: '(555) 234-5678',
    address: '147 Birch Street',
    city: 'Houston',
    state: 'TX',
    zipCode: '77002',
    propertyType: 'single_family',
    estimatedValue: 320000,
    status: 'new',
    notes: 'Divorce sale. Needs quick closing. Property is in good condition but needs some cosmetic updates.',
    source: 'Online Lead',
    company: 'Wilson Family Trust',
    score: 82,
    assignedTo: 'David Chen',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: '8',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@example.com',
    phone: '(555) 345-6789',
    address: '258 Spruce Avenue',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78202',
    propertyType: 'land',
    estimatedValue: 150000,
    status: 'lost',
    notes: 'Land sale. Owner decided to hold onto property for future development. May reconsider in 6 months.',
    source: 'Cold Call',
    company: 'Martinez Land Holdings',
    score: 65,
    assignedTo: 'Sarah Johnson',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '9',
    firstName: 'Christopher',
    lastName: 'Anderson',
    email: 'chris.anderson@example.com',
    phone: '(555) 456-7890',
    address: '369 Walnut Drive',
    city: 'Austin',
    state: 'TX',
    zipCode: '78703',
    propertyType: 'single_family',
    estimatedValue: 480000,
    status: 'contacted',
    notes: 'Tech professional relocating to Seattle. Property is modern with smart home features. High-end finishes.',
    source: 'Direct Mail Campaign',
    company: 'Anderson Tech LLC',
    score: 91,
    assignedTo: 'Mike Rodriguez',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '10',
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'amanda.taylor@example.com',
    phone: '(555) 567-8901',
    address: '741 Hickory Lane',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75203',
    propertyType: 'multi_family',
    estimatedValue: 580000,
    status: 'qualified',
    notes: 'Real estate investor looking to exit market. Property has good cash flow but wants to liquidate for other investments.',
    source: 'Referral',
    company: 'Taylor Investment Group',
    score: 89,
    assignedTo: 'David Chen',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-17'),
  },
];

// Helper function to make API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // In development/test mode, return mock data based on endpoint
    console.warn('API call failed, using mock data:', error);
    
    // Handle different endpoints
    if (endpoint.includes('/leads/') && !endpoint.includes('/leads?')) {
      // Individual lead lookup
      const leadId = endpoint.split('/leads/')[1];
      const lead = mockLeads.find(l => l.id === leadId);
      if (lead) {
        return lead as unknown as T;
      } else {
        throw new Error(`Lead with ID ${leadId} not found`);
      }
    } else if (endpoint === '/leads' || endpoint.startsWith('/leads?')) {
      // All leads or filtered leads
      return mockLeads as unknown as T;
    } else if (endpoint === '/leads/pipeline') {
      // Pipeline data
      return {
        stages: [
          { id: '1', name: 'New', position: 1, color: 'blue' },
          { id: '2', name: 'Contacted', position: 2, color: 'yellow' },
          { id: '3', name: 'Qualified', position: 3, color: 'orange' },
          { id: '4', name: 'Converted', position: 4, color: 'green' },
          { id: '5', name: 'Lost', position: 5, color: 'red' },
        ],
        leads: mockLeads
      } as unknown as T;
    }
    
    // Default fallback
    return mockLeads as unknown as T;
  }
}

export const leadService = {
  // Get all leads with optional filtering
  async getLeads(filters?: Record<string, any>): Promise<Lead[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return await apiCall<Lead[]>(`/leads${params.toString() ? `?${params.toString()}` : ''}`);
  },

  // Get a single lead by ID
  async getLead(id: string): Promise<Lead> {
    return await apiCall<Lead>(`/leads/${id}`);
  },

  // Create a new lead
  async createLead(leadData: LeadFormData): Promise<Lead> {
    return await apiCall<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify({
        ...leadData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });
  },

  // Update an existing lead
  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    return await apiCall<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  },

  // Delete a lead
  async deleteLead(id: string): Promise<void> {
    return await apiCall<void>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Get pipeline stages and leads
  async getPipeline(): Promise<{ stages: PipelineStage[]; leads: Lead[] }> {
    return await apiCall<{ stages: PipelineStage[]; leads: Lead[] }>('/leads/pipeline');
  },

  // Move lead between stages
  async moveLead(request: LeadMoveRequest): Promise<LeadMoveResponse> {
    return await apiCall<LeadMoveResponse>('/leads/pipeline/move', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Bulk operations
  async bulkUpdateLeads(leadIds: string[], updates: Partial<Lead>): Promise<Lead[]> {
    return await apiCall<Lead[]>('/leads/bulk', {
      method: 'PUT',
      body: JSON.stringify({ leadIds, updates }),
    });
  },

  async bulkDeleteLeads(leadIds: string[]): Promise<void> {
    return await apiCall<void>('/leads/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ leadIds }),
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
