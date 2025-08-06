import { useState, useCallback } from 'react';
import { useApi } from '../useApi';

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
  const api = useApi<Lead[]>();
  const singleLeadApi = useApi<Lead>();
  const bulkApi = useApi<BulkOperationResult>();
  const statsApi = useApi<BulkOperationStats>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [bulkOperation, setBulkOperation] = useState<BulkOperationResult | null>(null);

  const fetchLeads = useCallback(async (filters?: LeadsFilters) => {
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
    });

    setLeads(response);
    return response;
  }, [api]);

  const fetchLead = useCallback(async (id: string) => {
    const response = await singleLeadApi.execute({
      method: 'GET',
      url: `/api/leads/${id}`,
    });

    setCurrentLead(response);
    return response;
  }, [singleLeadApi]);

  const createLead = useCallback(async (data: CreateLeadData) => {
    const response = await singleLeadApi.execute({
      method: 'POST',
      url: '/api/leads',
      data,
    });

    setLeads(prev => [...prev, response]);
    return response;
  }, [singleLeadApi]);

  const updateLead = useCallback(async (id: string, data: UpdateLeadData) => {
    const response = await singleLeadApi.execute({
      method: 'PUT',
      url: `/api/leads/${id}`,
      data,
    });

    setLeads(prev => prev.map(lead => lead.id === id ? response : lead));
    if (currentLead?.id === id) {
      setCurrentLead(response);
    }
    return response;
  }, [singleLeadApi, currentLead]);

  const deleteLead = useCallback(async (id: string) => {
    await singleLeadApi.execute({
      method: 'DELETE',
      url: `/api/leads/${id}`,
    });

    setLeads(prev => prev.filter(lead => lead.id !== id));
    if (currentLead?.id === id) {
      setCurrentLead(null);
    }
  }, [singleLeadApi, currentLead]);

  const updateLeadStatus = useCallback(async (id: string, status: Lead['status']) => {
    return updateLead(id, { status });
  }, [updateLead]);

  // Bulk operations
  const executeBulkOperation = useCallback(async (request: BulkOperationRequest) => {
    const response = await bulkApi.execute({
      method: 'POST',
      url: '/api/leads/bulk/execute',
      data: request,
    });

    setBulkOperation(response);
    return response;
  }, [bulkApi]);

  const bulkUpdate = useCallback(async (leadIds: string[], data: Record<string, any>) => {
    return executeBulkOperation({
      leadIds,
      operation: 'update',
      data,
    });
  }, [executeBulkOperation]);

  const bulkDelete = useCallback(async (leadIds: string[]) => {
    return executeBulkOperation({
      leadIds,
      operation: 'delete',
    });
  }, [executeBulkOperation]);

  const bulkAssign = useCallback(async (leadIds: string[], assignedTo: string) => {
    return executeBulkOperation({
      leadIds,
      operation: 'assign',
      data: { assignedTo },
    });
  }, [executeBulkOperation]);

  const bulkChangeStatus = useCallback(async (leadIds: string[], status: Lead['status']) => {
    return executeBulkOperation({
      leadIds,
      operation: 'changeStatus',
      data: { status },
    });
  }, [executeBulkOperation]);

  const bulkChangeStage = useCallback(async (leadIds: string[], stageId: string) => {
    return executeBulkOperation({
      leadIds,
      operation: 'changeStage',
      data: { stageId },
    });
  }, [executeBulkOperation]);

  const getBulkOperationStats = useCallback(async (leadIds: string[]) => {
    const params = new URLSearchParams();
    params.append('leadIds', leadIds.join(','));
    
    const response = await statsApi.execute({
      method: 'GET',
      url: `/api/leads/bulk/stats?${params.toString()}`,
    });

    return response;
  }, [statsApi]);

  const validateLeadIds = useCallback(async (leadIds: string[]) => {
    const params = new URLSearchParams();
    params.append('leadIds', leadIds.join(','));
    
    const response = await api.execute({
      method: 'GET',
      url: `/api/leads/bulk/validate?${params.toString()}`,
    });

    return response;
  }, [api]);

  return {
    leads,
    currentLead,
    bulkOperation,
    loading: api.loading || singleLeadApi.loading || bulkApi.loading || statsApi.loading,
    error: api.error || singleLeadApi.error || bulkApi.error || statsApi.error,
    fetchLeads,
    fetchLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    // Bulk operations
    executeBulkOperation,
    bulkUpdate,
    bulkDelete,
    bulkAssign,
    bulkChangeStatus,
    bulkChangeStage,
    getBulkOperationStats,
    validateLeadIds,
    reset: () => {
      api.reset();
      singleLeadApi.reset();
      bulkApi.reset();
      statsApi.reset();
    },
  };
} 