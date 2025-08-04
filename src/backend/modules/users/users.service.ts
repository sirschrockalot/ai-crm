import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { User, UserDocument, UserStatus, UserRole } from './schemas/user.schema';
import { UserActivity, UserActivityDocument, ActivityType, ActivitySeverity } from './schemas/user-activity.schema';
import { CreateUserDto, UpdateUserDto, UserSearchDto } from './dto/user.dto';
import { EmailService } from './services/email.service';
import { UserValidationService } from './services/user-validation.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivityDocument>,
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
      role: UserRole.USER,
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
        role: savedUser.role,
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
        await user.save();
      } else {
        // Create new user
        user = await this.createUserFromOAuth(googleUser, tenantId);
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();
    user.status = UserStatus.ACTIVE;
    await user.save();

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
    }

    return updatedUser;
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string | Types.ObjectId, status: UserStatus, reason?: string, performedBy?: Types.ObjectId): Promise<User> {
    const user = await this.findById(userId);
    const oldStatus = user.status;

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

    return updatedUser;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string | Types.ObjectId, role: UserRole, reason?: string, performedBy?: Types.ObjectId): Promise<User> {
    const user = await this.findById(userId);
    const oldRole = user.role;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { role, lastActiveAt: new Date() },
      { new: true }
    ).exec();

    // Log role change activity
    await this.logUserActivity({
      userId: user._id,
      tenantId: user.tenantId,
      type: ActivityType.ROLE_CHANGE,
      description: `User role changed from ${oldRole} to ${role}`,
      severity: ActivitySeverity.HIGH,
      performedBy,
      metadata: {
        oldRole,
        newRole: role,
        reason,
      },
    });

    return updatedUser;
  }

  /**
   * Search and filter users
   */
  async searchUsers(searchDto: UserSearchDto, tenantId?: Types.ObjectId): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, search, status, role, sortBy = 'createdAt', sortOrder = 'desc' } = searchDto;

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
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add role filter
    if (role) {
      query.role = role;
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
  async getUsersByRole(role: UserRole, tenantId?: Types.ObjectId): Promise<User[]> {
    const query: any = { role };
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