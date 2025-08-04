import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      // TODO: Implement actual email sending with nodemailer
      // For now, just log the email
      this.logger.log(`Welcome email sent to ${email} for user ${firstName}`);
      
      // In production, this would use nodemailer to send actual emails
      // const transporter = nodemailer.createTransporter({
      //   host: this.configService.get('SMTP_HOST'),
      //   port: this.configService.get('SMTP_PORT'),
      //   secure: false,
      //   auth: {
      //     user: this.configService.get('SMTP_USER'),
      //     pass: this.configService.get('SMTP_PASS'),
      //   },
      // });
      
      // await transporter.sendMail({
      //   from: this.configService.get('SMTP_USER'),
      //   to: email,
      //   subject: 'Welcome to DealCycle CRM',
      //   html: this.getWelcomeEmailTemplate(firstName),
      // });
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Don't throw error to avoid blocking user registration
    }
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(email: string, firstName: string, verificationToken: string): Promise<void> {
    try {
      this.logger.log(`Email verification sent to ${email} for user ${firstName}`);
      
      // TODO: Implement actual email sending
      // const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`;
      
      // await transporter.sendMail({
      //   from: this.configService.get('SMTP_USER'),
      //   to: email,
      //   subject: 'Verify Your Email - DealCycle CRM',
      //   html: this.getEmailVerificationTemplate(firstName, verificationUrl),
      // });
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${email}:`, error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, firstName: string, resetToken: string): Promise<void> {
    try {
      this.logger.log(`Password reset email sent to ${email} for user ${firstName}`);
      
      // TODO: Implement actual email sending
      // const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
      
      // await transporter.sendMail({
      //   from: this.configService.get('SMTP_USER'),
      //   to: email,
      //   subject: 'Reset Your Password - DealCycle CRM',
      //   html: this.getPasswordResetTemplate(firstName, resetUrl),
      // });
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
    }
  }

  /**
   * Send account status change notification
   */
  async sendAccountStatusNotification(email: string, firstName: string, status: string, reason?: string): Promise<void> {
    try {
      this.logger.log(`Account status notification sent to ${email} for user ${firstName}`);
      
      // TODO: Implement actual email sending
      // await transporter.sendMail({
      //   from: this.configService.get('SMTP_USER'),
      //   to: email,
      //   subject: `Account Status Update - DealCycle CRM`,
      //   html: this.getAccountStatusTemplate(firstName, status, reason),
      // });
    } catch (error) {
      this.logger.error(`Failed to send account status notification to ${email}:`, error);
    }
  }

  /**
   * Send role change notification
   */
  async sendRoleChangeNotification(email: string, firstName: string, oldRole: string, newRole: string, reason?: string): Promise<void> {
    try {
      this.logger.log(`Role change notification sent to ${email} for user ${firstName}`);
      
      // TODO: Implement actual email sending
      // await transporter.sendMail({
      //   from: this.configService.get('SMTP_USER'),
      //   to: email,
      //   subject: `Role Update - DealCycle CRM`,
      //   html: this.getRoleChangeTemplate(firstName, oldRole, newRole, reason),
      // });
    } catch (error) {
      this.logger.error(`Failed to send role change notification to ${email}:`, error);
    }
  }

  /**
   * Get welcome email template
   */
  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to DealCycle CRM, ${firstName}!</h2>
        <p>Thank you for joining DealCycle CRM. We're excited to help you streamline your real estate wholesaling business.</p>
        <p>Here's what you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Set up your preferences</li>
          <li>Start managing your leads</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The DealCycle Team</p>
      </div>
    `;
  }

  /**
   * Get email verification template
   */
  private getEmailVerificationTemplate(firstName: string, verificationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email Address</h2>
        <p>Hi ${firstName},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email Address
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The DealCycle Team</p>
      </div>
    `;
  }

  /**
   * Get password reset template
   */
  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>The DealCycle Team</p>
      </div>
    `;
  }

  /**
   * Get account status template
   */
  private getAccountStatusTemplate(firstName: string, status: string, reason?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Status Update</h2>
        <p>Hi ${firstName},</p>
        <p>Your account status has been updated to: <strong>${status}</strong></p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>If you have any questions about this change, please contact our support team.</p>
        <p>Best regards,<br>The DealCycle Team</p>
      </div>
    `;
  }

  /**
   * Get role change template
   */
  private getRoleChangeTemplate(firstName: string, oldRole: string, newRole: string, reason?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Role Update</h2>
        <p>Hi ${firstName},</p>
        <p>Your role has been updated from <strong>${oldRole}</strong> to <strong>${newRole}</strong>.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>This change may affect your access to certain features in the system.</p>
        <p>If you have any questions about this change, please contact your administrator.</p>
        <p>Best regards,<br>The DealCycle Team</p>
      </div>
    `;
  }
} 