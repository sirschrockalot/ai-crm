import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { AuthService, JwtPayload, GoogleUser } from './auth.service';
import { TestModeService } from './services/test-mode.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { TestModeGuard } from './guards/test-mode.guard';
import { TestUser } from './decorators/test-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly testModeService: TestModeService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 200, description: 'Redirects to Google OAuth' })
  async googleAuth() {
    // This endpoint initiates the Google OAuth flow
    // The guard will handle the redirect to Google
  }

  @Post('register/google')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register user via Google OAuth token' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth token or registration failed' })
  async registerWithGoogle(@Req() req: Request) {
    try {
      const { accessToken, tenantId } = req.body;
      
      if (!accessToken) {
        throw new BadRequestException('Google access token is required');
      }

      // Validate Google token and get user data
      const googleUser = await this.authService.validateGoogleToken(accessToken);
      
      // Register user from OAuth data
      const jwtPayload = await this.authService.registerUserFromOAuth(googleUser, tenantId);
      
      // Generate JWT token
      const token = await this.authService.generateToken(jwtPayload);
      
      return {
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: jwtPayload.sub,
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            picture: googleUser.picture,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth callback successful' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const googleUser = req.user as GoogleUser;
      
      // Register or find user from OAuth data
      const jwtPayload = await this.authService.registerUserFromOAuth(googleUser);
      
      // Generate JWT token
      const token = await this.authService.generateToken(jwtPayload);
      
      // TODO: In production, redirect to frontend with token
      // For now, return JSON response
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Google OAuth registration successful',
        data: {
          token,
          user: {
            id: jwtPayload.sub,
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            picture: googleUser.picture,
          },
        },
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Google OAuth registration failed',
        error: error.message,
      });
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    const token = this.authService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const newToken = await this.authService.refreshToken(token);
    
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        expiresIn: this.authService.getTokenExpiration(),
      },
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    const token = this.authService.extractTokenFromHeader(authHeader);
    
    if (token) {
      await this.authService.logout(token);
    }
    
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('test-mode/status')
  @ApiOperation({ summary: 'Get test mode status' })
  @ApiResponse({ status: 200, description: 'Test mode status retrieved' })
  async getTestModeStatus() {
    const isEnabled = this.testModeService.isTestModeEnabled();
    const testUsers = isEnabled ? this.testModeService.getAllTestUsers() : [];
    
    return {
      success: true,
      message: 'Test mode status retrieved',
      data: {
        enabled: isEnabled,
        testUsers: testUsers.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
        })),
      },
    };
  }

  @Post('test-mode/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with test user' })
  @ApiResponse({ status: 200, description: 'Test login successful' })
  @ApiResponse({ status: 400, description: 'Test mode disabled or invalid credentials' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'acquisitions', 'dispositions'] })
  @ApiQuery({ name: 'email', required: false, type: String })
  async testModeLogin(
    @Query('role') role?: string,
    @Query('email') email?: string,
  ) {
    if (!this.testModeService.isTestModeEnabled()) {
      throw new BadRequestException('Test mode is not enabled');
    }

    let testUser = null;
    if (role) {
      testUser = this.testModeService.getTestUser(role);
    } else if (email) {
      testUser = this.testModeService.validateTestUser(email);
    } else {
      testUser = this.testModeService.getDefaultTestUser();
    }

    if (!testUser) {
      throw new BadRequestException('Invalid test user credentials');
    }

    // Create JWT payload and token
    const payload = this.testModeService.createTestUserPayload(testUser);
    const token = await this.authService.generateToken(payload);

    this.testModeService.logTestModeUsage('Test user logged in', testUser);

    return {
      success: true,
      message: 'Test login successful',
      data: {
        token,
        user: {
          id: testUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          roles: testUser.roles,
          isTestUser: true,
        },
      },
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    const user = req.user as JwtPayload;
    
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.sub,
          email: user.email,
          tenantId: user.tenantId,
          roles: user.roles,
        },
      },
    };
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateToken(@Req() req: Request) {
    const user = req.user as JwtPayload;
    
    return {
      success: true,
      message: 'Token is valid',
      data: {
        valid: true,
        user: {
          id: user.sub,
          email: user.email,
          tenantId: user.tenantId,
          roles: user.roles,
        },
      },
    };
  }
} 