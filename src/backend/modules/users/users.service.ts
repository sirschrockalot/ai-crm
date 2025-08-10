import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { User, UserDocument, UserStatus, UserRole } from './schemas/user.schema';
import { UserActivity, UserActivityDocument, ActivityType, ActivitySeverity } from './schemas/user-activity.schema';
import { UserStatusHistory, UserStatusHistoryDocument, StatusChangeReason } from './schemas/user-status-history.schema';
import { CreateUserDto, UpdateUserDto, UserSearchDto } from './dto/user.dto';
import { EmailService } from './services/email.service';
import { UserValidationService } from './services/user-validation.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivityDocument>,
    @InjectModel(UserStatusHistory.name) private userStatusHistoryModel: Model<UserStatusHistoryDocument>,
    private readonly emailService: EmailService,
    private readonly userValidationService: UserValidationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new user
   */
  async createUser(createUserDto: CreateUserDto, performedBy?: Types.ObjectId): Promise<User> {
    // Validate user data
    await this.userValidationService.validateCreateUser(createUserDto);

    // Check for existing user
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user with default settings
    const user = new this.userModel({
      ...createUserDto,
      settings: this.getDefaultUserSettings(),
      status: UserStatus.PENDING,
      roles: [UserRole.USER],
    });

    const savedUser = await user.save();

    // Log user creation
    await this.logUserActivity({
      userId: savedUser._id,
      tenantId: savedUser.tenantId,
      type: ActivityType.ACCOUNT_CREATION,
      description: 'User account created',
      severity: ActivitySeverity.LOW,
      performedBy,
      metadata: {
        email: savedUser.email,
        roles: savedUser.roles,
      },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.firstName);

    return savedUser;
  }

  /**
   * Create user from Google OAuth data
   */
  async createUserFromOAuth(googleUser: any, tenantId?: Types.ObjectId): Promise<User> {
    const createUserDto: CreateUserDto = {
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      picture: googleUser.picture,
      googleId: googleUser.id,
      tenantId,
    };

    return this.createUser(createUserDto);
  }

  /**
   * Find user by ID
   */
  async findById(userId: string | Types.ObjectId): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  /**
   * Find or create user from Google OAuth
   */
  async findOrCreateFromOAuth(googleUser: any, tenantId?: Types.ObjectId): Promise<User> {
    let user = await this.findByGoogleId(googleUser.id);
    
    if (!user) {
      user = await this.findByEmail(googleUser.email);
      
      if (user) {
        // Update existing user with Google ID
        user.googleId = googleUser.id;
        user.picture = googleUser.picture;
        await (user as any).save();
      } else {
        // Create new user
        user = await this.createUserFromOAuth(googleUser, tenantId);
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();
    user.status = UserStatus.ACTIVE;
    await (user as any).save();

    // Log login activity
    await this.logUserActivity({
      userId: user._id,
      tenantId: user.tenantId,
      type: ActivityType.LOGIN,
      description: 'User logged in via Google OAuth',
      severity: ActivitySeverity.LOW,
      metadata: {
        method: 'google_oauth',
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(userId: string | Types.ObjectId, updateUserDto: UpdateUserDto, performedBy?: Types.ObjectId): Promise<User> {
    const user = await this.findById(userId);

    // Validate update data
    await this.userValidationService.validateUpdateUser(updateUserDto);

    // Check for email conflicts if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Track changes for activity logging
    const changes: Record<string, any> = {};
    Object.keys(updateUserDto).forEach(key => {
      if (user[key] !== updateUserDto[key]) {
        changes[key] = { old: user[key], new: updateUserDto[key] };
      }
    });

    // Update user
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { ...updateUserDto, lastActiveAt: new Date() },
      { new: true }
    ).exec();

    // Log profile update activity
    if (Object.keys(changes).length > 0) {
      await this.logUserActivity({
        userId: user._id,
        tenantId: user.tenantId,
        type: ActivityType.PROFILE_UPDATE,
        description: 'User profile updated',
        severity: ActivitySeverity.LOW,
        performedBy,
        metadata: {
          changes,
        },
      });

      // Send profile change notification to user
      await this.emailService.sendProfileChangeNotification(
        user.email,
        user.firstName,
        changes
      );
    }

    return updatedUser;
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string | Types.ObjectId, status: UserStatus, reason?: string, performedBy?: Types.ObjectId): Promise<User> {
    const user = await this.findById(userId);
    const oldStatus = user.status;

    // Validate status transition
    this.validateStatusTransition(oldStatus, status);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { status, lastActiveAt: new Date() },
      { new: true }
    ).exec();

    // Log status change activity
    await this.logUserActivity({
      userId: user._id,
      tenantId: user.tenantId,
      type: ActivityType.STATUS_CHANGE,
      description: `User status changed from ${oldStatus} to ${status}`,
      severity: ActivitySeverity.MEDIUM,
      performedBy,
      metadata: {
        oldStatus,
        newStatus: status,
        reason,
      },
    });

    // Record status history
    await this.recordStatusHistory(user._id, oldStatus, status, reason, performedBy, user.tenantId);

    // Send status change notification email
    await this.sendStatusChangeNotification(user, oldStatus, status, reason);

    return updatedUser;
  }

  /**
   * Record status history
   */
  private async recordStatusHistory(
    userId: Types.ObjectId,
    oldStatus: UserStatus,
    newStatus: UserStatus,
    reason?: string,
    performedBy?: Types.ObjectId,
    tenantId?: Types.ObjectId
  ): Promise<void> {
    const statusHistory = new this.userStatusHistoryModel({
      userId,
      tenantId,
      oldStatus,
      newStatus,
      reason: this.mapReasonToEnum(reason),
      reasonDetails: reason,
      performedBy,
      changedAt: new Date(),
    });

    await statusHistory.save();
  }

  /**
   * Map reason string to StatusChangeReason enum
   */
  private mapReasonToEnum(reason?: string): StatusChangeReason {
    if (!reason) return StatusChangeReason.OTHER;
    
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('violation')) return StatusChangeReason.VIOLATION;
    if (reasonLower.includes('suspicious')) return StatusChangeReason.SUSPICIOUS_ACTIVITY;
    if (reasonLower.includes('payment')) return StatusChangeReason.PAYMENT_ISSUE;
    if (reasonLower.includes('request')) return StatusChangeReason.USER_REQUEST;
    if (reasonLower.includes('admin')) return StatusChangeReason.ADMIN_ACTION;
    if (reasonLower.includes('system')) return StatusChangeReason.SYSTEM_AUTO;
    
    return StatusChangeReason.OTHER;
  }

  /**
   * Get user status history
   */
  async getUserStatusHistory(userId: string | Types.ObjectId, page = 1, limit = 20): Promise<{ history: UserStatusHistory[]; total: number }> {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.userStatusHistoryModel
        .find({ userId })
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('performedBy', 'firstName lastName email')
        .exec(),
      this.userStatusHistoryModel.countDocuments({ userId }).exec(),
    ]);

    return { history, total };
  }

  /**
   * Enhanced activity search with advanced filtering
   */
  async searchUserActivity(searchDto: {
    userId?: string | Types.ObjectId;
    tenantId?: Types.ObjectId;
    type?: ActivityType;
    severity?: ActivitySeverity;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ activities: UserActivity[]; total: number }> {
    const {
      userId,
      tenantId,
      type,
      severity,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'performedAt',
      sortOrder = 'desc',
    } = searchDto;

    const query: any = {};
    const skip = (page - 1) * limit;

    // Add filters
    if (userId) {
      query.userId = userId;
    }

    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (type) {
      query.type = type;
    }

    if (severity) {
      query.severity = severity;
    }

    // Date range filter
    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) {
        query.performedAt.$gte = startDate;
      }
      if (endDate) {
        query.performedAt.$lte = endDate;
      }
    }

    // Text search
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.ipAddress': { $regex: search, $options: 'i' } },
        { 'metadata.userAgent': { $regex: search, $options: 'i' } },
        { 'context.module': { $regex: search, $options: 'i' } },
        { 'context.action': { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [activities, total] = await Promise.all([
      this.userActivityModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('performedBy', 'firstName lastName email')
        .exec(),
      this.userActivityModel.countDocuments(query).exec(),
    ]);

    return { activities, total };
  }

  /**
   * Clean up old activity logs based on retention policy
   */
  async cleanupOldActivityLogs(retentionDays: number = 90): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.userActivityModel.deleteMany({
      performedAt: { $lt: cutoffDate },
      severity: { $ne: ActivitySeverity.CRITICAL }, // Keep critical logs longer
    });

    this.logger.log(`Cleaned up ${result.deletedCount} old activity logs older than ${retentionDays} days`);

    return { deletedCount: result.deletedCount };
  }

  /**
   * Clean up old status history based on retention policy
   */
  async cleanupOldStatusHistory(retentionDays: number = 365): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.userStatusHistoryModel.deleteMany({
      changedAt: { $lt: cutoffDate },
    });

    this.logger.log(`Cleaned up ${result.deletedCount} old status history records older than ${retentionDays} days`);

    return { deletedCount: result.deletedCount };
  }

  /**
   * Get activity statistics for dashboard
   */
  async getActivityStatistics(tenantId?: Types.ObjectId, days: number = 30): Promise<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    activitiesBySeverity: Record<string, number>;
    recentActivityTrend: Array<{ date: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query: any = { performedAt: { $gte: startDate } };
    if (tenantId) {
      query.tenantId = tenantId;
    }

    // Get total activities
    const totalActivities = await this.userActivityModel.countDocuments(query);

    // Get activities by type
    const activitiesByType = await this.userActivityModel.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get activities by severity
    const activitiesBySeverity = await this.userActivityModel.aggregate([
      { $match: query },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get recent activity trend (daily)
    const recentActivityTrend = await this.userActivityModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$performedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalActivities,
      activitiesByType: activitiesByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      activitiesBySeverity: activitiesBySeverity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivityTrend: recentActivityTrend.map(item => ({
        date: item._id,
        count: item.count,
      })),
    };
  }

  /**
   * Export activity logs for compliance
   */
  async exportActivityLogs(
    userId?: string | Types.ObjectId,
    tenantId?: Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (startDate || endDate) {
      query.performedAt = {};
      if (startDate) {
        query.performedAt.$gte = startDate;
      }
      if (endDate) {
        query.performedAt.$lte = endDate;
      }
    }

    const activities = await this.userActivityModel
      .find(query)
      .sort({ performedAt: -1 })
      .populate('performedBy', 'firstName lastName email')
      .lean()
      .exec();

    if (format === 'csv') {
      return this.convertActivitiesToCsv(activities);
    }

    return JSON.stringify(activities, null, 2);
  }

  /**
   * Convert activities to CSV format
   */
  private convertActivitiesToCsv(activities: any[]): string {
    const headers = [
      'Date',
      'User ID',
      'Type',
      'Description',
      'Severity',
      'IP Address',
      'User Agent',
      'Module',
      'Action',
    ];

    const rows = activities.map(activity => [
      activity.performedAt,
      activity.userId,
      activity.type,
      activity.description,
      activity.severity,
      activity.metadata?.ipAddress || '',
      activity.metadata?.userAgent || '',
      activity.context?.module || '',
      activity.context?.action || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(oldStatus: UserStatus, newStatus: UserStatus): void {
    const validTransitions: Record<UserStatus, UserStatus[]> = {
      [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.INACTIVE],
      [UserStatus.ACTIVE]: [UserStatus.SUSPENDED, UserStatus.INACTIVE],
      [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.INACTIVE],
      [UserStatus.INACTIVE]: [UserStatus.ACTIVE, UserStatus.SUSPENDED],
    };

    if (!validTransitions[oldStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${oldStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Send status change notification
   */
  private async sendStatusChangeNotification(
    user: User, 
    oldStatus: UserStatus, 
    newStatus: UserStatus, 
    reason?: string
  ): Promise<void> {
    try {
      await this.emailService.sendAccountStatusNotification(
        user.email,
        user.firstName,
        newStatus,
        reason
      );
    } catch (error) {
      // Log error but don't fail the status update
      this.logger.error(`Failed to send status change notification to ${user.email}:`, error);
    }
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string | Types.ObjectId, roles: string[], reason?: string, performedBy?: Types.ObjectId): Promise<User> {
    const user = await this.findById(userId);
    const oldRoles = user.roles || [];

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { roles, lastActiveAt: new Date() },
      { new: true }
    ).exec();

    // Log role change activity
    await this.logUserActivity({
      userId: user._id,
      tenantId: user.tenantId,
      type: ActivityType.ROLE_CHANGE,
      description: `User roles changed from [${oldRoles.join(', ')}] to [${roles.join(', ')}]`,
      severity: ActivitySeverity.HIGH,
      performedBy,
      metadata: {
        oldRoles,
        newRoles: roles,
        reason,
      },
    });

    return updatedUser;
  }

  /**
   * Search and filter users
   */
  async searchUsers(searchDto: UserSearchDto, tenantId?: Types.ObjectId): Promise<{ users: User[]; total: number }> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      role, 
      company,
      position,
      tags,
      createdAfter,
      createdBefore,
      lastActiveAfter,
      lastActiveBefore,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = searchDto;

    const query: any = {};

    // Add tenant filter if provided
    if (tenantId) {
      query.tenantId = tenantId;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { 'profile.company': { $regex: search, $options: 'i' } },
        { 'profile.position': { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add role filter
    if (role) {
      query.roles = role;
    }

    // Add company filter
    if (company) {
      query['profile.company'] = { $regex: company, $options: 'i' };
    }

    // Add position filter
    if (position) {
      query['profile.position'] = { $regex: position, $options: 'i' };
    }

    // Add tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Add date range filters
    if (createdAfter || createdBefore) {
      query.createdAt = {};
      if (createdAfter) {
        query.createdAt.$gte = new Date(createdAfter);
      }
      if (createdBefore) {
        query.createdAt.$lte = new Date(createdBefore);
      }
    }

    if (lastActiveAfter || lastActiveBefore) {
      query.lastActiveAt = {};
      if (lastActiveAfter) {
        query.lastActiveAt.$gte = new Date(lastActiveAfter);
      }
      if (lastActiveBefore) {
        query.lastActiveAt.$lte = new Date(lastActiveBefore);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    // Log search analytics
    await this.logSearchAnalytics({
      searchTerm: search,
      filters: { status, role: role as UserRole },
      resultsCount: users.length,
      totalCount: total,
      page,
      limit,
      tenantId,
    });

    return { users, total };
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string | Types.ObjectId, page = 1, limit = 20): Promise<{ activities: UserActivity[]; total: number }> {
    const [activities, total] = await Promise.all([
      this.userActivityModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userActivityModel.countDocuments({ userId }).exec(),
    ]);

    return { activities, total };
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string | Types.ObjectId, reason?: string, performedBy?: Types.ObjectId): Promise<void> {
    const user = await this.findById(userId);

    // Soft delete by setting status to inactive
    await this.userModel.findByIdAndUpdate(userId, {
      status: UserStatus.INACTIVE,
      lastActiveAt: new Date(),
    });

    // Log deletion activity
    await this.logUserActivity({
      userId: user._id,
      tenantId: user.tenantId,
      type: ActivityType.ACCOUNT_DELETION,
      description: 'User account deactivated',
      severity: ActivitySeverity.HIGH,
      performedBy,
      metadata: {
        reason,
        method: 'soft_delete',
      },
    });
  }

  /**
   * Log user activity
   */
  async logUserActivity(activityData: Partial<UserActivity>): Promise<UserActivity> {
    const activity = new this.userActivityModel({
      ...activityData,
      performedAt: new Date(),
    });

    return activity.save();
  }

  /**
   * Log search analytics
   */
  async logSearchAnalytics(data: {
    searchTerm: string;
    filters: { status?: UserStatus; role?: UserRole };
    resultsCount: number;
    totalCount: number;
    page: number;
    limit: number;
    tenantId?: Types.ObjectId;
  }) {
    await this.logUserActivity({
      userId: null, // No specific user for search analytics
      tenantId: data.tenantId,
      type: ActivityType.SEARCH,
      description: `User search performed`,
      severity: ActivitySeverity.LOW,
      metadata: {
        searchTerm: data.searchTerm,
        filters: data.filters,
        resultsCount: data.resultsCount,
        totalCount: data.totalCount,
        page: data.page,
        limit: data.limit,
      },
    });
  }

  /**
   * Get default user settings
   */
  private getDefaultUserSettings() {
    return {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
    };
  }

  /**
   * Update user last active timestamp
   */
  async updateLastActive(userId: string | Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastActiveAt: new Date(),
    });
  }

  /**
   * Get users by tenant
   */
  async getUsersByTenant(tenantId: Types.ObjectId): Promise<User[]> {
    return this.userModel.find({ tenantId }).exec();
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string, tenantId?: Types.ObjectId): Promise<User[]> {
    const query: any = { roles: role };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    return this.userModel.find(query).exec();
  }

  /**
   * Get active users count
   */
  async getActiveUsersCount(tenantId?: Types.ObjectId): Promise<number> {
    const query: any = { status: UserStatus.ACTIVE };
    if (tenantId) {
      query.tenantId = tenantId;
    }
    return this.userModel.countDocuments(query).exec();
  }
} 