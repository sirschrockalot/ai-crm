import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SecurityService } from '../security/security.service';
import { User, UserDocument, UserStatus } from '../users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly securityService: SecurityService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string, ip: string, userAgent: string): Promise<UserDocument> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      await this.securityService.recordFailedLoginAttempt(email, ip, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.securityService.recordFailedLoginAttempt(email, ip, userAgent);
      await this.usersService.logUserActivity({
        userId: user._id,
        type: 'LOGIN_FAILED' as any,
        description: 'Failed login attempt',
        severity: 'MEDIUM' as any,
        ip,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    return user;
  }

  async login(email: string, password: string, ip: string, userAgent: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password, ip, userAgent);

    // Check for suspicious activity
    await this.securityService.checkSuspiciousActivity(user, ip, userAgent);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Create session
    const sessionId = uuidv4();
    const device = this.extractDeviceInfo(userAgent);
    
    // Add session to user
    const session = {
      id: sessionId,
      device,
      ip,
      userAgent,
      lastActive: new Date(),
      current: true,
    };

    // Mark all existing sessions as not current
    user.sessions = user.sessions.map(s => ({ ...s, current: false }));
    user.sessions.push(session);
    await user.save();

    // Log successful login
    await this.usersService.logUserActivity({
      userId: user._id,
      type: 'LOGIN' as any,
      description: 'User logged in successfully',
      severity: 'LOW' as any,
      ip,
      userAgent,
      metadata: { sessionId },
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }

  async refreshToken(refreshToken: string, ip: string, userAgent: string): Promise<LoginResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

      const user = await this.usersService.findUserById(payload.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Validate session
      const session = user.sessions.find(s => s.id === payload.sessionId);
      if (!session || session.current === false) {
        throw new UnauthorizedException('Invalid session');
      }

      // Update session
      session.lastActive = new Date();
      await user.save();

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      const { password: _, ...userWithoutPassword } = user.toObject();

      return {
        user: userWithoutPassword,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 24 * 60 * 60,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    
    // Remove specific session
    user.sessions = user.sessions.filter(s => s.id !== sessionId);
    await user.save();

    // Log logout activity
    await this.usersService.logUserActivity({
      userId: user._id,
      type: 'LOGOUT' as any,
      description: 'User logged out',
      severity: 'LOW' as any,
    });
  }

  async logoutAllSessions(userId: string): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    
    // Clear all sessions
    user.sessions = [];
    await user.save();

    // Log logout activity
    await this.usersService.logUserActivity({
      userId: user._id,
      type: 'LOGOUT' as any,
      description: 'User logged out from all sessions',
      severity: 'LOW' as any,
    });
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getCurrentUser(userId: string): Promise<Omit<UserDocument, 'password'>> {
    const user = await this.usersService.findUserById(userId);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  private generateAccessToken(user: UserDocument): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: UserDocument): string {
    const sessionId = user.sessions.find(s => s.current)?.id || uuidv4();
    
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
      sessionId,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      expiresIn: '7d',
    });
  }

  private extractDeviceInfo(userAgent: string): string {
    // Simple device detection (in production, use a proper library)
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
  }

  // Test mode login for development
  async testModeLogin(userId: string, email: string, role: string): Promise<LoginResponse> {
    // This should only be available in development/test environments
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Test mode login not available in production');
    }

    let user = await this.usersService.findUserByEmail(email);
    
    if (!user) {
      // Create test user if it doesn't exist
      user = await this.usersService.createUser({
        email,
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company',
        role: role as any,
      });
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const { password: _, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60,
    };
  }
}
