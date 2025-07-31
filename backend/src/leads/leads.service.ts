import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from './lead.schema';
import { CreateLeadDto } from '../common/dto/create-lead.dto';
import { UpdateLeadDto } from '../common/dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {}

  async createLead(createLeadDto: CreateLeadDto, tenantId: string): Promise<Lead> {
    const lead = new this.leadModel({
      ...createLeadDto,
      tenant_id: new Types.ObjectId(tenantId),
      status: 'new',
      priority: 'medium',
      communication_count: 0,
      tags: createLeadDto.tags || [],
    });

    return lead.save();
  }

  async findAllByTenant(tenantId: string, filters?: any): Promise<Lead[]> {
    const query: any = { tenant_id: new Types.ObjectId(tenantId) };

    // Apply filters
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.assigned_to) {
      query.assigned_to = new Types.ObjectId(filters.assigned_to);
    }
    if (filters?.source) {
      query.source = filters.source;
    }
    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    return this.leadModel.find(query).sort({ created_at: -1 }).exec();
  }

  async getPipelineData(tenantId: string, filters?: any): Promise<any> {
    const query: any = { tenant_id: new Types.ObjectId(tenantId) };

    // Apply filters
    if (filters?.assigned_to) {
      query.assigned_to = new Types.ObjectId(filters.assigned_to);
    }
    if (filters?.source) {
      query.source = filters.source;
    }
    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    const leads = await this.leadModel.find(query).sort({ created_at: -1 }).exec();

    // Organize leads by status
    const pipeline = {
      new: leads.filter(lead => lead.status === 'new'),
      contacted: leads.filter(lead => lead.status === 'contacted'),
      under_contract: leads.filter(lead => lead.status === 'under_contract'),
      closed: leads.filter(lead => lead.status === 'closed'),
      lost: leads.filter(lead => lead.status === 'lost')
    };

    return {
      pipeline,
      total: leads.length,
      stats: {
        new: pipeline.new.length,
        contacted: pipeline.contacted.length,
        under_contract: pipeline.under_contract.length,
        closed: pipeline.closed.length,
        lost: pipeline.lost.length
      }
    };
  }

  async findByIdAndTenant(leadId: string, tenantId: string): Promise<Lead | null> {
    return this.leadModel.findOne({
      _id: new Types.ObjectId(leadId),
      tenant_id: new Types.ObjectId(tenantId)
    }).exec();
  }

  async updateLead(leadId: string, tenantId: string, updateLeadDto: UpdateLeadDto): Promise<Lead | null> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    return this.leadModel.findByIdAndUpdate(
      leadId,
      { 
        ...updateLeadDto, 
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async deleteLead(leadId: string, tenantId: string): Promise<void> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    await this.leadModel.findByIdAndDelete(leadId);
  }

  async assignLead(leadId: string, tenantId: string, assignedTo: string): Promise<Lead | null> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    return this.leadModel.findByIdAndUpdate(
      leadId,
      { 
        assigned_to: new Types.ObjectId(assignedTo),
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async updateLeadStatus(leadId: string, tenantId: string, status: string): Promise<Lead | null> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    // Validate status
    const validStatuses = ['new', 'contacted', 'under_contract', 'closed', 'lost'];
    if (!validStatuses.includes(status)) {
      throw new ForbiddenException('Invalid status');
    }

    return this.leadModel.findByIdAndUpdate(
      leadId,
      { 
        status,
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async moveLeadInPipeline(leadId: string, tenantId: string, newStatus: string, position?: number): Promise<Lead | null> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    // Validate status
    const validStatuses = ['new', 'contacted', 'under_contract', 'closed', 'lost'];
    if (!validStatuses.includes(newStatus)) {
      throw new ForbiddenException('Invalid status');
    }

    return this.leadModel.findByIdAndUpdate(
      leadId,
      { 
        status: newStatus,
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async addTag(leadId: string, tenantId: string, tag: string): Promise<Lead | null> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    if (!lead.tags.includes(tag)) {
      return this.leadModel.findByIdAndUpdate(
        leadId,
        { 
          $push: { tags: tag },
          updated_at: new Date() 
        },
        { new: true }
      ).exec();
    }

    return lead;
  }

  async removeTag(leadId: string, tenantId: string, tag: string): Promise<Lead | null> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    return this.leadModel.findByIdAndUpdate(
      leadId,
      { 
        $pull: { tags: tag },
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async incrementCommunicationCount(leadId: string, tenantId: string): Promise<Lead | null> {
    const lead = await this.findByIdAndTenant(leadId, tenantId);
    if (!lead) {
      throw new NotFoundException('Lead not found in tenant');
    }

    return this.leadModel.findByIdAndUpdate(
      leadId,
      { 
        $inc: { communication_count: 1 },
        last_contacted: new Date(),
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async getLeadStats(tenantId: string): Promise<any> {
    const stats = await this.leadModel.aggregate([
      { $match: { tenant_id: new Types.ObjectId(tenantId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          contacted: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
          under_contract: { $sum: { $cond: [{ $eq: ['$status', 'under_contract'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      new: 0,
      contacted: 0,
      under_contract: 0,
      closed: 0,
      lost: 0
    };
  }

  async checkDuplicateLead(phone: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const query: any = {
      phone,
      tenant_id: new Types.ObjectId(tenantId)
    };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existingLead = await this.leadModel.findOne(query).exec();
    return !!existingLead;
  }
} 