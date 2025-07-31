import { Controller, Get, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      const tokens = await this.authService.generateTokens(user);
      
      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
        `access_token=${tokens.access_token}&` +
        `refresh_token=${tokens.refresh_token}&` +
        `user=${encodeURIComponent(JSON.stringify(tokens.user))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request) {
    const user = req.user as any;
    await this.authService.logout(user._id);
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: user.tenant_id,
    };
  }
} 