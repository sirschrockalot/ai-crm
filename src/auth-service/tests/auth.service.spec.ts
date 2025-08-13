import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { SecurityService } from '../src/security/security.service';
import { User, UserStatus } from '../src/users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let securityService: SecurityService;
  let jwtService: JwtService;

  const mockUser: Partial<User> = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    companyName: 'Test Company',
    role: 'user',
    status: UserStatus.ACTIVE,
    isEmailVerified: true,
    mfaEnabled: false,
    sessions: [],
    loginAttempts: 0,
  };

  const mockUsersService = {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    logUserActivity: jest.fn(),
  };

  const mockSecurityService = {
    recordFailedLoginAttempt: jest.fn(),
    checkSuspiciousActivity: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    securityService = module.get<SecurityService>(SecurityService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, password, ip, userAgent);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      mockUsersService.findUserByEmail.mockResolvedValue(null);
      mockSecurityService.recordFailedLoginAttempt.mockResolvedValue(undefined);

      await expect(service.validateUser(email, password, ip, userAgent))
        .rejects.toThrow('Invalid credentials');

      expect(mockSecurityService.recordFailedLoginAttempt).toHaveBeenCalledWith(email, ip, userAgent);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      const lockedUser = { ...mockUser, lockUntil: new Date(Date.now() + 60000) };
      mockUsersService.findUserByEmail.mockResolvedValue(lockedUser);

      await expect(service.validateUser(email, password, ip, userAgent))
        .rejects.toThrow('Account is temporarily locked');
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      mockUsersService.findUserByEmail.mockResolvedValue(inactiveUser);

      await expect(service.validateUser(email, password, ip, userAgent))
        .rejects.toThrow('Account is not active');
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      mockSecurityService.recordFailedLoginAttempt.mockResolvedValue(undefined);
      mockUsersService.logUserActivity.mockResolvedValue(undefined);

      await expect(service.validateUser(email, password, ip, userAgent))
        .rejects.toThrow('Invalid credentials');

      expect(mockSecurityService.recordFailedLoginAttempt).toHaveBeenCalledWith(email, ip, userAgent);
      expect(mockUsersService.logUserActivity).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login user and return tokens', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      const mockAccessToken = 'access-token';
      const mockRefreshToken = 'refresh-token';

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      mockSecurityService.checkSuspiciousActivity.mockResolvedValue(undefined);
      mockJwtService.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.login(email, password, ip, userAgent);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(result).toHaveProperty('expiresIn', 24 * 60 * 60);
      expect(mockSecurityService.checkSuspiciousActivity).toHaveBeenCalledWith(mockUser, ip, userAgent);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      const mockPayload = {
        userId: mockUser._id,
        sessionId: 'session-123',
      };

      const mockNewAccessToken = 'new-access-token';
      const mockNewRefreshToken = 'new-refresh-token';

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersService.findUserById.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce(mockNewAccessToken)
        .mockReturnValueOnce(mockNewRefreshToken);

      const result = await service.refreshToken(refreshToken, ip, userAgent);

      expect(result).toHaveProperty('accessToken', mockNewAccessToken);
      expect(result).toHaveProperty('refreshToken', mockNewRefreshToken);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      const ip = '127.0.0.1';
      const userAgent = 'test-agent';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken, ip, userAgent))
        .rejects.toThrow('Invalid refresh token');
    });
  });

  describe('validateToken', () => {
    it('should validate valid token', async () => {
      const token = 'valid-token';
      const mockPayload = {
        userId: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: undefined,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken(token);

      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token))
        .rejects.toThrow('Invalid token');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user without password', async () => {
      const userId = mockUser._id;
      const { password, ...userWithoutPassword } = mockUser;

      mockUsersService.findUserById.mockResolvedValue(mockUser as User);

      const result = await service.getCurrentUser(userId);

      expect(result).toEqual(userWithoutPassword);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('testModeLogin', () => {
    it('should create test user and return tokens', async () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const role = 'admin';

      const mockAccessToken = 'access-token';
      const mockRefreshToken = 'refresh-token';

      mockUsersService.findUserByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue(mockUser as User);
      mockJwtService.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.testModeLogin(userId, email, role);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email,
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company',
        role,
      });
    });

    it('should throw error in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(service.testModeLogin('id', 'email', 'role'))
          .rejects.toThrow('Test mode login not available in production');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
