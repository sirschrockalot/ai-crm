import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

import { UserInvitation, UserInvitationDocument, InvitationStatus } from '../schemas/user-invitation.schema';
import { User, UserDocument, UserStatus, UserRole } from '../schemas/user.schema';
import { UserActivity, UserActivityDocument, ActivityType, ActivitySeverity } from '../schemas/user-activity.schema';
import { CreateInvitationDto, AcceptInvitationDto, InvitationResponseDto } from '../dto/user-invitation.dto';
import { EmailService } from './email.service';

@Injectable()
export class UserInvitationService {
  private readonly logger = new Logger(UserInvitationService.name);

  constructor(
    @InjectModel(UserInvitation.name) private userInvitationModel: Model<UserInvitationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivityDocument>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new user invitation
   */
  async createInvitation(
    createInvitationDto: CreateInvitationDto,
    invitedBy: string | Types.ObjectId,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserInvitation> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: createInvitationDto.email.toLowerCase() }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await this.userInvitationModel.findOne({
      email: createInvitationDto.email.toLowerCase(),
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    }).exec();

    if (existingInvitation) {
      throw new ConflictException('A pending invitation already exists for this email');
    }

    // Generate secure token
    const token = this.generateSecureToken();
    const hashedToken = await this.hashToken(token);

    // Create invitation with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new this.userInvitationModel({
      email: createInvitationDto.email.toLowerCase(),
      token: hashedToken,
      invitedBy: new Types.ObjectId(invitedBy),
      status: InvitationStatus.PENDING,
      expiresAt,
      ipAddress,
      userAgent,
      roles: createInvitationDto.roles || [UserRole.USER],
      tenantId: createInvitationDto.tenantId ? new Types.ObjectId(createInvitationDto.tenantId) : undefined,
      message: createInvitationDto.message,
    });

    const savedInvitation = await invitation.save();

    // Send invitation email
    await this.emailService.sendUserInvitation(
      createInvitationDto.email,
      token,
      createInvitationDto.message,
    );

    // Log the invitation
    await this.logUserActivity({
      userId: new Types.ObjectId(invitedBy),
      type: ActivityType.INVITATION_SENT,
      description: `Invitation sent to ${createInvitationDto.email}`,
      severity: ActivitySeverity.LOW,
      metadata: {
        invitedEmail: createInvitationDto.email,
        invitationId: savedInvitation._id,
        roles: createInvitationDto.roles,
        ipAddress,
      },
    });

    this.logger.log(`Invitation created for ${createInvitationDto.email} by user ${invitedBy}`);

    return savedInvitation;
  }

  /**
   * Accept an invitation and create a new user
   */
  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto, ipAddress?: string): Promise<User> {
    // Hash the provided token to compare with stored hash
    const hashedToken = await this.hashToken(acceptInvitationDto.token);

    // Find valid invitation
    const invitation = await this.userInvitationModel.findOne({
      token: hashedToken,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    }).exec();

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: invitation.email.toLowerCase() }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength
    this.validatePasswordStrength(acceptInvitationDto.password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(acceptInvitationDto.password, 12);

    // Create new user
    const user = new this.userModel({
      email: invitation.email,
      firstName: acceptInvitationDto.firstName,
      lastName: acceptInvitationDto.lastName,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      roles: invitation.roles,
      tenantId: invitation.tenantId,
    });

    const savedUser = await user.save();

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Log the acceptance
    await this.logUserActivity({
      userId: savedUser._id,
      type: ActivityType.INVITATION_ACCEPTED,
      description: 'User account created via invitation',
      severity: ActivitySeverity.LOW,
      metadata: {
        invitationId: invitation._id,
        invitedBy: invitation.invitedBy,
        ipAddress,
      },
    });

    // Send acceptance confirmation email
    await this.emailService.sendInvitationAcceptedConfirmation(
      invitation.email,
      acceptInvitationDto.firstName,
    );

    this.logger.log(`Invitation accepted and user created: ${savedUser._id}`);

    return savedUser;
  }

  /**
   * Get invitation by token (for validation)
   */
  async getInvitationByToken(token: string): Promise<UserInvitation | null> {
    const hashedToken = await this.hashToken(token);

    const invitation = await this.userInvitationModel.findOne({
      token: hashedToken,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    }).exec();

    return invitation;
  }

  /**
   * Get invitations with pagination and filtering
   */
  async getInvitations(
    filters: {
      status?: InvitationStatus;
      invitedBy?: string | Types.ObjectId;
      tenantId?: string | Types.ObjectId;
      email?: string;
    } = {},
    page = 1,
    limit = 20,
  ): Promise<{ invitations: UserInvitation[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.invitedBy) {
      query.invitedBy = new Types.ObjectId(filters.invitedBy);
    }

    if (filters.tenantId) {
      query.tenantId = new Types.ObjectId(filters.tenantId);
    }

    if (filters.email) {
      query.email = { $regex: filters.email, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [invitations, total] = await Promise.all([
      this.userInvitationModel
        .find(query)
        .populate('invitedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userInvitationModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      invitations,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get invitation statistics
   */
  async getInvitationStats(tenantId?: string | Types.ObjectId): Promise<{
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    cancelled: number;
  }> {
    const query: any = {};
    if (tenantId) {
      query.tenantId = new Types.ObjectId(tenantId);
    }

    const [total, pending, accepted, expired, cancelled] = await Promise.all([
      this.userInvitationModel.countDocuments(query).exec(),
      this.userInvitationModel.countDocuments({
        ...query,
        status: InvitationStatus.PENDING,
        expiresAt: { $gt: new Date() },
      }).exec(),
      this.userInvitationModel.countDocuments({
        ...query,
        status: InvitationStatus.ACCEPTED,
      }).exec(),
      this.userInvitationModel.countDocuments({
        ...query,
        $or: [
          { status: InvitationStatus.EXPIRED },
          { expiresAt: { $lt: new Date() } },
        ],
      }).exec(),
      this.userInvitationModel.countDocuments({
        ...query,
        status: InvitationStatus.CANCELLED,
      }).exec(),
    ]);

    return {
      total,
      pending,
      accepted,
      expired,
      cancelled,
    };
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(
    invitationId: string | Types.ObjectId,
    cancelledBy: string | Types.ObjectId,
    reason?: string,
  ): Promise<void> {
    const invitation = await this.userInvitationModel.findById(invitationId).exec();
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be cancelled');
    }

    invitation.status = InvitationStatus.CANCELLED;
    await invitation.save();

    // Log the cancellation
    await this.logUserActivity({
      userId: new Types.ObjectId(cancelledBy),
      type: ActivityType.INVITATION_CANCELLED,
      description: `Invitation cancelled for ${invitation.email}`,
      severity: ActivitySeverity.MEDIUM,
      metadata: {
        invitationId: invitation._id,
        reason,
        cancelledEmail: invitation.email,
      },
    });

    this.logger.log(`Invitation cancelled: ${invitationId} by user ${cancelledBy}`);
  }

  /**
   * Resend invitation email
   */
  async resendInvitation(
    invitationId: string | Types.ObjectId,
    resendBy: string | Types.ObjectId,
  ): Promise<void> {
    const invitation = await this.userInvitationModel.findById(invitationId).exec();
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be resent');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Generate new token
    const newToken = this.generateSecureToken();
    const hashedToken = await this.hashToken(newToken);

    // Update invitation with new token and extend expiration
    invitation.token = hashedToken;
    invitation.expiresAt = new Date();
    invitation.expiresAt.setDate(invitation.expiresAt.getDate() + 7);
    await invitation.save();

    // Send new invitation email
    await this.emailService.sendUserInvitation(
      invitation.email,
      newToken,
      invitation.message,
    );

    // Log the resend
    await this.logUserActivity({
      userId: new Types.ObjectId(resendBy),
      type: ActivityType.INVITATION_RESENT,
      description: `Invitation resent to ${invitation.email}`,
      severity: ActivitySeverity.LOW,
      metadata: {
        invitationId: invitation._id,
        invitedEmail: invitation.email,
      },
    });

    this.logger.log(`Invitation resent: ${invitationId} by user ${resendBy}`);
  }

  /**
   * Clean up expired invitations
   */
  async cleanupExpiredInvitations(): Promise<void> {
    const result = await this.userInvitationModel.updateMany(
      {
        status: InvitationStatus.PENDING,
        expiresAt: { $lt: new Date() },
      },
      {
        status: InvitationStatus.EXPIRED,
      },
    ).exec();

    this.logger.log(`Cleaned up ${result.modifiedCount} expired invitations`);
  }

  /**
   * Generate a cryptographically secure token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a token for storage
   */
  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Check for complexity requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }
  }

  /**
   * Log user activity
   */
  private async logUserActivity(activityData: Partial<UserActivity>): Promise<UserActivity> {
    const activity = new this.userActivityModel(activityData);
    return activity.save();
  }
}

 