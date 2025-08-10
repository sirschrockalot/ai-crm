import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationSettingsDocument = NotificationSettings & Document;

@Schema({ timestamps: true })
export class NotificationSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'immediate' },
      types: [{ type: String }],
      digestTime: { type: String, default: '09:00' },
      digestDay: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], default: 'monday' },
    },
    default: {},
  })
  email: {
    enabled: boolean;
    frequency: string;
    types: string[];
    digestTime: string;
    digestDay: string;
  };

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      types: [{ type: String }],
      quietHours: { type: Boolean, default: false },
      quietStart: { type: String, default: '22:00' },
      quietEnd: { type: String, default: '08:00' },
    },
    default: {},
  })
  push: {
    enabled: boolean;
    types: string[];
    quietHours: boolean;
    quietStart: string;
    quietEnd: string;
  };

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      types: [{ type: String }],
      phoneNumber: { type: String, default: '' },
      quietHours: { type: Boolean, default: false },
      quietStart: { type: String, default: '22:00' },
      quietEnd: { type: String, default: '08:00' },
    },
    default: {},
  })
  sms: {
    enabled: boolean;
    types: string[];
    phoneNumber: string;
    quietHours: boolean;
    quietStart: string;
    quietEnd: string;
  };

  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      types: [{ type: String }],
      position: { type: String, enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'], default: 'top-right' },
      duration: { type: Number, default: 5000 },
      sound: { type: Boolean, default: true },
    },
    default: {},
  })
  inApp: {
    enabled: boolean;
    types: string[];
    position: string;
    duration: number;
    sound: boolean;
  };

  @Prop({
    type: [{
      type: { type: String, required: true },
      enabled: { type: Boolean, default: true },
      channels: [{ type: String }],
      priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    }],
    default: [],
  })
  notificationTypes: Array<{
    type: string;
    enabled: boolean;
    channels: string[];
    priority: string;
  }>;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettings);

// Indexes
NotificationSettingsSchema.index({ userId: 1 });
NotificationSettingsSchema.index({ 'email.enabled': 1 });
NotificationSettingsSchema.index({ 'push.enabled': 1 });
NotificationSettingsSchema.index({ 'sms.enabled': 1 });
NotificationSettingsSchema.index({ 'inApp.enabled': 1 });
