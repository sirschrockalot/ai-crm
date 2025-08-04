import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { PasswordResetService } from './password-reset.service';
import { EmailService } from './email.service';
import { PasswordResetToken, PasswordResetTokenDocument } from '../schemas/password-reset-token.schema';
import { User, UserDocument } from '../schemas/user.schema';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let passwordResetTokenModel: Model<PasswordResetTokenDocument>;
  let userModel: Model<UserDocument>;
  let emailService: EmailService;
  let configService: ConfigService;

  const mockPasswordResetTokenModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    find: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordReset: jest.fn(),
    sendPasswordChangeConfirmation: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: getModelToken(PasswordResetToken.name),
          useValue: mockPasswordResetTokenModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    passwordResetTokenModel = module.get<Model<PasswordResetTokenDocument>>(
      getModelToken(PasswordResetToken.name),
    );
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPasswordResetToken', () => {
    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      firstName: 'John',
    };

    const mockResetToken = {
      _id: new Types.ObjectId(),
      userId: mockUser._id,
      token: 'hashed-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      save: jest.fn(),
    };

    it('should create a password reset token for existing user', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockPasswordResetTokenModel.findOne.mockResolvedValue(null);
      mockPasswordResetTokenModel.create.mockReturnValue(mockResetToken);
      mockResetToken.save.mockResolvedValue(mockResetToken);
      mockEmailService.sendPasswordReset.mockResolvedValue(undefined);

      await service.createPasswordResetToken('test@example.com', '192.168.1.1', 'Mozilla/5.0');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockPasswordResetTokenModel.findOne).toHaveBeenCalledWith({
        userId: mockUser._id,
        expiresAt: { $gt: expect.any(Date) },
        usedAt: { $exists: false },
      });
      expect(mockPasswordResetTokenModel.create).toHaveBeenCalledWith({
        userId: mockUser._id,
        token: expect.any(String),
        expiresAt: expect.any(Date),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
      expect(mockEmailService.sendPasswordReset).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        expect.any(String),
      );
    });

    it('should not create token if user does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await service.createPasswordResetToken('nonexistent@example.com');

      expect(mockPasswordResetTokenModel.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('should not create token if user already has valid token', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockPasswordResetTokenModel.findOne.mockResolvedValue(mockResetToken);

      await service.createPasswordResetToken('test@example.com');

      expect(mockPasswordResetTokenModel.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const mockResetToken = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      token: 'hashed-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      usedAt: null,
      save: jest.fn(),
    };

    const mockUser = {
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      firstName: 'John',
    };

    it('should reset password with valid token', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValue(mockResetToken);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockResetToken.save.mockResolvedValue(mockResetToken);
      mockEmailService.sendPasswordChangeConfirmation.mockResolvedValue(undefined);

      await service.resetPassword('valid-token', 'NewPassword123!', '192.168.1.1');

      expect(mockPasswordResetTokenModel.findOne).toHaveBeenCalledWith({
        token: expect.any(String),
        expiresAt: { $gt: expect.any(Date) },
        usedAt: { $exists: false },
      });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockResetToken.userId,
        { password: expect.any(String) },
      );
      expect(mockResetToken.usedAt).toBeDefined();
      expect(mockEmailService.sendPasswordChangeConfirmation).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        '192.168.1.1',
      );
    });

    it('should throw error for invalid token', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for weak password', async () => {
      await expect(service.resetPassword('valid-token', 'weak')).rejects.toThrow(BadRequestException);
    });

    it('should throw error for password without uppercase', async () => {
      await expect(service.resetPassword('valid-token', 'password123!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for password without lowercase', async () => {
      await expect(service.resetPassword('valid-token', 'PASSWORD123!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for password without number', async () => {
      await expect(service.resetPassword('valid-token', 'Password!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for password without special character', async () => {
      await expect(service.resetPassword('valid-token', 'Password123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateResetToken', () => {
    it('should return true for valid token', async () => {
      const mockResetToken = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        token: 'hashed-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usedAt: null,
      };

      mockPasswordResetTokenModel.findOne.mockResolvedValue(mockResetToken);

      const result = await service.validateResetToken('valid-token');

      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValue(null);

      const result = await service.validateResetToken('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      const mockResult = { deletedCount: 5 };
      mockPasswordResetTokenModel.deleteMany.mockResolvedValue(mockResult);

      await service.cleanupExpiredTokens();

      expect(mockPasswordResetTokenModel.deleteMany).toHaveBeenCalledWith({
        expiresAt: { $lt: expect.any(Date) },
      });
    });
  });

  describe('getUserResetTokens', () => {
    it('should return user reset tokens', async () => {
      const mockTokens = [
        { _id: new Types.ObjectId(), token: 'token1' },
        { _id: new Types.ObjectId(), token: 'token2' },
      ];

      mockPasswordResetTokenModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTokens),
      });

      const result = await service.getUserResetTokens(new Types.ObjectId());

      expect(mockPasswordResetTokenModel.find).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
      expect(result).toEqual(mockTokens);
    });
  });

  describe('invalidateUserTokens', () => {
    it('should invalidate user tokens', async () => {
      const mockResult = { modifiedCount: 3 };
      mockPasswordResetTokenModel.updateMany.mockResolvedValue(mockResult);

      await service.invalidateUserTokens(new Types.ObjectId());

      expect(mockPasswordResetTokenModel.updateMany).toHaveBeenCalledWith(
        { userId: expect.any(Types.ObjectId), usedAt: { $exists: false } },
        { usedAt: expect.any(Date) },
      );
    });
  });
}); 