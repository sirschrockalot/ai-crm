import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '../../src/users/users.service';
import { User, UserDocument } from '../../src/users/user.schema';
import { Types } from 'mongoose';
import { UpdateProfileDto } from '../../src/common/dto/update-profile.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    google_id: 'google123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    tenant_id: '507f1f77bcf86cd799439012' as any,
    role: 'acquisition_rep',
    permissions: ['read_leads', 'write_leads'],
    is_active: true,
    is_verified: false,
    preferences: {
      theme: 'auto',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      default_view: 'dashboard',
    },
    last_login: new Date(),
    login_count: 5,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: jest.fn(),
    };

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

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = { name: 'New User', email: 'new@example.com' };
      const savedUser = { ...userData, _id: 'newUserId' };
      
      mockUserModel.save.mockResolvedValue(savedUser);

      const result = await service.createUser(userData);
      
      expect(result).toEqual(savedUser);
      expect(mockUserModel.save).toHaveBeenCalled();
    });
  });

  describe('findByGoogleId', () => {
    it('should find user by Google ID', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByGoogleId('google123');
      
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ google_id: 'google123' });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email and tenant ID', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com', 'tenant123');
      
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
        tenant_id: expect.any(Types.ObjectId),
      });
    });
  });

  describe('updateUser', () => {
    it('should update user by Google ID', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };
      
      mockUserModel.findOneAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.updateUser('google123', updateData);
      
      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { google_id: 'google123' },
        { ...updateData, updated_at: expect.any(Date) },
        { new: true }
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login time', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      await service.updateLastLogin('userId');

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('userId', {
        last_login: expect.any(Date),
        $inc: { login_count: 1 },
      });
    });
  });

  describe('validateUser', () => {
    it('should validate user by ID', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser('userId');
      
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('userId');
    });
  });

  describe('findAllByTenant', () => {
    it('should find all users in a tenant', async () => {
      const users = [mockUser];
      mockUserModel.find.mockResolvedValue(users);

      const result = await service.findAllByTenant('tenant123');
      
      expect(result).toEqual(users);
      expect(mockUserModel.find).toHaveBeenCalledWith({
        tenant_id: expect.any(Types.ObjectId),
      });
    });
  });

  describe('findByIdAndTenant', () => {
    it('should find user by ID and tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByIdAndTenant('userId', 'tenant123');
      
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        _id: expect.any(Types.ObjectId),
        tenant_id: expect.any(Types.ObjectId),
      });
    });
  });

  describe('createUserInTenant', () => {
    it('should create user in tenant', async () => {
      const userData = { name: 'New User', email: 'new@example.com' };
      const savedUser = { ...userData, _id: 'newUserId' };
      
      mockUserModel.save.mockResolvedValue(savedUser);

      const result = await service.createUserInTenant(userData, 'tenant123');
      
      expect(result).toEqual(savedUser);
      expect(mockUserModel.save).toHaveBeenCalled();
    });
  });

  describe('updateUserInTenant', () => {
    it('should update user in tenant', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };
      
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.updateUserInTenant('userId', 'tenant123', updateData);
      
      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'userId',
        { ...updateData, updated_at: expect.any(Date) },
        { new: true }
      );
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserInTenant('userId', 'tenant123', { name: 'Updated' })
      ).rejects.toThrow('User not found in tenant');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user in tenant', async () => {
      const deactivatedUser = { ...mockUser, is_active: false };
      
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(deactivatedUser);

      const result = await service.deactivateUser('userId', 'tenant123');
      
      expect(result).toEqual(deactivatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'userId',
        { is_active: false, updated_at: expect.any(Date) },
        { new: true }
      );
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.deactivateUser('userId', 'tenant123')
      ).rejects.toThrow('User not found in tenant');
    });
  });

  describe('activateUser', () => {
    it('should activate user in tenant', async () => {
      const activatedUser = { ...mockUser, is_active: true };
      
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(activatedUser);

      const result = await service.activateUser('userId', 'tenant123');
      
      expect(result).toEqual(activatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'userId',
        { is_active: true, updated_at: expect.any(Date) },
        { new: true }
      );
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.activateUser('userId', 'tenant123')
      ).rejects.toThrow('User not found in tenant');
    });
  });

  describe('deleteUser', () => {
    it('should delete user in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      await service.deleteUser('userId', 'tenant123');
      
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId');
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.deleteUser('userId', 'tenant123')
      ).rejects.toThrow('User not found in tenant');
    });
  });

  describe('getUserPermissions', () => {
    it('should get user permissions', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserPermissions('userId', 'tenant123');
      
      expect(result).toEqual(mockUser.permissions);
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.getUserPermissions('userId', 'tenant123')
      ).rejects.toThrow('User not found in tenant');
    });
  });

  // Profile management tests
  describe('getCurrentUser', () => {
    it('should get current user by ID and tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser('userId', 'tenant123');
      
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        _id: expect.any(Types.ObjectId),
        tenant_id: expect.any(Types.ObjectId),
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const profileData: UpdateProfileDto = {
        name: 'Updated Name',
        phone: '+1987654321',
      };
      const updatedUser = { ...mockUser, ...profileData };
      
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('userId', 'tenant123', profileData);
      
      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'userId',
        { ...profileData, updated_at: expect.any(Date) },
        { new: true }
      );
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('userId', 'tenant123', { name: 'Updated' })
      ).rejects.toThrow('User not found in tenant');
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const preferences = {
        theme: 'dark',
        notifications: {
          email: false,
          sms: true,
          push: true,
        },
      };
      const updatedUser = { 
        ...mockUser, 
        preferences: { ...mockUser.preferences, ...preferences } 
      };
      
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.updatePreferences('userId', 'tenant123', preferences);
      
      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'userId',
        { 
          preferences: { ...mockUser.preferences, ...preferences },
          updated_at: expect.any(Date) 
        },
        { new: true }
      );
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.updatePreferences('userId', 'tenant123', { theme: 'dark' })
      ).rejects.toThrow('User not found in tenant');
    });
  });

  describe('getPreferences', () => {
    it('should get user preferences', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.getPreferences('userId', 'tenant123');
      
      expect(result).toEqual(mockUser.preferences);
    });

    it('should return empty object when user has no preferences', async () => {
      const userWithoutPreferences = { ...mockUser, preferences: undefined };
      mockUserModel.findOne.mockResolvedValue(userWithoutPreferences);

      const result = await service.getPreferences('userId', 'tenant123');
      
      expect(result).toEqual({});
    });

    it('should throw NotFoundException when user not found in tenant', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.getPreferences('userId', 'tenant123')
      ).rejects.toThrow('User not found in tenant');
    });
  });
}); 