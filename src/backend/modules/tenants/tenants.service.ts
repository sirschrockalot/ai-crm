import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Tenant, TenantDocument, TenantStatus, TenantPlan } from './schemas/tenant.schema';
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto, TenantListResponseDto, TenantStatsDto } from './dto/tenant.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createTenant(createTenantDto: CreateTenantDto, createdBy: string): Promise<TenantResponseDto> {
    // Validate subdomain uniqueness
    const existingTenant = await this.tenantModel.findOne({
      $or: [
        { subdomain: createTenantDto.subdomain },
        { name: createTenantDto.name }
      ]
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this subdomain or name already exists');
    }

    // Validate subdomain format
    if (!this.isValidSubdomain(createTenantDto.subdomain)) {
      throw new BadRequestException('Invalid subdomain format');
    }

    // Create tenant with default settings
    const tenantId = uuidv4();
    const tenant = new this.tenantModel({
      ...createTenantDto,
      tenantId,
      status: TenantStatus.PENDING,
      ownerId: new Types.ObjectId(createdBy),
      createdBy: new Types.ObjectId(createdBy),
      settings: this.getDefaultSettings(createTenantDto.settings),
      maxUsers: this.getMaxUsersForPlan(createTenantDto.plan || TenantPlan.BASIC),
      maxLeads: this.getMaxLeadsForPlan(createTenantDto.plan || TenantPlan.BASIC),
      maxStorage: this.getMaxStorageForPlan(createTenantDto.plan || TenantPlan.BASIC),
    });

    const savedTenant = await tenant.save();
    return this.mapToResponseDto(savedTenant);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: TenantStatus,
    plan?: TenantPlan,
    search?: string,
  ): Promise<TenantListResponseDto> {
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { deletedAt: { $exists: false } };
    
    if (status) {
      query.status = status;
    }
    
    if (plan) {
      query.plan = plan;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const [tenants, total] = await Promise.all([
      this.tenantModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('ownerId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .exec(),
      this.tenantModel.countDocuments(query),
    ]);

    return {
      tenants: tenants.map(tenant => this.mapToResponseDto(tenant)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantModel
      .findOne({ tenantId, deletedAt: { $exists: false } })
      .populate('ownerId', 'firstName lastName email')
      .populate('adminIds', 'firstName lastName email')
      .populate('memberIds', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.mapToResponseDto(tenant);
  }

  async findBySubdomain(subdomain: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantModel
      .findOne({ subdomain, deletedAt: { $exists: false } })
      .populate('ownerId', 'firstName lastName email')
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.mapToResponseDto(tenant);
  }

  async updateTenant(tenantId: string, updateTenantDto: UpdateTenantDto, updatedBy: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantModel.findOne({ tenantId, deletedAt: { $exists: false } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if user has permission to update this tenant
    if (!this.canUpdateTenant(tenant, updatedBy)) {
      throw new ForbiddenException('Insufficient permissions to update this tenant');
    }

    // Validate subdomain uniqueness if being updated
    if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
      const existingTenant = await this.tenantModel.findOne({
        subdomain: updateTenantDto.subdomain,
        tenantId: { $ne: tenantId },
        deletedAt: { $exists: false }
      });

      if (existingTenant) {
        throw new ConflictException('Subdomain already in use');
      }

      if (!this.isValidSubdomain(updateTenantDto.subdomain)) {
        throw new BadRequestException('Invalid subdomain format');
      }
    }

    // Update tenant
    const updatedTenant = await this.tenantModel
      .findOneAndUpdate(
        { tenantId },
        {
          ...updateTenantDto,
          updatedBy: new Types.ObjectId(updatedBy),
        },
        { new: true }
      )
      .populate('ownerId', 'firstName lastName email')
      .populate('adminIds', 'firstName lastName email')
      .populate('memberIds', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .exec();

    return this.mapToResponseDto(updatedTenant);
  }

  async deleteTenant(tenantId: string, deletedBy: string): Promise<void> {
    const tenant = await this.tenantModel.findOne({ tenantId, deletedAt: { $exists: false } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if user has permission to delete this tenant
    if (!this.canDeleteTenant(tenant, deletedBy)) {
      throw new ForbiddenException('Insufficient permissions to delete this tenant');
    }

    // Soft delete
    await this.tenantModel.updateOne(
      { tenantId },
      { 
        deletedAt: new Date(),
        updatedBy: new Types.ObjectId(deletedBy),
      }
    );
  }

  async activateTenant(tenantId: string, activatedBy: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantModel.findOne({ tenantId, deletedAt: { $exists: false } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status === TenantStatus.ACTIVE) {
      throw new BadRequestException('Tenant is already active');
    }

    const updatedTenant = await this.tenantModel
      .findOneAndUpdate(
        { tenantId },
        {
          status: TenantStatus.ACTIVE,
          updatedBy: new Types.ObjectId(activatedBy),
        },
        { new: true }
      )
      .populate('ownerId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .exec();

    return this.mapToResponseDto(updatedTenant);
  }

  async suspendTenant(tenantId: string, suspendedBy: string, reason?: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantModel.findOne({ tenantId, deletedAt: { $exists: false } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status === TenantStatus.SUSPENDED) {
      throw new BadRequestException('Tenant is already suspended');
    }

    const updatedTenant = await this.tenantModel
      .findOneAndUpdate(
        { tenantId },
        {
          status: TenantStatus.SUSPENDED,
          updatedBy: new Types.ObjectId(suspendedBy),
        },
        { new: true }
      )
      .populate('ownerId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .exec();

    return this.mapToResponseDto(updatedTenant);
  }

  async getTenantStats(tenantId: string): Promise<TenantStatsDto> {
    const tenant = await this.tenantModel.findOne({ tenantId, deletedAt: { $exists: false } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get usage statistics
    const [userCount, leadCount, storageUsed] = await Promise.all([
      this.userModel.countDocuments({ tenantId, deletedAt: { $exists: false } }),
      // TODO: Add lead model count when implemented
      Promise.resolve(0),
      // TODO: Add storage calculation when implemented
      Promise.resolve(0),
    ]);

    return {
      tenantId: tenant.tenantId,
      tenantName: tenant.name,
      totalUsers: userCount,
      totalLeads: leadCount,
      totalStorage: storageUsed,
      activeUsers: tenant.auditLog?.totalLogins || 0,
      newLeadsThisMonth: 0, // TODO: Implement when lead model is available
      conversionRate: 0, // TODO: Implement when lead model is available
      lastActivity: tenant.auditLog?.lastActivity || tenant.createdAt,
    };
  }

  async addUserToTenant(tenantId: string, userId: string, role: 'admin' | 'member', addedBy: string): Promise<void> {
    const tenant = await this.tenantModel.findOne({ tenantId, deletedAt: { $exists: false } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!this.canManageTenantUsers(tenant, addedBy)) {
      throw new ForbiddenException('Insufficient permissions to manage tenant users');
    }

    const userObjectId = new Types.ObjectId(userId);
    
    if (role === 'admin') {
      if (!tenant.adminIds.includes(userObjectId)) {
        tenant.adminIds.push(userObjectId);
      }
    } else {
      if (!tenant.memberIds.includes(userObjectId)) {
        tenant.memberIds.push(userObjectId);
      }
    }

    tenant.updatedBy = new Types.ObjectId(addedBy);
    await tenant.save();
  }

  async removeUserFromTenant(tenantId: string, userId: string, removedBy: string): Promise<void> {
    const tenant = await this.tenantModel.findOne({ tenantId, deletedAt: { $exists: false } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!this.canManageTenantUsers(tenant, removedBy)) {
      throw new ForbiddenException('Insufficient permissions to manage tenant users');
    }

    const userObjectId = new Types.ObjectId(userId);
    
    // Remove from both admin and member lists
    tenant.adminIds = tenant.adminIds.filter(id => !id.equals(userObjectId));
    tenant.memberIds = tenant.memberIds.filter(id => !id.equals(userObjectId));
    
    tenant.updatedBy = new Types.ObjectId(removedBy);
    await tenant.save();
  }

  private isValidSubdomain(subdomain: string): boolean {
    // Subdomain must be 3-63 characters, alphanumeric and hyphens only, not starting or ending with hyphen
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    return subdomainRegex.test(subdomain);
  }

  private getDefaultSettings(settings: any): any {
    return {
      companyName: settings.companyName,
      timezone: settings.timezone || 'UTC',
      locale: settings.locale || 'en-US',
      currency: settings.currency || 'USD',
      features: {
        aiLeadScoring: false,
        advancedAnalytics: false,
        automationWorkflows: false,
        mobileApp: false,
        apiAccess: false,
        customIntegrations: false,
        ...settings.features,
      },
      security: {
        requireMfa: false,
        sessionTimeout: 480, // 8 hours
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
        },
        ipWhitelist: [],
        ...settings.security,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        inAppNotifications: true,
        notificationPreferences: {
          leadAssigned: true,
          leadStatusChanged: true,
          automationTriggered: true,
          systemAlerts: true,
        },
        ...settings.notifications,
      },
      integrations: {
        googleWorkspace: false,
        microsoft365: false,
        slack: false,
        zapier: false,
        customWebhooks: [],
        ...settings.integrations,
      },
    };
  }

  private getMaxUsersForPlan(plan: TenantPlan): number {
    switch (plan) {
      case TenantPlan.BASIC:
        return 5;
      case TenantPlan.PROFESSIONAL:
        return 25;
      case TenantPlan.ENTERPRISE:
        return 100;
      case TenantPlan.CUSTOM:
        return 1000;
      default:
        return 5;
    }
  }

  private getMaxLeadsForPlan(plan: TenantPlan): number {
    switch (plan) {
      case TenantPlan.BASIC:
        return 1000;
      case TenantPlan.PROFESSIONAL:
        return 10000;
      case TenantPlan.ENTERPRISE:
        return 100000;
      case TenantPlan.CUSTOM:
        return 1000000;
      default:
        return 1000;
    }
  }

  private getMaxStorageForPlan(plan: TenantPlan): number {
    switch (plan) {
      case TenantPlan.BASIC:
        return 1024; // 1GB
      case TenantPlan.PROFESSIONAL:
        return 10240; // 10GB
      case TenantPlan.ENTERPRISE:
        return 102400; // 100GB
      case TenantPlan.CUSTOM:
        return 1048576; // 1TB
      default:
        return 1024;
    }
  }

  private canUpdateTenant(tenant: TenantDocument, userId: string): boolean {
    const userObjectId = new Types.ObjectId(userId);
    return (
      tenant.ownerId.equals(userObjectId) ||
      tenant.adminIds.some(id => id.equals(userObjectId))
    );
  }

  private canDeleteTenant(tenant: TenantDocument, userId: string): boolean {
    const userObjectId = new Types.ObjectId(userId);
    return tenant.ownerId.equals(userObjectId);
  }

  private canManageTenantUsers(tenant: TenantDocument, userId: string): boolean {
    const userObjectId = new Types.ObjectId(userId);
    return (
      tenant.ownerId.equals(userObjectId) ||
      tenant.adminIds.some(id => id.equals(userObjectId))
    );
  }

  private mapToResponseDto(tenant: TenantDocument): TenantResponseDto {
    return {
      tenantId: tenant.tenantId,
      name: tenant.name,
      subdomain: tenant.subdomain,
      status: tenant.status,
      plan: tenant.plan,
      settings: tenant.settings,
      ownerId: tenant.ownerId.toString(),
      adminIds: tenant.adminIds.map(id => id.toString()),
      memberIds: tenant.memberIds.map(id => id.toString()),
      maxUsers: tenant.maxUsers,
      maxLeads: tenant.maxLeads,
      maxStorage: tenant.maxStorage,
      customDomain: tenant.customDomain,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      description: tenant.description,
      industry: tenant.industry,
      size: tenant.size,
      website: tenant.website,
      phone: tenant.phone,
      address: tenant.address,
      usageStats: tenant.usageStats,
      auditLog: tenant.auditLog,
      createdBy: tenant.createdBy.toString(),
      updatedBy: tenant.updatedBy?.toString(),
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
} 