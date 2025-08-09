import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Lead, LeadDocument, LeadStatus, LeadSource, LeadPriority } from './schemas/lead.schema';
import { 
  CreateLeadDto, 
  UpdateLeadDto, 
  LeadResponseDto, 
  LeadListResponseDto, 
  LeadSearchDto,
  BulkLeadOperationDto,
  BulkLeadCreateDto,
  LeadStatsDto
} from './dto/lead.dto';
import { LeadValidationService } from './services/lead-validation.service';
import { RequestWithTenant } from '../../common/middleware/tenant-isolation.middleware';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    private readonly leadValidationService: LeadValidationService,
  ) {}

  /**
   * Create a new lead
   */
  async createLead(createLeadDto: CreateLeadDto, req: RequestWithTenant): Promise<LeadResponseDto> {
    // Validate lead data
    const validationResult = await this.leadValidationService.validateCreateLead(createLeadDto);
    this.leadValidationService.throwIfInvalid(validationResult);

    // Check for duplicates
    const duplicateCheck = await this.checkForDuplicates(createLeadDto, req.tenant.tenantId);
    if (duplicateCheck.isDuplicate) {
      throw new BadRequestException({
        message: 'Duplicate lead detected',
        duplicateFields: duplicateCheck.duplicateFields,
      });
    }

    // Create lead with tenant context
    const leadId = uuidv4();
    const lead = new this.leadModel({
      ...createLeadDto,
      leadId,
      tenantId: req.tenant.tenantId,
      assignedTo: new Types.ObjectId(createLeadDto.assignedTo),
      createdBy: new Types.ObjectId(req.user.sub),
      updatedBy: new Types.ObjectId(req.user.sub),
      activities: [{
        type: 'status_change',
        description: `Lead created with status: ${createLeadDto.status || LeadStatus.NEW}`,
        timestamp: new Date(),
        userId: new Types.ObjectId(req.user.sub),
      }],
    });

    const savedLead = await lead.save();
    return this.mapToResponseDto(savedLead);
  }

  /**
   * Get all leads with filtering and pagination
   */
  async findAll(searchDto: LeadSearchDto, req: RequestWithTenant): Promise<LeadListResponseDto> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Build query with tenant isolation
    const query: any = { 
      tenantId: req.tenant.tenantId,
      deletedAt: { $exists: false }
    };

    // Apply filters
    this.applySearchFilters(query, filters);

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [leads, total] = await Promise.all([
      this.leadModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .exec(),
      this.leadModel.countDocuments(query),
    ]);

    return {
      leads: leads.map(lead => this.mapToResponseDto(lead)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a specific lead by ID
   */
  async findOne(leadId: string, req: RequestWithTenant): Promise<LeadResponseDto> {
    const lead = await this.leadModel
      .findOne({ 
        leadId, 
        tenantId: req.tenant.tenantId,
        deletedAt: { $exists: false }
      })
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.mapToResponseDto(lead);
  }

  /**
   * Update a lead
   */
  async updateLead(leadId: string, updateLeadDto: UpdateLeadDto, req: RequestWithTenant): Promise<LeadResponseDto> {
    const lead = await this.leadModel.findOne({ 
      leadId, 
      tenantId: req.tenant.tenantId,
      deletedAt: { $exists: false }
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Check if user has permission to update this lead
    if (!this.canUpdateLead(lead, req.user.sub)) {
      throw new ForbiddenException('Insufficient permissions to update this lead');
    }

    // Validate update data
    const validationResult = await this.leadValidationService.validateUpdateLead(updateLeadDto);
    this.leadValidationService.throwIfInvalid(validationResult);

    // Validate status transition if status is being updated
    if (updateLeadDto.status && updateLeadDto.status !== lead.status) {
      const statusValidation = this.leadValidationService.validateStatusTransition(lead.status, updateLeadDto.status);
      this.leadValidationService.throwIfInvalid(statusValidation);
    }

    // Prepare update data
    const updateData: any = {
      ...updateLeadDto,
      updatedBy: new Types.ObjectId(req.user.sub),
    };

    // Update assignedTo if provided
    if (updateLeadDto.assignedTo) {
      updateData.assignedTo = new Types.ObjectId(updateLeadDto.assignedTo);
    }

    // Add activity log for status change
    if (updateLeadDto.status && updateLeadDto.status !== lead.status) {
      updateData.$push = {
        activities: {
          type: 'status_change',
          description: `Status changed from ${lead.status} to ${updateLeadDto.status}`,
          timestamp: new Date(),
          userId: new Types.ObjectId(req.user.sub),
        }
      };
    }

    // Add activity log for assignment change
    if (updateLeadDto.assignedTo && updateLeadDto.assignedTo !== lead.assignedTo.toString()) {
      if (!updateData.$push) updateData.$push = { activities: [] };
      updateData.$push.activities.push({
        type: 'assignment',
        description: `Lead reassigned to user ${updateLeadDto.assignedTo}`,
        timestamp: new Date(),
        userId: new Types.ObjectId(req.user.sub),
      });
    }

    const updatedLead = await this.leadModel
      .findOneAndUpdate(
        { leadId, tenantId: req.tenant.tenantId },
        updateData,
        { new: true }
      )
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .exec();

    return this.mapToResponseDto(updatedLead);
  }

  /**
   * Delete a lead (soft delete)
   */
  async deleteLead(leadId: string, req: RequestWithTenant): Promise<void> {
    const lead = await this.leadModel.findOne({ 
      leadId, 
      tenantId: req.tenant.tenantId,
      deletedAt: { $exists: false }
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Check if user has permission to delete this lead
    if (!this.canDeleteLead(lead, req.user.sub)) {
      throw new ForbiddenException('Insufficient permissions to delete this lead');
    }

    // Soft delete
    await this.leadModel.updateOne(
      { leadId, tenantId: req.tenant.tenantId },
      { 
        deletedAt: new Date(),
        updatedBy: new Types.ObjectId(req.user.sub),
      }
    );
  }

  /**
   * Bulk update leads
   */
  async bulkUpdateLeads(bulkOperationDto: BulkLeadOperationDto, req: RequestWithTenant): Promise<void> {
    const { leadIds, ...updateData } = bulkOperationDto;

    // Validate that all leads belong to the tenant
    const leads = await this.leadModel.find({
      leadId: { $in: leadIds },
      tenantId: req.tenant.tenantId,
      deletedAt: { $exists: false }
    });

    if (leads.length !== leadIds.length) {
      throw new BadRequestException('Some leads not found or do not belong to this tenant');
    }

    // Check permissions for all leads
    for (const lead of leads) {
      if (!this.canUpdateLead(lead, req.user.sub)) {
        throw new ForbiddenException(`Insufficient permissions to update lead ${lead.leadId}`);
      }
    }

    // Prepare update data
    const update: any = {
      ...updateData,
      updatedBy: new Types.ObjectId(req.user.sub),
    };

    if (updateData.assignedTo) {
      update.assignedTo = new Types.ObjectId(updateData.assignedTo);
    }

    // Add activity log for bulk update
    update.$push = {
      activities: {
        type: 'other',
        description: `Bulk update: ${Object.keys(updateData).join(', ')}`,
        timestamp: new Date(),
        userId: new Types.ObjectId(req.user.sub),
      }
    };

    await this.leadModel.updateMany(
      { leadId: { $in: leadIds }, tenantId: req.tenant.tenantId },
      update
    );
  }

  /**
   * Bulk create leads
   */
  async bulkCreateLeads(bulkCreateDto: BulkLeadCreateDto, req: RequestWithTenant): Promise<LeadResponseDto[]> {
    const { leads } = bulkCreateDto;
    const createdLeads: LeadResponseDto[] = [];

    for (const createLeadDto of leads) {
      try {
        // Validate each lead
        const validationResult = await this.leadValidationService.validateCreateLead(createLeadDto);
        this.leadValidationService.throwIfInvalid(validationResult);

        // Check for duplicates
        const duplicateCheck = await this.checkForDuplicates(createLeadDto, req.tenant.tenantId);
        if (duplicateCheck.isDuplicate) {
          throw new BadRequestException({
            message: `Duplicate lead detected for ${createLeadDto.contactInfo.email}`,
            duplicateFields: duplicateCheck.duplicateFields,
          });
        }

        // Create lead
        const leadId = uuidv4();
        const lead = new this.leadModel({
          ...createLeadDto,
          leadId,
          tenantId: req.tenant.tenantId,
          assignedTo: new Types.ObjectId(createLeadDto.assignedTo),
          createdBy: new Types.ObjectId(req.user.sub),
          updatedBy: new Types.ObjectId(req.user.sub),
          activities: [{
            type: 'status_change',
            description: `Lead created with status: ${createLeadDto.status || LeadStatus.NEW}`,
            timestamp: new Date(),
            userId: new Types.ObjectId(req.user.sub),
          }],
        });

        const savedLead = await lead.save();
        createdLeads.push(this.mapToResponseDto(savedLead));
      } catch (error) {
        // Log error and continue with other leads
        console.error(`Error creating lead: ${error.message}`);
        throw error;
      }
    }

    return createdLeads;
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(req: RequestWithTenant): Promise<LeadStatsDto> {
    const pipeline = [
      {
        $match: {
          tenantId: req.tenant.tenantId,
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          newLeads: { $sum: { $cond: [{ $eq: ['$status', LeadStatus.NEW] }, 1, 0] } },
          contactedLeads: { $sum: { $cond: [{ $eq: ['$status', LeadStatus.CONTACTED] }, 1, 0] } },
          qualifiedLeads: { $sum: { $cond: [{ $eq: ['$status', LeadStatus.QUALIFIED] }, 1, 0] } },
          interestedLeads: { $sum: { $cond: [{ $eq: ['$status', LeadStatus.INTERESTED] }, 1, 0] } },
          negotiatingLeads: { $sum: { $cond: [{ $eq: ['$status', LeadStatus.NEGOTIATING] }, 1, 0] } },
          closedWonLeads: { $sum: { $cond: [{ $eq: ['$status', LeadStatus.CLOSED_WON] }, 1, 0] } },
          closedLostLeads: { $sum: { $cond: [{ $eq: ['$status', LeadStatus.CLOSED_LOST] }, 1, 0] } },
          averageScore: { $avg: '$score' },
          totalValue: { $sum: '$closeValue' }
        }
      }
    ];

    const result = await this.leadModel.aggregate(pipeline);
    const stats = result[0] || {
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      qualifiedLeads: 0,
      interestedLeads: 0,
      negotiatingLeads: 0,
      closedWonLeads: 0,
      closedLostLeads: 0,
      averageScore: 0,
      totalValue: 0,
    };

    const conversionRate = stats.totalLeads > 0 
      ? ((stats.closedWonLeads + stats.closedLostLeads) / stats.totalLeads) * 100 
      : 0;

    return {
      ...stats,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  /**
   * Check for duplicate leads
   */
  private async checkForDuplicates(createLeadDto: CreateLeadDto, tenantId: string): Promise<{ isDuplicate: boolean; duplicateFields: string[] }> {
    const duplicateFields: string[] = [];

    // Check for duplicate email
    if (createLeadDto.contactInfo.email) {
      const emailDuplicate = await this.leadModel.findOne({
        'contactInfo.email': createLeadDto.contactInfo.email,
        tenantId,
        deletedAt: { $exists: false }
      });
      if (emailDuplicate) {
        duplicateFields.push('email');
      }
    }

    // Check for duplicate phone
    if (createLeadDto.contactInfo.phone) {
      const phoneDuplicate = await this.leadModel.findOne({
        'contactInfo.phone': createLeadDto.contactInfo.phone,
        tenantId,
        deletedAt: { $exists: false }
      });
      if (phoneDuplicate) {
        duplicateFields.push('phone');
      }
    }

    return {
      isDuplicate: duplicateFields.length > 0,
      duplicateFields,
    };
  }

  /**
   * Apply search filters to query
   */
  private applySearchFilters(query: any, filters: any): void {
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.assignedTo) {
      query.assignedTo = new Types.ObjectId(filters.assignedTo);
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.createdAfter) {
      query.createdAt = { $gte: new Date(filters.createdAfter) };
    }

    if (filters.createdBefore) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(filters.createdBefore);
      } else {
        query.createdAt = { $lte: new Date(filters.createdBefore) };
      }
    }

    if (filters.lastContactAfter) {
      query.lastContactDate = { $gte: new Date(filters.lastContactAfter) };
    }

    if (filters.lastContactBefore) {
      if (query.lastContactDate) {
        query.lastContactDate.$lte = new Date(filters.lastContactBefore);
      } else {
        query.lastContactDate = { $lte: new Date(filters.lastContactBefore) };
      }
    }

    if (filters.nextFollowUpAfter) {
      query.nextFollowUpDate = { $gte: new Date(filters.nextFollowUpAfter) };
    }

    if (filters.nextFollowUpBefore) {
      if (query.nextFollowUpDate) {
        query.nextFollowUpDate.$lte = new Date(filters.nextFollowUpBefore);
      } else {
        query.nextFollowUpDate = { $lte: new Date(filters.nextFollowUpBefore) };
      }
    }

    if (filters.minScore !== undefined) {
      query.score = { $gte: filters.minScore };
    }

    if (filters.maxScore !== undefined) {
      if (query.score) {
        query.score.$lte = filters.maxScore;
      } else {
        query.score = { $lte: filters.maxScore };
      }
    }
  }

  /**
   * Check if user can update lead
   */
  private canUpdateLead(lead: LeadDocument, userId: string): boolean {
    // Users can update leads they are assigned to
    if (lead.assignedTo.toString() === userId) {
      return true;
    }

    // TODO: Add role-based permissions check
    // For now, allow all authenticated users to update leads
    return true;
  }

  /**
   * Check if user can delete lead
   */
  private canDeleteLead(lead: LeadDocument, userId: string): boolean {
    // Users can delete leads they are assigned to
    if (lead.assignedTo.toString() === userId) {
      return true;
    }

    // TODO: Add role-based permissions check
    // For now, allow all authenticated users to delete leads
    return true;
  }

  /**
   * Map lead document to response DTO
   */
  private mapToResponseDto(lead: LeadDocument): LeadResponseDto {
    return {
      leadId: lead.leadId,
      tenantId: lead.tenantId,
      status: lead.status,
      source: lead.source,
      priority: lead.priority,
      contactInfo: lead.contactInfo,
      propertyPreferences: lead.propertyPreferences,
      financialInfo: lead.financialInfo,
      communicationHistory: lead.communicationHistory,
      activities: lead.activities.map(activity => ({
        ...activity,
        userId: activity.userId.toString(),
      })),
      appointments: lead.appointments,
      propertiesViewed: lead.propertiesViewed,
      offers: lead.offers,
      assignedTo: lead.assignedTo.toString(),
      createdBy: lead.createdBy?.toString(),
      updatedBy: lead.updatedBy?.toString(),
      score: lead.score,
      tags: lead.tags,
      notes: lead.notes,
      nextFollowUpDate: lead.nextFollowUpDate,
      lastContactDate: lead.lastContactDate,
      expectedCloseDate: lead.expectedCloseDate,
      actualCloseDate: lead.actualCloseDate,
      closeValue: lead.closeValue,
      commissionAmount: lead.commissionAmount,
      commissionPercentage: lead.commissionPercentage,
      marketingCampaign: lead.marketingCampaign,
      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmCampaign: lead.utmCampaign,
      utmTerm: lead.utmTerm,
      utmContent: lead.utmContent,
      referrer: lead.referrer,
      ipAddress: lead.ipAddress,
      userAgent: lead.userAgent,
      deviceType: lead.deviceType,
      browser: lead.browser,
      operatingSystem: lead.operatingSystem,
      location: lead.location,
      timeOnSite: lead.timeOnSite,
      pagesViewed: lead.pagesViewed,
      customFields: lead.customFields,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }
} 