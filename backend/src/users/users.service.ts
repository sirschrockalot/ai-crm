import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { ROLE_PERMISSIONS } from '../common/constants/permissions';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(userData: any): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ google_id: googleId }).exec();
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.userModel.findOne({ 
      email: email, 
      tenant_id: new Types.ObjectId(tenantId) 
    }).exec();
  }

  async updateUser(googleId: string, updateData: any): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { google_id: googleId },
      { 
        ...updateData, 
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      last_login: new Date(),
      $inc: { login_count: 1 }
    });
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  // Multi-tenant user management methods
  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.userModel.find({ 
      tenant_id: new Types.ObjectId(tenantId) 
    }).exec();
  }

  async findByIdAndTenant(userId: string, tenantId: string): Promise<User | null> {
    return this.userModel.findOne({
      _id: new Types.ObjectId(userId),
      tenant_id: new Types.ObjectId(tenantId)
    }).exec();
  }

  async createUserInTenant(userData: any, tenantId: string): Promise<User> {
    const user = new this.userModel({
      ...userData,
      tenant_id: new Types.ObjectId(tenantId),
      permissions: ROLE_PERMISSIONS[userData.role] || []
    });
    return user.save();
  }

  async updateUserInTenant(userId: string, tenantId: string, updateData: any): Promise<User | null> {
    const user = await this.findByIdAndTenant(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found in tenant');
    }

    // Update permissions if role is changed
    if (updateData.role && updateData.role !== user.role) {
      updateData.permissions = ROLE_PERMISSIONS[updateData.role] || [];
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { 
        ...updateData, 
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async deactivateUser(userId: string, tenantId: string): Promise<User | null> {
    const user = await this.findByIdAndTenant(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found in tenant');
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { 
        is_active: false, 
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async activateUser(userId: string, tenantId: string): Promise<User | null> {
    const user = await this.findByIdAndTenant(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found in tenant');
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { 
        is_active: true, 
        updated_at: new Date() 
      },
      { new: true }
    ).exec();
  }

  async deleteUser(userId: string, tenantId: string): Promise<void> {
    const user = await this.findByIdAndTenant(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found in tenant');
    }

    await this.userModel.findByIdAndDelete(userId);
  }

  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const user = await this.findByIdAndTenant(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found in tenant');
    }

    return user.permissions;
  }
} 