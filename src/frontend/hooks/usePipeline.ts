import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useToast } from '@chakra-ui/react';
import pipelineService from '../services/pipelineService';
import { Lead, PipelineStage, LeadMoveRequest } from '../types/pipeline';

interface UsePipelineOptions {
  tenantId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const usePipeline = ({ tenantId, autoRefresh = true, refreshInterval = 30000 }: UsePipelineOptions) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch pipeline stages
  const {
    data: stages = [],
    isLoading: stagesLoading,
    error: stagesError,
    refetch: refetchStages,
  } = useQuery(
    ['pipeline-stages', tenantId],
    () => pipelineService.getPipelineStages(tenantId),
    {
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch all leads
  const {
    data: leads = [],
    isLoading: leadsLoading,
    error: leadsError,
    refetch: refetchLeads,
  } = useQuery(
    ['pipeline-leads', tenantId],
    () => pipelineService.getAllLeads(tenantId),
    {
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Move lead mutation
  const moveLeadMutation = useMutation(
    (request: LeadMoveRequest) => pipelineService.moveLead(request),
    {
      onSuccess: (data) => {
        toast({
          title: 'Lead moved successfully',
          description: data.message || 'Lead has been moved to the new stage',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Invalidate and refetch leads
        queryClient.invalidateQueries(['pipeline-leads', tenantId]);
        queryClient.invalidateQueries(['pipeline-stages', tenantId]);
      },
      onError: (error: any) => {
        toast({
          title: 'Error moving lead',
          description: error.response?.data?.message || 'Failed to move lead',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Create stage mutation
  const createStageMutation = useMutation(
    (stage: Partial<PipelineStage>) => pipelineService.createStage(stage),
    {
      onSuccess: () => {
        toast({
          title: 'Stage created successfully',
          description: 'New stage has been added to the pipeline',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline-stages', tenantId]);
      },
      onError: (error: any) => {
        toast({
          title: 'Error creating stage',
          description: error.response?.data?.message || 'Failed to create stage',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Update stage mutation
  const updateStageMutation = useMutation(
    ({ stageId, updates }: { stageId: string; updates: Partial<PipelineStage> }) =>
      pipelineService.updateStage(stageId, updates),
    {
      onSuccess: () => {
        toast({
          title: 'Stage updated successfully',
          description: 'Stage has been updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline-stages', tenantId]);
      },
      onError: (error: any) => {
        toast({
          title: 'Error updating stage',
          description: error.response?.data?.message || 'Failed to update stage',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Create lead mutation
  const createLeadMutation = useMutation(
    (lead: Partial<Lead>) => pipelineService.createLead(lead),
    {
      onSuccess: () => {
        toast({
          title: 'Lead created successfully',
          description: 'New lead has been added to the pipeline',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline-leads', tenantId]);
      },
      onError: (error: any) => {
        toast({
          title: 'Error creating lead',
          description: error.response?.data?.message || 'Failed to create lead',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Update lead mutation
  const updateLeadMutation = useMutation(
    ({ leadId, updates }: { leadId: string; updates: Partial<Lead> }) =>
      pipelineService.updateLead(leadId, updates),
    {
      onSuccess: () => {
        toast({
          title: 'Lead updated successfully',
          description: 'Lead has been updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline-leads', tenantId]);
      },
      onError: (error: any) => {
        toast({
          title: 'Error updating lead',
          description: error.response?.data?.message || 'Failed to update lead',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Handle lead move
  const handleLeadMove = useCallback(
    (leadId: string, fromStageId: string, toStageId: string) => {
      const request: LeadMoveRequest = {
        leadId,
        fromStageId,
        toStageId,
        userId: 'current-user-id', // TODO: Get from auth context
        tenantId,
      };

      moveLeadMutation.mutate(request);
    },
    [moveLeadMutation, tenantId]
  );

  // Get leads for a specific stage
  const getLeadsForStage = useCallback(
    (stageId: string) => {
      return leads.filter(lead => lead.stageId === stageId);
    },
    [leads]
  );

  // Refresh data
  const refreshData = useCallback(() => {
    refetchStages();
    refetchLeads();
  }, [refetchStages, refetchLeads]);

  // Loading state
  const isDataLoading = stagesLoading || leadsLoading || isLoading;

  // Error state
  const hasError = stagesError || leadsError;

  return {
    // Data
    stages,
    leads,
    selectedLead,
    
    // Loading states
    isLoading: isDataLoading,
    isMovingLead: moveLeadMutation.isLoading,
    isCreatingStage: createStageMutation.isLoading,
    isUpdatingStage: updateStageMutation.isLoading,
    isCreatingLead: createLeadMutation.isLoading,
    isUpdatingLead: updateLeadMutation.isLoading,
    
    // Error states
    hasError,
    stagesError,
    leadsError,
    
    // Actions
    handleLeadMove,
    getLeadsForStage,
    setSelectedLead,
    refreshData,
    
    // Mutations
    moveLeadMutation,
    createStageMutation,
    updateStageMutation,
    createLeadMutation,
    updateLeadMutation,
  };
}; 