import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException } from '@nestjs/common';

import { UsersService } from './users.service';
import { User, UserStatus, UserRole } from './schemas/user.schema';
import { UserActivity, ActivityType, ActivitySeverity } from './schemas/user-activity.schema';
import { EmailService } from './services/email.service';
import { UserValidationService } from './services/user-validation.service';
import { CreateUserDto } from './dto/user.dto';
import { UserStatusHistory } from './schemas/user-status-history.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;
  let userActivityModel: any;
  let userStatusHistoryModel: any;
  let emailService: EmailService;
  let userValidationService: UserValidationService;

  const mockUserModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    save: jest.fn(),
  };

  const mockUserActivityModel = {
    save: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockUserStatusHistoryModel = {
    save: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn(),
    sendAccountStatusNotification: jest.fn(),
  };

  const mockUserValidationService = {
    validateCreateUser: jest.fn(),
    validateUpdateUser: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(UserActivity.name),
          useValue: mockUserActivityModel,
        },
        {
          provide: getModelToken(UserStatusHistory.name),
          useValue: mockUserStatusHistoryModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: UserValidationService,
          useValue: mockUserValidationService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
    userActivityModel = module.get(getModelToken(UserActivity.name));
    userStatusHistoryModel = module.get(getModelToken(UserStatusHistory.name));
    emailService = module.get<EmailService>(EmailService);
    userValidationService = module.get<UserValidationService>(UserValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        _id: 'user123',
        ...createUserDto,
        status: UserStatus.PENDING,
        role: UserRole.USER,
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          ...createUserDto,
          status: UserStatus.PENDING,
          role: UserRole.USER,
        }),
      };

      mockUserValidationService.validateCreateUser.mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.save = jest.fn().mockResolvedValue(mockUser);
      mockUserActivityModel.save.mockResolvedValue({});
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserValidationService.validateCreateUser).toHaveBeenCalledWith(createUserDto);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith('test@example.com', 'John');
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserValidationService.validateCreateUser.mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue({ email: 'test@example.com' });

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should find user by ID successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById('user123');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('user123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findOrCreateFromOAuth', () => {
    it('should find existing user by Google ID', async () => {
      const googleUser = {
        id: 'google123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/picture.jpg',
      };

      const mockUser = {
        _id: 'user123',
        googleId: 'google123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        status: UserStatus.ACTIVE,
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          googleId: 'google123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
          status: UserStatus.ACTIVE,
        }),
      };

      mockUserModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) }) // findByGoogleId
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) }); // findByEmail

      mockUserActivityModel.save.mockResolvedValue({});

      const result = await service.findOrCreateFromOAuth(googleUser);

      expect(result).toEqual(mockUser);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      const googleUser = {
        id: 'google123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/picture.jpg',
      };

      const mockUser = {
        _id: 'user123',
        googleId: 'google123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        status: UserStatus.ACTIVE,
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          googleId: 'google123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
          status: UserStatus.ACTIVE,
        }),
      };

      mockUserModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) }) // findByGoogleId
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) }); // findByEmail

      mockUserValidationService.validateCreateUser.mockResolvedValue(undefined);
      mockUserModel.save = jest.fn().mockResolvedValue(mockUser);
      mockUserActivityModel.save.mockResolvedValue({});
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.findOrCreateFromOAuth(googleUser);

      expect(result).toEqual(mockUser);
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const updatedUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        lastActiveAt: new Date(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      mockUserValidationService.validateUpdateUser.mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });
      mockUserActivityModel.save.mockResolvedValue({});

      const result = await service.updateUser('user123', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { ...updateUserDto, lastActiveAt: expect.any(Date) },
        { new: true }
      );
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
      };

      const updatedUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.SUSPENDED,
        lastActiveAt: new Date(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });
      mockUserActivityModel.save.mockResolvedValue({});
      mockUserStatusHistoryModel.save.mockResolvedValue({});

      const result = await service.updateUserStatus('user123', UserStatus.SUSPENDED, 'Violation of terms');

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { status: UserStatus.SUSPENDED, lastActiveAt: expect.any(Date) },
        { new: true }
      );
    });

    it('should send status change notification email', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        status: UserStatus.ACTIVE,
      };

      const updatedUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.SUSPENDED,
        lastActiveAt: new Date(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });
      mockUserActivityModel.save.mockResolvedValue({});
      mockUserStatusHistoryModel.save.mockResolvedValue({});

      await service.updateUserStatus('user123', UserStatus.SUSPENDED, 'Violation of terms');

      expect(mockEmailService.sendAccountStatusNotification).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        UserStatus.SUSPENDED,
        'Violation of terms'
      );
    });

    it('should record status history', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
        tenantId: 'tenant123',
      };

      const updatedUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.SUSPENDED,
        lastActiveAt: new Date(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });
      mockUserActivityModel.save.mockResolvedValue({});
      mockUserStatusHistoryModel.save.mockResolvedValue({});

      await service.updateUserStatus('user123', UserStatus.SUSPENDED, 'Violation of terms', 'admin123');

      expect(mockUserStatusHistoryModel.save).toHaveBeenCalled();
    });

    it('should throw error for invalid status transition', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.INACTIVE,
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      await expect(
        service.updateUserStatus('user123', UserStatus.PENDING, 'Invalid transition')
      ).rejects.toThrow('Invalid status transition from inactive to pending');
    });

    it('should handle email notification failure gracefully', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        status: UserStatus.ACTIVE,
      };

      const updatedUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.SUSPENDED,
        lastActiveAt: new Date(),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });
      mockUserActivityModel.save.mockResolvedValue({});
      mockUserStatusHistoryModel.save.mockResolvedValue({});
      mockEmailService.sendAccountStatusNotification.mockRejectedValue(new Error('Email service error'));

      // Should not throw error even if email fails
      const result = await service.updateUserStatus('user123', UserStatus.SUSPENDED, 'Violation of terms');
      expect(result).toEqual(updatedUser);
    });
  });

  describe('getUserStatusHistory', () => {
    it('should get user status history successfully', async () => {
      const mockHistory = [
        {
          _id: 'history1',
          oldStatus: UserStatus.ACTIVE,
          newStatus: UserStatus.SUSPENDED,
          reason: 'VIOLATION',
          reasonDetails: 'Violation of terms',
          changedAt: new Date(),
        },
        {
          _id: 'history2',
          oldStatus: UserStatus.PENDING,
          newStatus: UserStatus.ACTIVE,
          reason: 'ADMIN_ACTION',
          reasonDetails: 'Account approved',
          changedAt: new Date(),
        },
      ];

      mockUserStatusHistoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockHistory),
              }),
            }),
          }),
        }),
      });

      mockUserStatusHistoryModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.getUserStatusHistory('user123', 1, 20);

      expect(result.history).toEqual(mockHistory);
      expect(result.total).toBe(2);
    });
  });

  describe('searchUserActivity', () => {
    it('should search user activities with filters successfully', async () => {
      const searchDto = {
        userId: 'user123',
        type: ActivityType.LOGIN,
        severity: ActivitySeverity.LOW,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        search: 'login',
        page: 1,
        limit: 20,
        sortBy: 'performedAt',
        sortOrder: 'desc' as const,
      };

      const mockActivities = [
        {
          _id: 'activity1',
          type: ActivityType.LOGIN,
          description: 'User logged in',
          severity: ActivitySeverity.LOW,
          performedAt: new Date(),
        },
      ];

      mockUserActivityModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockActivities),
              }),
            }),
          }),
        }),
      });

      mockUserActivityModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.searchUserActivity(searchDto);

      expect(result.activities).toEqual(mockActivities);
      expect(result.total).toBe(1);
    });
  });

  describe('cleanupOldActivityLogs', () => {
    it('should clean up old activity logs successfully', async () => {
      const retentionDays = 90;
      const mockResult = { deletedCount: 50 };

      mockUserActivityModel.deleteMany.mockResolvedValue(mockResult);

      const result = await service.cleanupOldActivityLogs(retentionDays);

      expect(result).toEqual(mockResult);
      expect(mockUserActivityModel.deleteMany).toHaveBeenCalledWith({
        performedAt: { $lt: expect.any(Date) },
        severity: { $ne: ActivitySeverity.CRITICAL },
      });
    });
  });

  describe('cleanupOldStatusHistory', () => {
    it('should clean up old status history successfully', async () => {
      const retentionDays = 365;
      const mockResult = { deletedCount: 10 };

      mockUserStatusHistoryModel.deleteMany.mockResolvedValue(mockResult);

      const result = await service.cleanupOldStatusHistory(retentionDays);

      expect(result).toEqual(mockResult);
      expect(mockUserStatusHistoryModel.deleteMany).toHaveBeenCalledWith({
        changedAt: { $lt: expect.any(Date) },
      });
    });
  });

  describe('getActivityStatistics', () => {
    it('should get activity statistics successfully', async () => {
      const tenantId = 'tenant123';
      const days = 30;

      const mockTotal = 100;
      const mockActivitiesByType = [
        { _id: ActivityType.LOGIN, count: 50 },
        { _id: ActivityType.PROFILE_UPDATE, count: 30 },
      ];
      const mockActivitiesBySeverity = [
        { _id: ActivitySeverity.LOW, count: 80 },
        { _id: ActivitySeverity.MEDIUM, count: 20 },
      ];
      const mockRecentTrend = [
        { _id: '2024-01-01', count: 10 },
        { _id: '2024-01-02', count: 15 },
      ];

      mockUserActivityModel.countDocuments.mockResolvedValue(mockTotal);
      mockUserActivityModel.aggregate.mockResolvedValueOnce(mockActivitiesByType);
      mockUserActivityModel.aggregate.mockResolvedValueOnce(mockActivitiesBySeverity);
      mockUserActivityModel.aggregate.mockResolvedValueOnce(mockRecentTrend);

      const result = await service.getActivityStatistics(tenantId, days);

      expect(result.totalActivities).toBe(100);
      expect(result.activitiesByType).toEqual({
        [ActivityType.LOGIN]: 50,
        [ActivityType.PROFILE_UPDATE]: 30,
      });
      expect(result.activitiesBySeverity).toEqual({
        [ActivitySeverity.LOW]: 80,
        [ActivitySeverity.MEDIUM]: 20,
      });
      expect(result.recentActivityTrend).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
      ]);
    });
  });

  describe('exportActivityLogs', () => {
    it('should export activity logs in JSON format', async () => {
      const userId = 'user123';
      const tenantId = 'tenant123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const format = 'json';

      const mockActivities = [
        {
          _id: 'activity1',
          type: ActivityType.LOGIN,
          description: 'User logged in',
          performedAt: new Date(),
        },
      ];

      mockUserActivityModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockActivities),
            }),
          }),
        }),
      });

      const result = await service.exportActivityLogs(userId, tenantId, startDate, endDate, format);

      expect(result).toBe(JSON.stringify(mockActivities, null, 2));
    });

    it('should export activity logs in CSV format', async () => {
      const userId = 'user123';
      const tenantId = 'tenant123';
      const format = 'csv';

      const mockActivities = [
        {
          performedAt: new Date('2024-01-01'),
          userId: 'user123',
          type: ActivityType.LOGIN,
          description: 'User logged in',
          severity: ActivitySeverity.LOW,
          metadata: { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' },
          context: { module: 'auth', action: 'POST' },
        },
      ];

      mockUserActivityModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockActivities),
            }),
          }),
        }),
      });

      const result = await service.exportActivityLogs(userId, tenantId, undefined, undefined, format);

      expect(result).toContain('Date,User ID,Type,Description,Severity,IP Address,User Agent,Module,Action');
      expect(result).toContain('login');
      expect(result).toContain('User logged in');
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const searchDto = {
        page: 1,
        limit: 10,
        search: 'john',
        status: UserStatus.ACTIVE,
      };

      const mockUsers = [
        { _id: 'user123', email: 'john@example.com', firstName: 'John' },
        { _id: 'user456', email: 'johnny@example.com', firstName: 'Johnny' },
      ];

      mockUserModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      });

      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.searchUsers(searchDto);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
    });
  });

  describe('getUserActivity', () => {
    it('should get user activity successfully', async () => {
      const mockActivities = [
        { _id: 'activity1', type: ActivityType.LOGIN, description: 'User logged in' },
        { _id: 'activity2', type: ActivityType.PROFILE_UPDATE, description: 'Profile updated' },
      ];

      mockUserActivityModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockActivities),
            }),
          }),
        }),
      });

      mockUserActivityModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.getUserActivity('user123', 1, 20);

      expect(result.activities).toEqual(mockActivities);
      expect(result.total).toBe(2);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      const existingUser = {
        _id: 'user123',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingUser),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });
      mockUserActivityModel.save.mockResolvedValue({});

      await service.deleteUser('user123', 'User requested deletion');

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        status: UserStatus.INACTIVE,
        lastActiveAt: expect.any(Date),
      });
    });
  });

  describe('logUserActivity', () => {
    it('should log user activity successfully', async () => {
      const activityData = {
        userId: 'user123',
        type: ActivityType.LOGIN,
        description: 'User logged in',
        severity: ActivitySeverity.LOW,
      };

      const mockActivity = {
        _id: 'activity123',
        ...activityData,
        performedAt: new Date(),
      };

      mockUserActivityModel.save.mockResolvedValue(mockActivity);

      const result = await service.logUserActivity(activityData);

      expect(result).toEqual(mockActivity);
      expect(mockUserActivityModel.save).toHaveBeenCalledWith({
        ...activityData,
        performedAt: expect.any(Date),
      });
    });
  });

  describe('getActiveUsersCount', () => {
    it('should get active users count successfully', async () => {
      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await service.getActiveUsersCount('tenant123');

      expect(result).toBe(5);
      expect(mockUserModel.countDocuments).toHaveBeenCalledWith({
        status: UserStatus.ACTIVE,
        tenantId: 'tenant123',
      });
    });
  });
}); 