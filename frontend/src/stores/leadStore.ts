import { create } from 'zustand';
import { leadService, Lead, CreateLeadData, UpdateLeadData } from '../services/leads';

interface PipelineData {
  pipeline: {
    new: Lead[];
    contacted: Lead[];
    under_contract: Lead[];
    closed: Lead[];
    lost: Lead[];
  };
  total: number;
  stats: {
    new: number;
    contacted: number;
    under_contract: number;
    closed: number;
    lost: number;
  };
}

interface LeadState {
  leads: Lead[];
  currentLead: Lead | null;
  pipelineData: PipelineData | null;
  loading: boolean;
  error: string | null;
  filters: any;
  stats: any;
  
  // Actions
  fetchLeads: (filters?: any) => Promise<void>;
  fetchPipelineData: (filters?: any) => Promise<void>;
  fetchLead: (leadId: string) => Promise<void>;
  createLead: (leadData: CreateLeadData) => Promise<void>;
  updateLead: (leadId: string, leadData: UpdateLeadData) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  assignLead: (leadId: string, assignedTo: string) => Promise<void>;
  updateLeadStatus: (leadId: string, status: string) => Promise<void>;
  moveLeadInPipeline: (leadId: string, newStatus: string) => Promise<void>;
  addTag: (leadId: string, tag: string) => Promise<void>;
  removeTag: (leadId: string, tag: string) => Promise<void>;
  recordContact: (leadId: string) => Promise<void>;
  fetchLeadStats: () => Promise<void>;
  setFilters: (filters: any) => void;
  clearError: () => void;
  setCurrentLead: (lead: Lead | null) => void;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  currentLead: null,
  pipelineData: null,
  loading: false,
  error: null,
  filters: {},
  stats: null,

  fetchLeads: async (filters?: any) => {
    set({ loading: true, error: null });
    try {
      const leads = await leadService.getLeads(filters);
      set({ leads, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch leads', 
        loading: false 
      });
    }
  },

  fetchPipelineData: async (filters?: any) => {
    set({ loading: true, error: null });
    try {
      const pipelineData = await leadService.getPipelineData(filters);
      set({ pipelineData, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch pipeline data', 
        loading: false 
      });
    }
  },

  fetchLead: async (leadId: string) => {
    set({ loading: true, error: null });
    try {
      const lead = await leadService.getLead(leadId);
      set({ currentLead: lead, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch lead', 
        loading: false 
      });
    }
  },

  createLead: async (leadData: CreateLeadData) => {
    set({ loading: true, error: null });
    try {
      const newLead = await leadService.createLead(leadData);
      set(state => ({ 
        leads: [newLead, ...state.leads],
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create lead', 
        loading: false 
      });
      throw error;
    }
  },

  updateLead: async (leadId: string, leadData: UpdateLeadData) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await leadService.updateLead(leadId, leadData);
      set(state => ({
        leads: state.leads.map(lead => 
          lead._id === leadId ? updatedLead : lead
        ),
        currentLead: state.currentLead?._id === leadId ? updatedLead : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update lead', 
        loading: false 
      });
      throw error;
    }
  },

  deleteLead: async (leadId: string) => {
    set({ loading: true, error: null });
    try {
      await leadService.deleteLead(leadId);
      set(state => ({
        leads: state.leads.filter(lead => lead._id !== leadId),
        currentLead: state.currentLead?._id === leadId ? null : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete lead', 
        loading: false 
      });
      throw error;
    }
  },

  assignLead: async (leadId: string, assignedTo: string) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await leadService.assignLead(leadId, assignedTo);
      set(state => ({
        leads: state.leads.map(lead => 
          lead._id === leadId ? updatedLead : lead
        ),
        currentLead: state.currentLead?._id === leadId ? updatedLead : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to assign lead', 
        loading: false 
      });
      throw error;
    }
  },

  updateLeadStatus: async (leadId: string, status: string) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await leadService.updateLeadStatus(leadId, status);
      set(state => ({
        leads: state.leads.map(lead => 
          lead._id === leadId ? updatedLead : lead
        ),
        currentLead: state.currentLead?._id === leadId ? updatedLead : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update lead status', 
        loading: false 
      });
      throw error;
    }
  },

  moveLeadInPipeline: async (leadId: string, newStatus: string) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await leadService.moveLeadInPipeline(leadId, newStatus);
      set(state => ({
        leads: state.leads.map(lead => 
          lead._id === leadId ? updatedLead : lead
        ),
        currentLead: state.currentLead?._id === leadId ? updatedLead : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to move lead in pipeline', 
        loading: false 
      });
      throw error;
    }
  },

  addTag: async (leadId: string, tag: string) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await leadService.addTag(leadId, tag);
      set(state => ({
        leads: state.leads.map(lead => 
          lead._id === leadId ? updatedLead : lead
        ),
        currentLead: state.currentLead?._id === leadId ? updatedLead : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add tag', 
        loading: false 
      });
      throw error;
    }
  },

  removeTag: async (leadId: string, tag: string) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await leadService.removeTag(leadId, tag);
      set(state => ({
        leads: state.leads.map(lead => 
          lead._id === leadId ? updatedLead : lead
        ),
        currentLead: state.currentLead?._id === leadId ? updatedLead : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove tag', 
        loading: false 
      });
      throw error;
    }
  },

  recordContact: async (leadId: string) => {
    set({ loading: true, error: null });
    try {
      const updatedLead = await leadService.recordContact(leadId);
      set(state => ({
        leads: state.leads.map(lead => 
          lead._id === leadId ? updatedLead : lead
        ),
        currentLead: state.currentLead?._id === leadId ? updatedLead : state.currentLead,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to record contact', 
        loading: false 
      });
      throw error;
    }
  },

  fetchLeadStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await leadService.getLeadStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch lead stats', 
        loading: false 
      });
    }
  },

  setFilters: (filters: any) => {
    set({ filters });
  },

  clearError: () => {
    set({ error: null });
  },

  setCurrentLead: (lead: Lead | null) => {
    set({ currentLead: lead });
  },
})); 