import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument, UserRole, UserStatus } from './schemas/user.schema';
import { UserActivity, UserActivityDocument, ActivityType, ActivitySeverity } from './schemas/user-activity.schema';
import { PasswordReset, PasswordResetDocument } from './schemas/password-reset.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserActivity.name) private activityModel: Model<UserActivityDocument>,
    @InjectModel(PasswordReset.name) private passwordResetModel: Model<PasswordResetDocument>,
  ) {}

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    role?: UserRole;
    tenantId?: string;
  }): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new this.userModel({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
      tenantId: userData.tenantId ? new Types.ObjectId(userData.tenantId) : undefined,
    });

    const savedUser = await user.save();

    // Log user creation activity
    await this.logUserActivity({
      userId: savedUser._id,
      type: ActivityType.PROFILE_UPDATE,
      description: 'User account created',
      severity: ActivitySeverity.LOW,
    });

    return savedUser;
  }

  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Log profile update activity
    await this.logUserActivity({
      userId: user._id,
      type: ActivityType.PROFILE_UPDATE,
      description: 'User profile updated',
      severity: ActivitySeverity.LOW,
    });

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }

    // Log user deletion activity
    await this.logUserActivity({
      userId: new Types.ObjectId(id),
      type: ActivityType.PROFILE_UPDATE,
      description: 'User account deleted',
      severity: ActivitySeverity.HIGH,
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    // Log password change activity
    await this.logUserActivity({
      userId: user._id,
      type: ActivityType.PASSWORD_CHANGE,
      description: 'Password changed successfully',
      severity: ActivitySeverity.MEDIUM,
    });
  }

  async requestPasswordReset(email: string, ip: string, userAgent: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create or update password reset record
    await this.passwordResetModel.findOneAndUpdate(
      { userId: user._id },
      {
        token,
        expiresAt,
        ip,
        userAgent,
        isUsed: false,
        isRevoked: false,
        attempts: 0,
      },
      { upsert: true, new: true }
    );

    // Log password reset request activity
    await this.logUserActivity({
      userId: user._id,
      type: ActivityType.PASSWORD_RESET_REQUEST,
      description: 'Password reset requested',
      severity: ActivitySeverity.MEDIUM,
      ip,
      userAgent,
    });

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${token}`);
  }

  async resetPassword(token: string, newPassword: string, ip: string, userAgent: string): Promise<void> {
    const passwordReset = await this.passwordResetModel.findOne({
      token,
      isUsed: false,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await this.userModel.findByIdAndUpdate(passwordReset.userId, {
      password: hashedPassword,
    });

    // Mark reset token as used
    passwordReset.isUsed = true;
    passwordReset.usedAt = new Date();
    await passwordReset.save();

    // Log password reset completion activity
    await this.logUserActivity({
      userId: passwordReset.userId,
      type: ActivityType.PASSWORD_RESET_COMPLETE,
      description: 'Password reset completed',
      severity: ActivitySeverity.MEDIUM,
      ip,
      userAgent,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.status = UserStatus.ACTIVE;
    await user.save();

    // Log email verification activity
    await this.logUserActivity({
      userId: user._id,
      type: ActivityType.EMAIL_VERIFICATION,
      description: 'Email verified successfully',
      severity: ActivitySeverity.LOW,
    });
  }

  async setupMFA(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const user = await this.findUserById(userId);
    
    // Generate MFA secret
    const secret = uuidv4();
    const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substr(2, 8));

    user.mfaSecret = secret;
    user.backupCodes = backupCodes;
    user.mfaEnabled = true;
    await user.save();

    // Generate QR code URL (simplified for demo)
    const qrCodeUrl = `otpauth://totp/DealCycle:${user.email}?secret=${secret}&issuer=DealCycle`;

    // Log MFA setup activity
    await this.logUserActivity({
      userId: user._id,
      type: ActivityType.MFA_SETUP,
      description: 'MFA setup completed',
      severity: ActivitySeverity.MEDIUM,
    });

    return { secret, qrCodeUrl, backupCodes };
  }

  async verifyMFA(userId: string, code: string): Promise<boolean> {
    const user = await this.findUserById(userId);
    
    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException('MFA is not enabled for this user');
    }

    // Simple verification for demo (in production, use proper TOTP library)
    const isValid = user.mfaSecret === code || user.backupCodes.includes(code);

    if (isValid && user.backupCodes.includes(code)) {
      // Remove used backup code
      user.backupCodes = user.backupCodes.filter(c => c !== code);
      await user.save();
    }

    // Log MFA verification activity
    await this.logUserActivity({
      userId: user._id,
      type: ActivityType.MFA_VERIFICATION,
      description: `MFA verification ${isValid ? 'successful' : 'failed'}`,
      severity: isValid ? ActivitySeverity.LOW : ActivitySeverity.MEDIUM,
    });

    return isValid;
  }

  async disableMFA(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    
    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.backupCodes = [];
    await user.save();

    // Log MFA disable activity
    await this.logUserActivity({
      userId: user._id,
      type: ActivityType.MFA_DISABLE,
      description: 'MFA disabled',
      severity: ActivitySeverity.MEDIUM,
    });
  }

  async logUserActivity(activityData: {
    userId: Types.ObjectId;
    type: ActivityType;
    description: string;
    severity?: ActivitySeverity;
    ip?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    const activity = new this.activityModel({
      ...activityData,
      severity: activityData.severity || ActivitySeverity.LOW,
    });
    await activity.save();
  }

  async getUserActivity(userId: string, limit = 50): Promise<UserActivity[]> {
    return this.activityModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getUsersByTenant(tenantId: string): Promise<UserDocument[]> {
    return this.userModel.find({ tenantId: new Types.ObjectId(tenantId) }).exec();
  }

  async searchUsers(query: string, tenantId?: string): Promise<UserDocument[]> {
    const searchQuery: any = {
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { companyName: { $regex: query, $options: 'i' } },
      ],
    };

    if (tenantId) {
      searchQuery.tenantId = new Types.ObjectId(tenantId);
    }

    return this.userModel.find(searchQuery).limit(20).exec();
  }
}
