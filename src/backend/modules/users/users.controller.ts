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
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserSearchDto, UpdateUserStatusDto, UpdateUserRolesDto, UserActivitySearchDto, ActivityExportDto } from './dto/user.dto';
import { ActivityType } from './schemas/user-activity.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserId, CurrentTenantId } from '../auth/decorators/auth.decorator';
import { JwtPayload } from '../auth/auth.service';
import { Types } from 'mongoose';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const user = await this.usersService.createUser(createUserDto, new Types.ObjectId(currentUser.sub));
    
    return {
      success: true,
      message: 'User created successfully',
      data: { user },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended', 'pending'] })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'manager', 'user', 'viewer'] })
  @ApiQuery({ name: 'company', required: false, type: String })
  @ApiQuery({ name: 'position', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'createdAfter', required: false, type: String })
  @ApiQuery({ name: 'createdBefore', required: false, type: String })
  @ApiQuery({ name: 'lastActiveAfter', required: false, type: String })
  @ApiQuery({ name: 'lastActiveBefore', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'testRole', required: false, enum: ['admin', 'acquisitions', 'dispositions'], description: 'Test mode: specify role for authentication bypass' })
  @ApiQuery({ name: 'testEmail', required: false, type: String, description: 'Test mode: specify email for authentication bypass' })
  async searchUsers(
    @Query() searchDto: UserSearchDto,
    @CurrentTenantId() tenantId: string,
  ) {
    const { users, total } = await this.usersService.searchUsers(searchDto, new Types.ObjectId(tenantId));
    
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          page: searchDto.page || 1,
          limit: searchDto.limit || 10,
          total,
          pages: Math.ceil(total / (searchDto.limit || 10)),
        },
      },
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUserId() userId: string) {
    const user = await this.usersService.findById(userId);
    
    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: { user },
    };
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid profile data' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async updateCurrentUserProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUserId() userId: string,
  ) {
    const user = await this.usersService.updateUser(userId, updateUserDto, new Types.ObjectId(userId));
    
    return {
      success: true,
      message: 'User profile updated successfully',
      data: { user },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') userId: string) {
    const user = await this.usersService.findById(userId);
    
    return {
      success: true,
      message: 'User retrieved successfully',
      data: { user },
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUserId() userId: string,
  ) {
    const user = await this.usersService.updateUser(userId, updateUserDto, new Types.ObjectId(userId));
    
    return {
      success: true,
      message: 'User profile updated successfully',
      data: { user },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const user = await this.usersService.updateUser(userId, updateUserDto, new Types.ObjectId(currentUserId));
    
    return {
      success: true,
      message: 'User updated successfully',
      data: { user },
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const user = await this.usersService.updateUserStatus(
      userId,
      updateStatusDto.status,
      updateStatusDto.reason,
      new Types.ObjectId(currentUserId),
    );
    
    return {
      success: true,
      message: 'User status updated successfully',
      data: { user },
    };
  }

  @Put(':id/roles')
  @ApiOperation({ summary: 'Update user roles' })
  @ApiResponse({ status: 200, description: 'User roles updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRoles(
    @Param('id') userId: string,
    @Body() updateRolesDto: UpdateUserRolesDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const user = await this.usersService.updateUserRoles(
      userId,
      updateRolesDto.roles,
      updateRolesDto.reason,
      new Types.ObjectId(currentUserId),
    );
    
    return {
      success: true,
      message: 'User roles updated successfully',
      data: { user },
    };
  }

  @Get('me/activity')
  @ApiOperation({ summary: 'Get current user activity' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCurrentUserActivity(
    @CurrentUserId() userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    const { activities, total } = await this.usersService.getUserActivity(userId, page, limit);
    
    return {
      success: true,
      message: 'User activity retrieved successfully',
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Get('me/profile/activity')
  @ApiOperation({ summary: 'Get current user profile activity' })
  @ApiResponse({ status: 200, description: 'User profile activity retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCurrentUserProfileActivity(
    @CurrentUserId() userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    // Get only profile-related activities
    const { activities, total } = await this.usersService.getUserActivity(userId, page, limit);
    const profileActivities = activities.filter(activity => 
      activity.type === ActivityType.PROFILE_UPDATE || 
      activity.type === ActivityType.ACCOUNT_CREATION
    );
    
    return {
      success: true,
      message: 'User profile activity retrieved successfully',
      data: {
        activities: profileActivities,
        pagination: {
          page,
          limit,
          total: profileActivities.length,
          pages: Math.ceil(profileActivities.length / limit),
        },
      },
    };
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get user activity by ID' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserActivity(
    @Param('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    const { activities, total } = await this.usersService.getUserActivity(userId, page, limit);
    
    return {
      success: true,
      message: 'User activity retrieved successfully',
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id') userId: string,
    @Body('reason') reason?: string,
    @CurrentUserId() currentUserId?: string,
  ) {
    await this.usersService.deleteUser(userId, reason, new Types.ObjectId(currentUserId));
    
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Get('stats/active-count')
  @ApiOperation({ summary: 'Get active users count' })
  @ApiResponse({ status: 200, description: 'Active users count retrieved successfully' })
  async getActiveUsersCount(@CurrentTenantId() tenantId: string) {
    const count = await this.usersService.getActiveUsersCount(new Types.ObjectId(tenantId));
    
    return {
      success: true,
      message: 'Active users count retrieved successfully',
      data: { count },
    };
  }

  @Get('stats/by-role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({ status: 200, description: 'Users by role retrieved successfully' })
  async getUsersByRole(
    @Param('role') role: string,
    @CurrentTenantId() tenantId: string,
  ) {
    const users = await this.usersService.getUsersByRole(role as any, new Types.ObjectId(tenantId));
    
    return {
      success: true,
      message: 'Users by role retrieved successfully',
      data: { users },
    };
  }

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Get user status history' })
  @ApiResponse({ status: 200, description: 'User status history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserStatusHistory(
    @Param('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    const { history, total } = await this.usersService.getUserStatusHistory(userId, page, limit);
    
    return {
      success: true,
      message: 'User status history retrieved successfully',
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Get('activity/search')
  @ApiOperation({ summary: 'Search user activities with advanced filtering' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  async searchActivities(
    @Query() searchDto: UserActivitySearchDto,
    @CurrentTenantId() tenantId: string,
  ) {
    const { activities, total } = await this.usersService.searchUserActivity({
      ...searchDto,
      tenantId: new Types.ObjectId(tenantId),
      type: searchDto.type as ActivityType,
      severity: searchDto.severity as any,
      startDate: searchDto.startDate ? new Date(searchDto.startDate) : undefined,
      endDate: searchDto.endDate ? new Date(searchDto.endDate) : undefined,
    });
    
    return {
      success: true,
      message: 'Activities retrieved successfully',
      data: {
        activities,
        pagination: {
          page: searchDto.page || 1,
          limit: searchDto.limit || 20,
          total,
          pages: Math.ceil(total / (searchDto.limit || 20)),
        },
      },
    };
  }

  @Get('activity/statistics')
  @ApiOperation({ summary: 'Get activity statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Activity statistics retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze' })
  async getActivityStatistics(
    @CurrentTenantId() tenantId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days = 30,
  ) {
    const statistics = await this.usersService.getActivityStatistics(new Types.ObjectId(tenantId), days);
    
    return {
      success: true,
      message: 'Activity statistics retrieved successfully',
      data: statistics,
    };
  }

  @Post('activity/export')
  @ApiOperation({ summary: 'Export activity logs for compliance' })
  @ApiResponse({ status: 200, description: 'Activity logs exported successfully' })
  async exportActivityLogs(
    @Body() exportDto: ActivityExportDto,
    @CurrentTenantId() tenantId: string,
  ) {
    const data = await this.usersService.exportActivityLogs(
      exportDto.userId,
      new Types.ObjectId(tenantId),
      exportDto.startDate ? new Date(exportDto.startDate) : undefined,
      exportDto.endDate ? new Date(exportDto.endDate) : undefined,
      exportDto.format || 'json'
    );
    
    return {
      success: true,
      message: 'Activity logs exported successfully',
      data: {
        format: exportDto.format || 'json',
        content: data,
      },
    };
  }

  @Post('activity/cleanup')
  @ApiOperation({ summary: 'Clean up old activity logs based on retention policy' })
  @ApiResponse({ status: 200, description: 'Activity logs cleaned up successfully' })
  @ApiQuery({ name: 'retentionDays', required: false, type: Number, description: 'Days to retain logs' })
  async cleanupActivityLogs(
    @Query('retentionDays', new ParseIntPipe({ optional: true })) retentionDays = 90,
  ) {
    const result = await this.usersService.cleanupOldActivityLogs(retentionDays);
    
    return {
      success: true,
      message: 'Activity logs cleaned up successfully',
      data: result,
    };
  }

  @Post('status-history/cleanup')
  @ApiOperation({ summary: 'Clean up old status history based on retention policy' })
  @ApiResponse({ status: 200, description: 'Status history cleaned up successfully' })
  @ApiQuery({ name: 'retentionDays', required: false, type: Number, description: 'Days to retain history' })
  async cleanupStatusHistory(
    @Query('retentionDays', new ParseIntPipe({ optional: true })) retentionDays = 365,
  ) {
    const result = await this.usersService.cleanupOldStatusHistory(retentionDays);
    
    return {
      success: true,
      message: 'Status history cleaned up successfully',
      data: result,
    };
  }
} 