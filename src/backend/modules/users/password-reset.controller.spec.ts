import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';

import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './services/password-reset.service';
import { EmailService } from './services/email.service';
import { PasswordResetToken, PasswordResetTokenDocument } from './schemas/password-reset-token.schema';
import { User, UserDocument } from './schemas/user.schema';

describe('PasswordResetController (e2e)', () => {
  let app: INestApplication;
  let passwordResetService: PasswordResetService;
  let emailService: EmailService;

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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PasswordResetController],
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

    app = moduleFixture.createNestApplication();
    passwordResetService = moduleFixture.get<PasswordResetService>(PasswordResetService);
    emailService = moduleFixture.get<EmailService>(EmailService);

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/forgot-password', () => {
    it('should return success message for valid email', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        firstName: 'John',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockPasswordResetTokenModel.findOne.mockResolvedValue(null);
      mockPasswordResetTokenModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      });
      mockEmailService.sendPasswordReset.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toEqual({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      expect(mockEmailService.sendPasswordReset).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        expect.any(String),
      );
    });

    it('should return success message even for non-existent email', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toEqual({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      expect(mockEmailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 for missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/reset-password', () => {
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

    it('should reset password with valid token and strong password', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValue(mockResetToken);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockResetToken.save.mockResolvedValue(mockResetToken);
      mockEmailService.sendPasswordChangeConfirmation.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'valid-token',
          newPassword: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Password has been successfully reset. You can now log in with your new password.',
      });
      expect(mockEmailService.sendPasswordChangeConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        expect.any(String),
      );
    });

    it('should return 400 for invalid token', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'valid-token',
          newPassword: 'weak',
        })
        .expect(400);
    });

    it('should return 400 for missing token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'valid-token',
        })
        .expect(400);
    });
  });

  describe('POST /auth/validate-reset-token', () => {
    it('should return valid: true for valid token', async () => {
      const mockResetToken = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        token: 'hashed-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usedAt: null,
      };

      mockPasswordResetTokenModel.findOne.mockResolvedValue(mockResetToken);

      const response = await request(app.getHttpServer())
        .post('/auth/validate-reset-token')
        .send({ token: 'valid-token' })
        .expect(200);

      expect(response.body).toEqual({ valid: true });
    });

    it('should return valid: false for invalid token', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/validate-reset-token')
        .send({ token: 'invalid-token' })
        .expect(200);

      expect(response.body).toEqual({ valid: false });
    });

    it('should return 400 for missing token', async () => {
      await request(app.getHttpServer())
        .post('/auth/validate-reset-token')
        .send({})
        .expect(400);
    });
  });
}); 