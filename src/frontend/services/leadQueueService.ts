import { Lead, LeadStatus } from '../types';
import { mockLeads } from './mockDataService';

export interface LeadQueueStats {
  totalLeads: number;
  newLeads: number;
  callbackLeads: number;
  followUpLeads: number;
  avgCallTime: number;
  todayGoal: number;
  callsMade: number;
}

export interface NextLeadResult {
  lead: Lead | null;
  stats: LeadQueueStats;
  message: string;
}

class LeadQueueService {
  private leads: Lead[] = [];
  private currentUser: string | null = null;

  constructor() {
    this.leads = [...mockLeads];
  }

  /**
   * Set the current user for lead assignment
   */
  setCurrentUser(userId: string) {
    this.currentUser = userId;
  }

  /**
   * Get the next lead in the queue based on priority
   */
  async getNextLead(): Promise<NextLeadResult> {
    try {
      // Priority order: New leads > Callback leads > Follow-up leads
      const newLeads = this.leads.filter(lead => 
        lead.status === 'new' && 
        (!lead.assignedTo || lead.assignedTo === this.currentUser)
      );
      
      const callbackLeads = this.leads.filter(lead => 
        lead.status === 'contacted' && 
        (!lead.assignedTo || lead.assignedTo === this.currentUser)
      );
      
      const followUpLeads = this.leads.filter(lead => 
        lead.status === 'qualified' && 
        (!lead.assignedTo || lead.assignedTo === this.currentUser)
      );

      // Get the next lead based on priority
      let nextLead: Lead | null = null;
      let message = '';

      if (newLeads.length > 0) {
        nextLead = newLeads[0];
        message = `New lead: ${nextLead.firstName} ${nextLead.lastName}`;
      } else if (callbackLeads.length > 0) {
        nextLead = callbackLeads[0];
        message = `Callback: ${nextLead.firstName} ${nextLead.lastName}`;
      } else if (followUpLeads.length > 0) {
        nextLead = followUpLeads[0];
        message = `Follow-up: ${nextLead.firstName} ${nextLead.lastName}`;
      }

      const stats = this.getQueueStats();

      return {
        lead: nextLead,
        stats,
        message: nextLead ? message : 'No leads available in your queue'
      };
    } catch (error) {
      console.error('Error getting next lead:', error);
      throw new Error('Failed to get next lead');
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): LeadQueueStats {
    const newLeads = this.leads.filter(lead => lead.status === 'new');
    const callbackLeads = this.leads.filter(lead => lead.status === 'contacted');
    const followUpLeads = this.leads.filter(lead => lead.status === 'qualified');

    return {
      totalLeads: this.leads.length,
      newLeads: newLeads.length,
      callbackLeads: callbackLeads.length,
      followUpLeads: followUpLeads.length,
      avgCallTime: 4.2, // Mock data - would come from actual call logs
      todayGoal: 25, // Mock data - would come from user settings
      callsMade: 23, // Mock data - would come from actual call logs
    };
  }

  /**
   * Update lead status after a call
   */
  async updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): Promise<void> {
    const leadIndex = this.leads.findIndex(lead => lead.id === leadId);
    if (leadIndex !== -1) {
      this.leads[leadIndex].status = status;
      this.leads[leadIndex].updatedAt = new Date();
      if (notes) {
        this.leads[leadIndex].notes = notes;
      }
    }
  }

  /**
   * Assign lead to current user
   */
  async assignLead(leadId: string): Promise<void> {
    const leadIndex = this.leads.findIndex(lead => lead.id === leadId);
    if (leadIndex !== -1 && this.currentUser) {
      this.leads[leadIndex].assignedTo = this.currentUser;
      this.leads[leadIndex].updatedAt = new Date();
    }
  }

  /**
   * Get leads by status
   */
  getLeadsByStatus(status: LeadStatus): Lead[] {
    return this.leads.filter(lead => lead.status === status);
  }

  /**
   * Get all leads for current user
   */
  getUserLeads(): Lead[] {
    if (!this.currentUser) return [];
    return this.leads.filter(lead => lead.assignedTo === this.currentUser);
  }

  /**
   * Refresh leads from API (placeholder for future implementation)
   */
  async refreshLeads(): Promise<void> {
    // In a real implementation, this would fetch from the API
    // For now, we'll just use the mock data
    this.leads = [...mockLeads];
  }
}

// Export singleton instance
export const leadQueueService = new LeadQueueService();
