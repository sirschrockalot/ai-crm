import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment } from '../schemas/assignment.schema';
import { QueueService } from './queue.service';

export interface AgentCapacity {
  agentId: string;
  currentWorkload: number;
  maxCapacity: number;
  skills: string[];
  availability: 'available' | 'busy' | 'offline';
  lastActive: Date;
}

export interface AssignmentResult {
  success: boolean;
  assignedAgentId?: string;
  reason?: string;
  workloadBalance?: number;
  skillMatchScore?: number;
}

export interface AssignmentStats {
  totalAssignments: number;
  successfulAssignments: number;
  failedAssignments: number;
  averageAssignmentTime: number;
  workloadBalanceScore: number;
  skillMatchScore: number;
  agentUtilization: Record<string, number>;
}

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    @InjectModel('Assignment') private assignmentModel: Model<Assignment>,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Assign a lead to the best available agent
   */
  async assignLeadToAgent(leadId: string, priority: number = 1): Promise<AssignmentResult> {
    try {
      // Get available agents with their capacity
      const availableAgents = await this.getAvailableAgents();
      
      if (availableAgents.length === 0) {
        this.logger.warn('No available agents for assignment');
        return {
          success: false,
          reason: 'No available agents',
        };
      }

      // Find the best agent based on capacity and skills
      const bestAgent = this.findBestAgent(availableAgents, leadId, priority);
      
      if (!bestAgent) {
        this.logger.warn('No suitable agent found for assignment');
        return {
          success: false,
          reason: 'No suitable agent found',
        };
      }

      // Create assignment record
      const assignment = new this.assignmentModel({
        leadId,
        agentId: bestAgent.agentId,
        assignedAt: new Date(),
        status: 'pending',
        workloadAtAssignment: bestAgent.currentWorkload,
        capacityAtAssignment: bestAgent.maxCapacity,
        skillMatchScore: bestAgent.skillMatchScore || 0,
      });

      await assignment.save();

      // Update queue item with assignment
      const queueItem = await this.queueService.getNextLead();
      if (queueItem) {
        await this.queueService.assignLead(queueItem._id.toString(), bestAgent.agentId);
      }

      this.logger.log(`Lead ${leadId} assigned to agent ${bestAgent.agentId}`);

      return {
        success: true,
        assignedAgentId: bestAgent.agentId,
        reason: 'Automatic assignment based on capacity and skills',
        workloadBalance: bestAgent.workloadBalance || 0,
        skillMatchScore: bestAgent.skillMatchScore || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to assign lead ${leadId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Manually assign a lead to a specific agent
   */
  async manualAssignLead(leadId: string, agentId: string, reason?: string): Promise<AssignmentResult> {
    try {
      // Check if agent is available
      const agentCapacity = await this.getAgentCapacity(agentId);
      
      if (!agentCapacity || agentCapacity.availability !== 'available') {
        return {
          success: false,
          reason: 'Agent is not available',
        };
      }

      // Check if agent has capacity
      if (agentCapacity.currentWorkload >= agentCapacity.maxCapacity) {
        return {
          success: false,
          reason: 'Agent is at maximum capacity',
        };
      }

      // Create assignment record
      const assignment = new this.assignmentModel({
        leadId,
        agentId,
        assignedAt: new Date(),
        status: 'pending',
        assignmentType: 'manual',
        reason,
        workloadAtAssignment: agentCapacity.currentWorkload,
        capacityAtAssignment: agentCapacity.maxCapacity,
      });

      await assignment.save();

      this.logger.log(`Lead ${leadId} manually assigned to agent ${agentId}`);

      return {
        success: true,
        assignedAgentId: agentId,
        reason: reason || 'Manual assignment',
      };
    } catch (error) {
      this.logger.error(`Failed to manually assign lead ${leadId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reassign a lead to a different agent
   */
  async reassignLead(leadId: string, newAgentId: string, reason?: string): Promise<AssignmentResult> {
    try {
      // Get current assignment
      const currentAssignment = await this.assignmentModel.findOne({
        leadId,
        status: { $in: ['pending', 'accepted'] },
      });

      if (!currentAssignment) {
        return {
          success: false,
          reason: 'No current assignment found',
        };
      }

      // Check if new agent is available
      const newAgentCapacity = await this.getAgentCapacity(newAgentId);
      
      if (!newAgentCapacity || newAgentCapacity.availability !== 'available') {
        return {
          success: false,
          reason: 'New agent is not available',
        };
      }

      // Update current assignment status
      currentAssignment.status = 'reassigned';
      currentAssignment.reassignedAt = new Date();
      currentAssignment.reassignmentReason = reason;
      await currentAssignment.save();

      // Create new assignment
      const newAssignment = new this.assignmentModel({
        leadId,
        agentId: newAgentId,
        assignedAt: new Date(),
        status: 'pending',
        assignmentType: 'reassignment',
        reason,
        previousAgentId: currentAssignment.agentId,
        workloadAtAssignment: newAgentCapacity.currentWorkload,
        capacityAtAssignment: newAgentCapacity.maxCapacity,
      });

      await newAssignment.save();

      this.logger.log(`Lead ${leadId} reassigned from agent ${currentAssignment.agentId} to ${newAgentId}`);

      return {
        success: true,
        assignedAgentId: newAgentId,
        reason: reason || 'Reassignment',
      };
    } catch (error) {
      this.logger.error(`Failed to reassign lead ${leadId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(): Promise<AssignmentStats> {
    try {
      const [
        totalAssignments,
        successfulAssignments,
        failedAssignments,
        averageAssignmentTime,
        agentUtilization,
      ] = await Promise.all([
        this.assignmentModel.countDocuments(),
        this.assignmentModel.countDocuments({ status: 'accepted' }),
        this.assignmentModel.countDocuments({ status: 'rejected' }),
        this.calculateAverageAssignmentTime(),
        this.calculateAgentUtilization(),
      ]);

      const workloadBalanceScore = await this.calculateWorkloadBalanceScore();
      const skillMatchScore = await this.calculateSkillMatchScore();

      return {
        totalAssignments,
        successfulAssignments,
        failedAssignments,
        averageAssignmentTime,
        workloadBalanceScore,
        skillMatchScore,
        agentUtilization,
      };
    } catch (error) {
      this.logger.error(`Failed to get assignment stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get assignment history for a lead
   */
  async getLeadAssignmentHistory(leadId: string): Promise<Assignment[]> {
    try {
      return await this.assignmentModel
        .find({ leadId })
        .sort({ assignedAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get assignment history for lead ${leadId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get agent assignment history
   */
  async getAgentAssignmentHistory(agentId: string, limit: number = 50): Promise<Assignment[]> {
    try {
      return await this.assignmentModel
        .find({ agentId })
        .sort({ assignedAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      this.logger.error(`Failed to get assignment history for agent ${agentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(assignmentId: string, status: string, notes?: string): Promise<Assignment> {
    try {
      const assignment = await this.assignmentModel.findByIdAndUpdate(
        assignmentId,
        {
          status,
          notes,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (assignment) {
        this.logger.log(`Assignment ${assignmentId} status updated to ${status}`);
      }

      return assignment;
    } catch (error) {
      this.logger.error(`Failed to update assignment status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available agents with their capacity
   */
  private async getAvailableAgents(): Promise<AgentCapacity[]> {
    // This would typically query the users/agents collection
    // For now, returning mock data
    return [
      {
        agentId: 'agent1',
        currentWorkload: 3,
        maxCapacity: 10,
        skills: ['sales', 'negotiation', 'real-estate'],
        availability: 'available',
        lastActive: new Date(),
      },
      {
        agentId: 'agent2',
        currentWorkload: 5,
        maxCapacity: 8,
        skills: ['sales', 'customer-service'],
        availability: 'available',
        lastActive: new Date(),
      },
      {
        agentId: 'agent3',
        currentWorkload: 8,
        maxCapacity: 10,
        skills: ['sales', 'negotiation'],
        availability: 'busy',
        lastActive: new Date(),
      },
    ];
  }

  /**
   * Find the best agent for assignment
   */
  private findBestAgent(
    availableAgents: AgentCapacity[],
    leadId: string,
    priority: number
  ): AgentCapacity & { workloadBalance?: number; skillMatchScore?: number } | null {
    // Filter available agents
    const available = availableAgents.filter(agent => agent.availability === 'available');
    
    if (available.length === 0) {
      return null;
    }

    // Calculate workload balance and skill match for each agent
    const scoredAgents = available.map(agent => {
      const workloadBalance = 1 - (agent.currentWorkload / agent.maxCapacity);
      const skillMatchScore = this.calculateSkillMatch(agent.skills, leadId);
      
      return {
        ...agent,
        workloadBalance,
        skillMatchScore,
        totalScore: (workloadBalance * 0.6) + (skillMatchScore * 0.4),
      };
    });

    // Sort by total score and return the best agent
    scoredAgents.sort((a, b) => b.totalScore - a.totalScore);
    
    return scoredAgents[0];
  }

  /**
   * Get agent capacity
   */
  private async getAgentCapacity(agentId: string): Promise<AgentCapacity | null> {
    const agents = await this.getAvailableAgents();
    return agents.find(agent => agent.agentId === agentId) || null;
  }

  /**
   * Calculate skill match score
   */
  private calculateSkillMatch(agentSkills: string[], leadId: string): number {
    // This would typically match agent skills with lead requirements
    // For now, returning a random score between 0.5 and 1.0
    return 0.5 + Math.random() * 0.5;
  }

  /**
   * Calculate average assignment time
   */
  private async calculateAverageAssignmentTime(): Promise<number> {
    try {
      const result = await this.assignmentModel.aggregate([
        {
          $addFields: {
            assignmentTime: {
              $divide: [
                { $subtract: ['$updatedAt', '$assignedAt'] },
                1000 * 60, // Convert to minutes
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageTime: { $avg: '$assignmentTime' },
          },
        },
      ]);

      return result.length > 0 ? result[0].averageTime : 0;
    } catch (error) {
      this.logger.error(`Failed to calculate average assignment time: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate workload balance score
   */
  private async calculateWorkloadBalanceScore(): Promise<number> {
    try {
      const agents = await this.getAvailableAgents();
      const workloads = agents.map(agent => agent.currentWorkload / agent.maxCapacity);
      const averageWorkload = workloads.reduce((sum, load) => sum + load, 0) / workloads.length;
      const variance = workloads.reduce((sum, load) => sum + Math.pow(load - averageWorkload, 2), 0) / workloads.length;
      
      // Lower variance means better balance
      return Math.max(0, 100 - (variance * 100));
    } catch (error) {
      this.logger.error(`Failed to calculate workload balance score: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate skill match score
   */
  private async calculateSkillMatchScore(): Promise<number> {
    try {
      const assignments = await this.assignmentModel
        .find({ skillMatchScore: { $exists: true } })
        .limit(100)
        .exec();

      if (assignments.length === 0) {
        return 0;
      }

      const totalScore = assignments.reduce((sum, assignment) => sum + (assignment.skillMatchScore || 0), 0);
      return totalScore / assignments.length;
    } catch (error) {
      this.logger.error(`Failed to calculate skill match score: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate agent utilization
   */
  private async calculateAgentUtilization(): Promise<Record<string, number>> {
    try {
      const agents = await this.getAvailableAgents();
      const utilization: Record<string, number> = {};
      
      agents.forEach(agent => {
        utilization[agent.agentId] = (agent.currentWorkload / agent.maxCapacity) * 100;
      });

      return utilization;
    } catch (error) {
      this.logger.error(`Failed to calculate agent utilization: ${error.message}`);
      return {};
    }
  }
} 