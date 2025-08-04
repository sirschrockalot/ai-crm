import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

import { PasswordResetToken, PasswordResetTokenDocument } from '../schemas/password-reset-token.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { EmailService } from './email.service';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectModel(PasswordResetToken.name) private passwordResetTokenModel: Model<PasswordResetTokenDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a password reset token for a user
   */
  async createPasswordResetToken(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    // Find user by email
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      // Don't reveal if user exists or not for security
      this.logger.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Check if user already has a valid reset token
    const existingToken = await this.passwordResetTokenModel.findOne({
      userId: user._id,
      expiresAt: { $gt: new Date() },
      usedAt: { $exists: false },
    }).exec();

    if (existingToken) {
      this.logger.log(`User ${user._id} already has a valid reset token`);
      return;
    }

    // Generate secure token
    const token = this.generateSecureToken();
    const hashedToken = await this.hashToken(token);

    // Create reset token with 24-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const resetToken = new this.passwordResetTokenModel({
      userId: user._id,
      token: hashedToken,
      expiresAt,
      ipAddress,
      userAgent,
    });

    await resetToken.save();

    // Send password reset email
    await this.emailService.sendPasswordReset(user.email, user.firstName, token);

    this.logger.log(`Password reset token created for user ${user._id}`);
  }

  /**
   * Validate and use a password reset token
   */
  async resetPassword(token: string, newPassword: string, ipAddress?: string): Promise<void> {
    // Validate password strength
    this.validatePasswordStrength(newPassword);

    // Hash the provided token to compare with stored hash
    const hashedToken = await this.hashToken(token);

    // Find valid reset token
    const resetToken = await this.passwordResetTokenModel.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      usedAt: { $exists: false },
    }).exec();

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.userModel.findByIdAndUpdate(resetToken.userId, {
      password: hashedPassword,
    }).exec();

    // Mark token as used
    resetToken.usedAt = new Date();
    await resetToken.save();

    // Get user for email notification
    const user = await this.userModel.findById(resetToken.userId).exec();
    if (user) {
      // Send password change confirmation email
      await this.emailService.sendPasswordChangeConfirmation(user.email, user.firstName, ipAddress);
      this.logger.log(`Password reset completed for user ${user._id}`);
    }
  }

  /**
   * Clean up expired reset tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    const result = await this.passwordResetTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    }).exec();

    this.logger.log(`Cleaned up ${result.deletedCount} expired password reset tokens`);
  }

  /**
   * Get reset tokens for a user (for admin purposes)
   */
  async getUserResetTokens(userId: string | Types.ObjectId): Promise<PasswordResetToken[]> {
    return this.passwordResetTokenModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Invalidate all reset tokens for a user
   */
  async invalidateUserTokens(userId: string | Types.ObjectId): Promise<void> {
    await this.passwordResetTokenModel.updateMany(
      { userId, usedAt: { $exists: false } },
      { usedAt: new Date() }
    ).exec();

    this.logger.log(`Invalidated all reset tokens for user ${userId}`);
  }

  /**
   * Validate a reset token without using it
   */
  async validateResetToken(token: string): Promise<boolean> {
    const hashedToken = await this.hashToken(token);

    const resetToken = await this.passwordResetTokenModel.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      usedAt: { $exists: false },
    }).exec();

    return !!resetToken;
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
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }
  }
} 