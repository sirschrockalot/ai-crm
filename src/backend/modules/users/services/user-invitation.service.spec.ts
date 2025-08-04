import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { UserInvitationService } from './user-invitation.service';
import { UserInvitation, UserInvitationDocument, InvitationStatus } from '../schemas/user-invitation.schema';
import { User, UserDocument, UserStatus } from '../schemas/user.schema';
import { UserActivity, UserActivityDocument } from '../schemas/user-activity.schema';
import { CreateInvitationDto, AcceptInvitationDto } from '../dto/user-invitation.dto';
import { EmailService } from './email.service';

describe('UserInvitationService', () => {
  let service: UserInvitationService;
  let userInvitationModel: Model<UserInvitationDocument>;
  let userModel: Model<UserDocument>;
  let userActivityModel: Model<UserActivityDocument>;
  let emailService: EmailService;

  const mockUserInvitationModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockUserActivityModel = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailService = {
    sendUserInvitation: jest.fn(),
    sendInvitationAcceptedConfirmation: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInvitationService,
        {
          provide: getModelToken(UserInvitation.name),
          useValue: mockUserInvitationModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(UserActivity.name),
          useValue: mockUserActivityModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: 'ConfigService',
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UserInvitationService>(UserInvitationService);
    userInvitationModel = module.get<Model<UserInvitationDocument>>(
      getModelToken(UserInvitation.name),
    );
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    userActivityModel = module.get<Model<UserActivityDocument>>(getModelToken(UserActivity.name));
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvitation', () => {
    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'admin@example.com',
      firstName: 'Admin',
    };

    const mockInvitation = {
      _id: new Types.ObjectId(),
      email: 'user@example.com',
      token: 'hashed-token',
      invitedBy: mockUser._id,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      roles: ['user'],
      save: jest.fn(),
    };

    const createInvitationDto: CreateInvitationDto = {
      email: 'user@example.com',
      roles: ['user'],
      message: 'Welcome to our platform!',
    };

    it('should create a new invitation successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserInvitationModel.findOne.mockResolvedValue(null);
      mockUserInvitationModel.create.mockReturnValue(mockInvitation);
      mockInvitation.save.mockResolvedValue(mockInvitation);
      mockEmailService.sendUserInvitation.mockResolvedValue(undefined);
      mockUserActivityModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      });

      const result = await service.createInvitation(createInvitationDto, mockUser._id);

      expect(result).toEqual(mockInvitation);
      expect(mockUserInvitationModel.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        token: expect.any(String),
        invitedBy: mockUser._id,
        status: InvitationStatus.PENDING,
        expiresAt: expect.any(Date),
        ipAddress: undefined,
        userAgent: undefined,
        roles: ['user'],
        tenantId: undefined,
        message: 'Welcome to our platform!',
      });
      expect(mockEmailService.sendUserInvitation).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(String),
        'Welcome to our platform!',
      );
    });

    it('should throw error if user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.createInvitation(createInvitationDto, mockUser._id)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw error if pending invitation already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserInvitationModel.findOne.mockResolvedValue(mockInvitation);

      await expect(service.createInvitation(createInvitationDto, mockUser._id)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('acceptInvitation', () => {
    const mockInvitation = {
      _id: new Types.ObjectId(),
      email: 'user@example.com',
      token: 'hashed-token',
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      roles: ['user'],
      save: jest.fn(),
    };

    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      status: UserStatus.ACTIVE,
      roles: ['user'],
      save: jest.fn(),
    };

    const acceptInvitationDto: AcceptInvitationDto = {
      token: 'valid-token',
      firstName: 'John',
      lastName: 'Doe',
      password: 'SecurePassword123!',
    };

    it('should accept invitation and create user successfully', async () => {
      mockUserInvitationModel.findOne.mockResolvedValue(mockInvitation);
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockReturnValue(mockUser);
      mockUser.save.mockResolvedValue(mockUser);
      mockInvitation.save.mockResolvedValue(mockInvitation);
      mockEmailService.sendInvitationAcceptedConfirmation.mockResolvedValue(undefined);
      mockUserActivityModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      });

      const result = await service.acceptInvitation(acceptInvitationDto);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: expect.any(String),
        status: UserStatus.ACTIVE,
        roles: ['user'],
        tenantId: undefined,
      });
      expect(mockInvitation.status).toBe(InvitationStatus.ACCEPTED);
      expect(mockInvitation.acceptedAt).toBeDefined();
    });

    it('should throw error for invalid token', async () => {
      mockUserInvitationModel.findOne.mockResolvedValue(null);

      await expect(service.acceptInvitation(acceptInvitationDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user already exists', async () => {
      mockUserInvitationModel.findOne.mockResolvedValue(mockInvitation);
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.acceptInvitation(acceptInvitationDto)).rejects.toThrow(ConflictException);
    });

    it('should throw error for weak password', async () => {
      const weakPasswordDto = { ...acceptInvitationDto, password: 'weak' };

      await expect(service.acceptInvitation(weakPasswordDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getInvitationByToken', () => {
    it('should return invitation for valid token', async () => {
      const mockInvitation = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockUserInvitationModel.findOne.mockResolvedValue(mockInvitation);

      const result = await service.getInvitationByToken('valid-token');

      expect(result).toEqual(mockInvitation);
    });

    it('should return null for invalid token', async () => {
      mockUserInvitationModel.findOne.mockResolvedValue(null);

      const result = await service.getInvitationByToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('getInvitations', () => {
    const mockInvitations = [
      {
        _id: new Types.ObjectId(),
        email: 'user1@example.com',
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        _id: new Types.ObjectId(),
        email: 'user2@example.com',
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    ];

    it('should return invitations with pagination', async () => {
      const mockFindQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockInvitations),
      };

      mockUserInvitationModel.find.mockReturnValue(mockFindQuery);
      mockUserInvitationModel.countDocuments.mockResolvedValue(2);

      const result = await service.getInvitations({}, 1, 20);

      expect(result.invitations).toEqual(mockInvitations);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply filters correctly', async () => {
      const mockFindQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };

      mockUserInvitationModel.find.mockReturnValue(mockFindQuery);
      mockUserInvitationModel.countDocuments.mockResolvedValue(0);

      await service.getInvitations({ status: InvitationStatus.PENDING, email: 'test' }, 1, 20);

      expect(mockUserInvitationModel.find).toHaveBeenCalledWith({
        status: InvitationStatus.PENDING,
        email: { $regex: 'test', $options: 'i' },
      });
    });
  });

  describe('getInvitationStats', () => {
    it('should return invitation statistics', async () => {
      mockUserInvitationModel.countDocuments
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(15) // pending
        .mockResolvedValueOnce(80) // accepted
        .mockResolvedValueOnce(5) // expired
        .mockResolvedValueOnce(0); // cancelled

      const result = await service.getInvitationStats();

      expect(result).toEqual({
        total: 100,
        pending: 15,
        accepted: 80,
        expired: 5,
        cancelled: 0,
      });
    });
  });

  describe('cancelInvitation', () => {
    const mockInvitation = {
      _id: new Types.ObjectId(),
      email: 'user@example.com',
      status: InvitationStatus.PENDING,
      save: jest.fn(),
    };

    it('should cancel invitation successfully', async () => {
      mockUserInvitationModel.findById.mockResolvedValue(mockInvitation);
      mockInvitation.save.mockResolvedValue(mockInvitation);
      mockUserActivityModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      });

      await service.cancelInvitation(mockInvitation._id, new Types.ObjectId(), 'Test reason');

      expect(mockInvitation.status).toBe(InvitationStatus.CANCELLED);
      expect(mockInvitation.save).toHaveBeenCalled();
    });

    it('should throw error if invitation not found', async () => {
      mockUserInvitationModel.findById.mockResolvedValue(null);

      await expect(service.cancelInvitation(new Types.ObjectId(), new Types.ObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if invitation is not pending', async () => {
      const nonPendingInvitation = { ...mockInvitation, status: InvitationStatus.ACCEPTED };
      mockUserInvitationModel.findById.mockResolvedValue(nonPendingInvitation);

      await expect(service.cancelInvitation(mockInvitation._id, new Types.ObjectId())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resendInvitation', () => {
    const mockInvitation = {
      _id: new Types.ObjectId(),
      email: 'user@example.com',
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      save: jest.fn(),
    };

    it('should resend invitation successfully', async () => {
      mockUserInvitationModel.findById.mockResolvedValue(mockInvitation);
      mockInvitation.save.mockResolvedValue(mockInvitation);
      mockEmailService.sendUserInvitation.mockResolvedValue(undefined);
      mockUserActivityModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      });

      await service.resendInvitation(mockInvitation._id, new Types.ObjectId());

      expect(mockInvitation.token).toBeDefined();
      expect(mockInvitation.expiresAt).toBeDefined();
      expect(mockInvitation.save).toHaveBeenCalled();
      expect(mockEmailService.sendUserInvitation).toHaveBeenCalled();
    });

    it('should throw error if invitation not found', async () => {
      mockUserInvitationModel.findById.mockResolvedValue(null);

      await expect(service.resendInvitation(new Types.ObjectId(), new Types.ObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if invitation is not pending', async () => {
      const nonPendingInvitation = { ...mockInvitation, status: InvitationStatus.ACCEPTED };
      mockUserInvitationModel.findById.mockResolvedValue(nonPendingInvitation);

      await expect(service.resendInvitation(mockInvitation._id, new Types.ObjectId())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cleanupExpiredInvitations', () => {
    it('should clean up expired invitations', async () => {
      mockUserInvitationModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

      await service.cleanupExpiredInvitations();

      expect(mockUserInvitationModel.updateMany).toHaveBeenCalledWith(
        {
          status: InvitationStatus.PENDING,
          expiresAt: { $lt: expect.any(Date) },
        },
        {
          status: InvitationStatus.EXPIRED,
        },
      );
    });
  });
}); 