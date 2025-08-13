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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findUserById(req.user.userId);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    const user = await this.usersService.updateUser(req.user.userId, updateData);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    await this.usersService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword
    );
    return { message: 'Password changed successfully' };
  }

  @Post('mfa/setup')
  async setupMFA(@Request() req) {
    return this.usersService.setupMFA(req.user.userId);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMFA(@Request() req, @Body() body: { code: string }) {
    const isValid = await this.usersService.verifyMFA(req.user.userId, body.code);
    return { valid: isValid };
  }

  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  async disableMFA(@Request() req) {
    await this.usersService.disableMFA(req.user.userId);
    return { message: 'MFA disabled successfully' };
  }

  @Get('activity')
  async getUserActivity(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.usersService.getUserActivity(req.user.userId, limitNum);
  }

  @Get('sessions')
  async getUserSessions(@Request() req) {
    const user = await this.usersService.findUserById(req.user.userId);
    return user.sessions || [];
  }

  @Delete('sessions/:sessionId')
  async revokeSession(@Request() req, @Param('sessionId') sessionId: string) {
    // TODO: Implement session revocation
    return { message: 'Session revoked successfully' };
  }

  @Delete('sessions')
  async revokeAllSessions(@Request() req) {
    // TODO: Implement all sessions revocation
    return { message: 'All sessions revoked successfully' };
  }

  // Admin-only endpoints
  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Query('tenantId') tenantId?: string) {
    if (tenantId) {
      return this.usersService.getUsersByTenant(tenantId);
    }
    // TODO: Implement pagination for all users
    return [];
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  async searchUsers(
    @Query('q') query: string,
    @Query('tenantId') tenantId?: string
  ) {
    return this.usersService.searchUsers(query, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findUserById(id);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    const user = await this.usersService.updateUser(id, updateData);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }

  @Get(':id/activity')
  @Roles(UserRole.ADMIN)
  async getUserActivityById(
    @Param('id') id: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.usersService.getUserActivity(id, limitNum);
  }
}
