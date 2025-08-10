import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TimeEntry, TimeEntryDocument } from './schemas/time-entry.schema';
import { Timesheet, TimesheetDocument } from './schemas/timesheet.schema';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { ApproveTimesheetDto } from './dto/approve-timesheet.dto';
import { ExportTimeDataDto } from './dto/export-time-data.dto';
import { BulkCreateTimeEntriesDto } from './dto/bulk-time-entries.dto';
import { BulkUpdateTimeEntriesDto } from './dto/bulk-time-entries.dto';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectModel(TimeEntry.name) private timeEntryModel: Model<TimeEntryDocument>,
    @InjectModel(Timesheet.name) private timesheetModel: Model<TimesheetDocument>,
  ) {}

  // Time Entry Methods
  async createTimeEntry(createTimeEntryDto: CreateTimeEntryDto, userId: string, tenantId: string): Promise<TimeEntry> {
    // Validate time overlap
    await this.validateTimeOverlap(
      userId,
      new Date(createTimeEntryDto.startTime),
      new Date(createTimeEntryDto.endTime),
      null
    );

    const timeEntry = new this.timeEntryModel({
      ...createTimeEntryDto,
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      startTime: new Date(createTimeEntryDto.startTime),
      endTime: new Date(createTimeEntryDto.endTime),
    });

    return timeEntry.save();
  }

  async getTimeEntries(userId: string, tenantId: string, filters?: any): Promise<TimeEntry[]> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    };

    if (filters?.startDate) {
      query.startTime = { $gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      query.endTime = { $lte: new Date(filters.endDate) };
    }
    if (filters?.projectId) {
      query.projectId = new Types.ObjectId(filters.projectId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }

    return this.timeEntryModel.find(query).sort({ startTime: -1 }).exec();
  }

  async getTimeEntryById(id: string, userId: string, tenantId: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    }).exec();

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    return timeEntry;
  }

  async updateTimeEntry(id: string, updateTimeEntryDto: UpdateTimeEntryDto, userId: string, tenantId: string): Promise<TimeEntry> {
    const timeEntry = await this.getTimeEntryById(id, userId, tenantId);

    // Validate time overlap if time is being changed
    if (updateTimeEntryDto.startTime || updateTimeEntryDto.endTime) {
      await this.validateTimeOverlap(
        userId,
        updateTimeEntryDto.startTime ? new Date(updateTimeEntryDto.startTime) : timeEntry.startTime,
        updateTimeEntryDto.endTime ? new Date(updateTimeEntryDto.endTime) : timeEntry.endTime,
        id
      );
    }

    const updatedTimeEntry = await this.timeEntryModel.findByIdAndUpdate(
      id,
      {
        ...updateTimeEntryDto,
        ...(updateTimeEntryDto.startTime && { startTime: new Date(updateTimeEntryDto.startTime) }),
        ...(updateTimeEntryDto.endTime && { endTime: new Date(updateTimeEntryDto.endTime) }),
      },
      { new: true }
    ).exec();

    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: string, userId: string, tenantId: string): Promise<void> {
    await this.getTimeEntryById(id, userId, tenantId);
    await this.timeEntryModel.findByIdAndDelete(id).exec();
  }

  // Timesheet Methods
  async createTimesheet(createTimesheetDto: CreateTimesheetDto, userId: string, tenantId: string): Promise<Timesheet> {
    const timesheet = new this.timesheetModel({
      ...createTimesheetDto,
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      weekStartDate: new Date(createTimesheetDto.weekStartDate),
      weekEndDate: new Date(createTimesheetDto.weekEndDate),
    });

    return timesheet.save();
  }

  async getTimesheets(userId: string, tenantId: string, filters?: any): Promise<Timesheet[]> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    };

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.startDate) {
      query.weekStartDate = { $gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      query.weekEndDate = { $lte: new Date(filters.endDate) };
    }

    return this.timesheetModel.find(query).sort({ weekStartDate: -1 }).exec();
  }

  async getTimesheetById(id: string, userId: string, tenantId: string): Promise<Timesheet> {
    const timesheet = await this.timesheetModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    }).exec();

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    return timesheet;
  }

  async updateTimesheet(id: string, updateTimesheetDto: any, userId: string, tenantId: string): Promise<Timesheet> {
    await this.getTimesheetById(id, userId, tenantId);

    const updatedTimesheet = await this.timesheetModel.findByIdAndUpdate(
      id,
      {
        ...updateTimesheetDto,
        ...(updateTimesheetDto.weekStartDate && { weekStartDate: new Date(updateTimesheetDto.weekStartDate) }),
        ...(updateTimesheetDto.weekEndDate && { weekEndDate: new Date(updateTimesheetDto.weekEndDate) }),
      },
      { new: true }
    ).exec();

    return updatedTimesheet;
  }

  async submitTimesheet(id: string, userId: string, tenantId: string): Promise<Timesheet> {
    const timesheet = await this.getTimesheetById(id, userId, tenantId);

    if (timesheet.status !== 'draft') {
      throw new BadRequestException('Only draft timesheets can be submitted');
    }

    return this.timesheetModel.findByIdAndUpdate(
      id,
      {
        status: 'submitted',
        submittedAt: new Date(),
      },
      { new: true }
    ).exec();
  }

  async approveTimesheet(id: string, approveTimesheetDto: ApproveTimesheetDto, approverId: string, tenantId: string): Promise<Timesheet> {
    const timesheet = await this.timesheetModel.findOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    }).exec();

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    if (timesheet.status !== 'submitted') {
      throw new BadRequestException('Only submitted timesheets can be approved/rejected');
    }

    const newStatus = approveTimesheetDto.approved ? 'approved' : 'rejected';
    const updateData: any = {
      status: newStatus,
      approvedBy: new Types.ObjectId(approverId),
      approvedAt: new Date(),
    };

    if (approveTimesheetDto.comments) {
      updateData.comments = approveTimesheetDto.comments;
    }

    return this.timesheetModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  // Analytics Methods
  async getTimeTrackingAnalytics(userId: string, tenantId: string, filters?: any): Promise<any> {
    const matchStage: any = {
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
    };

    if (filters?.startDate) {
      matchStage.startTime = { $gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      matchStage.endTime = { $lte: new Date(filters.endDate) };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$duration' },
          billableHours: { $sum: { $cond: ['$billable', '$duration', 0] } },
          nonBillableHours: { $sum: { $cond: ['$billable', 0, '$duration'] } },
          totalEntries: { $sum: 1 },
          billableEntries: { $sum: { $cond: ['$billable', 1, 0] } },
        },
      },
    ];

    const result = await this.timeEntryModel.aggregate(pipeline).exec();
    return result[0] || {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      totalEntries: 0,
      billableEntries: 0,
    };
  }

  // Helper Methods
  private async validateTimeOverlap(userId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<void> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const overlappingEntries = await this.timeEntryModel.find(query).exec();

    if (overlappingEntries.length > 0) {
      throw new BadRequestException('Time entry overlaps with existing entries');
    }
  }

  // Get pending timesheets for approval (for managers)
  async getPendingTimesheets(tenantId: string): Promise<Timesheet[]> {
    return this.timesheetModel.find({
      tenantId: new Types.ObjectId(tenantId),
      status: 'submitted',
    })
    .populate('userId', 'firstName lastName email')
    .sort({ submittedAt: 1 })
    .exec();
  }

  // Export functionality
  async exportTimeData(exportRequest: ExportTimeDataDto, userId: string, tenantId: string): Promise<any> {
    const query: any = {
      tenantId: new Types.ObjectId(tenantId),
    };

    // Apply filters
    if (exportRequest.startDate) {
      query.startTime = { $gte: new Date(exportRequest.startDate) };
    }
    if (exportRequest.endDate) {
      query.endTime = { $lte: new Date(exportRequest.endDate) };
    }
    if (exportRequest.projectIds && exportRequest.projectIds.length > 0) {
      query.projectId = { $in: exportRequest.projectIds.map(id => new Types.ObjectId(id)) };
    }
    if (exportRequest.userIds && exportRequest.userIds.length > 0) {
      query.userId = { $in: exportRequest.userIds.map(id => new Types.ObjectId(id)) };
    }
    if (exportRequest.billableOnly) {
      query.billable = true;
    }

    // Get time entries
    const timeEntries = await this.timeEntryModel.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('projectId', 'name')
      .populate('taskId', 'name')
      .sort({ startTime: 1 })
      .exec();

    // Format data based on export format
    switch (exportRequest.format) {
      case 'csv':
        return this.formatCsvExport(timeEntries, exportRequest);
      case 'pdf':
        return this.formatPdfExport(timeEntries, exportRequest);
      case 'excel':
        return this.formatExcelExport(timeEntries, exportRequest);
      default:
        throw new BadRequestException('Unsupported export format');
    }
  }

  // Bulk operations
  async createBulkTimeEntries(bulkDto: BulkCreateTimeEntriesDto, userId: string, tenantId: string): Promise<TimeEntry[]> {
    const timeEntries = bulkDto.entries.map(entry => ({
      ...entry,
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      startTime: new Date(entry.startTime),
      endTime: new Date(entry.endTime),
    }));

    // Validate all entries for time overlap
    for (const entry of timeEntries) {
      await this.validateTimeOverlap(
        userId,
        entry.startTime,
        entry.endTime,
        null
      );
    }

    const createdEntries = await this.timeEntryModel.insertMany(timeEntries);
    return createdEntries as unknown as TimeEntry[];
  }

  async updateBulkTimeEntries(bulkDto: BulkUpdateTimeEntriesDto, userId: string, tenantId: string): Promise<TimeEntry[]> {
    const updatedEntries: TimeEntry[] = [];

    for (const update of bulkDto.updates) {
      const updatedEntry = await this.updateTimeEntry(
        update.id,
        update.data,
        userId,
        tenantId
      );
      updatedEntries.push(updatedEntry);
    }

    return updatedEntries;
  }

  // Team analytics for managers
  async getTeamAnalytics(tenantId: string, filters?: any): Promise<any> {
    const query: any = { tenantId: new Types.ObjectId(tenantId) };

    if (filters?.startDate) {
      query.startTime = { $gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      query.endTime = { $lte: new Date(filters.endDate) };
    }

    const timeEntries = await this.timeEntryModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$userId',
          totalHours: { $sum: '$duration' },
          billableHours: { $sum: { $cond: ['$billable', '$duration', 0] } },
          entryCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: '$user.firstName',
          totalHours: 1,
          billableHours: 1,
          entryCount: 1,
        },
      },
    ]);

    return timeEntries;
  }

  // Get time tracking statistics
  async getTimeTrackingStats(userId: string, tenantId: string): Promise<any> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // This week's hours
    const thisWeekEntries = await this.timeEntryModel.find({
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      startTime: { $gte: weekStart, $lte: weekEnd },
    });

    const thisWeek = thisWeekEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const billableHours = thisWeekEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0);

    // Active projects this week
    const activeProjects = await this.timeEntryModel.distinct('projectId', {
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      startTime: { $gte: weekStart, $lte: weekEnd },
    });

    // Pending approvals (if user is manager)
    const pendingApprovals = await this.timesheetModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
      status: 'submitted',
    });

    // Weekly trend (compare to last week)
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(weekStart.getDate() - 1);

    const lastWeekEntries = await this.timeEntryModel.find({
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      startTime: { $gte: lastWeekStart, $lte: lastWeekEnd },
    });

    const lastWeek = lastWeekEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const weeklyTrend = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    return {
      thisWeek,
      billableHours,
      activeProjects: activeProjects.length,
      timesheetStatus: 'draft', // Default status
      weeklyTrend,
      billablePercentage: thisWeek > 0 ? (billableHours / thisWeek) * 100 : 0,
      pendingApprovals,
    };
  }

  // Get available projects
  async getProjects(tenantId: string): Promise<any[]> {
    // This is a placeholder - in a real system, you'd have a projects collection
    // For now, return mock data or integrate with existing project management
    return [
      {
        id: '1',
        name: 'Project Alpha',
        description: 'Main development project',
        isActive: true,
        billableRate: 150,
      },
      {
        id: '2',
        name: 'Project Beta',
        description: 'Client consultation project',
        isActive: true,
        billableRate: 200,
      },
      {
        id: '3',
        name: 'Project Gamma',
        description: 'Internal research project',
        isActive: true,
        billableRate: 0,
      },
    ];
  }

  // Get tasks for a specific project
  async getProjectTasks(projectId: string, tenantId: string): Promise<any[]> {
    // This is a placeholder - in a real system, you'd have a tasks collection
    // For now, return mock data or integrate with existing task management
    return [
      {
        id: '1',
        projectId,
        name: 'Development',
        description: 'Software development tasks',
        isActive: true,
      },
      {
        id: '2',
        projectId,
        name: 'Testing',
        description: 'Quality assurance tasks',
        isActive: true,
      },
      {
        id: '3',
        projectId,
        name: 'Documentation',
        description: 'Documentation and reporting',
        isActive: true,
      },
    ];
  }

  // Timer functionality
  private activeTimers = new Map<string, { startTime: Date; projectId: string; taskId?: string; userId: string }>();

  async startTimer(userId: string, projectId: string, tenantId: string, taskId?: string): Promise<any> {
    // Stop any existing timer for this user
    await this.stopTimer(userId, userId, 'Timer stopped automatically', tenantId);

    const timerId = `timer_${userId}_${Date.now()}`;
    this.activeTimers.set(userId, {
      startTime: new Date(),
      projectId,
      taskId,
      userId,
    });

    return {
      timerId,
      startTime: new Date(),
      projectId,
      taskId,
    };
  }

  async stopTimer(timerId: string, userId: string, description: string, tenantId: string): Promise<TimeEntry> {
    const timer = this.activeTimers.get(userId);
    if (!timer) {
      throw new BadRequestException('No active timer found');
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - timer.startTime.getTime()) / (1000 * 60 * 60); // hours

    // Create time entry
    const timeEntry = new this.timeEntryModel({
      userId: new Types.ObjectId(userId),
      projectId: new Types.ObjectId(timer.projectId),
      taskId: timer.taskId ? new Types.ObjectId(timer.taskId) : undefined,
      startTime: timer.startTime,
      endTime,
      duration,
      description,
      billable: true,
      tenantId: new Types.ObjectId(tenantId),
    });

    // Remove timer
    this.activeTimers.delete(userId);

    return timeEntry.save();
  }

  async getActiveTimer(userId: string, tenantId: string): Promise<any> {
    const timer = this.activeTimers.get(userId);
    if (!timer) {
      return null;
    }

    return {
      timerId: `timer_${userId}_${timer.startTime.getTime()}`,
      startTime: timer.startTime,
      projectId: timer.projectId,
      taskId: timer.taskId,
    };
  }

  // Get approval queue
  async getApprovalQueue(tenantId: string): Promise<any[]> {
    const pendingTimesheets = await this.timesheetModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        status: 'submitted',
      })
      .populate('userId', 'firstName lastName')
      .sort({ submittedAt: 1 })
      .exec();

    return pendingTimesheets.map(timesheet => {
      const populatedUserId = timesheet.userId as any;
      return {
        id: timesheet._id.toString(),
        userId: populatedUserId._id.toString(),
        userName: `${populatedUserId.firstName} ${populatedUserId.lastName}`,
        weekStartDate: timesheet.weekStartDate,
        weekEndDate: timesheet.weekEndDate,
        totalHours: timesheet.totalHours,
        status: timesheet.status,
        submittedAt: timesheet.submittedAt,
      };
    });
  }

  // Get recent time entries
  async getRecentEntries(userId: string, tenantId: string, limit: number = 10): Promise<TimeEntry[]> {
    return this.timeEntryModel
      .find({
        userId: new Types.ObjectId(userId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .sort({ startTime: -1 })
      .limit(limit)
      .exec();
  }

  // Get project time allocation
  async getProjectAllocation(userId: string, tenantId: string, weekStartDate: Date): Promise<any[]> {
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekStartDate.getDate() + 6);

    const timeEntries = await this.timeEntryModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          tenantId: new Types.ObjectId(tenantId),
          startTime: { $gte: weekStartDate, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: '$projectId',
          totalHours: { $sum: '$duration' },
          billableHours: { $sum: { $cond: ['$billable', '$duration', 0] } },
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      {
        $project: {
          projectId: '$_id',
          projectName: '$project.name',
          totalHours: 1,
          billableHours: 1,
          percentage: 1,
        },
      },
    ]);

    // Calculate percentages
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    return timeEntries.map(entry => ({
      ...entry,
      percentage: totalHours > 0 ? (entry.totalHours / totalHours) * 100 : 0,
    }));
  }

  // Get weekly timesheet data
  async getWeeklyTimesheet(userId: string, tenantId: string, weekStartDate: Date): Promise<any> {
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekStartDate.getDate() + 6);

    const timeEntries = await this.timeEntryModel.find({
      userId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      startTime: { $gte: weekStartDate, $lte: weekEnd },
    });

    const days: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      
      const dayEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === date.getTime();
      });

      const dayHours = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const dayBillableHours = dayEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + entry.duration, 0);

      days.push({
        date,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: date.getTime() === today.getTime(),
        hours: dayHours,
        billableHours: dayBillableHours,
        entries: dayEntries,
      });
    }

    const totalHours = days.reduce((sum, day) => sum + day.hours, 0);
    const billableHours = days.reduce((sum, day) => sum + day.billableHours, 0);

    return {
      weekStartDate,
      weekEndDate: weekEnd,
      days,
      totalHours,
      billableHours,
      status: 'draft',
    };
  }

  // Save timesheet as draft
  async saveTimesheetDraft(userId: string, timesheetData: any, tenantId: string): Promise<Timesheet> {
    // This is a simplified implementation - in a real system, you'd save the timesheet data
    // For now, return a mock timesheet
    const timesheet = new this.timesheetModel({
      userId: new Types.ObjectId(userId),
      weekStartDate: timesheetData.weekStartDate,
      weekEndDate: timesheetData.weekEndDate,
      totalHours: timesheetData.totalHours,
      billableHours: timesheetData.billableHours,
      status: 'draft',
      tenantId: new Types.ObjectId(tenantId),
      entries: [],
    });

    return timesheet.save();
  }

  // Reject timesheet
  async rejectTimesheet(id: string, reason: string, approverId: string, tenantId: string): Promise<Timesheet> {
    const timesheet = await this.timesheetModel.findOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    if (timesheet.status !== 'submitted') {
      throw new BadRequestException('Timesheet cannot be rejected in current status');
    }

    timesheet.status = 'rejected';
    timesheet.rejectionReason = reason;
    timesheet.approvedBy = new Types.ObjectId(approverId);
    timesheet.approvedAt = new Date();

    return timesheet.save();
  }

  // Private helper methods for export formatting
  private formatCsvExport(timeEntries: any[], exportRequest: ExportTimeDataDto): any {
    const headers = ['Date', 'User', 'Project', 'Task', 'Start Time', 'End Time', 'Duration', 'Description', 'Billable'];
    if (exportRequest.includeStatus) {
      headers.push('Status');
    }

    const rows = timeEntries.map(entry => {
      const row = [
        new Date(entry.startTime).toLocaleDateString(),
        `${entry.userId.firstName} ${entry.userId.lastName}`,
        entry.projectId?.name || 'N/A',
        entry.taskId?.name || 'N/A',
        new Date(entry.startTime).toLocaleTimeString(),
        new Date(entry.endTime).toLocaleTimeString(),
        `${entry.duration}h`,
        entry.description,
        entry.billable ? 'Yes' : 'No',
      ];

      if (exportRequest.includeStatus) {
        row.push(entry.status || 'N/A');
      }

      return row;
    });

    return {
      format: 'csv',
      data: [headers, ...rows],
      filename: `time-tracking-export-${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  private formatPdfExport(timeEntries: any[], exportRequest: ExportTimeDataDto): any {
    // This would integrate with a PDF generation library
    // For now, return a placeholder
    return {
      format: 'pdf',
      data: timeEntries,
      filename: `time-tracking-export-${new Date().toISOString().split('T')[0]}.pdf`,
      message: 'PDF export requires additional PDF generation library integration',
    };
  }

  private formatExcelExport(timeEntries: any[], exportRequest: ExportTimeDataDto): any {
    // This would integrate with an Excel generation library
    // For now, return a placeholder
    return {
      format: 'excel',
      data: timeEntries,
      filename: `time-tracking-export-${new Date().toISOString().split('T')[0]}.xlsx`,
      message: 'Excel export requires additional Excel generation library integration',
    };
  }
}
