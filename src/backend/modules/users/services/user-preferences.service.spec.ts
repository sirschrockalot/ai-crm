import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { UserPreferencesService } from './user-preferences.service';
import { UserPreferences, UserPreferencesDocument } from '../schemas/user-preferences.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { UserActivity, UserActivityDocument } from '../schemas/user-activity.schema';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let userPreferencesModel: Model<UserPreferencesDocument>;
  let userModel: Model<UserDocument>;
  let userActivityModel: Model<UserActivityDocument>;

  const mockUserPreferencesModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  const mockUserActivityModel = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        {
          provide: getModelToken(UserPreferences.name),
          useValue: mockUserPreferencesModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(UserActivity.name),
          useValue: mockUserActivityModel,
        },
      ],
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
    userPreferencesModel = module.get<Model<UserPreferencesDocument>>(
      getModelToken(UserPreferences.name),
    );
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    userActivityModel = module.get<Model<UserActivityDocument>>(getModelToken(UserActivity.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      firstName: 'John',
    };

    const mockPreferences = {
      _id: new Types.ObjectId(),
      userId: mockUser._id,
      preferences: {
        emailNotifications: {
          marketing: true,
          security: true,
          updates: false,
          frequency: 'daily',
        },
        ui: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
        },
        privacy: {
          profileVisibility: 'public',
          dataSharing: false,
          analytics: true,
        },
        application: {
          autoRefresh: true,
          emailDigest: false,
          dashboardLayout: 'default',
          defaultView: 'list',
        },
      },
      changeHistory: [],
    };

    it('should return existing user preferences', async () => {
      mockUserPreferencesModel.findOne.mockResolvedValue(mockPreferences);

      const result = await service.getUserPreferences(mockUser._id);

      expect(result).toEqual(mockPreferences);
      expect(mockUserPreferencesModel.findOne).toHaveBeenCalledWith({ userId: mockUser._id });
    });

    it('should create default preferences if none exist', async () => {
      mockUserPreferencesModel.findOne.mockResolvedValue(null);
      mockUserPreferencesModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(mockPreferences),
      });

      const result = await service.getUserPreferences(mockUser._id);

      expect(result).toEqual(mockPreferences);
      expect(mockUserPreferencesModel.create).toHaveBeenCalledWith({
        userId: mockUser._id,
        preferences: expect.any(Object),
        changeHistory: [],
      });
    });
  });

  describe('updateUserPreferences', () => {
    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      firstName: 'John',
    };

    const mockPreferences = {
      _id: new Types.ObjectId(),
      userId: mockUser._id,
      preferences: {
        emailNotifications: {
          marketing: true,
          security: true,
          updates: false,
          frequency: 'daily',
        },
        ui: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
        },
        privacy: {
          profileVisibility: 'public',
          dataSharing: false,
          analytics: true,
        },
        application: {
          autoRefresh: true,
          emailDigest: false,
          dashboardLayout: 'default',
          defaultView: 'list',
        },
      },
      changeHistory: [],
      save: jest.fn(),
    };

    it('should update user preferences successfully', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserPreferencesModel.findOne.mockResolvedValue(mockPreferences);
      mockPreferences.save.mockResolvedValue(mockPreferences);
      mockUserActivityModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      });

      const updateDto = {
        preferences: {
          ui: {
            theme: 'dark',
          },
        },
      };

      const result = await service.updateUserPreferences(mockUser._id, updateDto, mockUser._id);

      expect(result).toEqual(mockPreferences);
      expect(mockPreferences.preferences.ui.theme).toBe('dark');
      expect(mockPreferences.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const updateDto = {
        preferences: {
          ui: {
            theme: 'dark',
          },
        },
      };

      await expect(service.updateUserPreferences(mockUser._id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for invalid email frequency', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserPreferencesModel.findOne.mockResolvedValue(mockPreferences);

      const updateDto = {
        preferences: {
          emailNotifications: {
            frequency: 'invalid',
          },
        },
      };

      await expect(service.updateUserPreferences(mockUser._id, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid theme', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserPreferencesModel.findOne.mockResolvedValue(mockPreferences);

      const updateDto = {
        preferences: {
          ui: {
            theme: 'invalid',
          },
        },
      };

      await expect(service.updateUserPreferences(mockUser._id, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid profile visibility', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserPreferencesModel.findOne.mockResolvedValue(mockPreferences);

      const updateDto = {
        preferences: {
          privacy: {
            profileVisibility: 'invalid',
          },
        },
      };

      await expect(service.updateUserPreferences(mockUser._id, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetUserPreferences', () => {
    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      firstName: 'John',
    };

    const mockPreferences = {
      _id: new Types.ObjectId(),
      userId: mockUser._id,
      preferences: {
        emailNotifications: {
          marketing: true,
          security: true,
          updates: false,
          frequency: 'daily',
        },
        ui: {
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
        },
        privacy: {
          profileVisibility: 'public',
          dataSharing: false,
          analytics: true,
        },
        application: {
          autoRefresh: true,
          emailDigest: false,
          dashboardLayout: 'default',
          defaultView: 'list',
        },
      },
      changeHistory: [],
      save: jest.fn(),
    };

    it('should reset user preferences to defaults', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserPreferencesModel.findOne.mockResolvedValue(mockPreferences);
      mockPreferences.save.mockResolvedValue(mockPreferences);
      mockUserActivityModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      });

      const result = await service.resetUserPreferences(mockUser._id, mockUser._id);

      expect(result).toEqual(mockPreferences);
      expect(mockPreferences.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.resetUserPreferences(mockUser._id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPreferenceHistory', () => {
    const mockPreferences = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      changeHistory: [
        {
          field: 'ui.theme',
          oldValue: 'light',
          newValue: 'dark',
          changedAt: new Date(),
        },
        {
          field: 'emailNotifications.frequency',
          oldValue: 'daily',
          newValue: 'weekly',
          changedAt: new Date(),
        },
      ],
    };

    it('should return preference change history', async () => {
      mockUserPreferencesModel.findOne.mockResolvedValue(mockPreferences);

      const result = await service.getPreferenceHistory(new Types.ObjectId(), 1, 20);

      expect(result.changes).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should return empty history if no preferences exist', async () => {
      mockUserPreferencesModel.findOne.mockResolvedValue(null);

      const result = await service.getPreferenceHistory(new Types.ObjectId(), 1, 20);

      expect(result.changes).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getUsersByPreference', () => {
    const mockUsers = [
      { _id: new Types.ObjectId(), email: 'user1@example.com' },
      { _id: new Types.ObjectId(), email: 'user2@example.com' },
    ];

    const mockPreferences = [
      { userId: mockUsers[0]._id },
      { userId: mockUsers[1]._id },
    ];

    it('should return users by preference value', async () => {
      mockUserPreferencesModel.find.mockResolvedValue(mockPreferences);
      mockUserModel.find.mockResolvedValue(mockUsers);

      const result = await service.getUsersByPreference('preferences.ui.theme', 'dark');

      expect(result).toEqual(mockUsers);
      expect(mockUserPreferencesModel.find).toHaveBeenCalledWith({
        'preferences.ui.theme': 'dark',
      });
    });

    it('should filter by tenant if provided', async () => {
      const tenantId = new Types.ObjectId();
      mockUserModel.find.mockResolvedValue(mockUsers);
      mockUserPreferencesModel.find.mockResolvedValue(mockPreferences);

      await service.getUsersByPreference('preferences.ui.theme', 'dark', tenantId);

      expect(mockUserModel.find).toHaveBeenCalledWith({ tenantId });
    });
  });
}); 