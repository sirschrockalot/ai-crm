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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { ApproveTimesheetDto } from './dto/approve-timesheet.dto';
import { ExportTimeDataDto } from './dto/export-time-data.dto';
import { BulkCreateTimeEntriesDto, BulkUpdateTimeEntriesDto } from './dto/bulk-time-entries.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { StartTimerDto, StopTimerDto } from './dto/timer.dto';
import { TimesheetDraftDto } from './dto/timesheet-draft.dto';
import { RejectTimesheetDto } from './dto/reject-timesheet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Time Tracking')
@Controller('api/time-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  // Time Entry Endpoints
  @Post('entries')
  @ApiOperation({ summary: 'Create a new time entry' })
  @ApiResponse({ status: 201, description: 'Time entry created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or time overlap' })
  async createTimeEntry(
    @Body() createTimeEntryDto: CreateTimeEntryDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.createTimeEntry(
      createTimeEntryDto,
      req.user.id,
      tenantId,
    );
  }

  @Get('entries')
  @ApiOperation({ summary: 'Get time entries with optional filters' })
  @ApiResponse({ status: 200, description: 'Time entries retrieved successfully' })
  async getTimeEntries(
    @Query() filters: any,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getTimeEntries(req.user.id, tenantId, filters);
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'Get a specific time entry by ID' })
  @ApiResponse({ status: 200, description: 'Time entry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  async getTimeEntry(
    @Param('id') id: string,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getTimeEntryById(id, req.user.id, tenantId);
  }

  @Put('entries/:id')
  @ApiOperation({ summary: 'Update a time entry' })
  @ApiResponse({ status: 200, description: 'Time entry updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or time overlap' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  async updateTimeEntry(
    @Param('id') id: string,
    @Body() updateTimeEntryDto: UpdateTimeEntryDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.updateTimeEntry(
      id,
      updateTimeEntryDto,
      req.user.id,
      tenantId,
    );
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a time entry' })
  @ApiResponse({ status: 204, description: 'Time entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  async deleteTimeEntry(
    @Param('id') id: string,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    await this.timeTrackingService.deleteTimeEntry(id, req.user.id, tenantId);
  }

  // Timesheet Endpoints
  @Post('timesheets')
  @ApiOperation({ summary: 'Create a new timesheet' })
  @ApiResponse({ status: 201, description: 'Timesheet created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createTimesheet(
    @Body() createTimesheetDto: CreateTimesheetDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.createTimesheet(
      createTimesheetDto,
      req.user.id,
      tenantId,
    );
  }

  @Get('timesheets')
  @ApiOperation({ summary: 'Get timesheets with optional filters' })
  @ApiResponse({ status: 200, description: 'Timesheets retrieved successfully' })
  async getTimesheets(
    @Query() filters: any,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getTimesheets(req.user.id, tenantId, filters);
  }

  @Get('timesheets/:id')
  @ApiOperation({ summary: 'Get a specific timesheet by ID' })
  @ApiResponse({ status: 200, description: 'Timesheet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  async getTimesheet(
    @Param('id') id: string,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getTimesheetById(id, req.user.id, tenantId);
  }

  @Put('timesheets/:id')
  @ApiOperation({ summary: 'Update a timesheet' })
  @ApiResponse({ status: 200, description: 'Timesheet updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  async updateTimesheet(
    @Param('id') id: string,
    @Body() updateTimesheetDto: UpdateTimesheetDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.updateTimesheet(
      id,
      updateTimesheetDto,
      req.user.id,
      tenantId,
    );
  }

  @Post('timesheets/:id/submit')
  @ApiOperation({ summary: 'Submit a timesheet for approval' })
  @ApiResponse({ status: 200, description: 'Timesheet submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - timesheet cannot be submitted' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  async submitTimesheet(
    @Param('id') id: string,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.submitTimesheet(id, req.user.id, tenantId);
  }

  @Post('timesheets/:id/approve')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Approve or reject a timesheet' })
  @ApiResponse({ status: 200, description: 'Timesheet approval status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - timesheet cannot be approved/rejected' })
  @ApiResponse({ status: 404, description: 'Timesheet not found' })
  async approveTimesheet(
    @Param('id') id: string,
    @Body() approveTimesheetDto: ApproveTimesheetDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.approveTimesheet(
      id,
      approveTimesheetDto,
      req.user.id,
      tenantId,
    );
  }

  // Analytics Endpoints
  @Get('analytics')
  @ApiOperation({ summary: 'Get time tracking analytics' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  async getAnalytics(
    @Query() filters: any,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getTimeTrackingAnalytics(req.user.id, tenantId, filters);
  }

  // Manager-only Endpoints
  @Get('pending-timesheets')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Get pending timesheets for approval (managers only)' })
  @ApiResponse({ status: 200, description: 'Pending timesheets retrieved successfully' })
  async getPendingTimesheets(@TenantId() tenantId: string) {
    return this.timeTrackingService.getPendingTimesheets(tenantId);
  }

  // Export Endpoints
  @Post('export')
  @ApiOperation({ summary: 'Export time tracking data' })
  @ApiResponse({ status: 200, description: 'Export data generated successfully' })
  async exportTimeData(
    @Body() exportRequest: ExportTimeDataDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.exportTimeData(exportRequest, req.user.id, tenantId);
  }

  // Bulk Operations
  @Post('entries/bulk')
  @ApiOperation({ summary: 'Create multiple time entries' })
  @ApiResponse({ status: 201, description: 'Time entries created successfully' })
  async createBulkTimeEntries(
    @Body() createBulkTimeEntriesDto: BulkCreateTimeEntriesDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.createBulkTimeEntries(
      createBulkTimeEntriesDto,
      req.user.id,
      tenantId,
    );
  }

  @Put('entries/bulk')
  @ApiOperation({ summary: 'Update multiple time entries' })
  @ApiResponse({ status: 200, description: 'Time entries updated successfully' })
  async updateBulkTimeEntries(
    @Body() updateBulkTimeEntriesDto: BulkUpdateTimeEntriesDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.updateBulkTimeEntries(
      updateBulkTimeEntriesDto,
      req.user.id,
      tenantId,
    );
  }

  // Team Analytics (for managers)
  @Get('team-analytics')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Get team time tracking analytics (managers only)' })
  @ApiResponse({ status: 200, description: 'Team analytics retrieved successfully' })
  async getTeamAnalytics(
    @Query() filters: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getTeamAnalytics(tenantId, filters);
  }

  // Stats endpoint
  @Get('stats')
  @ApiOperation({ summary: 'Get time tracking statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getTimeTrackingStats(req.user.id, tenantId);
  }

  // Projects endpoint
  @Get('projects')
  @ApiOperation({ summary: 'Get available projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async getProjects(
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getProjects(tenantId);
  }

  // Project tasks endpoint
  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Get tasks for a specific project' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getProjectTasks(
    @Param('projectId') projectId: string,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getProjectTasks(projectId, tenantId);
  }

  // Timer endpoints
  @Post('timer/start')
  @ApiOperation({ summary: 'Start a timer for time tracking' })
  @ApiResponse({ status: 200, description: 'Timer started successfully' })
  async startTimer(
    @Body() startTimerDto: StartTimerDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.startTimer(
      req.user.id,
      startTimerDto.projectId,
      tenantId,
      startTimerDto.taskId,
    );
  }

  @Post('timer/:timerId/stop')
  @ApiOperation({ summary: 'Stop a timer' })
  @ApiResponse({ status: 200, description: 'Timer stopped successfully' })
  async stopTimer(
    @Param('timerId') timerId: string,
    @Body() stopTimerDto: StopTimerDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.stopTimer(timerId, req.user.id, stopTimerDto.description, tenantId);
  }

  @Get('timer/active')
  @ApiOperation({ summary: 'Get active timer' })
  @ApiResponse({ status: 200, description: 'Active timer retrieved successfully' })
  async getActiveTimer(
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getActiveTimer(req.user.id, tenantId);
  }

  // Approval queue endpoint
  @Get('approval-queue')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Get approval queue (managers only)' })
  @ApiResponse({ status: 200, description: 'Approval queue retrieved successfully' })
  async getApprovalQueue(
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getApprovalQueue(tenantId);
  }

  // Recent entries endpoint
  @Get('entries/recent')
  @ApiOperation({ summary: 'Get recent time entries' })
  @ApiResponse({ status: 200, description: 'Recent entries retrieved successfully' })
  async getRecentEntries(
    @Query('limit') limit: number = 10,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getRecentEntries(req.user.id, tenantId, limit);
  }

  // Project allocation endpoint
  @Get('projects/allocation')
  @ApiOperation({ summary: 'Get project time allocation' })
  @ApiResponse({ status: 200, description: 'Project allocation retrieved successfully' })
  async getProjectAllocation(
    @Query('weekStartDate') weekStartDate: string,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getProjectAllocation(req.user.id, tenantId, new Date(weekStartDate));
  }

  // Weekly timesheet endpoint
  @Get('timesheet/weekly')
  @ApiOperation({ summary: 'Get weekly timesheet data' })
  @ApiResponse({ status: 200, description: 'Weekly timesheet retrieved successfully' })
  async getWeeklyTimesheet(
    @Query('weekStartDate') weekStartDate: string,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.getWeeklyTimesheet(req.user.id, tenantId, new Date(weekStartDate));
  }

  // Timesheet draft endpoint
  @Post('timesheet/draft')
  @ApiOperation({ summary: 'Save timesheet as draft' })
  @ApiResponse({ status: 201, description: 'Timesheet draft saved successfully' })
  async saveTimesheetDraft(
    @Body() timesheetDraftDto: TimesheetDraftDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.saveTimesheetDraft(req.user.id, timesheetDraftDto, tenantId);
  }

  // Reject timesheet endpoint
  @Post('timesheets/:id/reject')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Reject a timesheet' })
  @ApiResponse({ status: 200, description: 'Timesheet rejected successfully' })
  async rejectTimesheet(
    @Param('id') id: string,
    @Body() rejectTimesheetDto: RejectTimesheetDto,
    @Request() req: any,
    @TenantId() tenantId: string,
  ) {
    return this.timeTrackingService.rejectTimesheet(id, rejectTimesheetDto.reason, req.user.id, tenantId);
  }
}
