import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { QueueService, QueueStats } from '../services/queue.service';
import { CreateQueueItemDto, UpdateQueueItemDto, QueueResponseDto } from '../dto/queue.dto';

@Controller('leads/queue')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Add a lead to the queue
   */
  @Post('add')
  async addToQueue(@Body() createQueueItemDto: CreateQueueItemDto): Promise<QueueResponseDto> {
    const queueItem = await this.queueService.addToQueue(
      createQueueItemDto.leadId,
      createQueueItemDto.priority
    );
    
    return {
      success: true,
      data: queueItem,
      message: 'Lead added to queue successfully',
    };
  }

  /**
   * Get the next lead from the queue
   */
  @Get('next')
  async getNextLead(): Promise<QueueResponseDto> {
    const nextLead = await this.queueService.getNextLead();
    
    if (!nextLead) {
      return {
        success: false,
        data: null,
        message: 'No pending leads in queue',
      };
    }

    return {
      success: true,
      data: nextLead,
      message: 'Next lead retrieved successfully',
    };
  }

  /**
   * Assign a lead from the queue to an agent
   */
  @Put(':id/assign')
  async assignLead(
    @Param('id') queueItemId: string,
    @Body() updateQueueItemDto: UpdateQueueItemDto
  ): Promise<QueueResponseDto> {
    const assignedItem = await this.queueService.assignLead(
      queueItemId,
      updateQueueItemDto.agentId
    );

    return {
      success: true,
      data: assignedItem,
      message: 'Lead assigned successfully',
    };
  }

  /**
   * Get queue statistics
   */
  @Get('stats')
  async getQueueStats(): Promise<QueueResponseDto> {
    const stats = await this.queueService.getQueueStats();
    
    return {
      success: true,
      data: stats,
      message: 'Queue statistics retrieved successfully',
    };
  }

  /**
   * Get queue items with pagination
   */
  @Get('items')
  async getQueueItems(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ): Promise<QueueResponseDto> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const result = await this.queueService.getQueueItems(pageNum, limitNum);
    
    return {
      success: true,
      data: result,
      message: 'Queue items retrieved successfully',
    };
  }

  /**
   * Update queue item priority
   */
  @Put(':id/priority')
  async updatePriority(
    @Param('id') queueItemId: string,
    @Body() updateQueueItemDto: UpdateQueueItemDto
  ): Promise<QueueResponseDto> {
    const updatedItem = await this.queueService.updatePriority(
      queueItemId,
      updateQueueItemDto.priority
    );

    return {
      success: true,
      data: updatedItem,
      message: 'Priority updated successfully',
    };
  }

  /**
   * Remove a lead from the queue
   */
  @Delete(':id')
  async removeFromQueue(@Param('id') queueItemId: string): Promise<QueueResponseDto> {
    const removed = await this.queueService.removeFromQueue(queueItemId);
    
    if (removed) {
      return {
        success: true,
        data: null,
        message: 'Lead removed from queue successfully',
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'Lead not found in queue',
      };
    }
  }

  /**
   * Clean up expired queue items
   */
  @Delete('cleanup')
  async cleanupExpiredItems(
    @Query('hours') hours: string = '24'
  ): Promise<QueueResponseDto> {
    const hoursNum = parseInt(hours, 10);
    const removedCount = await this.queueService.cleanupExpiredItems(hoursNum);
    
    return {
      success: true,
      data: { removedCount },
      message: `Cleaned up ${removedCount} expired queue items`,
    };
  }
} 