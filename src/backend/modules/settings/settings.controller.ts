import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser, CurrentUserId } from '../auth/decorators/auth.decorator';
import { SettingsService } from './settings.service';
import {
  UserProfileDto,
  UserPreferencesDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  SystemSettingsDto,
  CompanyBrandingDto,
  CustomFieldDto,
  WorkflowDto,
  AuditLogDto,
} from './dto/settings.dto';

@ApiTags('Settings and Configuration')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ===== USER PROFILE AND PREFERENCES =====

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  async getUserProfile(@CurrentUserId() userId: string) {
    return this.settingsService.getUserProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserProfileDto,
  })
  async updateUserProfile(
    @CurrentUserId() userId: string,
    @Body() updateDto: Partial<UserProfileDto>,
  ) {
    return this.settingsService.updateUserProfile(userId, updateDto);
  }

  @Post('profile/avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.settingsService.uploadAvatar(userId, file);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
    type: UserPreferencesDto,
  })
  async getUserPreferences(@CurrentUserId() userId: string) {
    return this.settingsService.getUserPreferences(userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({
    status: 200,
    description: 'User preferences updated successfully',
    type: UserPreferencesDto,
  })
  async updateUserPreferences(
    @CurrentUserId() userId: string,
    @Body() updateDto: Partial<UserPreferencesDto>,
  ) {
    return this.settingsService.updateUserPreferences(userId, updateDto);
  }

  // ===== NOTIFICATION SETTINGS =====

  @Get('notifications')
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
    type: NotificationSettingsDto,
  })
  async getNotificationSettings(@CurrentUserId() userId: string) {
    return this.settingsService.getNotificationSettings(userId);
  }

  @Put('notifications')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
    type: NotificationSettingsDto,
  })
  async updateNotificationSettings(
    @CurrentUserId() userId: string,
    @Body() updateDto: Partial<NotificationSettingsDto>,
  ) {
    return this.settingsService.updateNotificationSettings(userId, updateDto);
  }

  // ===== SECURITY SETTINGS =====

  @Get('security')
  @ApiOperation({ summary: 'Get security settings' })
  @ApiResponse({
    status: 200,
    description: 'Security settings retrieved successfully',
    type: SecuritySettingsDto,
  })
  async getSecuritySettings(@CurrentUserId() userId: string) {
    return this.settingsService.getSecuritySettings(userId);
  }

  @Put('security')
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({
    status: 200,
    description: 'Security settings updated successfully',
    type: SecuritySettingsDto,
  })
  async updateSecuritySettings(
    @CurrentUserId() userId: string,
    @Body() updateDto: Partial<SecuritySettingsDto>,
  ) {
    return this.settingsService.updateSecuritySettings(userId, updateDto);
  }

  @Post('security/2fa/enable')
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({
    status: 200,
    description: '2FA enabled successfully',
  })
  async enableTwoFactor(
    @CurrentUserId() userId: string,
    @Body() body: { method: 'totp' | 'sms' | 'email' },
  ) {
    return this.settingsService.enableTwoFactor(userId, body.method);
  }

  @Post('security/2fa/disable')
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
  })
  async disableTwoFactor(@CurrentUserId() userId: string) {
    return this.settingsService.disableTwoFactor(userId);
  }

  @Post('security/2fa/verify')
  @ApiOperation({ summary: 'Verify two-factor authentication code' })
  @ApiResponse({
    status: 200,
    description: '2FA code verified successfully',
  })
  async verifyTwoFactor(
    @CurrentUserId() userId: string,
    @Body() body: { code: string },
  ) {
    return this.settingsService.verifyTwoFactor(userId, body.code);
  }

  @Post('security/password/change')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  async changePassword(
    @CurrentUserId() userId: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.settingsService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  // ===== SYSTEM SETTINGS (ADMIN ONLY) =====

  @Get('system')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get system settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System settings retrieved successfully',
    type: SystemSettingsDto,
  })
  async getSystemSettings() {
    return this.settingsService.getSystemSettings();
  }

  @Put('system')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update system settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System settings updated successfully',
    type: SystemSettingsDto,
  })
  async updateSystemSettings(@Body() updateDto: Partial<SystemSettingsDto>) {
    return this.settingsService.updateSystemSettings(updateDto);
  }

  // ===== COMPANY BRANDING (ADMIN ONLY) =====

  @Get('company')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get company information and branding (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Company information retrieved successfully',
    type: CompanyBrandingDto,
  })
  async getCompanyBranding() {
    return this.settingsService.getCompanyBranding();
  }

  @Put('company')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update company information and branding (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Company information updated successfully',
    type: CompanyBrandingDto,
  })
  async updateCompanyBranding(@Body() updateDto: Partial<CompanyBrandingDto>) {
    return this.settingsService.updateCompanyBranding(updateDto);
  }

  @Post('company/logo')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload company logo (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadCompanyLogo(@UploadedFile() file: Express.Multer.File) {
    return this.settingsService.uploadCompanyLogo(file);
  }

  // ===== CUSTOM FIELDS (ADMIN ONLY) =====

  @Get('custom-fields')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get custom fields configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Custom fields retrieved successfully',
    type: [CustomFieldDto],
  })
  async getCustomFields() {
    return this.settingsService.getCustomFields();
  }

  @Post('custom-fields')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create custom field (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Custom field created successfully',
    type: CustomFieldDto,
  })
  async createCustomField(@Body() createDto: CustomFieldDto) {
    return this.settingsService.createCustomField(createDto);
  }

  @Put('custom-fields/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update custom field (Admin only)' })
  @ApiParam({ name: 'id', description: 'Custom field ID' })
  @ApiResponse({
    status: 200,
    description: 'Custom field updated successfully',
    type: CustomFieldDto,
  })
  async updateCustomField(
    @Param('id') id: string,
    @Body() updateDto: Partial<CustomFieldDto>,
  ) {
    return this.settingsService.updateCustomField(id, updateDto);
  }

  @Delete('custom-fields/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete custom field (Admin only)' })
  @ApiParam({ name: 'id', description: 'Custom field ID' })
  @ApiResponse({
    status: 200,
    description: 'Custom field deleted successfully',
  })
  async deleteCustomField(@Param('id') id: string) {
    return this.settingsService.deleteCustomField(id);
  }

  // ===== WORKFLOW CUSTOMIZATION (ADMIN ONLY) =====

  @Get('workflows')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get workflow configurations (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Workflows retrieved successfully',
    type: [WorkflowDto],
  })
  async getWorkflows() {
    return this.settingsService.getWorkflows();
  }

  @Post('workflows')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create workflow (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Workflow created successfully',
    type: WorkflowDto,
  })
  async createWorkflow(@Body() createDto: WorkflowDto) {
    return this.settingsService.createWorkflow(createDto);
  }

  @Put('workflows/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update workflow (Admin only)' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow updated successfully',
    type: WorkflowDto,
  })
  async updateWorkflow(
    @Param('id') id: string,
    @Body() updateDto: Partial<WorkflowDto>,
  ) {
    return this.settingsService.updateWorkflow(id, updateDto);
  }

  @Delete('workflows/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete workflow (Admin only)' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({
    status: 200,
    description: 'Workflow deleted successfully',
  })
  async deleteWorkflow(@Param('id') id: string) {
    return this.settingsService.deleteWorkflow(id);
  }

  // ===== AUDIT AND ANALYTICS =====

  @Get('audit-log')
  @ApiOperation({ summary: 'Get settings audit log' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
    type: [AuditLogDto],
  })
  async getAuditLog(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.settingsService.getAuditLog({ startDate, endDate, action, userId });
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get settings usage analytics' })
  @ApiQuery({ name: 'period', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
  })
  async getAnalytics(@Query('period') period?: string) {
    return this.settingsService.getAnalytics(period);
  }

  // ===== EXPORT/IMPORT (ADMIN ONLY) =====

  @Post('export')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export settings configuration (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Settings exported successfully',
  })
  async exportSettings() {
    return this.settingsService.exportSettings();
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Import settings configuration (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importSettings(@UploadedFile() file: Express.Multer.File) {
    return this.settingsService.importSettings(file);
  }
}
