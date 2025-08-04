import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { PasswordResetService } from './services/password-reset.service';
import { ForgotPasswordDto, ResetPasswordDto, ValidateResetTokenDto } from './dto/password-reset.dto';
import { PasswordResetThrottleGuard } from './guards/password-reset-throttle.guard';

@ApiTags('Password Reset')
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  @UseGuards(PasswordResetThrottleGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if user exists)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email address',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('User-Agent');

    await this.passwordResetService.createPasswordResetToken(
      forgotPasswordDto.email,
      ipAddress,
      userAgent,
    );

    // Always return success to prevent email enumeration
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token, or weak password',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    const ipAddress = this.getClientIp(request);

    await this.passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      ipAddress,
    );

    return {
      message: 'Password has been successfully reset. You can now log in with your new password.',
    };
  }

  @Post('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate password reset token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async validateResetToken(
    @Body() validateResetTokenDto: ValidateResetTokenDto,
  ): Promise<{ valid: boolean }> {
    try {
      // This is a simplified validation - in a real implementation,
      // you might want to return more information about the token
      await this.passwordResetService.validateResetToken(validateResetTokenDto.token);
      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
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