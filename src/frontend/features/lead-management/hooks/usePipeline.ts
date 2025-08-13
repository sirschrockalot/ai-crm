import { useState, useCallback, useEffect } from 'react';
import { leadService } from '../services/leadService';
import { Lead, PipelineStage, LeadMoveRequest, PipelineData } from '../types/lead';

export function usePipeline() {
  const [data, setData] = useState<PipelineData>({
    stages: [],
    leads: [],
    loading: false,
    error: null,
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchPipeline = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await leadService.getPipeline();
      setData({
        stages: result.stages,
        leads: result.leads,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pipeline',
      }));
    }
  }, []);

  const moveLead = useCallback(async (request: LeadMoveRequest) => {
    try {
      const response = await leadService.moveLead(request);
      if (response.success) {
        // Optimistically update the UI
        setData(prev => ({
          ...prev,
          leads: prev.leads.map(lead => 
            lead.id === request.leadId 
              ? { ...lead, status: response.lead.status }
              : lead
          ),
        }));
      }
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateStage = useCallback(async (stageId: string, updates: Partial<PipelineStage>) => {
    // This would typically call an API to update stage configuration
    setData(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      ),
    }));
  }, []);

  const selectLead = useCallback((lead: Lead | null) => {
    setSelectedLead(lead);
  }, []);

  // Auto-fetch pipeline on mount
  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  return {
    ...data,
    selectedLead,
    fetchPipeline,
    moveLead,
    updateStage,
    selectLead,
    refreshPipeline: fetchPipeline,
  };
}
