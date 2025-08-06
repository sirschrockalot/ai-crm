import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { PipelineLead, PipelineStage } from '../components/pipeline';

export interface PipelineData {
  stages: PipelineStage[];
  totalLeads: number;
  totalValue: number;
  conversionRate: number;
}

export interface MoveLeadRequest {
  leadId: string;
  fromStageId: string;
  toStageId: string;
}

export interface UpdateStatusRequest {
  leadId: string;
  newStatus: string;
}

export function usePipeline() {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pipelineApi = useApi<PipelineData>();
  const moveApi = useApi<any>();
  const statusApi = useApi<any>();

  // Fetch pipeline data
  const fetchPipelineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await pipelineApi.execute('GET', '/api/leads/pipeline');
      
      if (response.success) {
        setPipelineData(response.data);
      } else {
        setError(response.message || 'Failed to fetch pipeline data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pipelineApi]);

  // Move lead between stages
  const moveLead = useCallback(async (request: MoveLeadRequest) => {
    try {
      setError(null);
      
      const response = await moveApi.execute('PUT', '/api/leads/pipeline/move', request);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to move lead');
      }
      
      // Refresh pipeline data after successful move
      await fetchPipelineData();
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [moveApi, fetchPipelineData]);

  // Update lead status
  const updateLeadStatus = useCallback(async (request: UpdateStatusRequest) => {
    try {
      setError(null);
      
      const response = await statusApi.execute('PUT', `/api/leads/${request.leadId}/status`, {
        status: request.newStatus,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update lead status');
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [statusApi]);

  // Get stage by ID
  const getStageById = useCallback((stageId: string) => {
    return pipelineData?.stages.find(stage => stage.id === stageId);
  }, [pipelineData]);

  // Get lead by ID
  const getLeadById = useCallback((leadId: string) => {
    for (const stage of pipelineData?.stages || []) {
      const lead = stage.leads.find(l => l.id === leadId);
      if (lead) return lead;
    }
    return null;
  }, [pipelineData]);

  // Calculate pipeline statistics
  const getPipelineStats = useCallback(() => {
    if (!pipelineData) return null;

    const totalLeads = pipelineData.stages.reduce((sum, stage) => sum + stage.leads.length, 0);
    const totalValue = pipelineData.stages.reduce((sum, stage) => {
      return sum + stage.leads.reduce((leadSum, lead) => leadSum + lead.estimatedValue, 0);
    }, 0);

    const convertedLeads = pipelineData.stages
      .filter(stage => stage.name.toLowerCase().includes('converted'))
      .reduce((sum, stage) => sum + stage.leads.length, 0);

    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      totalValue,
      conversionRate,
      stageCount: pipelineData.stages.length,
    };
  }, [pipelineData]);

  // Filter leads by criteria
  const filterLeads = useCallback((criteria: {
    status?: string;
    propertyType?: string;
    assignedAgent?: string;
    minValue?: number;
    maxValue?: number;
  }) => {
    if (!pipelineData) return [];

    const filteredLeads: PipelineLead[] = [];

    for (const stage of pipelineData.stages) {
      for (const lead of stage.leads) {
        let matches = true;

        if (criteria.status && lead.status !== criteria.status) {
          matches = false;
        }

        if (criteria.propertyType && lead.propertyType !== criteria.propertyType) {
          matches = false;
        }

        if (criteria.assignedAgent && lead.assignedAgent !== criteria.assignedAgent) {
          matches = false;
        }

        if (criteria.minValue && lead.estimatedValue < criteria.minValue) {
          matches = false;
        }

        if (criteria.maxValue && lead.estimatedValue > criteria.maxValue) {
          matches = false;
        }

        if (matches) {
          filteredLeads.push(lead);
        }
      }
    }

    return filteredLeads;
  }, [pipelineData]);

  return {
    // Data
    pipelineData,
    loading: loading || pipelineApi.loading || moveApi.loading || statusApi.loading,
    error: error || pipelineApi.error || moveApi.error || statusApi.error,
    
    // Actions
    fetchPipelineData,
    moveLead,
    updateLeadStatus,
    
    // Utilities
    getStageById,
    getLeadById,
    getPipelineStats,
    filterLeads,
    
    // Reset
    reset: () => {
      setPipelineData(null);
      setError(null);
      pipelineApi.reset();
      moveApi.reset();
      statusApi.reset();
    },
  };
} 