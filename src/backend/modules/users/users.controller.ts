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
import { CreateUserDto, UpdateUserDto, UserSearchDto, UpdateUserStatusDto, UpdateUserRoleDto, UserActivitySearchDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserId, CurrentTenantId } from '../auth/decorators/auth.decorator';
import { JwtPayload } from '../auth/auth.service';

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
    const user = await this.usersService.createUser(createUserDto, currentUser.sub);
    
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
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async searchUsers(
    @Query() searchDto: UserSearchDto,
    @CurrentTenantId() tenantId: string,
  ) {
    const { users, total } = await this.usersService.searchUsers(searchDto, tenantId);
    
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
    const user = await this.usersService.updateUser(userId, updateUserDto, userId);
    
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
    const user = await this.usersService.updateUser(userId, updateUserDto, currentUserId);
    
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
      currentUserId,
    );
    
    return {
      success: true,
      message: 'User status updated successfully',
      data: { user },
    };
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const user = await this.usersService.updateUserRole(
      userId,
      updateRoleDto.role,
      updateRoleDto.reason,
      currentUserId,
    );
    
    return {
      success: true,
      message: 'User role updated successfully',
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
    await this.usersService.deleteUser(userId, reason, currentUserId);
    
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Get('stats/active-count')
  @ApiOperation({ summary: 'Get active users count' })
  @ApiResponse({ status: 200, description: 'Active users count retrieved successfully' })
  async getActiveUsersCount(@CurrentTenantId() tenantId: string) {
    const count = await this.usersService.getActiveUsersCount(tenantId);
    
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
    const users = await this.usersService.getUsersByRole(role as any, tenantId);
    
    return {
      success: true,
      message: 'Users by role retrieved successfully',
      data: { users },
    };
  }
} 