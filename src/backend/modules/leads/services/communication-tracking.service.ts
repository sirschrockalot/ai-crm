import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommunicationLog, CommunicationLogDocument } from '../schemas/communication-log.schema';

export interface CommunicationStats {
  totalCommunications: number;
  totalSms: number;
  totalVoice: number;
  totalEmail: number;
  totalCost: number;
  successRate: number;
  averageResponseTime: number;
  topUsers: Array<{ userId: string; count: number }>;
  topLeads: Array<{ leadId: string; count: number }>;
}

export interface CommunicationAnalytics {
  dailyStats: Array<{
    date: string;
    sms: number;
    voice: number;
    email: number;
    cost: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    count: number;
  }>;
  typeDistribution: {
    sms: number;
    voice: number;
    email: number;
  };
  statusDistribution: {
    queued: number;
    sent: number;
    delivered: number;
    failed: number;
  };
}

export interface CommunicationSearchFilters {
  leadId?: string;
  userId?: string;
  type?: 'sms' | 'voice' | 'email';
  direction?: 'outbound' | 'inbound';
  status?: 'queued' | 'sent' | 'delivered' | 'failed';
  dateFrom?: Date;
  dateTo?: Date;
  costMin?: number;
  costMax?: number;
}

@Injectable()
export class CommunicationTrackingService {
  private readonly logger = new Logger(CommunicationTrackingService.name);

  constructor(
    @InjectModel(CommunicationLog.name) private communicationLogModel: Model<CommunicationLogDocument>,
  ) {}

  /**
   * Log a communication activity
   */
  async logCommunication(log: Omit<CommunicationLog, 'createdAt' | 'updatedAt'>): Promise<CommunicationLog> {
    try {
      const communicationLog = new this.communicationLogModel(log);
      return await communicationLog.save();
    } catch (error) {
      this.logger.error('Failed to log communication:', error);
      throw error;
    }
  }

  /**
   * Get communication history for a lead
   */
  async getCommunicationHistory(
    leadId: string,
    tenantId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<CommunicationLog[]> {
    try {
      return await this.communicationLogModel
        .find({ leadId, tenantId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .exec();
    } catch (error) {
      this.logger.error('Failed to get communication history:', error);
      throw error;
    }
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats(tenantId: string, dateFrom?: Date, dateTo?: Date): Promise<CommunicationStats> {
    try {
      const query: any = { tenantId };
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      const [
        totalCommunications,
        totalSms,
        totalVoice,
        totalEmail,
        totalCost,
        successfulCommunications,
        topUsers,
        topLeads,
      ] = await Promise.all([
        this.communicationLogModel.countDocuments(query),
        this.communicationLogModel.countDocuments({ ...query, type: 'sms' }),
        this.communicationLogModel.countDocuments({ ...query, type: 'voice' }),
        this.communicationLogModel.countDocuments({ ...query, type: 'email' }),
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: null, totalCost: { $sum: '$cost' } } },
        ]),
        this.communicationLogModel.countDocuments({ ...query, status: { $in: ['sent', 'delivered'] } }),
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$leadId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      const totalCostValue = totalCost[0]?.totalCost || 0;
      const successRate = totalCommunications > 0 ? (successfulCommunications / totalCommunications) * 100 : 0;

      return {
        totalCommunications,
        totalSms,
        totalVoice,
        totalEmail,
        totalCost: totalCostValue,
        successRate,
        averageResponseTime: 0, // TODO: Calculate based on response times
        topUsers: topUsers.map(user => ({ userId: user._id, count: user.count })),
        topLeads: topLeads.map(lead => ({ leadId: lead._id, count: lead.count })),
      };
    } catch (error) {
      this.logger.error('Failed to get communication stats:', error);
      throw error;
    }
  }

  /**
   * Get communication analytics
   */
  async getCommunicationAnalytics(tenantId: string, dateFrom?: Date, dateTo?: Date): Promise<CommunicationAnalytics> {
    try {
      const query: any = { tenantId };
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      const [
        dailyStats,
        hourlyStats,
        typeDistribution,
        statusDistribution,
      ] = await Promise.all([
        this.communicationLogModel.aggregate([
          { $match: query },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                type: '$type',
              },
              count: { $sum: 1 },
              cost: { $sum: '$cost' },
            },
          },
          { $sort: { '_id.date': 1 } },
        ]),
        this.communicationLogModel.aggregate([
          { $match: query },
          {
            $group: {
              _id: { $hour: '$createdAt' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

      // Process daily stats
      const processedDailyStats = dailyStats.reduce((acc, stat) => {
        const date = stat._id.date;
        const type = stat._id.type;
        const existing = acc.find(s => s.date === date);
        
        if (existing) {
          existing[type] = stat.count;
          existing.cost += stat.cost;
        } else {
          acc.push({
            date,
            sms: type === 'sms' ? stat.count : 0,
            voice: type === 'voice' ? stat.count : 0,
            email: type === 'email' ? stat.count : 0,
            cost: stat.cost,
          });
        }
        return acc;
      }, [] as any[]);

      // Process type distribution
      const typeDist = typeDistribution.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as any);

      // Process status distribution
      const statusDist = statusDistribution.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as any);

      return {
        dailyStats: processedDailyStats,
        hourlyStats: hourlyStats.map(stat => ({ hour: stat._id, count: stat.count })),
        typeDistribution: {
          sms: typeDist.sms || 0,
          voice: typeDist.voice || 0,
          email: typeDist.email || 0,
        },
        statusDistribution: {
          queued: statusDist.queued || 0,
          sent: statusDist.sent || 0,
          delivered: statusDist.delivered || 0,
          failed: statusDist.failed || 0,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get communication analytics:', error);
      throw error;
    }
  }

  /**
   * Search communications with filters
   */
  async searchCommunications(
    tenantId: string,
    filters: CommunicationSearchFilters,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ communications: CommunicationLog[]; total: number }> {
    try {
      const query: any = { tenantId };

      if (filters.leadId) query.leadId = filters.leadId;
      if (filters.userId) query.userId = filters.userId;
      if (filters.type) query.type = filters.type;
      if (filters.direction) query.direction = filters.direction;
      if (filters.status) query.status = filters.status;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
      if (filters.costMin || filters.costMax) {
        query.cost = {};
        if (filters.costMin) query.cost.$gte = filters.costMin;
        if (filters.costMax) query.cost.$lte = filters.costMax;
      }

      const [communications, total] = await Promise.all([
        this.communicationLogModel
          .find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .exec(),
        this.communicationLogModel.countDocuments(query),
      ]);

      return { communications, total };
    } catch (error) {
      this.logger.error('Failed to search communications:', error);
      throw error;
    }
  }

  /**
   * Update communication status
   */
  async updateCommunicationStatus(messageId: string, status: string, error?: string): Promise<void> {
    try {
      const update: any = { status };
      if (error) update.error = error;

      await this.communicationLogModel.updateOne(
        { messageId },
        { $set: update },
      );
    } catch (error) {
      this.logger.error('Failed to update communication status:', error);
      throw error;
    }
  }

  /**
   * Get communication cost analysis
   */
  async getCostAnalysis(tenantId: string, dateFrom?: Date, dateTo?: Date): Promise<{
    totalCost: number;
    averageCost: number;
    costByType: Record<string, number>;
    costByUser: Array<{ userId: string; cost: number }>;
  }> {
    try {
      const query: any = { tenantId };
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      const [totalCost, costByType, costByUser] = await Promise.all([
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: null, totalCost: { $sum: '$cost' }, count: { $sum: 1 } } },
        ]),
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$type', cost: { $sum: '$cost' } } },
        ]),
        this.communicationLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$userId', cost: { $sum: '$cost' } } },
          { $sort: { cost: -1 } },
          { $limit: 10 },
        ]),
      ]);

      const totalCostValue = totalCost[0]?.totalCost || 0;
      const count = totalCost[0]?.count || 0;
      const averageCost = count > 0 ? totalCostValue / count : 0;

      const costByTypeMap = costByType.reduce((acc, stat) => {
        acc[stat._id] = stat.cost;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalCost: totalCostValue,
        averageCost,
        costByType: costByTypeMap,
        costByUser: costByUser.map(user => ({ userId: user._id, cost: user.cost })),
      };
    } catch (error) {
      this.logger.error('Failed to get cost analysis:', error);
      throw error;
    }
  }

  /**
   * Export communication logs
   */
  async exportCommunicationLogs(
    tenantId: string,
    filters: CommunicationSearchFilters,
  ): Promise<CommunicationLog[]> {
    try {
      const query: any = { tenantId };

      if (filters.leadId) query.leadId = filters.leadId;
      if (filters.userId) query.userId = filters.userId;
      if (filters.type) query.type = filters.type;
      if (filters.direction) query.direction = filters.direction;
      if (filters.status) query.status = filters.status;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }

      return await this.communicationLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error('Failed to export communication logs:', error);
      throw error;
    }
  }
} 