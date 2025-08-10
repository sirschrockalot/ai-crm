import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { FileService } from '../shared/services/file.service';
import { AuditService } from '../shared/services/audit.service';
import {
  UserProfileDto,
  UserPreferencesDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  SystemSettingsDto,
  CompanyBrandingDto,
  CustomFieldDto,
  WorkflowDto,
  AuditLogDto,
  AuditLogQueryDto,
} from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('UserPreferences') private readonly userPreferencesModel: Model<any>,
    @InjectModel('NotificationSettings') private readonly notificationSettingsModel: Model<any>,
    @InjectModel('SecuritySettings') private readonly securitySettingsModel: Model<any>,
    @InjectModel('SystemSettings') private readonly systemSettingsModel: Model<any>,
    @InjectModel('CompanyBranding') private readonly companyBrandingModel: Model<any>,
    @InjectModel('CustomField') private readonly customFieldModel: Model<any>,
    @InjectModel('Workflow') private readonly workflowModel: Model<any>,
    @InjectModel('AuditLog') private readonly auditLogModel: Model<any>,
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
    private readonly auditService: AuditService,
  ) {}

  // ===== USER PROFILE MANAGEMENT =====

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      title: user.title,
      department: user.department,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      timezone: user.timezone,
    };
  }

  async updateUserProfile(userId: string, updateDto: Partial<UserProfileDto>): Promise<UserProfileDto> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateDto.email });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true, runValidators: true }
    ).select('-password');

    // Log the change
    await this.auditService.logAction({
      userId,
      action: 'UPDATE_PROFILE',
      entity: 'User',
      entityId: userId,
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return this.getUserProfile(userId);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      await this.fileService.deleteFile(user.avatar);
    }

    // Upload new avatar
    const avatarUrl = await this.fileService.uploadFile(file, 'avatars', userId);

    // Update user profile
    await this.userModel.findByIdAndUpdate(userId, { avatar: avatarUrl });

    // Log the change
    await this.auditService.logAction({
      userId,
      action: 'UPLOAD_AVATAR',
      entity: 'User',
      entityId: userId,
      changes: { avatar: avatarUrl },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return { avatarUrl };
  }

  // ===== USER PREFERENCES MANAGEMENT =====

  async getUserPreferences(userId: string): Promise<UserPreferencesDto> {
    let preferences = await this.userPreferencesModel.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async updateUserPreferences(userId: string, updateDto: Partial<UserPreferencesDto>): Promise<UserPreferencesDto> {
    const preferences = await this.userPreferencesModel.findOne({ userId });
    if (!preferences) {
      throw new NotFoundException('User preferences not found');
    }

    const updatedPreferences = await this.userPreferencesModel.findOneAndUpdate(
      { userId },
      { $set: updateDto },
      { new: true, runValidators: true }
    );

    // Log the change
    await this.auditService.logAction({
      userId,
      action: 'UPDATE_PREFERENCES',
      entity: 'UserPreferences',
      entityId: preferences._id.toString(),
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return updatedPreferences;
  }

  private async createDefaultPreferences(userId: string): Promise<UserPreferencesDto> {
    const defaultPreferences = {
      userId,
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      dashboard: {
        layout: 'grid',
        defaultView: 'overview',
        refreshInterval: 30,
        showCharts: true,
        showMetrics: true,
        showRecentActivity: true,
        compactMode: false,
      },
      autoRefresh: true,
      showNotifications: true,
      soundEnabled: true,
    };

    const preferences = new this.userPreferencesModel(defaultPreferences);
    await preferences.save();

    return preferences;
  }

  // ===== NOTIFICATION SETTINGS MANAGEMENT =====

  async getNotificationSettings(userId: string): Promise<NotificationSettingsDto> {
    let settings = await this.notificationSettingsModel.findOne({ userId });
    
    if (!settings) {
      // Create default notification settings if none exist
      settings = await this.createDefaultNotificationSettings(userId);
    }

    return settings;
  }

  async updateNotificationSettings(userId: string, updateDto: Partial<NotificationSettingsDto>): Promise<NotificationSettingsDto> {
    const settings = await this.notificationSettingsModel.findOne({ userId });
    if (!settings) {
      throw new NotFoundException('Notification settings not found');
    }

    const updatedSettings = await this.notificationSettingsModel.findOneAndUpdate(
      { userId },
      { $set: updateDto },
      { new: true, runValidators: true }
    );

    // Log the change
    await this.auditService.logAction({
      userId,
      action: 'UPDATE_NOTIFICATION_SETTINGS',
      entity: 'NotificationSettings',
      entityId: settings._id.toString(),
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return updatedSettings;
  }

  private async createDefaultNotificationSettings(userId: string): Promise<NotificationSettingsDto> {
    const defaultSettings = {
      userId,
      email: {
        enabled: true,
        frequency: 'immediate',
        types: ['lead_assigned', 'status_changed', 'system_alerts'],
        marketingEmails: false,
        systemEmails: true,
      },
      push: {
        enabled: true,
        types: ['lead_assigned', 'status_changed', 'urgent_alerts'],
        soundEnabled: true,
        vibrationEnabled: true,
      },
      sms: {
        enabled: false,
        types: ['urgent_alerts'],
        urgentAlerts: true,
      },
      inAppNotifications: true,
      desktopNotifications: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
    };

    const settings = new this.notificationSettingsModel(defaultSettings);
    await settings.save();

    return settings;
  }

  // ===== SECURITY SETTINGS MANAGEMENT =====

  async getSecuritySettings(userId: string): Promise<SecuritySettingsDto> {
    let settings = await this.securitySettingsModel.findOne({ userId });
    
    if (!settings) {
      // Create default security settings if none exist
      settings = await this.createDefaultSecuritySettings(userId);
    }

    return settings;
  }

  async updateSecuritySettings(userId: string, updateDto: Partial<SecuritySettingsDto>): Promise<SecuritySettingsDto> {
    const settings = await this.securitySettingsModel.findOne({ userId });
    if (!settings) {
      throw new NotFoundException('Security settings not found');
    }

    const updatedSettings = await this.securitySettingsModel.findOneAndUpdate(
      { userId },
      { $set: updateDto },
      { new: true, runValidators: true }
    );

    // Log the change
    await this.auditService.logAction({
      userId,
      action: 'UPDATE_SECURITY_SETTINGS',
      entity: 'SecuritySettings',
      entityId: settings._id.toString(),
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return updatedSettings;
  }

  async enableTwoFactor(userId: string, method: 'totp' | 'sms' | 'email'): Promise<{ qrCode?: string; backupCodes: string[] }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (method === 'totp') {
      const secret = speakeasy.generateSecret({
        name: `Presidential Digs CRM (${user.email})`,
        issuer: 'Presidential Digs CRM',
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Store the secret temporarily (should be encrypted in production)
      await this.securitySettingsModel.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            twoFactorEnabled: true, 
            twoFactorMethod: method,
            twoFactorSecret: secret.base32,
            twoFactorBackupCodes: this.generateBackupCodes(),
          }
        },
        { upsert: true }
      );

      return { qrCode, backupCodes: this.generateBackupCodes() };
    } else {
      // For SMS/Email 2FA, implement the respective logic
      await this.securitySettingsModel.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            twoFactorEnabled: true, 
            twoFactorMethod: method,
            twoFactorBackupCodes: this.generateBackupCodes(),
          }
        },
        { upsert: true }
      );

      return { backupCodes: this.generateBackupCodes() };
    }
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.securitySettingsModel.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          twoFactorEnabled: false, 
          twoFactorMethod: null,
          twoFactorSecret: null,
        },
        $unset: { twoFactorSecret: 1 }
      }
    );

    // Log the change
    await this.auditService.logAction({
      userId,
      action: 'DISABLE_2FA',
      entity: 'SecuritySettings',
      entityId: userId,
      changes: { twoFactorEnabled: false },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  async verifyTwoFactor(userId: string, code: string): Promise<boolean> {
    const settings = await this.securitySettingsModel.findOne({ userId });
    if (!settings || !settings.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    if (settings.twoFactorMethod === 'totp') {
      return speakeasy.totp.verify({
        secret: settings.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2, // Allow 2 time steps for clock skew
      });
    }

    // Implement SMS/Email verification logic here
    return false;
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
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword });

    // Log the change
    await this.auditService.logAction({
      userId,
      action: 'CHANGE_PASSWORD',
      entity: 'User',
      entityId: userId,
      changes: { passwordChanged: true },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  private async createDefaultSecuritySettings(userId: string): Promise<SecuritySettingsDto> {
    const defaultSettings = {
      userId,
      twoFactorEnabled: false,
      twoFactorMethod: 'totp',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expirationDays: 90,
        preventReuse: 5,
      },
      sessionTimeout: 30,
      loginHistory: true,
      ipRestrictions: [],
      suspiciousActivityDetection: true,
      accountLockout: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
    };

    const settings = new this.securitySettingsModel(defaultSettings);
    await settings.save();

    return settings;
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }

  // ===== SYSTEM SETTINGS MANAGEMENT =====

  async getSystemSettings(): Promise<SystemSettingsDto> {
    let settings = await this.systemSettingsModel.findOne();
    
    if (!settings) {
      // Create default system settings if none exist
      settings = await this.createDefaultSystemSettings();
    }

    return settings;
  }

  async updateSystemSettings(updateDto: Partial<SystemSettingsDto>): Promise<SystemSettingsDto> {
    const settings = await this.systemSettingsModel.findOne();
    if (!settings) {
      throw new NotFoundException('System settings not found');
    }

    const updatedSettings = await this.systemSettingsModel.findOneAndUpdate(
      {},
      { $set: updateDto },
      { new: true, runValidators: true }
    );

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'UPDATE_SYSTEM_SETTINGS',
      entity: 'SystemSettings',
      entityId: settings._id.toString(),
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return updatedSettings;
  }

  private async createDefaultSystemSettings(): Promise<SystemSettingsDto> {
    const defaultSettings = {
      company: {
        name: 'Presidential Digs CRM',
        logo: null,
        address: null,
        phone: null,
        email: null,
        website: null,
        description: null,
        industry: null,
      },
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        customCss: null,
        fontFamily: 'Inter',
        logoUrl: null,
        faviconUrl: null,
      },
      features: {
        aiLeadScoring: true,
        advancedAnalytics: true,
        automationWorkflows: true,
        mobileApp: false,
        apiAccess: true,
        customIntegrations: true,
        multiTenancy: false,
        auditLogging: true,
      },
      integrations: {},
      timezone: 'UTC',
      locale: 'en',
      currency: 'USD',
      maxUsers: 10,
      maxLeads: 1000,
    };

    const settings = new this.systemSettingsModel(defaultSettings);
    await settings.save();

    return settings;
  }

  // ===== COMPANY BRANDING MANAGEMENT =====

  async getCompanyBranding(): Promise<CompanyBrandingDto> {
    let branding = await this.companyBrandingModel.findOne();
    
    if (!branding) {
      // Create default company branding if none exists
      branding = await this.createDefaultCompanyBranding();
    }

    return branding;
  }

  async updateCompanyBranding(updateDto: Partial<CompanyBrandingDto>): Promise<CompanyBrandingDto> {
    const branding = await this.companyBrandingModel.findOne();
    if (!branding) {
      throw new NotFoundException('Company branding not found');
    }

    const updatedBranding = await this.companyBrandingModel.findOneAndUpdate(
      {},
      { $set: updateDto },
      { new: true, runValidators: true }
    );

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'UPDATE_COMPANY_BRANDING',
      entity: 'CompanyBranding',
      entityId: branding._id.toString(),
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return updatedBranding;
  }

  async uploadCompanyLogo(file: Express.Multer.File): Promise<{ logoUrl: string }> {
    const branding = await this.companyBrandingModel.findOne();
    if (!branding) {
      throw new NotFoundException('Company branding not found');
    }

    // Delete old logo if exists
    if (branding.branding?.logoUrl) {
      await this.fileService.deleteFile(branding.branding.logoUrl);
    }

    // Upload new logo
    const logoUrl = await this.fileService.uploadFile(file, 'company-logos', 'company');

    // Update company branding
    await this.companyBrandingModel.findOneAndUpdate(
      {},
      { 'branding.logoUrl': logoUrl }
    );

    return { logoUrl };
  }

  private async createDefaultCompanyBranding(): Promise<CompanyBrandingDto> {
    const defaultBranding = {
      company: {
        name: 'Presidential Digs CRM',
        logo: null,
        address: null,
        phone: null,
        email: null,
        website: null,
        description: null,
        industry: null,
      },
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        customCss: null,
        fontFamily: 'Inter',
        logoUrl: null,
        faviconUrl: null,
      },
      slogan: 'Building the future, one deal at a time',
      mission: 'To provide innovative CRM solutions that empower businesses to succeed',
      vision: 'To be the leading CRM platform for real estate and construction companies',
      socialMedia: [],
      contactEmail: 'contact@presidentialdigs.com',
      supportEmail: 'support@presidentialdigs.com',
    };

    const branding = new this.companyBrandingModel(defaultBranding);
    await branding.save();

    return branding;
  }

  // ===== CUSTOM FIELDS MANAGEMENT =====

  async getCustomFields(): Promise<CustomFieldDto[]> {
    return this.customFieldModel.find({ active: true }).sort({ sortOrder: 1 });
  }

  async createCustomField(createDto: CustomFieldDto): Promise<CustomFieldDto> {
    const customField = new this.customFieldModel({
      ...createDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await customField.save();

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'CREATE_CUSTOM_FIELD',
      entity: 'CustomField',
      entityId: customField._id.toString(),
      changes: createDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return customField;
  }

  async updateCustomField(id: string, updateDto: Partial<CustomFieldDto>): Promise<CustomFieldDto> {
    const customField = await this.customFieldModel.findById(id);
    if (!customField) {
      throw new NotFoundException('Custom field not found');
    }

    const updatedField = await this.customFieldModel.findByIdAndUpdate(
      id,
      { 
        ...updateDto,
        updatedAt: new Date().toISOString()
      },
      { new: true, runValidators: true }
    );

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'UPDATE_CUSTOM_FIELD',
      entity: 'CustomField',
      entityId: id,
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return updatedField;
  }

  async deleteCustomField(id: string): Promise<void> {
    const customField = await this.customFieldModel.findById(id);
    if (!customField) {
      throw new NotFoundException('Custom field not found');
    }

    // Soft delete by setting active to false
    await this.customFieldModel.findByIdAndUpdate(id, { active: false });

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'DELETE_CUSTOM_FIELD',
      entity: 'CustomField',
      entityId: id,
      changes: { active: false },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  // ===== WORKFLOW MANAGEMENT =====

  async getWorkflows(): Promise<WorkflowDto[]> {
    return this.workflowModel.find({ active: true }).sort({ priority: -1, createdAt: -1 });
  }

  async createWorkflow(createDto: WorkflowDto): Promise<WorkflowDto> {
    const workflow = new this.workflowModel({
      ...createDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await workflow.save();

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'CREATE_WORKFLOW',
      entity: 'Workflow',
      entityId: workflow._id.toString(),
      changes: createDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return workflow;
  }

  async updateWorkflow(id: string, updateDto: Partial<WorkflowDto>): Promise<WorkflowDto> {
    const workflow = await this.workflowModel.findById(id);
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const updatedWorkflow = await this.workflowModel.findByIdAndUpdate(
      id,
      { 
        ...updateDto,
        updatedAt: new Date().toISOString()
      },
      { new: true, runValidators: true }
    );

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'UPDATE_WORKFLOW',
      entity: 'Workflow',
      entityId: id,
      changes: updateDto,
      ipAddress: 'system',
      userAgent: 'system',
    });

    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<void> {
    const workflow = await this.workflowModel.findById(id);
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Soft delete by setting active to false
    await this.workflowModel.findByIdAndUpdate(id, { active: false });

    // Log the change
    await this.auditService.logAction({
      userId: 'system',
      action: 'DELETE_WORKFLOW',
      entity: 'Workflow',
      entityId: id,
      changes: { active: false },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  // ===== AUDIT AND ANALYTICS =====

  async getAuditLog(query: AuditLogQueryDto): Promise<AuditLogDto[]> {
    const filter: any = {};

    if (query.startDate && query.endDate) {
      filter.timestamp = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    if (query.action) {
      filter.action = query.action;
    }

    if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.entity) {
      filter.entity = query.entity;
    }

    const limit = query.limit || 100;
    const offset = query.offset || 0;

    return this.auditLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset);
  }

  async getAnalytics(period?: string): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalUsers,
      activeUsers,
      totalSettingsChanges,
      settingsByCategory,
      topActions,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ lastLoginAt: { $gte: startDate } }),
      this.auditLogModel.countDocuments({
        timestamp: { $gte: startDate },
        action: { $regex: /UPDATE|CREATE|DELETE/, $options: 'i' },
      }),
      this.auditLogModel.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            action: { $regex: /UPDATE|CREATE|DELETE/, $options: 'i' },
          },
        },
        {
          $group: {
            _id: '$entity',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      this.auditLogModel.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      period,
      startDate,
      endDate: now,
      metrics: {
        totalUsers,
        activeUsers,
        totalSettingsChanges,
        userEngagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      },
      settingsByCategory,
      topActions,
    };
  }

  // ===== EXPORT/IMPORT =====

  async exportSettings(): Promise<Blob> {
    const [
      systemSettings,
      companyBranding,
      customFields,
      workflows,
    ] = await Promise.all([
      this.getSystemSettings(),
      this.getCompanyBranding(),
      this.getCustomFields(),
      this.getWorkflows(),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      systemSettings,
      companyBranding,
      customFields,
      workflows,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  async importSettings(file: Express.Multer.File): Promise<void> {
    try {
      const fileContent = file.buffer.toString();
      const importData = JSON.parse(fileContent);

      // Validate import data structure
      if (!importData.systemSettings || !importData.companyBranding) {
        throw new BadRequestException('Invalid import file format');
      }

      // Import system settings
      if (importData.systemSettings) {
        await this.updateSystemSettings(importData.systemSettings);
      }

      // Import company branding
      if (importData.companyBranding) {
        await this.updateCompanyBranding(importData.companyBranding);
      }

      // Import custom fields
      if (importData.customFields && Array.isArray(importData.customFields)) {
        for (const field of importData.customFields) {
          const existingField = await this.customFieldModel.findOne({ name: field.name, entity: field.entity });
          if (existingField) {
            await this.updateCustomField(existingField._id.toString(), field);
          } else {
            await this.createCustomField(field);
          }
        }
      }

      // Import workflows
      if (importData.workflows && Array.isArray(importData.workflows)) {
        for (const workflow of importData.workflows) {
          const existingWorkflow = await this.workflowModel.findOne({ name: workflow.name, entity: workflow.entity });
          if (existingWorkflow) {
            await this.updateWorkflow(existingWorkflow._id.toString(), workflow);
          } else {
            await this.createWorkflow(workflow);
          }
        }
      }

      // Log the import
      await this.auditService.logAction({
        userId: 'system',
        action: 'IMPORT_SETTINGS',
        entity: 'System',
        entityId: 'import',
        changes: { importedData: Object.keys(importData) },
        ipAddress: 'system',
        userAgent: 'system',
      });

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to parse import file');
    }
  }
}
