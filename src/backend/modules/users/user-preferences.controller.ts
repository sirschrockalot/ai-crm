import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { UserPreferencesService } from './services/user-preferences.service';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { CurrentUser } from '../auth/decorators/auth.decorator';

@ApiTags('User Preferences')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getMyPreferences(@CurrentUser('sub') userId: string) {
    return this.userPreferencesService.getUserPreferences(userId);
  }

  @Put('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid preference values',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateMyPreferences(
    @CurrentUser('sub') userId: string,
    @Body() updateDto: UpdateUserPreferencesDto,
  ) {
    return this.userPreferencesService.updateUserPreferences(userId, updateDto, new Types.ObjectId(userId));
  }

  @Post('preferences/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset current user preferences to defaults' })
  @ApiResponse({
    status: 200,
    description: 'Preferences reset successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resetMyPreferences(@CurrentUser('sub') userId: string) {
    return this.userPreferencesService.resetUserPreferences(userId, new Types.ObjectId(userId));
  }

  @Get('preferences/history')
  @ApiOperation({ summary: 'Get current user preference change history' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Preference history retrieved successfully',
  })
  async getMyPreferenceHistory(
    @CurrentUser('sub') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.userPreferencesService.getPreferenceHistory(userId, page, limit);
  }

  // Admin endpoints
  @Get(':userId/preferences')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get user preferences (Admin/Manager only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserPreferences(@Param('userId') userId: string) {
    return this.userPreferencesService.getUserPreferences(userId);
  }

  @Put(':userId/preferences')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user preferences (Admin/Manager only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid preference values',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserPreferences(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserPreferencesDto,
    @CurrentUser('sub') performedBy: string,
  ) {
    return this.userPreferencesService.updateUserPreferences(userId, updateDto, new Types.ObjectId(performedBy));
  }

  @Post(':userId/preferences/reset')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user preferences to defaults (Admin/Manager only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Preferences reset successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resetUserPreferences(
    @Param('userId') userId: string,
    @CurrentUser('sub') performedBy: string,
  ) {
    return this.userPreferencesService.resetUserPreferences(userId, new Types.ObjectId(performedBy));
  }

  @Get(':userId/preferences/history')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get user preference change history (Admin/Manager only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Preference history retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getUserPreferenceHistory(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.userPreferencesService.getPreferenceHistory(userId, page, limit);
  }
} 