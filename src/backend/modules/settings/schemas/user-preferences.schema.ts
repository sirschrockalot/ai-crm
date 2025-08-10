import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPreferencesDocument = UserPreferences & Document;

@Schema({ timestamps: true })
export class UserPreferences {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ['light', 'dark', 'system'], default: 'system' })
  theme: string;

  @Prop({ type: String, default: 'en-US' })
  language: string;

  @Prop({ type: String, default: 'UTC' })
  timezone: string;

  @Prop({ type: String, enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], default: 'MM/DD/YYYY' })
  dateFormat: string;

  @Prop({ type: String, enum: ['12h', '24h'], default: '12h' })
  timeFormat: string;

  @Prop({
    type: {
      layout: { type: String, enum: ['grid', 'list'], default: 'grid' },
      defaultView: { type: String, default: 'overview' },
      refreshInterval: { type: Number, default: 300 },
      showCharts: { type: Boolean, default: true },
      showMetrics: { type: Boolean, default: true },
      showRecentActivity: { type: Boolean, default: true },
    },
    default: {},
  })
  dashboard: {
    layout: string;
    defaultView: string;
    refreshInterval: number;
    showCharts: boolean;
    showMetrics: boolean;
    showRecentActivity: boolean;
  };

  @Prop({
    type: {
      compactMode: { type: Boolean, default: false },
      showTooltips: { type: Boolean, default: true },
      autoSave: { type: Boolean, default: true },
      confirmActions: { type: Boolean, default: true },
    },
    default: {},
  })
  interface: {
    compactMode: boolean;
    showTooltips: boolean;
    autoSave: boolean;
    confirmActions: boolean;
  };

  @Prop({
    type: {
      emailSignature: { type: String, default: '' },
      defaultEmailTemplate: { type: String, default: '' },
      autoBcc: { type: Boolean, default: false },
      bccEmail: { type: String, default: '' },
    },
    default: {},
  })
  communication: {
    emailSignature: string;
    defaultEmailTemplate: string;
    autoBcc: boolean;
    bccEmail: string;
  };
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

// Indexes
UserPreferencesSchema.index({ userId: 1 });
UserPreferencesSchema.index({ theme: 1 });
UserPreferencesSchema.index({ language: 1 });
UserPreferencesSchema.index({ timezone: 1 });
