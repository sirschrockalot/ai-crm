import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    google_id: 'google123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'acquisition_rep',
    tenant_id: '507f1f77bcf86cd799439012' as any,
    is_active: true,
    permissions: ['leads:read', 'leads:create'],
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    mockUserModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockUser),
    }));
    mockUserModel.find = jest.fn().mockReturnThis();
    mockUserModel.findOne = jest.fn().mockReturnThis();
    mockUserModel.findById = jest.fn().mockReturnThis();
    mockUserModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockUserModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockUserModel.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByTenant', () => {
    it('should return all users for a tenant', async () => {
      const tenantId = '507f1f77bcf86cd799439012';
      const expectedUsers = [mockUser];

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedUsers),
      });

      const result = await service.findAllByTenant(tenantId);

      expect(mockUserModel.find).toHaveBeenCalledWith({
        tenant_id: expect.any(Object),
      });
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findByIdAndTenant', () => {
    it('should return user by id and tenant', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByIdAndTenant(userId, tenantId);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
        tenant_id: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByIdAndTenant(userId, tenantId);

      expect(result).toBeNull();
    });
  });

  describe('createUserInTenant', () => {
    it('should create a new user in tenant', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        role: 'acquisition_rep',
      };
      const tenantId = '507f1f77bcf86cd799439012';

      const mockNewUser = { ...mockUser, ...userData };
      const mockUserInstance = {
        save: jest.fn().mockResolvedValue(mockNewUser),
      };
      mockUserModel.mockReturnValue(mockUserInstance);

      const result = await service.createUserInTenant(userData, tenantId);

      expect(mockUserModel).toHaveBeenCalledWith({
        ...userData,
        tenant_id: expect.any(Object),
        permissions: expect.any(Array),
      });
      expect(result).toEqual(mockNewUser);
    });
  });

  describe('updateUserInTenant', () => {
    it('should update user in tenant', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';
      const updateData = { name: 'Updated User' };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, ...updateData }),
      });

      const result = await service.updateUserInTenant(userId, tenantId, updateData);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        {
          ...updateData,
          updated_at: expect.any(Date),
        },
        { new: true }
      );
      expect(result).toEqual({ ...mockUser, ...updateData });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';
      const updateData = { name: 'Updated User' };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateUserInTenant(userId, tenantId, updateData))
        .rejects.toThrow('User not found in tenant');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, is_active: false }),
      });

      const result = await service.deactivateUser(userId, tenantId);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        {
          is_active: false,
          updated_at: expect.any(Date),
        },
        { new: true }
      );
      expect(result.is_active).toBe(false);
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, is_active: false }),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, is_active: true }),
      });

      const result = await service.activateUser(userId, tenantId);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        {
          is_active: true,
          updated_at: expect.any(Date),
        },
        { new: true }
      );
      expect(result.is_active).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      mockUserModel.findByIdAndDelete.mockResolvedValue(undefined);

      await service.deleteUser(userId, tenantId);

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteUser(userId, tenantId))
        .rejects.toThrow('User not found in tenant');
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tenantId = '507f1f77bcf86cd799439012';
      const expectedPermissions = ['leads:read', 'leads:create'];

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockUser, permissions: expectedPermissions }),
      });

      const result = await service.getUserPermissions(userId, tenantId);

      expect(result).toEqual(expectedPermissions);
    });
  });
}); 