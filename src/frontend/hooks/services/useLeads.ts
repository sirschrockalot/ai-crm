import { useState, useCallback } from 'react';
import { useApi } from '../useApi';
import { useAuth } from '../useAuth';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'single_family' | 'multi_family' | 'commercial' | 'land';
  estimatedValue: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'single_family' | 'multi_family' | 'commercial' | 'land';
  estimatedValue: number;
  notes?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: Lead['status'];
}

export interface LeadsFilters {
  status?: Lead['status'];
  propertyType?: Lead['propertyType'];
  city?: string;
  state?: string;
  minValue?: number;
  maxValue?: number;
}

export interface BulkOperationRequest {
  leadIds: string[];
  operation: 'update' | 'delete' | 'assign' | 'changeStatus' | 'changeStage';
  data?: Record<string, any>;
}

export interface BulkOperationResult {
  operationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors: any[];
  warnings: string[];
}

export interface BulkOperationStats {
  totalLeads: number;
  validLeads: number;
  invalidLeads: number;
  leadStatuses: Record<string, number>;
  leadStages: Record<string, number>;
}

export function useLeads() {
  const { isAuthenticated, user } = useAuth();
  const api = useApi<Lead[]>();
  const singleLeadApi = useApi<Lead>();
  const bulkApi = useApi<BulkOperationResult>();
  const statsApi = useApi<BulkOperationStats>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [bulkOperation, setBulkOperation] = useState<BulkOperationResult | null>(null);

  // Get authentication headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchLeads = useCallback(async (filters?: LeadsFilters) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.execute({
      method: 'GET',
      url: `/api/leads${params.toString() ? `?${params.toString()}` : ''}`,
      headers: getAuthHeaders(),
    });

    setLeads(response);
    return response;
  }, [api, isAuthenticated, getAuthHeaders]);

  const fetchLead = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await singleLeadApi.execute({
      method: 'GET',
      url: `/api/leads/${id}`,
      headers: getAuthHeaders(),
    });

    setCurrentLead(response);
    return response;
  }, [singleLeadApi, isAuthenticated, getAuthHeaders]);

  const createLead = useCallback(async (data: CreateLeadData) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await singleLeadApi.execute({
      method: 'POST',
      url: '/api/leads',
      data,
      headers: getAuthHeaders(),
    });

    setLeads(prev => [...prev, response]);
    return response;
  }, [singleLeadApi, isAuthenticated, getAuthHeaders]);

  const updateLead = useCallback(async (id: string, data: UpdateLeadData) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await singleLeadApi.execute({
      method: 'PUT',
      url: `/api/leads/${id}`,
      data,
      headers: getAuthHeaders(),
    });

    setLeads(prev => prev.map(lead => lead.id === id ? response : lead));
    if (currentLead?.id === id) {
      setCurrentLead(response);
    }
    return response;
  }, [singleLeadApi, currentLead, isAuthenticated, getAuthHeaders]);

  const deleteLead = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    await singleLeadApi.execute({
      method: 'DELETE',
      url: `/api/leads/${id}`,
      headers: getAuthHeaders(),
    });

    setLeads(prev => prev.filter(lead => lead.id !== id));
    if (currentLead?.id === id) {
      setCurrentLead(null);
    }
  }, [singleLeadApi, currentLead, isAuthenticated, getAuthHeaders]);

  const updateLeadStatus = useCallback(async (id: string, status: Lead['status']) => {
    return updateLead(id, { status });
  }, [updateLead]);

  const bulkUpdateLeads = useCallback(async (leadIds: string[], updates: Partial<Lead>) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await bulkApi.execute({
      method: 'POST',
      url: '/api/leads/bulk-update',
      data: {
        leadIds,
        operation: 'update',
        data: updates,
      },
      headers: getAuthHeaders(),
    });

    setBulkOperation(response);
    return response;
  }, [bulkApi, isAuthenticated, getAuthHeaders]);

  const bulkDeleteLeads = useCallback(async (leadIds: string[]) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await bulkApi.execute({
      method: 'POST',
      url: '/api/leads/bulk-delete',
      data: {
        leadIds,
        operation: 'delete',
      },
      headers: getAuthHeaders(),
    });

    setBulkOperation(response);
    return response;
  }, [bulkApi, isAuthenticated, getAuthHeaders]);

  const importLeads = useCallback(async (file: File): Promise<{ imported: number; failed: number }> => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.execute({
      method: 'POST',
      url: '/api/leads/import',
      data: formData,
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    // Refresh leads after import
    await fetchLeads();
    return response as { imported: number; failed: number };
  }, [api, isAuthenticated, getAuthHeaders, fetchLeads]);

  const exportLeads = useCallback(async (filters?: LeadsFilters) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.execute({
      method: 'GET',
      url: `/api/leads/export${params.toString() ? `?${params.toString()}` : ''}`,
      headers: {
        ...getAuthHeaders(),
        'Accept': 'application/octet-stream',
      },
    });

    return response;
  }, [api, isAuthenticated, getAuthHeaders]);

  const getLeadStats = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await statsApi.execute({
      method: 'GET',
      url: '/api/leads/stats',
      headers: getAuthHeaders(),
    });

    return response;
  }, [statsApi, isAuthenticated, getAuthHeaders]);

  return {
    // Data
    leads,
    currentLead,
    bulkOperation,
    
    // Loading states from shared API hooks
    loading: api.loading || singleLeadApi.loading || bulkApi.loading || statsApi.loading,
    error: api.error || singleLeadApi.error || bulkApi.error || statsApi.error,
    
    // Authentication state
    isAuthenticated,
    user,
    
    // Actions
    fetchLeads,
    fetchLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
    getLeadStats,
    
    // Reset functions
    reset: () => {
      api.reset();
      singleLeadApi.reset();
      bulkApi.reset();
      statsApi.reset();
      setLeads([]);
      setCurrentLead(null);
      setBulkOperation(null);
    },
  };
} 