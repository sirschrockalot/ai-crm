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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService, JwtPayload, GoogleUser } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 200, description: 'Redirects to Google OAuth' })
  async googleAuth() {
    // This endpoint initiates the Google OAuth flow
    // The guard will handle the redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth callback successful' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const googleUser = req.user as GoogleUser;
      
      // Create JWT payload from Google user data
      const jwtPayload = await this.authService.handleGoogleOAuthUser(googleUser);
      
      // Generate JWT token
      const token = await this.authService.generateToken(jwtPayload);
      
      // TODO: In production, redirect to frontend with token
      // For now, return JSON response
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Google OAuth authentication successful',
        data: {
          token,
          user: {
            id: googleUser.id,
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            picture: googleUser.picture,
          },
        },
      });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Google OAuth authentication failed',
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