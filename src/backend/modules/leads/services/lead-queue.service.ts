import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { 
  QueueEntry, 
  QueueEntryDocument, 
  QueuePriority, 
  QueueStatus,
  QueueConfiguration,
  QueueConfigurationDocument 
} from '../schemas/queue.schema';
import { Lead, LeadDocument } from '../schemas/lead.schema';
import { LeadScoringService } from './lead-scoring.service';
import { RequestWithTenant } from '../../../common/middleware/tenant-isolation.middleware';

export interface QueueEntryData {
  leadId: string;
  priority?: QueuePriority;
  score?: number;
  estimatedProcessingTime?: number;
  assignmentReason?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface QueueStatus {
  totalLeads: number;
  pendingLeads: number;
  assignedLeads: number;
  processingLeads: number;
  completedLeads: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  queueUtilization: number;
  activeAgents: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

@Injectable()
export class LeadQueueService {
  private readonly logger = new Logger(LeadQueueService.name);

  constructor(
    @InjectModel(QueueEntry.name) private queueEntryModel: Model<QueueEntryDocument>,
    @InjectModel(QueueConfiguration.name) private queueConfigModel: Model<QueueConfigurationDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  /**
   * Add a lead to the queue
   */
  async addToQueue(queueData: QueueEntryData, req: RequestWithTenant): Promise<QueueEntry> {
    const config = await this.getQueueConfiguration(req.tenant.tenantId);
    
    // Check if queue is full
    const queueSize = await this.getQueueSize(req.tenant.tenantId);
    if (queueSize >= config.maxQueueSize) {
      throw new BadRequestException('Queue is full. Cannot add more leads.');
    }

    // Get lead score if not provided
    let score = queueData.score;
    if (!score) {
      try {
        const scoringResult = await this.leadScoringService.calculateLeadScore(queueData.leadId);
        score = scoringResult.percentageScore;
      } catch (error) {
        this.logger.warn(`Failed to calculate score for lead ${queueData.leadId}:`, error.message);
        score = 50; // Default score
      }
    }

    // Determine priority based on score if not provided
    let priority = queueData.priority;
    if (!priority) {
      priority = this.calculatePriorityFromScore(score);
    }

    // Get next queue position
    const nextPosition = await this.getNextQueuePosition(req.tenant.tenantId);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.queueEntryExpiration);

    const queueEntry = new this.queueEntryModel({
      queueId: uuidv4(),
      tenantId: req.tenant.tenantId,
      leadId: queueData.leadId,
      priority,
      status: QueueStatus.PENDING,
      score,
      queuePosition: nextPosition,
      waitTime: 0,
      estimatedProcessingTime: queueData.estimatedProcessingTime,
      assignmentReason: queueData.assignmentReason,
      notes: queueData.notes,
      tags: queueData.tags,
      metadata: queueData.metadata,
      createdAt: new Date(),
      expiresAt,
    });

    const savedEntry = await queueEntry.save();
    this.logger.log(`Added lead ${queueData.leadId} to queue with priority ${priority}`);

    return savedEntry;
  }

  /**
   * Get next lead from queue (FIFO with priority)
   */
  async getNextLead(req: RequestWithTenant): Promise<QueueEntry | null> {
    const config = await this.getQueueConfiguration(req.tenant.tenantId);

    // Find the next lead based on priority and FIFO order
    const nextLead = await this.queueEntryModel
      .findOne({
        tenantId: req.tenant.tenantId,
        status: QueueStatus.PENDING,
        expiresAt: { $gt: new Date() },
      })
      .sort({
        priority: 1, // Priority order: urgent=1, high=2, normal=3, low=4
        createdAt: 1, // FIFO within same priority
      })
      .exec();

    if (!nextLead) {
      return null;
    }

    // Update wait time
    const waitTime = Math.floor((Date.now() - nextLead.createdAt.getTime()) / (1000 * 60));
    nextLead.waitTime = waitTime;
    await nextLead.save();

    return nextLead;
  }

  /**
   * Assign a lead to an agent
   */
  async assignLead(queueId: string, agentId: string, req: RequestWithTenant): Promise<QueueEntry> {
    const queueEntry = await this.queueEntryModel.findOne({
      queueId,
      tenantId: req.tenant.tenantId,
    }).exec();

    if (!queueEntry) {
      throw new NotFoundException(`Queue entry not found: ${queueId}`);
    }

    if (queueEntry.status !== QueueStatus.PENDING) {
      throw new BadRequestException(`Cannot assign lead with status: ${queueEntry.status}`);
    }

    // Update queue entry
    queueEntry.status = QueueStatus.ASSIGNED;
    queueEntry.assignedTo = new Types.ObjectId(agentId);
    queueEntry.assignedBy = new Types.ObjectId(req.user.id);
    queueEntry.assignedAt = new Date();

    const updatedEntry = await queueEntry.save();
    this.logger.log(`Assigned lead ${queueEntry.leadId} to agent ${agentId}`);

    return updatedEntry;
  }

  /**
   * Update queue entry status
   */
  async updateQueueStatus(queueId: string, status: QueueStatus, req: RequestWithTenant): Promise<QueueEntry> {
    const queueEntry = await this.queueEntryModel.findOne({
      queueId,
      tenantId: req.tenant.tenantId,
    }).exec();

    if (!queueEntry) {
      throw new NotFoundException(`Queue entry not found: ${queueId}`);
    }

    queueEntry.status = status;
    queueEntry.updatedAt = new Date();

    if (status === QueueStatus.COMPLETED) {
      queueEntry.completedAt = new Date();
      queueEntry.actualProcessingTime = Math.floor(
        (queueEntry.completedAt.getTime() - queueEntry.assignedAt!.getTime()) / (1000 * 60)
      );
    }

    const updatedEntry = await queueEntry.save();
    this.logger.log(`Updated queue entry ${queueId} status to ${status}`);

    return updatedEntry;
  }

  /**
   * Get queue status and statistics
   */
  async getQueueStatus(req: RequestWithTenant): Promise<QueueStatus> {
    const tenantId = req.tenant.tenantId;

    // Get counts by status
    const [pendingCount, assignedCount, processingCount, completedCount] = await Promise.all([
      this.queueEntryModel.countDocuments({ tenantId, status: QueueStatus.PENDING }),
      this.queueEntryModel.countDocuments({ tenantId, status: QueueStatus.ASSIGNED }),
      this.queueEntryModel.countDocuments({ tenantId, status: QueueStatus.PROCESSING }),
      this.queueEntryModel.countDocuments({ tenantId, status: QueueStatus.COMPLETED }),
    ]);

    const totalLeads = pendingCount + assignedCount + processingCount + completedCount;

    // Calculate average wait time
    const pendingLeads = await this.queueEntryModel.find({ tenantId, status: QueueStatus.PENDING }).exec();
    const totalWaitTime = pendingLeads.reduce((sum, lead) => sum + (lead.waitTime || 0), 0);
    const averageWaitTime = pendingLeads.length > 0 ? totalWaitTime / pendingLeads.length : 0;

    // Calculate average processing time
    const completedLeads = await this.queueEntryModel.find({ tenantId, status: QueueStatus.COMPLETED }).exec();
    const totalProcessingTime = completedLeads.reduce((sum, lead) => sum + (lead.actualProcessingTime || 0), 0);
    const averageProcessingTime = completedLeads.length > 0 ? totalProcessingTime / completedLeads.length : 0;

    // Calculate queue utilization
    const config = await this.getQueueConfiguration(tenantId);
    const queueUtilization = (totalLeads / config.maxQueueSize) * 100;

    // Determine health status
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (queueUtilization > 90) {
      healthStatus = 'critical';
    } else if (queueUtilization > 75) {
      healthStatus = 'warning';
    }

    // Get active agents count (simplified - would need user service integration)
    const activeAgents = await this.getActiveAgentsCount(tenantId);

    return {
      totalLeads,
      pendingLeads: pendingCount,
      assignedLeads: assignedCount,
      processingLeads: processingCount,
      completedLeads: completedCount,
      averageWaitTime,
      averageProcessingTime,
      queueUtilization,
      activeAgents,
      healthStatus,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get queue entries with filtering and pagination
   */
  async getQueueEntries(
    filters: {
      status?: QueueStatus;
      priority?: QueuePriority;
      assignedTo?: string;
      page?: number;
      limit?: number;
    },
    req: RequestWithTenant,
  ): Promise<{ entries: QueueEntry[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, ...filterCriteria } = filters;
    const skip = (page - 1) * limit;

    const query: any = { tenantId: req.tenant.tenantId };

    if (filterCriteria.status) {
      query.status = filterCriteria.status;
    }
    if (filterCriteria.priority) {
      query.priority = filterCriteria.priority;
    }
    if (filterCriteria.assignedTo) {
      query.assignedTo = new Types.ObjectId(filterCriteria.assignedTo);
    }

    const [entries, total] = await Promise.all([
      this.queueEntryModel
        .find(query)
        .sort({ priority: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'firstName lastName email')
        .populate('assignedBy', 'firstName lastName email')
        .exec(),
      this.queueEntryModel.countDocuments(query),
    ]);

    return {
      entries,
      total,
      page,
      limit,
    };
  }

  /**
   * Remove lead from queue
   */
  async removeFromQueue(queueId: string, req: RequestWithTenant): Promise<void> {
    const result = await this.queueEntryModel.deleteOne({
      queueId,
      tenantId: req.tenant.tenantId,
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Queue entry not found: ${queueId}`);
    }

    this.logger.log(`Removed queue entry ${queueId}`);
  }

  /**
   * Reorder queue entry
   */
  async reorderQueueEntry(
    queueId: string,
    newPriority: QueuePriority,
    req: RequestWithTenant,
  ): Promise<QueueEntry> {
    const queueEntry = await this.queueEntryModel.findOne({
      queueId,
      tenantId: req.tenant.tenantId,
    }).exec();

    if (!queueEntry) {
      throw new NotFoundException(`Queue entry not found: ${queueId}`);
    }

    queueEntry.priority = newPriority;
    queueEntry.updatedAt = new Date();

    const updatedEntry = await queueEntry.save();
    this.logger.log(`Reordered queue entry ${queueId} to priority ${newPriority}`);

    return updatedEntry;
  }

  /**
   * Clean up expired queue entries
   */
  async cleanupExpiredEntries(req: RequestWithTenant): Promise<number> {
    const result = await this.queueEntryModel.deleteMany({
      tenantId: req.tenant.tenantId,
      expiresAt: { $lt: new Date() },
      status: QueueStatus.PENDING,
    }).exec();

    if (result.deletedCount > 0) {
      this.logger.log(`Cleaned up ${result.deletedCount} expired queue entries`);
    }

    return result.deletedCount;
  }

  /**
   * Get queue configuration
   */
  async getQueueConfiguration(tenantId: string): Promise<QueueConfiguration> {
    let config = await this.queueConfigModel.findOne({ tenantId }).exec();

    if (!config) {
      // Create default configuration
      config = new this.queueConfigModel({
        configId: uuidv4(),
        tenantId,
        maxQueueSize: 1000,
        maxWaitTime: 30,
        assignmentTimeout: 5,
        queueEntryExpiration: 24,
        maxLeadsPerAgent: 10,
        maxWorkloadPercentage: 80,
        enableSkillMatching: true,
        enableWorkloadBalancing: true,
        skillMatchThreshold: 60,
        urgentPriorityWeight: 1,
        highPriorityWeight: 2,
        normalPriorityWeight: 3,
        lowPriorityWeight: 4,
        enableAutoScaling: false,
        scalingThreshold: 80,
        scalingCooldown: 20,
        enableAlerts: true,
        alertThreshold: 90,
        alertCooldown: 5,
        batchSize: 1000,
        processingInterval: 60,
        enableCaching: true,
        cacheExpiration: 300,
        createdAt: new Date(),
      });

      await config.save();
    }

    return config;
  }

  /**
   * Update queue configuration
   */
  async updateQueueConfiguration(
    updates: Partial<QueueConfiguration>,
    req: RequestWithTenant,
  ): Promise<QueueConfiguration> {
    const config = await this.getQueueConfiguration(req.tenant.tenantId);

    Object.assign(config, updates);
    config.updatedAt = new Date();
    config.updatedBy = new Types.ObjectId(req.user.id);

    const updatedConfig = await config.save();
    this.logger.log(`Updated queue configuration for tenant ${req.tenant.tenantId}`);

    return updatedConfig;
  }

  /**
   * Calculate priority from score
   */
  private calculatePriorityFromScore(score: number): QueuePriority {
    if (score >= 80) {
      return QueuePriority.URGENT;
    } else if (score >= 60) {
      return QueuePriority.HIGH;
    } else if (score >= 40) {
      return QueuePriority.NORMAL;
    } else {
      return QueuePriority.LOW;
    }
  }

  /**
   * Get queue size
   */
  private async getQueueSize(tenantId: string): Promise<number> {
    return this.queueEntryModel.countDocuments({ tenantId });
  }

  /**
   * Get next queue position
   */
  private async getNextQueuePosition(tenantId: string): Promise<number> {
    const lastEntry = await this.queueEntryModel
      .findOne({ tenantId })
      .sort({ queuePosition: -1 })
      .exec();

    return lastEntry ? lastEntry.queuePosition + 1 : 1;
  }

  /**
   * Get active agents count (simplified implementation)
   */
  private async getActiveAgentsCount(tenantId: string): Promise<number> {
    // This would typically query the user service for active agents
    // For now, return a simplified count based on assigned leads
    const activeAgents = await this.queueEntryModel.distinct('assignedTo', {
      tenantId,
      status: { $in: [QueueStatus.ASSIGNED, QueueStatus.PROCESSING] },
    }).exec();

    return activeAgents.length;
  }

  /**
   * Batch add leads to queue
   */
  async batchAddToQueue(leadsData: QueueEntryData[], req: RequestWithTenant): Promise<QueueEntry[]> {
    const config = await this.getQueueConfiguration(req.tenant.tenantId);
    const currentSize = await this.getQueueSize(req.tenant.tenantId);

    if (currentSize + leadsData.length > config.maxQueueSize) {
      throw new BadRequestException('Adding these leads would exceed queue capacity.');
    }

    const queueEntries: QueueEntry[] = [];
    let nextPosition = await this.getNextQueuePosition(req.tenant.tenantId);

    for (const leadData of leadsData) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + config.queueEntryExpiration);

      const priority = leadData.priority || this.calculatePriorityFromScore(leadData.score || 50);

      const queueEntry = new this.queueEntryModel({
        queueId: uuidv4(),
        tenantId: req.tenant.tenantId,
        leadId: leadData.leadId,
        priority,
        status: QueueStatus.PENDING,
        score: leadData.score || 50,
        queuePosition: nextPosition++,
        waitTime: 0,
        estimatedProcessingTime: leadData.estimatedProcessingTime,
        assignmentReason: leadData.assignmentReason,
        notes: leadData.notes,
        tags: leadData.tags,
        metadata: leadData.metadata,
        createdAt: new Date(),
        expiresAt,
      });

      queueEntries.push(queueEntry);
    }

    const savedEntries = await this.queueEntryModel.insertMany(queueEntries);
    this.logger.log(`Batch added ${leadsData.length} leads to queue`);

    return savedEntries;
  }
} 