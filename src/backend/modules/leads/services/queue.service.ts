import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueueItem } from '../schemas/queue.schema';

export interface QueueStats {
  totalItems: number;
  pendingItems: number;
  assignedItems: number;
  averageWaitTime: number;
  priorityDistribution: Record<string, number>;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectModel('QueueItem') private queueModel: Model<QueueItem>,
  ) {}

  /**
   * Add a lead to the FIFO queue
   */
  async addToQueue(leadId: string, priority: number = 1): Promise<QueueItem> {
    try {
      const queueItem = new this.queueModel({
        leadId,
        priority,
        createdAt: new Date(),
        status: 'pending',
      });

      const savedItem = await queueItem.save();
      this.logger.log(`Lead ${leadId} added to queue with priority ${priority}`);
      
      return savedItem;
    } catch (error) {
      this.logger.error(`Failed to add lead ${leadId} to queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the next lead from the queue (FIFO with priority)
   */
  async getNextLead(): Promise<QueueItem | null> {
    try {
      const nextItem = await this.queueModel
        .findOne({ status: 'pending' })
        .sort({ priority: -1, createdAt: 1 })
        .exec();

      if (nextItem) {
        this.logger.log(`Retrieved lead ${nextItem.leadId} from queue`);
      } else {
        this.logger.log('No pending leads in queue');
      }

      return nextItem;
    } catch (error) {
      this.logger.error(`Failed to get next lead from queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Assign a lead from the queue to an agent
   */
  async assignLead(queueItemId: string, agentId: string): Promise<QueueItem> {
    try {
      const updatedItem = await this.queueModel.findByIdAndUpdate(
        queueItemId,
        {
          agentId,
          assignedAt: new Date(),
          status: 'assigned',
        },
        { new: true }
      );

      if (updatedItem) {
        this.logger.log(`Lead ${updatedItem.leadId} assigned to agent ${agentId}`);
      }

      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to assign lead: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    try {
      const [
        totalItems,
        pendingItems,
        assignedItems,
        priorityDistribution,
      ] = await Promise.all([
        this.queueModel.countDocuments(),
        this.queueModel.countDocuments({ status: 'pending' }),
        this.queueModel.countDocuments({ status: 'assigned' }),
        this.queueModel.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
      ]);

      // Calculate average wait time
      const avgWaitTime = await this.calculateAverageWaitTime();

      const stats: QueueStats = {
        totalItems,
        pendingItems,
        assignedItems,
        averageWaitTime: avgWaitTime,
        priorityDistribution: priorityDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get queue stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove a lead from the queue
   */
  async removeFromQueue(queueItemId: string): Promise<boolean> {
    try {
      const result = await this.queueModel.findByIdAndDelete(queueItemId);
      if (result) {
        this.logger.log(`Lead ${result.leadId} removed from queue`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to remove lead from queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update queue item priority
   */
  async updatePriority(queueItemId: string, newPriority: number): Promise<QueueItem> {
    try {
      const updatedItem = await this.queueModel.findByIdAndUpdate(
        queueItemId,
        { priority: newPriority },
        { new: true }
      );

      if (updatedItem) {
        this.logger.log(`Priority updated for lead ${updatedItem.leadId} to ${newPriority}`);
      }

      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to update priority: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get queue items with pagination
   */
  async getQueueItems(page: number = 1, limit: number = 50): Promise<{
    items: QueueItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [items, total] = await Promise.all([
        this.queueModel
          .find()
          .sort({ priority: -1, createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.queueModel.countDocuments(),
      ]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to get queue items: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate average wait time for pending items
   */
  private async calculateAverageWaitTime(): Promise<number> {
    try {
      const result = await this.queueModel.aggregate([
        { $match: { status: 'pending' } },
        {
          $addFields: {
            waitTime: {
              $divide: [
                { $subtract: [new Date(), '$createdAt'] },
                1000 * 60, // Convert to minutes
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageWaitTime: { $avg: '$waitTime' },
          },
        },
      ]);

      return result.length > 0 ? result[0].averageWaitTime : 0;
    } catch (error) {
      this.logger.error(`Failed to calculate average wait time: ${error.message}`);
      return 0;
    }
  }

  /**
   * Clean up expired queue items
   */
  async cleanupExpiredItems(expirationHours: number = 24): Promise<number> {
    try {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() - expirationHours);

      const result = await this.queueModel.deleteMany({
        createdAt: { $lt: expirationDate },
        status: 'pending',
      });

      this.logger.log(`Cleaned up ${result.deletedCount} expired queue items`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup expired items: ${error.message}`);
      throw error;
    }
  }
} 