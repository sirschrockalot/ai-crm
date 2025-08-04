import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { TenantIsolationMiddleware, TenantContext } from './tenant-isolation.middleware';

describe('TenantIsolationMiddleware', () => {
  let middleware: TenantIsolationMiddleware;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantIsolationMiddleware,
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

    middleware = module.get<TenantIsolationMiddleware>(TenantIsolationMiddleware);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('use', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockRequest = {
        headers: {},
        path: '/api/test',
        method: 'GET',
      };
      mockResponse = {
        setHeader: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should extract tenant from JWT token and set headers', async () => {
      const tenantContext: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
        subdomain: 'test',
      };

      mockRequest.headers.authorization = 'Bearer valid-token';
      mockJwtService.verify.mockReturnValue({
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
        subdomain: 'test',
      });

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockRequest.tenant).toEqual(tenantContext);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Tenant-ID', 'tenant-123');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Tenant-Name', 'Test Tenant');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract tenant from subdomain when JWT token is not available', async () => {
      mockRequest.headers.host = 'test.dealcycle.com';

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockRequest.tenant).toEqual({
        tenantId: 'test',
        tenantName: 'test',
        subdomain: 'test',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract tenant from custom headers', async () => {
      mockRequest.headers['x-tenant-id'] = 'tenant-456';
      mockRequest.headers['x-tenant-name'] = 'Custom Tenant';
      mockRequest.headers['x-tenant-subdomain'] = 'custom';

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockRequest.tenant).toEqual({
        tenantId: 'tenant-456',
        tenantName: 'Custom Tenant',
        subdomain: 'custom',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract tenant from query parameters in development mode', async () => {
      mockConfigService.get.mockReturnValue('development');
      mockRequest.query = {
        tenantId: 'dev-tenant',
        tenantName: 'Development Tenant',
        tenantSubdomain: 'dev',
      };

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockRequest.tenant).toEqual({
        tenantId: 'dev-tenant',
        tenantName: 'Development Tenant',
        subdomain: 'dev',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not extract tenant from query parameters in production mode', async () => {
      mockConfigService.get.mockReturnValue('production');
      mockRequest.query = {
        tenantId: 'dev-tenant',
        tenantName: 'Development Tenant',
      };

      await expect(middleware.use(mockRequest, mockResponse, mockNext))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should skip common subdomains', async () => {
      mockRequest.headers.host = 'www.dealcycle.com';

      await expect(middleware.use(mockRequest, mockResponse, mockNext))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when no tenant context is found', async () => {
      await expect(middleware.use(mockRequest, mockResponse, mockNext))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle JWT verification errors gracefully', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(middleware.use(mockRequest, mockResponse, mockNext))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle missing host header', async () => {
      mockRequest.headers.host = undefined;

      await expect(middleware.use(mockRequest, mockResponse, mockNext))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('extractTenantFromToken', () => {
    it('should extract tenant from valid JWT token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockJwtService.verify.mockReturnValue({
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
        subdomain: 'test',
      });

      const result = await (middleware as any).extractTenantFromToken(mockRequest);

      expect(result).toEqual({
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
        subdomain: 'test',
      });
    });

    it('should return null when authorization header is missing', async () => {
      const mockRequest = {
        headers: {},
      };

      const result = await (middleware as any).extractTenantFromToken(mockRequest);

      expect(result).toBeNull();
    });

    it('should return null when authorization header does not start with Bearer', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Invalid valid-token',
        },
      };

      const result = await (middleware as any).extractTenantFromToken(mockRequest);

      expect(result).toBeNull();
    });

    it('should return null when JWT payload does not contain tenant information', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      mockJwtService.verify.mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
      });

      const result = await (middleware as any).extractTenantFromToken(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('extractTenantFromSubdomain', () => {
    it('should extract tenant from valid subdomain', () => {
      const mockRequest = {
        headers: {
          host: 'tenant1.dealcycle.com',
        },
      };

      const result = (middleware as any).extractTenantFromSubdomain(mockRequest);

      expect(result).toEqual({
        tenantId: 'tenant1',
        tenantName: 'tenant1',
        subdomain: 'tenant1',
      });
    });

    it('should skip common subdomains', () => {
      const commonSubdomains = ['www', 'api', 'admin', 'app', 'dev', 'staging', 'prod'];

      commonSubdomains.forEach(subdomain => {
        const mockRequest = {
          headers: {
            host: `${subdomain}.dealcycle.com`,
          },
        };

        const result = (middleware as any).extractTenantFromSubdomain(mockRequest);

        expect(result).toBeNull();
      });
    });

    it('should return null when host header is missing', () => {
      const mockRequest = {
        headers: {},
      };

      const result = (middleware as any).extractTenantFromSubdomain(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('extractTenantFromHeader', () => {
    it('should extract tenant from custom headers', () => {
      const mockRequest = {
        headers: {
          'x-tenant-id': 'tenant-456',
          'x-tenant-name': 'Custom Tenant',
          'x-tenant-subdomain': 'custom',
        },
      };

      const result = (middleware as any).extractTenantFromHeader(mockRequest);

      expect(result).toEqual({
        tenantId: 'tenant-456',
        tenantName: 'Custom Tenant',
        subdomain: 'custom',
      });
    });

    it('should return null when required headers are missing', () => {
      const mockRequest = {
        headers: {
          'x-tenant-id': 'tenant-456',
          // missing x-tenant-name
        },
      };

      const result = (middleware as any).extractTenantFromHeader(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('extractTenantFromQuery', () => {
    it('should extract tenant from query parameters', () => {
      const mockRequest = {
        query: {
          tenantId: 'query-tenant',
          tenantName: 'Query Tenant',
          tenantSubdomain: 'query',
        },
      };

      const result = (middleware as any).extractTenantFromQuery(mockRequest);

      expect(result).toEqual({
        tenantId: 'query-tenant',
        tenantName: 'Query Tenant',
        subdomain: 'query',
      });
    });

    it('should return null when required query parameters are missing', () => {
      const mockRequest = {
        query: {
          tenantId: 'query-tenant',
          // missing tenantName
        },
      };

      const result = (middleware as any).extractTenantFromQuery(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('validateTenantAccess', () => {
    it('should pass validation for valid tenant', async () => {
      const mockRequest = {};
      const tenantContext: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
      };

      // Mock the validation methods to return true
      jest.spyOn(middleware as any, 'validateTenantExists').mockResolvedValue(true);
      jest.spyOn(middleware as any, 'validateUserTenantAccess').mockResolvedValue(true);

      await expect((middleware as any).validateTenantAccess(mockRequest, tenantContext))
        .resolves.toBeUndefined();
    });

    it('should throw ForbiddenException for invalid tenant', async () => {
      const mockRequest = {};
      const tenantContext: TenantContext = {
        tenantId: 'invalid-tenant',
        tenantName: 'Invalid Tenant',
      };

      jest.spyOn(middleware as any, 'validateTenantExists').mockResolvedValue(false);

      await expect((middleware as any).validateTenantAccess(mockRequest, tenantContext))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user does not have tenant access', async () => {
      const mockRequest = {};
      const tenantContext: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
      };

      jest.spyOn(middleware as any, 'validateTenantExists').mockResolvedValue(true);
      jest.spyOn(middleware as any, 'validateUserTenantAccess').mockResolvedValue(false);

      await expect((middleware as any).validateTenantAccess(mockRequest, tenantContext))
        .rejects.toThrow(ForbiddenException);
    });
  });
}); 