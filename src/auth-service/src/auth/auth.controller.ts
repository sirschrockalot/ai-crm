import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: { email: string; password: string },
    @Request() req,
  ) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.authService.login(
      loginDto.email,
      loginDto.password,
      ip,
      userAgent,
    );
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      companyName: string;
    },
  ) {
    const user = await this.usersService.createUser(registerDto);
    const { password, ...userWithoutPassword } = user.toObject();
    
    return {
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userWithoutPassword,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Request() req,
  ) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.authService.refreshToken(body.refreshToken, ip, userAgent);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const sessionId = req.user.sessionId;
    await this.authService.logout(req.user.userId, sessionId);
    return { message: 'Logged out successfully' };
  }

  @Post('logout/all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAllSessions(@Request() req) {
    await this.authService.logoutAllSessions(req.user.userId);
    return { message: 'Logged out from all sessions successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }

  @Post('validate')
  @Public()
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() body: { token: string }) {
    try {
      const payload = await this.authService.validateToken(body.token);
      const user = await this.authService.getCurrentUser(payload.userId);
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() body: { email: string },
    @Request() req,
  ) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await this.usersService.requestPasswordReset(body.email, ip, userAgent);
    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  @Post('reset-password/confirm')
  @Public()
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body() body: { token: string; password: string },
    @Request() req,
  ) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await this.usersService.resetPassword(body.token, body.password, ip, userAgent);
    return { message: 'Password reset successfully' };
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    await this.usersService.verifyEmail(body.token);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Request() req) {
    // TODO: Implement resend verification email
    return { message: 'Verification email sent successfully' };
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  async setupMFA(@Request() req) {
    return this.usersService.setupMFA(req.user.userId);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyMFA(
    @Request() req,
    @Body() body: { code: string },
  ) {
    const isValid = await this.usersService.verifyMFA(req.user.userId, body.code);
    return { valid: isValid };
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disableMFA(@Request() req) {
    await this.usersService.disableMFA(req.user.userId);
    return { message: 'MFA disabled successfully' };
  }

  // Test mode endpoints (development only)
  @Post('test-mode/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async testModeLogin(
    @Body() body: { userId: string; email: string; role: string },
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Test mode not available in production');
    }

    return this.authService.testModeLogin(body.userId, body.email, body.role);
  }

  // Google OAuth endpoints
  @Get('google')
  @Public()
  async googleAuth() {
    // This would redirect to Google OAuth
    return { message: 'Google OAuth endpoint - redirect to Google' };
  }

  @Post('google/callback')
  @Public()
  async googleAuthCallback(
    @Body() body: { code: string; state?: string },
    @Request() req,
  ) {
    // TODO: Implement Google OAuth callback
    return { message: 'Google OAuth callback - not implemented yet' };
  }

  @Post('register/google')
  @Public()
  async googleRegister() {
    // TODO: Implement Google OAuth registration
    return { message: 'Google OAuth registration - not implemented yet' };
  }

  // Health check endpoint
  @Get('health')
  @Public()
  async healthCheck() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  // Simple test endpoint
  @Get('test')
  @Public()
  async test() {
    return { message: 'Auth service is working!' };
  }

  // Very simple test endpoint
  @Get('ping')
  @Public()
  async ping() {
    return { pong: true };
  }

  // Super simple test endpoint
  @Get('simple')
  async simple() {
    return { message: 'Simple endpoint works!' };
  }
}
