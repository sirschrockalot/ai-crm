import { useState, useCallback } from 'react';
import { useApi } from '../useApi';
import { useAuth } from '../../contexts/AuthContext';
import { mockLeads, mockLeadAnalytics, mockLeadStatuses, mockPropertyTypes, mockCities, mockStates, mockLeadSources, mockCompanies, mockLeadScores, mockEstimatedValues, mockAssignedUsers, mockLeadStages, mockLeadActivities, mockLeadNotes, mockLeadTasks, mockLeadDocuments, mockLeadHistory } from '../../services/mockDataService';

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
  status?: Lead['status'] | '';
  propertyType?: Lead['propertyType'] | '';
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
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredLeads = [...mockLeads];

    if (filters) {
      if (filters.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
      }
      if (filters.propertyType) {
        filteredLeads = filteredLeads.filter(lead => lead.propertyType === filters.propertyType);
      }
      if (filters.city) {
        filteredLeads = filteredLeads.filter(lead => lead.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }
      if (filters.state) {
        filteredLeads = filteredLeads.filter(lead => lead.state === filters.state);
      }
      if (filters.minValue) {
        filteredLeads = filteredLeads.filter(lead => lead.estimatedValue >= filters.minValue!);
      }
      if (filters.maxValue) {
        filteredLeads = filteredLeads.filter(lead => lead.estimatedValue <= filters.maxValue!);
      }
    }

    setLeads(filteredLeads);
    return filteredLeads;
  }, [isAuthenticated]);

  const createLead = useCallback(async (leadData: CreateLeadData) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      ...leadData,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setLeads(prev => [...prev, newLead]);
    return newLead;
  }, [isAuthenticated]);

  const updateLead = useCallback(async (leadId: string, updateData: UpdateLeadData) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, ...updateData, updatedAt: new Date() }
        : lead
    ));

    const updatedLead = leads.find(lead => lead.id === leadId);
    if (updatedLead) {
      setCurrentLead({ ...updatedLead, ...updateData, updatedAt: new Date() });
    }

    return updatedLead;
  }, [isAuthenticated, leads]);

  const deleteLead = useCallback(async (leadId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    setLeads(prev => prev.filter(lead => lead.id !== leadId));
    if (currentLead?.id === leadId) {
      setCurrentLead(null);
    }

    return { success: true };
  }, [isAuthenticated, currentLead]);

  const bulkUpdateLeads = useCallback(async (leadIds: string[], updateData: Record<string, any>) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLeads(prev => prev.map(lead => 
      leadIds.includes(lead.id) 
        ? { ...lead, ...updateData, updatedAt: new Date() }
        : lead
    ));

    return { success: true, updatedCount: leadIds.length };
  }, [isAuthenticated]);

  const bulkDeleteLeads = useCallback(async (leadIds: string[]) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    setLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));
    if (currentLead && leadIds.includes(currentLead.id)) {
      setCurrentLead(null);
    }

    return { success: true, deletedCount: leadIds.length };
  }, [isAuthenticated, currentLead]);

  const importLeads = useCallback(async (file: File) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock import - in real app, this would parse the file
    const mockImportedLeads: Lead[] = [
      {
        id: `imported-${Date.now()}-1`,
        firstName: 'Imported',
        lastName: 'Lead 1',
        email: 'imported1@example.com',
        phone: '(555) 999-0001',
        address: '123 Imported Street',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        propertyType: 'single_family',
        estimatedValue: 400000,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `imported-${Date.now()}-2`,
        firstName: 'Imported',
        lastName: 'Lead 2',
        email: 'imported2@example.com',
        phone: '(555) 999-0002',
        address: '456 Imported Avenue',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        propertyType: 'multi_family',
        estimatedValue: 600000,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setLeads(prev => [...prev, ...mockImportedLeads]);
    return { success: true, importedCount: mockImportedLeads.length };
  }, [isAuthenticated]);

  const exportLeads = useCallback(async (filters?: LeadsFilters) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock export - in real app, this would generate a CSV/Excel file
    const exportData = leads.map(lead => ({
      'First Name': lead.firstName,
      'Last Name': lead.lastName,
      'Email': lead.email,
      'Phone': lead.phone,
      'Address': lead.address,
      'City': lead.city,
      'State': lead.state,
      'Zip Code': lead.zipCode,
      'Property Type': lead.propertyType,
      'Estimated Value': lead.estimatedValue,
      'Status': lead.status,
      'Created At': lead.createdAt.toISOString(),
    }));

    // Create and download CSV
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    return { success: true, exportedCount: exportData.length };
  }, [isAuthenticated, leads]);

  const getLeadStats = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockLeadAnalytics;
  }, [isAuthenticated]);

  const getLeadById = useCallback(async (leadId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setCurrentLead(lead);
    }
    return lead;
  }, [isAuthenticated, leads]);

  const getLeadActivities = useCallback(async (leadId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockLeadActivities.filter(activity => activity.leadId === leadId);
  }, [isAuthenticated]);

  const getLeadNotes = useCallback(async (leadId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockLeadNotes.filter(note => note.leadId === leadId);
  }, [isAuthenticated]);

  const getLeadTasks = useCallback(async (leadId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockLeadTasks.filter(task => task.leadId === leadId);
  }, [isAuthenticated]);

  const getLeadDocuments = useCallback(async (leadId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockLeadDocuments.filter(doc => doc.leadId === leadId);
  }, [isAuthenticated]);

  const getLeadHistory = useCallback(async (leadId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mockLeadHistory.filter(history => history.leadId === leadId);
  }, [isAuthenticated]);

  const getFilterOptions = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      statuses: mockLeadStatuses,
      propertyTypes: mockPropertyTypes,
      cities: mockCities,
      states: mockStates,
      sources: mockLeadSources,
      companies: mockCompanies,
      scores: mockLeadScores,
      values: mockEstimatedValues,
      assignedUsers: mockAssignedUsers,
      stages: mockLeadStages,
    };
  }, [isAuthenticated]);

  return {
    leads,
    loading: false, // Mock data doesn't have loading state
    error: null as string | null, // Mock data doesn't have error state
    isAuthenticated,
    user,
    currentLead,
    bulkOperation,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
    getLeadStats,
    getLeadById,
    getLeadActivities,
    getLeadNotes,
    getLeadTasks,
    getLeadDocuments,
    getLeadHistory,
    getFilterOptions,
  };
} 