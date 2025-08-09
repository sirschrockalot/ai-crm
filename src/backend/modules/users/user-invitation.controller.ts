import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

import { UserInvitationService } from './services/user-invitation.service';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/user-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { CurrentUser } from '../auth/decorators/auth.decorator';
import { InvitationStatus } from './schemas/user-invitation.schema';

@ApiTags('User Invitations')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserInvitationController {
  constructor(private readonly userInvitationService: UserInvitationService) {}

  @Post('invitations')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send user invitation (Admin/Manager only)' })
  @ApiResponse({
    status: 201,
    description: 'Invitation sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid invitation data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists or pending invitation exists',
  })
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser('sub') invitedBy: string,
    @Req() request: Request,
  ) {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('User-Agent');

    const invitation = await this.userInvitationService.createInvitation(
      createInvitationDto,
      invitedBy,
      ipAddress,
      userAgent,
    );

    return {
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        roles: invitation.roles,
      },
    };
  }

  @Get('invitations')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get invitations list (Admin/Manager only)' })
  @ApiQuery({ name: 'status', required: false, enum: InvitationStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Invitations retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getInvitations(
    @Query('status') status?: InvitationStatus,
    @Query('email') email?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @CurrentUser('sub') currentUserId: string,
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (email) filters.email = email;

    return this.userInvitationService.getInvitations(filters, page, limit);
  }

  @Get('invitations/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get invitation statistics (Admin/Manager only)' })
  @ApiResponse({
    status: 200,
    description: 'Invitation statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getInvitationStats() {
    return this.userInvitationService.getInvitationStats();
  }

  @Put('invitations/:id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel invitation (Admin/Manager only)' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({
    status: 200,
    description: 'Invitation cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid invitation status',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  async cancelInvitation(
    @Param('id') invitationId: string,
    @CurrentUser('sub') cancelledBy: string,
    @Body() body: { reason?: string },
  ) {
    await this.userInvitationService.cancelInvitation(invitationId, cancelledBy, body.reason);

    return {
      message: 'Invitation cancelled successfully',
    };
  }

  @Put('invitations/:id/resend')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend invitation (Admin/Manager only)' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({
    status: 200,
    description: 'Invitation resent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid invitation status or expired',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  async resendInvitation(
    @Param('id') invitationId: string,
    @CurrentUser('sub') resendBy: string,
  ) {
    await this.userInvitationService.resendInvitation(invitationId, resendBy);

    return {
      message: 'Invitation resent successfully',
    };
  }
}

@ApiTags('User Invitations')
@Controller('auth')
export class PublicInvitationController {
  constructor(private readonly userInvitationService: UserInvitationService) {}

  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invitation and create user account' })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted and account created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token, or weak password',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Req() request: Request,
  ) {
    const ipAddress = this.getClientIp(request);

    const user = await this.userInvitationService.acceptInvitation(acceptInvitationDto, ipAddress);

    return {
      message: 'Invitation accepted and account created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles: user.roles,
      },
    };
  }

  @Get('validate-invitation/:token')
  @ApiOperation({ summary: 'Validate invitation token' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
  })
  async validateInvitationToken(@Param('token') token: string) {
    const invitation = await this.userInvitationService.getInvitationByToken(token);

    if (!invitation) {
      return {
        valid: false,
        message: 'Invalid or expired invitation token',
      };
    }

    return {
      valid: true,
      invitation: {
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        roles: invitation.roles,
        message: invitation.message,
      },
    };
  }

  /**
   * Extract client IP address from request
   */
  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
} 