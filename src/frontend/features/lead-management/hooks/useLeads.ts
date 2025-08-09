import { useState, useCallback } from 'react';
import { leadService } from '../services/leadService';
import { Lead, LeadFormData } from '../types/lead';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const importLeads = useCallback(async (file: File, options?: { updateExisting?: boolean; skipDuplicates?: boolean }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await leadService.importLeads(file, options);
      if (result.success) {
        // Refresh leads after import
        await fetchLeads();
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import leads');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLeads]);

  const exportLeads = useCallback(async (filters?: Record<string, any>, format: 'csv' | 'json' = 'csv') => {
    try {
      const blob = await leadService.exportLeads(filters, format);
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export leads');
      throw err;
    }
  }, []);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
  };
}
