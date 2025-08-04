import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPreferencesDocument = UserPreferences & Document;

@Schema({ timestamps: true })
export class UserPreferences {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({
    type: Object,
    default: {
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
  })
  preferences: {
    emailNotifications: {
      marketing: boolean;
      security: boolean;
      updates: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'never';
    };
    ui: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      timezone: string;
      dateFormat: string;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'team';
      dataSharing: boolean;
      analytics: boolean;
    };
    application: {
      autoRefresh: boolean;
      emailDigest: boolean;
      dashboardLayout: string;
      defaultView: string;
    };
  };

  @Prop({ type: [Object], default: [] })
  changeHistory: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changedAt: Date;
    changedBy?: Types.ObjectId;
  }>;
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

// Indexes for better query performance
UserPreferencesSchema.index({ userId: 1 }, { unique: true });
UserPreferencesSchema.index({ 'preferences.emailNotifications.frequency': 1 });
UserPreferencesSchema.index({ 'preferences.ui.theme': 1 });
UserPreferencesSchema.index({ 'preferences.ui.language': 1 });
UserPreferencesSchema.index({ 'preferences.privacy.profileVisibility': 1 });

// Compound indexes for common queries
UserPreferencesSchema.index({ userId: 1, 'preferences.ui.theme': 1 });
UserPreferencesSchema.index({ userId: 1, 'preferences.emailNotifications.frequency': 1 });

// Ensure virtual fields are serialized
UserPreferencesSchema.set('toJSON', { virtuals: true });
UserPreferencesSchema.set('toObject', { virtuals: true });

// Pre-save middleware to track changes
UserPreferencesSchema.pre('save', function(next) {
  if (this.isModified('preferences')) {
    const changes = this.getChanges();
    if (changes.length > 0) {
      this.changeHistory.push(...changes);
    }
  }
  next();
});

// Method to get changes between old and new preferences
UserPreferencesSchema.methods.getChanges = function(): Array<{
  field: string;
  oldValue: any;
  newValue: any;
  changedAt: Date;
}> {
  const changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changedAt: Date;
  }> = [];

  if (this.isModified('preferences')) {
    const oldPreferences = this.getChanges().preferences?.[0] || {};
    const newPreferences = this.preferences;

    // Compare email notifications
    if (oldPreferences.emailNotifications) {
      Object.keys(newPreferences.emailNotifications).forEach(key => {
        if (oldPreferences.emailNotifications[key] !== newPreferences.emailNotifications[key]) {
          changes.push({
            field: `emailNotifications.${key}`,
            oldValue: oldPreferences.emailNotifications[key],
            newValue: newPreferences.emailNotifications[key],
            changedAt: new Date(),
          });
        }
      });
    }

    // Compare UI preferences
    if (oldPreferences.ui) {
      Object.keys(newPreferences.ui).forEach(key => {
        if (oldPreferences.ui[key] !== newPreferences.ui[key]) {
          changes.push({
            field: `ui.${key}`,
            oldValue: oldPreferences.ui[key],
            newValue: newPreferences.ui[key],
            changedAt: new Date(),
          });
        }
      });
    }

    // Compare privacy settings
    if (oldPreferences.privacy) {
      Object.keys(newPreferences.privacy).forEach(key => {
        if (oldPreferences.privacy[key] !== newPreferences.privacy[key]) {
          changes.push({
            field: `privacy.${key}`,
            oldValue: oldPreferences.privacy[key],
            newValue: newPreferences.privacy[key],
            changedAt: new Date(),
          });
        }
      });
    }

    // Compare application settings
    if (oldPreferences.application) {
      Object.keys(newPreferences.application).forEach(key => {
        if (oldPreferences.application[key] !== newPreferences.application[key]) {
          changes.push({
            field: `application.${key}`,
            oldValue: oldPreferences.application[key],
            newValue: newPreferences.application[key],
            changedAt: new Date(),
          });
        }
      });
    }
  }

  return changes;
}; 