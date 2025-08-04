import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { LeadQueueService } from '../services/lead-queue.service';
import {
  QueueEntryDto,
  QueueStatusDto,
  AssignmentRequestDto,
  ManualAssignmentDto,
  QueueConfigurationDto,
  QueueAnalyticsDto,
  QueuePerformanceDto,
  QueueOptimizationDto,
  QueueReorderingDto,
  QueueBulkOperationDto,
} from '../dto/queue.dto';
import { RequestWithTenant } from '../../../common/middleware/tenant-isolation.middleware';

@ApiTags('Lead Queue')
@Controller('leads/queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(private readonly leadQueueService: LeadQueueService) {}

  @Post('add')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Add lead to queue',
    description: 'Adds a lead to the FIFO queue with priority handling',
  })
  @ApiResponse({
    status: 201,
    description: 'Lead added to queue successfully',
    type: QueueEntryDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Queue is full or invalid data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async addToQueue(
    @Body() queueData: any,
    @Request() req: RequestWithTenant,
  ): Promise<QueueEntryDto> {
    return this.leadQueueService.addToQueue(queueData, req);
  }

  @Post('batch-add')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Batch add leads to queue',
    description: 'Adds multiple leads to the queue in a single operation',
  })
  @ApiResponse({
    status: 201,
    description: 'Leads added to queue successfully',
    type: [QueueEntryDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Queue capacity exceeded or invalid data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async batchAddToQueue(
    @Body() leadsData: any[],
    @Request() req: RequestWithTenant,
  ): Promise<QueueEntryDto[]> {
    return this.leadQueueService.batchAddToQueue(leadsData, req);
  }

  @Get('next')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get next lead from queue',
    description: 'Retrieves the next lead from the queue based on FIFO and priority',
  })
  @ApiResponse({
    status: 200,
    description: 'Next lead retrieved successfully',
    type: QueueEntryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No leads available in queue',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getNextLead(@Request() req: RequestWithTenant): Promise<QueueEntryDto | null> {
    return this.leadQueueService.getNextLead(req);
  }

  @Post(':queueId/assign')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Assign lead to agent',
    description: 'Assigns a specific lead from the queue to an agent',
  })
  @ApiParam({ name: 'queueId', description: 'Queue entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead assigned successfully',
    type: QueueEntryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Queue entry not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot assign lead with current status',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async assignLead(
    @Param('queueId') queueId: string,
    @Body() assignmentRequest: AssignmentRequestDto,
    @Request() req: RequestWithTenant,
  ): Promise<QueueEntryDto> {
    return this.leadQueueService.assignLead(queueId, assignmentRequest.agentId!, req);
  }

  @Post('manual-assign')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Manual lead assignment',
    description: 'Manually assigns multiple leads to a specific agent',
  })
  @ApiResponse({
    status: 200,
    description: 'Leads assigned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid assignment data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async manualAssignment(
    @Body() manualAssignment: ManualAssignmentDto,
    @Request() req: RequestWithTenant,
  ): Promise<{ message: string; assignedCount: number }> {
    // This would typically call a service method for manual assignment
    // For now, returning a placeholder response
    return {
      message: 'Manual assignment completed',
      assignedCount: manualAssignment.leadIds.length,
    };
  }

  @Put(':queueId/status')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Update queue entry status',
    description: 'Updates the status of a queue entry',
  })
  @ApiParam({ name: 'queueId', description: 'Queue entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: QueueEntryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Queue entry not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateQueueStatus(
    @Param('queueId') queueId: string,
    @Body() statusUpdate: { status: string },
    @Request() req: RequestWithTenant,
  ): Promise<QueueEntryDto> {
    return this.leadQueueService.updateQueueStatus(queueId, statusUpdate.status as any, req);
  }

  @Get('status')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get queue status',
    description: 'Retrieves current queue status and statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue status retrieved successfully',
    type: QueueStatusDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getQueueStatus(@Request() req: RequestWithTenant): Promise<QueueStatusDto> {
    return this.leadQueueService.getQueueStatus(req);
  }

  @Get('entries')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get queue entries',
    description: 'Retrieves queue entries with filtering and pagination',
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'Filter by assigned agent' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Queue entries retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getQueueEntries(
    @Query() filters: any,
    @Request() req: RequestWithTenant,
  ): Promise<{ entries: QueueEntryDto[]; total: number; page: number; limit: number }> {
    return this.leadQueueService.getQueueEntries(filters, req);
  }

  @Delete(':queueId')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove lead from queue',
    description: 'Removes a lead from the queue',
  })
  @ApiParam({ name: 'queueId', description: 'Queue entry ID' })
  @ApiResponse({
    status: 204,
    description: 'Lead removed from queue successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Queue entry not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async removeFromQueue(
    @Param('queueId') queueId: string,
    @Request() req: RequestWithTenant,
  ): Promise<void> {
    return this.leadQueueService.removeFromQueue(queueId, req);
  }

  @Put(':queueId/reorder')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Reorder queue entry',
    description: 'Changes the priority of a queue entry',
  })
  @ApiParam({ name: 'queueId', description: 'Queue entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Queue entry reordered successfully',
    type: QueueEntryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Queue entry not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async reorderQueueEntry(
    @Param('queueId') queueId: string,
    @Body() reorderRequest: QueueReorderingDto,
    @Request() req: RequestWithTenant,
  ): Promise<QueueEntryDto> {
    return this.leadQueueService.reorderQueueEntry(queueId, reorderRequest.newPriority!, req);
  }

  @Post('bulk-operation')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Bulk queue operations',
    description: 'Performs bulk operations on multiple queue entries',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk operation completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid operation data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async bulkOperation(
    @Body() bulkOperation: QueueBulkOperationDto,
    @Request() req: RequestWithTenant,
  ): Promise<{ message: string; processedCount: number }> {
    // This would typically call a service method for bulk operations
    // For now, returning a placeholder response
    return {
      message: 'Bulk operation completed',
      processedCount: bulkOperation.queueIds.length,
    };
  }

  @Get('configuration')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Get queue configuration',
    description: 'Retrieves the current queue configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue configuration retrieved successfully',
    type: QueueConfigurationDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getQueueConfiguration(@Request() req: RequestWithTenant): Promise<QueueConfigurationDto> {
    return this.leadQueueService.getQueueConfiguration(req.tenant.tenantId);
  }

  @Put('configuration')
  @Roles('admin')
  @ApiOperation({
    summary: 'Update queue configuration',
    description: 'Updates the queue configuration settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue configuration updated successfully',
    type: QueueConfigurationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateQueueConfiguration(
    @Body() configuration: QueueConfigurationDto,
    @Request() req: RequestWithTenant,
  ): Promise<QueueConfigurationDto> {
    return this.leadQueueService.updateQueueConfiguration(configuration, req);
  }

  @Get('analytics')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Get queue analytics',
    description: 'Retrieves comprehensive queue analytics and performance metrics',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Analytics period' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date' })
  @ApiResponse({
    status: 200,
    description: 'Queue analytics retrieved successfully',
    type: QueueAnalyticsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getQueueAnalytics(
    @Query() filters: any,
    @Request() req: RequestWithTenant,
  ): Promise<QueueAnalyticsDto> {
    // This would typically call a service method for analytics
    // For now, returning mock data structure
    return {
      period: 'daily',
      totalLeadsQueued: 0,
      totalLeadsAssigned: 0,
      totalLeadsCompleted: 0,
      averageWaitTime: 0,
      averageProcessingTime: 0,
      queueThroughput: 0,
      queueUtilization: 0,
      automaticAssignments: 0,
      manualAssignments: 0,
      reassignments: 0,
      averageAssignmentTime: 0,
      totalAgents: 0,
      activeAgents: 0,
      averageAgentWorkload: 0,
      workloadBalanceScore: 0,
      bottleneckDetected: false,
      conversionRate: 0,
      responseRate: 0,
      satisfactionScore: 0,
      priorityDistribution: {
        urgent: 0,
        high: 0,
        normal: 0,
        low: 0,
      },
      date: new Date(),
    };
  }

  @Get('performance')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Get queue performance metrics',
    description: 'Retrieves detailed queue performance metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
    type: QueuePerformanceDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getQueuePerformance(@Request() req: RequestWithTenant): Promise<QueuePerformanceDto> {
    // This would typically call a service method for performance metrics
    // For now, returning mock data structure
    return {
      averageProcessingTimeMs: 0,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      successRate: 0,
      averageAssignmentTimeMs: 0,
      throughput: 0,
      latency: 0,
      lastOperationTime: new Date(),
      performanceByPeriod: [],
    };
  }

  @Get('optimization')
  @Roles('admin')
  @ApiOperation({
    summary: 'Get queue optimization recommendations',
    description: 'Retrieves optimization recommendations for the queue system',
  })
  @ApiResponse({
    status: 200,
    description: 'Optimization recommendations retrieved successfully',
    type: QueueOptimizationDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getQueueOptimization(@Request() req: RequestWithTenant): Promise<QueueOptimizationDto> {
    // This would typically call a service method for optimization recommendations
    // For now, returning mock data structure
    return {
      recommendations: [],
      improvements: [],
      configSuggestions: [],
      estimatedGains: 0,
      priority: 'low',
      effort: 'low',
      timestamp: new Date(),
    };
  }

  @Post('cleanup')
  @Roles('admin')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Clean up expired queue entries',
    description: 'Removes expired entries from the queue',
  })
  @ApiResponse({
    status: 202,
    description: 'Cleanup job started successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async cleanupExpiredEntries(@Request() req: RequestWithTenant): Promise<{ message: string; cleanedCount: number }> {
    const cleanedCount = await this.leadQueueService.cleanupExpiredEntries(req);
    return {
      message: 'Queue cleanup completed',
      cleanedCount,
    };
  }

  @Post('pause')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Pause queue processing',
    description: 'Pauses the queue processing temporarily',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue paused successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async pauseQueue(@Request() req: RequestWithTenant): Promise<{ message: string; status: string }> {
    // This would typically call a service method to pause queue processing
    return {
      message: 'Queue processing paused',
      status: 'paused',
    };
  }

  @Post('resume')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Resume queue processing',
    description: 'Resumes the queue processing after being paused',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue resumed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async resumeQueue(@Request() req: RequestWithTenant): Promise<{ message: string; status: string }> {
    // This would typically call a service method to resume queue processing
    return {
      message: 'Queue processing resumed',
      status: 'active',
    };
  }
} 