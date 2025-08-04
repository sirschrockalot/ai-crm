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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadResponseDto,
  LeadListResponseDto,
  LeadSearchDto,
  BulkLeadOperationDto,
  BulkLeadCreateDto,
  LeadStatsDto,
} from './dto/lead.dto';
import { RequestWithTenant } from '../../common/middleware/tenant-isolation.middleware';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Create a new lead',
    description: 'Creates a new lead with validation and duplicate detection',
  })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    type: LeadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid lead data or duplicate detected',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async createLead(
    @Body() createLeadDto: CreateLeadDto,
    @Request() req: RequestWithTenant,
  ): Promise<LeadResponseDto> {
    return this.leadsService.createLead(createLeadDto, req);
  }

  @Get()
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get all leads with filtering and pagination',
    description: 'Retrieves leads with search, filtering, and pagination capabilities',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by lead status' })
  @ApiQuery({ name: 'source', required: false, description: 'Filter by lead source' })
  @ApiQuery({ name: 'assignedTo', required: false, description: 'Filter by assigned user' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, email, phone' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter by creation date from' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter by creation date to' })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    type: LeadListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findAll(
    @Query() searchDto: LeadSearchDto,
    @Request() req: RequestWithTenant,
  ): Promise<LeadListResponseDto> {
    return this.leadsService.findAll(searchDto, req);
  }

  @Get('stats')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get lead statistics',
    description: 'Retrieves lead statistics and analytics data',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead statistics retrieved successfully',
    type: LeadStatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getLeadStats(
    @Request() req: RequestWithTenant,
  ): Promise<LeadStatsDto> {
    return this.leadsService.getLeadStats(req);
  }

  @Get(':leadId')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Get a specific lead by ID',
    description: 'Retrieves detailed information about a specific lead',
  })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead retrieved successfully',
    type: LeadResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findOne(
    @Param('leadId') leadId: string,
    @Request() req: RequestWithTenant,
  ): Promise<LeadResponseDto> {
    return this.leadsService.findOne(leadId, req);
  }

  @Put(':leadId')
  @Roles('admin', 'manager', 'agent')
  @ApiOperation({
    summary: 'Update a lead',
    description: 'Updates lead information with validation and audit logging',
  })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    type: LeadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid lead data',
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateLead(
    @Param('leadId') leadId: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Request() req: RequestWithTenant,
  ): Promise<LeadResponseDto> {
    return this.leadsService.updateLead(leadId, updateLeadDto, req);
  }

  @Delete(':leadId')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a lead',
    description: 'Soft deletes a lead (marks as deleted but preserves data)',
  })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({
    status: 204,
    description: 'Lead deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async deleteLead(
    @Param('leadId') leadId: string,
    @Request() req: RequestWithTenant,
  ): Promise<void> {
    return this.leadsService.deleteLead(leadId, req);
  }

  @Post('bulk/create')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Bulk create leads',
    description: 'Creates multiple leads in a single operation',
  })
  @ApiResponse({
    status: 201,
    description: 'Leads created successfully',
    type: [LeadResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid lead data or duplicates detected',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async bulkCreateLeads(
    @Body() bulkCreateDto: BulkLeadCreateDto,
    @Request() req: RequestWithTenant,
  ): Promise<LeadResponseDto[]> {
    return this.leadsService.bulkCreateLeads(bulkCreateDto, req);
  }

  @Put('bulk/update')
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Bulk update leads',
    description: 'Updates multiple leads in a single operation',
  })
  @ApiResponse({
    status: 200,
    description: 'Leads updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid operation data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async bulkUpdateLeads(
    @Body() bulkOperationDto: BulkLeadOperationDto,
    @Request() req: RequestWithTenant,
  ): Promise<void> {
    return this.leadsService.bulkUpdateLeads(bulkOperationDto, req);
  }
} 