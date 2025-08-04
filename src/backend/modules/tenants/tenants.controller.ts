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
import { Permissions } from '../../common/constants/permissions';
import { TenantsService } from './tenants.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantResponseDto,
  TenantListResponseDto,
  TenantStatsDto,
} from './dto/tenant.dto';
import { RequestWithTenant } from '../../common/middleware/tenant-isolation.middleware';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(Permissions.TENANT_CREATE)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Tenant already exists' })
  async createTenant(
    @Body() createTenantDto: CreateTenantDto,
    @Request() req: RequestWithTenant,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.createTenant(createTenantDto, req.user.id);
  }

  @Get()
  @Roles(Permissions.TENANT_READ)
  @ApiOperation({ summary: 'Get all tenants with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Tenants retrieved successfully',
    type: TenantListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended', 'pending'] })
  @ApiQuery({ name: 'plan', required: false, enum: ['basic', 'professional', 'enterprise', 'custom'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('search') search?: string,
  ): Promise<TenantListResponseDto> {
    return this.tenantsService.findAll(page, limit, status as any, plan as any, search);
  }

  @Get(':tenantId')
  @Roles(Permissions.TENANT_READ)
  @ApiOperation({ summary: 'Get a specific tenant by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant retrieved successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  async findOne(@Param('tenantId') tenantId: string): Promise<TenantResponseDto> {
    return this.tenantsService.findOne(tenantId);
  }

  @Get('subdomain/:subdomain')
  @Roles(Permissions.TENANT_READ)
  @ApiOperation({ summary: 'Get a tenant by subdomain' })
  @ApiResponse({
    status: 200,
    description: 'Tenant retrieved successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'subdomain', description: 'Tenant subdomain' })
  async findBySubdomain(@Param('subdomain') subdomain: string): Promise<TenantResponseDto> {
    return this.tenantsService.findBySubdomain(subdomain);
  }

  @Put(':tenantId')
  @Roles(Permissions.TENANT_UPDATE)
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @Request() req: RequestWithTenant,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.updateTenant(tenantId, updateTenantDto, req.user.id);
  }

  @Delete(':tenantId')
  @Roles(Permissions.TENANT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tenant (soft delete)' })
  @ApiResponse({ status: 204, description: 'Tenant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  async deleteTenant(
    @Param('tenantId') tenantId: string,
    @Request() req: RequestWithTenant,
  ): Promise<void> {
    return this.tenantsService.deleteTenant(tenantId, req.user.id);
  }

  @Post(':tenantId/activate')
  @Roles(Permissions.TENANT_UPDATE)
  @ApiOperation({ summary: 'Activate a tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant activated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 400, description: 'Tenant is already active' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  async activateTenant(
    @Param('tenantId') tenantId: string,
    @Request() req: RequestWithTenant,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.activateTenant(tenantId, req.user.id);
  }

  @Post(':tenantId/suspend')
  @Roles(Permissions.TENANT_UPDATE)
  @ApiOperation({ summary: 'Suspend a tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant suspended successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 400, description: 'Tenant is already suspended' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  async suspendTenant(
    @Param('tenantId') tenantId: string,
    @Request() req: RequestWithTenant,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.suspendTenant(tenantId, req.user.id);
  }

  @Get(':tenantId/stats')
  @Roles(Permissions.TENANT_READ)
  @ApiOperation({ summary: 'Get tenant statistics' })
  @ApiResponse({
    status: 200,
    description: 'Tenant statistics retrieved successfully',
    type: TenantStatsDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  async getTenantStats(@Param('tenantId') tenantId: string): Promise<TenantStatsDto> {
    return this.tenantsService.getTenantStats(tenantId);
  }

  @Post(':tenantId/users/:userId')
  @Roles(Permissions.TENANT_USER_MANAGE)
  @ApiOperation({ summary: 'Add a user to a tenant' })
  @ApiResponse({ status: 200, description: 'User added to tenant successfully' })
  @ApiResponse({ status: 404, description: 'Tenant or user not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'role', enum: ['admin', 'member'], description: 'User role in tenant' })
  async addUserToTenant(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Query('role') role: 'admin' | 'member',
    @Request() req: RequestWithTenant,
  ): Promise<void> {
    return this.tenantsService.addUserToTenant(tenantId, userId, role, req.user.id);
  }

  @Delete(':tenantId/users/:userId')
  @Roles(Permissions.TENANT_USER_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a user from a tenant' })
  @ApiResponse({ status: 204, description: 'User removed from tenant successfully' })
  @ApiResponse({ status: 404, description: 'Tenant or user not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async removeUserFromTenant(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Request() req: RequestWithTenant,
  ): Promise<void> {
    return this.tenantsService.removeUserFromTenant(tenantId, userId, req.user.id);
  }
} 