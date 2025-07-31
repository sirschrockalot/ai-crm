import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    google_id: 'google123',
    email: 'test@example.com',
    name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    avatar_url: 'https://example.com/avatar.jpg',
    tenant_id: '507f1f77bcf86cd799439012' as any,
    role: 'acquisition_rep',
    is_active: true,
    last_login: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByGoogleId: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            updateLastLogin: jest.fn(),
            validateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthUser', () => {
    it('should create new user if user does not exist', async () => {
      const oauthUser = {
        google_id: 'google123',
        email: 'test@example.com',
        name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      jest.spyOn(usersService, 'findByGoogleId').mockResolvedValue(null);
      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser as any);

      const result = await service.validateOAuthUser(oauthUser);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google123');
      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          google_id: 'google123',
          email: 'test@example.com',
          name: 'Test User',
          first_name: 'Test',
          last_name: 'User',
          avatar_url: 'https://example.com/avatar.jpg',
          role: 'acquisition_rep',
          is_active: true,
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should update existing user if user exists', async () => {
      const oauthUser = {
        google_id: 'google123',
        email: 'test@example.com',
        name: 'Updated User',
        first_name: 'Updated',
        last_name: 'User',
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      jest.spyOn(usersService, 'findByGoogleId').mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, 'updateUser').mockResolvedValue({
        ...mockUser,
        name: 'Updated User',
      } as any);

      const result = await service.validateOAuthUser(oauthUser);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google123');
      expect(usersService.updateUser).toHaveBeenCalledWith('google123', {
        name: 'Updated User',
        first_name: 'Updated',
        last_name: 'User',
        avatar_url: 'https://example.com/new-avatar.jpg',
        last_login: expect.any(Date),
      });
      expect(result.name).toBe('Updated User');
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const mockAccessToken = 'access.token.here';
      const mockRefreshToken = 'refresh.token.here';

      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await service.generateTokens(mockUser as any);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        user: {
          _id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          avatar_url: mockUser.avatar_url,
          role: mockUser.role,
          tenant_id: mockUser.tenant_id,
        },
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockRefreshToken = 'refresh.token.here';
      const mockPayload = { sub: mockUser._id };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(usersService, 'validateUser').mockResolvedValue(mockUser as any);
      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        access_token: 'new.access.token',
        refresh_token: 'new.refresh.token',
        user: mockUser,
      });

      const result = await service.refreshToken(mockRefreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken);
      expect(usersService.validateUser).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual({
        access_token: 'new.access.token',
        refresh_token: 'new.refresh.token',
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid.token')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should update last login time', async () => {
      jest.spyOn(usersService, 'updateLastLogin').mockResolvedValue(undefined);

      await service.logout(mockUser._id);

      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser._id);
    });
  });
}); 