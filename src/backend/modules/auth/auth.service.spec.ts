import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

import { AuthService, JwtPayload, GoogleUser } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a JWT token', async () => {
      const payload: JwtPayload = {
        sub: 'user123',
        email: 'test@example.com',
        roles: ['user'],
      };
      const expectedToken = 'mock.jwt.token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.generateToken(payload);

      expect(result).toBe(expectedToken);
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid JWT token', async () => {
      const token = 'valid.jwt.token';
      const expectedPayload: JwtPayload = {
        sub: 'user123',
        email: 'test@example.com',
        roles: ['user'],
      };

      mockJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      const result = await service.validateToken(token);

      expect(result).toEqual(expectedPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid.jwt.token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.validateToken(token)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const authHeader = 'Bearer mock.jwt.token';
      const result = service.extractTokenFromHeader(authHeader);
      expect(result).toBe('mock.jwt.token');
    });

    it('should return undefined for non-Bearer header', () => {
      const authHeader = 'Basic dXNlcjpwYXNz';
      const result = service.extractTokenFromHeader(authHeader);
      expect(result).toBeUndefined();
    });

    it('should return undefined for malformed header', () => {
      const authHeader = 'Bearer';
      const result = service.extractTokenFromHeader(authHeader);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined header', () => {
      const result = service.extractTokenFromHeader(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('handleGoogleOAuthUser', () => {
    it('should create JWT payload from Google user data', async () => {
      const googleUser: GoogleUser = {
        id: 'google123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/picture.jpg',
      };

      const result = await service.handleGoogleOAuthUser(googleUser);

      expect(result).toEqual({
        sub: googleUser.id,
        email: googleUser.email,
        roles: ['user'],
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh a valid token', async () => {
      const oldToken = 'old.jwt.token';
      const newToken = 'new.jwt.token';
      const payload: JwtPayload = {
        sub: 'user123',
        email: 'test@example.com',
        roles: ['user'],
      };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockJwtService.sign.mockReturnValue(newToken);

      const result = await service.refreshToken(oldToken);

      expect(result).toBe(newToken);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(oldToken);
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const token = 'invalid.jwt.token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateGoogleToken', () => {
    it('should throw BadRequestException for unimplemented feature', async () => {
      const accessToken = 'google.access.token';

      await expect(service.validateGoogleToken(accessToken)).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should handle logout successfully', async () => {
      const token = 'jwt.token';

      await expect(service.logout(token)).resolves.toBeUndefined();
    });
  });

  describe('getTokenExpiration', () => {
    it('should return correct expiration for hours', () => {
      mockConfigService.get.mockReturnValue('24h');
      const result = service.getTokenExpiration();
      expect(result).toBe(24 * 60 * 60);
    });

    it('should return correct expiration for minutes', () => {
      mockConfigService.get.mockReturnValue('30m');
      const result = service.getTokenExpiration();
      expect(result).toBe(30 * 60);
    });

    it('should return correct expiration for seconds', () => {
      mockConfigService.get.mockReturnValue('3600s');
      const result = service.getTokenExpiration();
      expect(result).toBe(3600);
    });

    it('should return default expiration for invalid format', () => {
      mockConfigService.get.mockReturnValue('invalid');
      const result = service.getTokenExpiration();
      expect(result).toBe(24 * 60 * 60);
    });

    it('should return default expiration when config is undefined', () => {
      mockConfigService.get.mockReturnValue(undefined);
      const result = service.getTokenExpiration();
      expect(result).toBe(24 * 60 * 60);
    });
  });
}); 