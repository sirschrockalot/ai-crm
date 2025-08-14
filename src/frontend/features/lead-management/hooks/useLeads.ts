import { useState, useCallback } from 'react';
import { leadService } from '../services/leadService';
import { Lead, LeadFormData } from '../types/lead';
import { ImportOptions, ExportRequest, ValidationResult } from '../services/leadImportExportService';

// Mock data for compatibility
const mockLeadStatuses = [
  { value: 'new', label: 'New', count: 0 },
  { value: 'contacted', label: 'Contacted', count: 0 },
  { value: 'qualified', label: 'Qualified', count: 0 },
  { value: 'converted', label: 'Converted', count: 0 },
  { value: 'lost', label: 'Lost', count: 0 },
];

const mockPropertyTypes = [
  { value: 'single_family', label: 'Single Family', count: 0 },
  { value: 'multi_family', label: 'Multi Family', count: 0 },
  { value: 'commercial', label: 'Commercial', count: 0 },
  { value: 'land', label: 'Land', count: 0 },
];

const mockCities = [
  { value: 'Austin', label: 'Austin', count: 0 },
  { value: 'Dallas', label: 'Dallas', count: 0 },
  { value: 'Houston', label: 'Houston', count: 0 },
  { value: 'San Antonio', label: 'San Antonio', count: 0 },
];

const mockStates = [
  { value: 'TX', label: 'Texas', count: 0 },
  { value: 'CA', label: 'California', count: 0 },
  { value: 'FL', label: 'Florida', count: 0 },
  { value: 'NY', label: 'New York', count: 0 },
];

export interface ImportProgress {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  percentage: number;
  message: string;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
}

export interface ExportProgress {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  percentage: number;
  message: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    status: 'idle',
    percentage: 0,
    message: 'Ready to import',
    currentStep: 'Ready',
    totalSteps: 1,
    currentStepNumber: 0,
  });
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    status: 'idle',
    percentage: 0,
    message: 'Ready to export',
  });

  // Mock authentication state for compatibility
  const isAuthenticated = true; // In real app, this would come from auth context

  const fetchLeads = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await leadService.getLeads(filters);
      setLeads(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = useCallback(async (leadData: LeadFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newLead = await leadService.createLead(leadData);
      setLeads(prev => [...prev, newLead]);
      return newLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedLead = await leadService.updateLead(id, {
        ...updates,
        updatedAt: new Date(),
      });
      setLeads(prev => prev.map(lead => 
        lead.id === id ? updatedLead : lead
      ));
      return updatedLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await leadService.deleteLead(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateLeads = useCallback(async (leadIds: string[], updates: Partial<Lead>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedLeads = await leadService.bulkUpdateLeads(leadIds, updates);
      setLeads(prev => prev.map(lead => {
        const updatedLead = updatedLeads.find(u => u.id === lead.id);
        return updatedLead || lead;
      }));
      return updatedLeads;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update leads');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteLeads = useCallback(async (leadIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await leadService.bulkDeleteLeads(leadIds);
      setLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk delete leads');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const importLeads = useCallback(async (
    file: File, 
    options?: ImportOptions,
    tenantId: string = 'default',
    userId: string = 'default'
  ) => {
    setError(null);
    setImportProgress({
      status: 'processing',
      percentage: 0,
      message: 'Starting import...',
      currentStep: 'Uploading file',
      totalSteps: 4,
      currentStepNumber: 1,
    });
    
    try {
      const result = await leadService.importLeads(file, options, tenantId, userId);
      
      if (result.success) {
        setImportProgress({
          status: 'completed',
          percentage: 100,
          message: `Successfully imported ${result.imported} leads`,
          currentStep: 'Import completed',
          totalSteps: 4,
          currentStepNumber: 4,
        });
        
        // Refresh leads after import
        await fetchLeads();
      } else {
        setImportProgress({
          status: 'failed',
          percentage: 100,
          message: `Import completed with ${result.errors.length} errors`,
          currentStep: 'Import failed',
          totalSteps: 4,
          currentStepNumber: 4,
        });
      }
      
      return result;
    } catch (err) {
      setImportProgress({
        status: 'failed',
        percentage: 100,
        message: 'Import failed',
        currentStep: 'Import failed',
        totalSteps: 4,
        currentStepNumber: 4,
      });
      setError(err instanceof Error ? err.message : 'Failed to import leads');
      throw err;
    }
  }, [fetchLeads]);

  const exportLeads = useCallback(async (
    filters?: Record<string, any>, 
    format: 'csv' | 'json' | 'xlsx' = 'csv'
  ) => {
    setError(null);
    setExportProgress({
      status: 'processing',
      percentage: 0,
      message: 'Starting export...',
    });
    
    try {
      const blob = await leadService.exportLeads(filters, format);
      
      setExportProgress({
        status: 'completed',
        percentage: 100,
        message: 'Export completed successfully',
      });
      
      return blob;
    } catch (err) {
      setExportProgress({
        status: 'failed',
        percentage: 100,
        message: 'Export failed',
      });
      setError(err instanceof Error ? err.message : 'Failed to export leads');
      throw err;
    }
  }, []);

  // Mock methods for compatibility
  const getLeadStats = useCallback(async (): Promise<{
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    conversionRate: number;
    totalPipelineValue: number;
    averageLeadValue: number;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalLeads: leads.length,
      newLeads: leads.filter(lead => lead.status === 'new').length,
      qualifiedLeads: leads.filter(lead => lead.status === 'qualified').length,
      convertedLeads: leads.filter(lead => lead.status === 'converted').length,
      conversionRate: leads.length > 0 ? 
        (leads.filter(lead => lead.status === 'converted').length / leads.length) * 100 : 0,
      totalPipelineValue: leads.reduce((sum, lead) => sum + lead.estimatedValue, 0),
      averageLeadValue: leads.length > 0 ? 
        leads.reduce((sum, lead) => sum + lead.estimatedValue, 0) / leads.length : 0,
    };
  }, [leads]);

  const getFilterOptions = useCallback(async (): Promise<{
    statuses: Array<{ value: string; label: string; count: number }>;
    propertyTypes: Array<{ value: string; label: string; count: number }>;
    cities: Array<{ value: string; label: string; count: number }>;
    states: Array<{ value: string; label: string; count: number }>;
    sources: any[];
    companies: any[];
    scores: any[];
    values: any[];
    assignedUsers: any[];
    stages: any[];
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      statuses: mockLeadStatuses,
      propertyTypes: mockPropertyTypes,
      cities: mockCities,
      states: mockStates,
      sources: [],
      companies: [],
      scores: [],
      values: [],
      assignedUsers: [],
      stages: [],
    };
  }, []);

  // Additional import/export methods
  const validateImportFile = useCallback(async (file: File): Promise<ValidationResult> => {
    setError(null);
    try {
      return await leadService.validateImportFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate file');
      throw err;
    }
  }, []);

  const downloadImportTemplate = useCallback(async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    setError(null);
    try {
      return await leadService.downloadImportTemplate(format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template');
      throw err;
    }
  }, []);

  const resetImportProgress = useCallback(() => {
    setImportProgress({
      status: 'idle',
      percentage: 0,
      message: 'Ready to import',
      currentStep: 'Ready',
      totalSteps: 1,
      currentStepNumber: 0,
    });
  }, []);

  const resetExportProgress = useCallback(() => {
    setExportProgress({
      status: 'idle',
      percentage: 0,
      message: 'Ready to export',
    });
  }, []);

  return {
    leads,
    loading,
    error,
    isAuthenticated,
    importProgress,
    exportProgress,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
    getLeadStats,
    getFilterOptions,
    validateImportFile,
    downloadImportTemplate,
    resetImportProgress,
    resetExportProgress,
  };
}
