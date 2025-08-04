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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';

import { RbacService } from './rbac.service';
import { CreateRoleDto, UpdateRoleDto, RoleSearchDto, AssignRoleDto, RevokeRoleDto } from './dto/role.dto';
import { Role } from './schemas/role.schema';
import { UserRole } from './schemas/user-role.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireAdmin, RequireUserWrite, RequireUserAccess } from '../../common/decorators/roles.decorator';

@ApiTags('RBAC - Role-Based Access Control')
@ApiBearerAuth()
@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('roles')
  @RequireAdmin()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Role created successfully', type: Role })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Role name already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid role data' })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @Request() req: any,
  ): Promise<Role> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    return this.rbacService.createRole(createRoleDto, tenantId, req.user._id);
  }

  @Get('roles')
  @RequireUserAccess()
  @ApiOperation({ summary: 'Search and filter roles' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Roles retrieved successfully' })
  async searchRoles(
    @Query() searchDto: RoleSearchDto,
    @Request() req: any,
  ): Promise<{ roles: Role[]; total: number }> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    return this.rbacService.searchRoles(searchDto, tenantId);
  }

  @Get('roles/:id')
  @RequireUserAccess()
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role retrieved successfully', type: Role })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  async getRoleById(@Param('id') id: string): Promise<Role> {
    return this.rbacService.getRoleById(id);
  }

  @Put('roles/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role updated successfully', type: Role })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot modify system roles' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: any,
  ): Promise<Role> {
    return this.rbacService.updateRole(id, updateRoleDto, req.user._id);
  }

  @Delete('roles/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot delete system roles or roles assigned to users' })
  async deleteRole(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.rbacService.deleteRole(id, req.user._id);
  }

  @Post('users/:userId/roles')
  @RequireUserWrite()
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Role assigned successfully', type: UserRole })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already has this role' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid role or user data' })
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req: any,
  ): Promise<UserRole> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    return this.rbacService.assignRoleToUser(assignRoleDto, tenantId, req.user._id);
  }

  @Delete('users/:userId/roles/:roleId')
  @RequireUserWrite()
  @ApiOperation({ summary: 'Revoke role from user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role revoked successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role assignment not found' })
  async revokeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Body() revokeRoleDto: RevokeRoleDto,
    @Request() req: any,
  ): Promise<void> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    return this.rbacService.revokeRoleFromUser(userId, roleId, tenantId, req.user._id, revokeRoleDto.reason);
  }

  @Get('users/:userId/roles')
  @RequireUserAccess()
  @ApiOperation({ summary: 'Get user\'s roles' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User roles retrieved successfully', type: [Role] })
  async getUserRoles(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<Role[]> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    return this.rbacService.getUserRoles(userId, tenantId);
  }

  @Get('users/:userId/permissions')
  @RequireUserAccess()
  @ApiOperation({ summary: 'Get user\'s permissions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User permissions retrieved successfully', type: [String] })
  async getUserPermissions(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<string[]> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    return this.rbacService.getUserPermissions(userId, tenantId);
  }

  @Get('users/:userId/permissions/check/:permission')
  @RequireUserAccess()
  @ApiOperation({ summary: 'Check if user has specific permission' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permission check result', type: Boolean })
  async checkUserPermission(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
    @Request() req: any,
  ): Promise<{ hasPermission: boolean }> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    const hasPermission = await this.rbacService.hasPermission(userId, permission, tenantId);
    return { hasPermission };
  }

  @Post('users/:userId/permissions/check')
  @RequireUserAccess()
  @ApiOperation({ summary: 'Check if user has any of the specified permissions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permission check result', type: Boolean })
  async checkUserAnyPermission(
    @Param('userId') userId: string,
    @Body() body: { permissions: string[] },
    @Request() req: any,
  ): Promise<{ hasAnyPermission: boolean }> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    const hasAnyPermission = await this.rbacService.hasAnyPermission(userId, body.permissions, tenantId);
    return { hasAnyPermission };
  }

  @Post('users/:userId/permissions/check-all')
  @RequireUserAccess()
  @ApiOperation({ summary: 'Check if user has all of the specified permissions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permission check result', type: Boolean })
  async checkUserAllPermissions(
    @Param('userId') userId: string,
    @Body() body: { permissions: string[] },
    @Request() req: any,
  ): Promise<{ hasAllPermissions: boolean }> {
    const tenantId = req.user.tenantId ? new Types.ObjectId(req.user.tenantId) : undefined;
    const hasAllPermissions = await this.rbacService.hasAllPermissions(userId, body.permissions, tenantId);
    return { hasAllPermissions };
  }

  @Post('initialize-system-roles')
  @RequireAdmin()
  @ApiOperation({ summary: 'Initialize system roles (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System roles initialized successfully' })
  async initializeSystemRoles(): Promise<{ message: string }> {
    await this.rbacService.initializeSystemRoles();
    return { message: 'System roles initialized successfully' };
  }
} 