import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UserPreferences, UserPreferencesDocument } from '../schemas/user-preferences.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { UserActivity, UserActivityDocument, ActivityType, ActivitySeverity } from '../schemas/user-activity.schema';
import { UserPreferencesDto, UpdateUserPreferencesDto } from '../dto/user-preferences.dto';

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);

  constructor(
    @InjectModel(UserPreferences.name) private userPreferencesModel: Model<UserPreferencesDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivityDocument>,
  ) {}

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string | Types.ObjectId): Promise<UserPreferences> {
    let preferences = await this.userPreferencesModel.findOne({ userId }).exec();

    if (!preferences) {
      // Create default preferences if they don't exist
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string | Types.ObjectId,
    updateDto: UpdateUserPreferencesDto,
    performedBy?: Types.ObjectId,
  ): Promise<UserPreferences> {
    // Validate user exists
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get current preferences or create default ones
    let preferences = await this.userPreferencesModel.findOne({ userId }).exec();
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    // Validate the update
    this.validatePreferencesUpdate(updateDto.preferences);

    // Store old preferences for change tracking
    const oldPreferences = JSON.parse(JSON.stringify(preferences.preferences));

    // Update preferences
    preferences.preferences = {
      ...preferences.preferences,
      ...updateDto.preferences,
    };

    // Ensure nested objects are properly merged
    if (updateDto.preferences.emailNotifications) {
      preferences.preferences.emailNotifications = {
        ...preferences.preferences.emailNotifications,
        ...updateDto.preferences.emailNotifications,
      };
    }

    if (updateDto.preferences.ui) {
      preferences.preferences.ui = {
        ...preferences.preferences.ui,
        ...updateDto.preferences.ui,
      };
    }

    if (updateDto.preferences.privacy) {
      preferences.preferences.privacy = {
        ...preferences.preferences.privacy,
        ...updateDto.preferences.privacy,
      };
    }

    if (updateDto.preferences.application) {
      preferences.preferences.application = {
        ...preferences.preferences.application,
        ...updateDto.preferences.application,
      };
    }

    // Save preferences
    const savedPreferences = await preferences.save();

    // Log the changes
    await this.logPreferenceChanges(userId, oldPreferences, savedPreferences.preferences, performedBy);

    this.logger.log(`Preferences updated for user ${userId}`);

    return savedPreferences;
  }

  /**
   * Reset user preferences to defaults
   */
  async resetUserPreferences(
    userId: string | Types.ObjectId,
    performedBy?: Types.ObjectId,
  ): Promise<UserPreferences> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const defaultPreferences = this.getDefaultPreferences();
    const oldPreferences = await this.getUserPreferences(userId);

    // Update to default preferences
    const updatedPreferences = await this.updateUserPreferences(
      userId,
      { preferences: defaultPreferences },
      performedBy,
    );

    // Log the reset
    await this.logUserActivity({
      userId: new Types.ObjectId(userId),
      type: ActivityType.PREFERENCES_RESET,
      description: 'User preferences reset to defaults',
      severity: ActivitySeverity.LOW,
      performedBy,
      metadata: {
        resetBy: performedBy,
      },
    });

    return updatedPreferences;
  }

  /**
   * Get preference change history
   */
  async getPreferenceHistory(
    userId: string | Types.ObjectId,
    page = 1,
    limit = 20,
  ): Promise<{ changes: any[]; total: number }> {
    const preferences = await this.userPreferencesModel.findOne({ userId }).exec();
    if (!preferences) {
      return { changes: [], total: 0 };
    }

    const skip = (page - 1) * limit;
    const changes = preferences.changeHistory
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(skip, skip + limit);

    return {
      changes,
      total: preferences.changeHistory.length,
    };
  }

  /**
   * Get users by preference value
   */
  async getUsersByPreference(
    preferencePath: string,
    value: any,
    tenantId?: Types.ObjectId,
  ): Promise<User[]> {
    const query: any = { [preferencePath]: value };
    if (tenantId) {
      query.userId = { $in: await this.getUserIdsByTenant(tenantId) };
    }

    const preferences = await this.userPreferencesModel.find(query).exec();
    const userIds = preferences.map(p => p.userId);

    return this.userModel.find({ _id: { $in: userIds } }).exec();
  }

  /**
   * Create default preferences for a user
   */
  private async createDefaultPreferences(userId: string | Types.ObjectId): Promise<UserPreferences> {
    const defaultPreferences = this.getDefaultPreferences();

    const preferences = new this.userPreferencesModel({
      userId,
      preferences: defaultPreferences,
      changeHistory: [],
    });

    return preferences.save();
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): UserPreferencesDto['preferences'] {
    return {
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
    };
  }

  /**
   * Validate preferences update
   */
  private validatePreferencesUpdate(preferences: Partial<UserPreferencesDto['preferences']>): void {
    if (preferences.emailNotifications) {
      const { frequency } = preferences.emailNotifications;
      if (frequency && !['daily', 'weekly', 'monthly', 'never'].includes(frequency)) {
        throw new BadRequestException('Invalid email frequency value');
      }
    }

    if (preferences.ui) {
      const { theme } = preferences.ui;
      if (theme && !['light', 'dark', 'auto'].includes(theme)) {
        throw new BadRequestException('Invalid theme value');
      }
    }

    if (preferences.privacy) {
      const { profileVisibility } = preferences.privacy;
      if (profileVisibility && !['public', 'private', 'team'].includes(profileVisibility)) {
        throw new BadRequestException('Invalid profile visibility value');
      }
    }
  }

  /**
   * Log preference changes
   */
  private async logPreferenceChanges(
    userId: string | Types.ObjectId,
    oldPreferences: any,
    newPreferences: any,
    performedBy?: Types.ObjectId,
  ): Promise<void> {
    const changes = this.getChanges(oldPreferences, newPreferences);

    if (changes.length > 0) {
      // Log each change as a separate activity
      for (const change of changes) {
        await this.logUserActivity({
          userId: new Types.ObjectId(userId),
          type: ActivityType.PREFERENCES_UPDATE,
          description: `Preference updated: ${change.field}`,
          severity: ActivitySeverity.LOW,
          performedBy,
          metadata: {
            field: change.field,
            oldValue: change.oldValue,
            newValue: change.newValue,
          },
        });
      }
    }
  }

  /**
   * Get changes between old and new preferences
   */
  private getChanges(oldPreferences: any, newPreferences: any): Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }> {
    const changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }> = [];

    // Compare email notifications
    if (newPreferences.emailNotifications) {
      Object.keys(newPreferences.emailNotifications).forEach(key => {
        if (oldPreferences.emailNotifications?.[key] !== newPreferences.emailNotifications[key]) {
          changes.push({
            field: `emailNotifications.${key}`,
            oldValue: oldPreferences.emailNotifications?.[key],
            newValue: newPreferences.emailNotifications[key],
          });
        }
      });
    }

    // Compare UI preferences
    if (newPreferences.ui) {
      Object.keys(newPreferences.ui).forEach(key => {
        if (oldPreferences.ui?.[key] !== newPreferences.ui[key]) {
          changes.push({
            field: `ui.${key}`,
            oldValue: oldPreferences.ui?.[key],
            newValue: newPreferences.ui[key],
          });
        }
      });
    }

    // Compare privacy settings
    if (newPreferences.privacy) {
      Object.keys(newPreferences.privacy).forEach(key => {
        if (oldPreferences.privacy?.[key] !== newPreferences.privacy[key]) {
          changes.push({
            field: `privacy.${key}`,
            oldValue: oldPreferences.privacy?.[key],
            newValue: newPreferences.privacy[key],
          });
        }
      });
    }

    // Compare application settings
    if (newPreferences.application) {
      Object.keys(newPreferences.application).forEach(key => {
        if (oldPreferences.application?.[key] !== newPreferences.application[key]) {
          changes.push({
            field: `application.${key}`,
            oldValue: oldPreferences.application?.[key],
            newValue: newPreferences.application[key],
          });
        }
      });
    }

    return changes;
  }

  /**
   * Get user IDs by tenant
   */
  private async getUserIdsByTenant(tenantId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const users = await this.userModel.find({ tenantId }).select('_id').exec();
    return users.map(user => user._id);
  }

  /**
   * Log user activity
   */
  private async logUserActivity(activityData: Partial<UserActivity>): Promise<UserActivity> {
    const activity = new this.userActivityModel(activityData);
    return activity.save();
  }
} 