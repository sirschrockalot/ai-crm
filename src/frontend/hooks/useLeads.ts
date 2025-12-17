import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { Lead, LeadStatus, PropertyType } from '../types';

export interface LeadFilters {
  status?: LeadStatus;
  propertyType?: PropertyType;
  assignedTo?: string;
  minValue?: number;
  maxValue?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadSortConfig {
  field: keyof Lead;
  direction: 'asc' | 'desc';
}

export interface LeadValidation {
  validIds: string[];
  invalidIds: string[];
  errors: string[];
}

export interface LeadImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [sortConfig, setSortConfig] = useState<LeadSortConfig>({
    field: 'createdAt',
    direction: 'desc',
  });

  const leadsApi = useApi<Lead[]>();
  const singleLeadApi = useApi<Lead>();
  const importApi = useApi<LeadImportResult>();
  const validationApi = useApi<LeadValidation>();

  // Fetch all leads
  const fetchLeads = useCallback(async (filters?: LeadFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await leadsApi.execute({
        method: 'GET',
        url: `/api/leads${params.toString() ? `?${params.toString()}` : ''}`,
      });

      setLeads(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(errorMessage);
      // Do not rethrow here to avoid unhandled promise rejections in effects
      return [];
    } finally {
      setLoading(false);
    }
  }, [leadsApi]);

  // Fetch single lead by ID
  const fetchLead = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await singleLeadApi.execute({
        method: 'GET',
        url: `/api/leads/${id}`,
      });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead';
      setError(errorMessage);
      // Return null on error instead of throwing to avoid unhandled rejections
      return null as any;
    }
  }, [singleLeadApi]);

  // Create new lead
  const createLead = useCallback(async (leadData: Partial<Lead>) => {
    try {
      setError(null);
      const response = await singleLeadApi.execute({
        method: 'POST',
        url: '/api/leads',
        data: leadData,
      });

      // Refresh leads list
      await fetchLeads(filters);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lead';
      setError(errorMessage);
      throw err;
    }
  }, [singleLeadApi, fetchLeads, filters]);

  // Update lead
  const updateLead = useCallback(async (id: string, leadData: Partial<Lead>) => {
    try {
      setError(null);
      const response = await singleLeadApi.execute({
        method: 'PUT',
        url: `/api/leads/${id}`,
        data: leadData,
      });

      // Refresh leads list
      await fetchLeads(filters);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead';
      setError(errorMessage);
      throw err;
    }
  }, [singleLeadApi, fetchLeads, filters]);

  // Delete lead
  const deleteLead = useCallback(async (id: string) => {
    try {
      setError(null);
      await singleLeadApi.execute({
        method: 'DELETE',
        url: `/api/leads/${id}`,
      });

      // Refresh leads list
      await fetchLeads(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(errorMessage);
      throw err;
    }
  }, [singleLeadApi, fetchLeads, filters]);

  // Bulk operations
  const bulkUpdateLeads = useCallback(async (ids: string[], updates: Partial<Lead>) => {
    try {
      setError(null);
      const response = await singleLeadApi.execute({
        method: 'PUT',
        url: '/api/leads/bulk',
        data: { ids, updates },
      });

      // Refresh leads list
      await fetchLeads(filters);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update leads';
      setError(errorMessage);
      throw err;
    }
  }, [singleLeadApi, fetchLeads, filters]);

  const bulkDeleteLeads = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      await singleLeadApi.execute({
        method: 'DELETE',
        url: '/api/leads/bulk',
        data: { ids },
      });

      // Refresh leads list
      await fetchLeads(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete leads';
      setError(errorMessage);
      throw err;
    }
  }, [singleLeadApi, fetchLeads, filters]);

  // Import/Export functionality
  const importLeads = useCallback(async (file: File): Promise<LeadImportResult> => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const response = await importApi.execute({
        method: 'POST',
        url: '/api/leads/import',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh leads list
      await fetchLeads(filters);
      return response as LeadImportResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import leads';
      setError(errorMessage);
      throw err;
    }
  }, [importApi, fetchLeads, filters]);

  const exportLeads = useCallback(async (filters?: LeadFilters, format: 'csv' | 'excel' = 'csv') => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await importApi.execute({
        method: 'GET',
        url: `/api/leads/export?${params.toString()}`,
      });

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export leads';
      setError(errorMessage);
      throw err;
    }
  }, [importApi]);

  // Validation
  const validateLeads = useCallback(async (leadData: Partial<Lead>[]) => {
    try {
      setError(null);
      const response = await validationApi.execute({
        method: 'POST',
        url: '/api/leads/validate',
        data: { leads: leadData },
      });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate leads';
      setError(errorMessage);
      throw err;
    }
  }, [validationApi]);

  // Filter and sort leads
  const filteredLeads = useCallback(() => {
    let filtered = [...leads];

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(lead => lead.propertyType === filters.propertyType);
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(lead => lead.assignedTo === filters.assignedTo);
    }
    if (filters.minValue) {
      filtered = filtered.filter(lead => lead.estimatedValue >= filters.minValue!);
    }
    if (filters.maxValue) {
      filtered = filtered.filter(lead => lead.estimatedValue <= filters.maxValue!);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.firstName.toLowerCase().includes(searchTerm) ||
        lead.lastName.toLowerCase().includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm) ||
        lead.phone.includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, filters, sortConfig]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<LeadFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update sort configuration
  const updateSortConfig = useCallback((field: keyof Lead, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get lead statistics
  const getLeadStats = useCallback(() => {
    const total = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    const qualified = leads.filter(lead => lead.status === 'qualified').length;
    const converted = leads.filter(lead => lead.status === 'converted').length;
    const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
    const avgValue = total > 0 ? totalValue / total : 0;

    return {
      total,
      newLeads,
      qualified,
      converted,
      totalValue,
      avgValue,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
    };
  }, [leads]);

  return {
    // Data
    leads,
    filteredLeads: filteredLeads(),
    loading: loading || leadsApi.loading || singleLeadApi.loading,
    error: error || leadsApi.error || singleLeadApi.error,
    filters,
    sortConfig,
    
    // Actions
    fetchLeads,
    fetchLead,
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
    validateLeads,
    
    // Filtering and sorting
    updateFilters,
    updateSortConfig,
    resetFilters,
    
    // Utilities
    getLeadStats,
    
    // Reset
    reset: () => {
      setLeads([]);
      setError(null);
      setFilters({});
      leadsApi.reset();
      singleLeadApi.reset();
    },
  };
} 