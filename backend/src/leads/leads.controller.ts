import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  ForbiddenException 
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from '../common/dto/create-lead.dto';
import { UpdateLeadDto } from '../common/dto/update-lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { USER_ROLES } from '../common/decorators/roles.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async createLead(@Body() createLeadDto: CreateLeadDto, @Request() req: any) {
    const tenantId = req.user.tenant_id.toString();
    
    // Check for duplicate lead
    const isDuplicate = await this.leadsService.checkDuplicateLead(createLeadDto.phone, tenantId);
    if (isDuplicate) {
      throw new ForbiddenException('A lead with this phone number already exists');
    }

    return this.leadsService.createLead(createLeadDto, tenantId);
  }

  @Get()
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async getLeads(@Query() filters: any, @Request() req: any) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.findAllByTenant(tenantId, filters);
  }

  @Get('pipeline')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async getPipelineData(@Query() filters: any, @Request() req: any) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.getPipelineData(tenantId, filters);
  }

  @Get('stats')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async getLeadStats(@Request() req: any) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.getLeadStats(tenantId);
  }

  @Get(':id')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async getLead(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id.toString();
    const lead = await this.leadsService.findByIdAndTenant(id, tenantId);
    
    if (!lead) {
      throw new ForbiddenException('Lead not found in tenant');
    }
    
    return lead;
  }

  @Put(':id')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async updateLead(
    @Param('id') id: string, 
    @Body() updateLeadDto: UpdateLeadDto, 
    @Request() req: any
  ) {
    const tenantId = req.user.tenant_id.toString();
    
    // Check for duplicate lead if phone is being updated
    if (updateLeadDto.phone) {
      const isDuplicate = await this.leadsService.checkDuplicateLead(updateLeadDto.phone, tenantId, id);
      if (isDuplicate) {
        throw new ForbiddenException('A lead with this phone number already exists');
      }
    }

    return this.leadsService.updateLead(id, tenantId, updateLeadDto);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async deleteLead(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id.toString();
    await this.leadsService.deleteLead(id, tenantId);
    return { message: 'Lead deleted successfully' };
  }

  @Put(':id/assign')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async assignLead(
    @Param('id') id: string, 
    @Body() body: { assigned_to: string }, 
    @Request() req: any
  ) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.assignLead(id, tenantId, body.assigned_to);
  }

  @Put(':id/status')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async updateLeadStatus(
    @Param('id') id: string, 
    @Body() body: { status: string }, 
    @Request() req: any
  ) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.updateLeadStatus(id, tenantId, body.status);
  }

  @Put(':id/move')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async moveLeadInPipeline(
    @Param('id') id: string, 
    @Body() body: { status: string; position?: number }, 
    @Request() req: any
  ) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.moveLeadInPipeline(id, tenantId, body.status, body.position);
  }

  @Post(':id/tags')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async addTag(
    @Param('id') id: string, 
    @Body() body: { tag: string }, 
    @Request() req: any
  ) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.addTag(id, tenantId, body.tag);
  }

  @Delete(':id/tags/:tag')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async removeTag(
    @Param('id') id: string, 
    @Param('tag') tag: string, 
    @Request() req: any
  ) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.removeTag(id, tenantId, tag);
  }

  @Post(':id/contact')
  @Roles(USER_ROLES.ACQUISITION_REP, USER_ROLES.ADMIN)
  async recordContact(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenant_id.toString();
    return this.leadsService.incrementCommunicationCount(id, tenantId);
  }
} 