import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';

export interface SessionModel extends Model<SessionDocument> {
  findActiveByUser(userId: Types.ObjectId, tenantId: Types.ObjectId): Promise<SessionDocument[]>;
  findByDeviceFingerprint(fingerprint: string, tenantId: Types.ObjectId): Promise<SessionDocument[]>;
  findByIpAddress(ipAddress: string, tenantId: Types.ObjectId): Promise<SessionDocument[]>;
  cleanupExpired(): Promise<any>;
  getStatistics(tenantId: Types.ObjectId): Promise<any[]>;
}

export type SessionDocument = Session & Document & {
  duration: number;
  age: number;
  status: string;
  updateActivity(ipAddress: string, userAgent: string): Promise<SessionDocument>;
  terminate(terminatedBy: Types.ObjectId, reason: string): Promise<SessionDocument>;
  addSecurityFlag(flag: string): Promise<SessionDocument>;
  removeSecurityFlag(flag: string): Promise<SessionDocument>;
};

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionToken: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ type: Object })
  deviceInfo: {
    deviceType: string;
    browser: string;
    os: string;
    screenResolution: string;
    timezone: string;
    language: string;
    fingerprint: string;
  };

  @Prop({ type: Object })
  location: {
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  lastActivity: Date;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  terminatedBy?: Types.ObjectId;

  @Prop()
  terminatedAt?: Date;

  @Prop()
  terminationReason?: string;

  @Prop({ type: [String], default: [] })
  securityFlags: string[];

  @Prop({ type: [Object], default: [] })
  activityLog: Array<{
    action: string;
    resource: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    outcome: string;
    details: Record<string, any>;
  }>;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Indexes for performance
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ sessionToken: 1 }, { unique: true });
SessionSchema.index({ tenantId: 1, isActive: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ lastActivity: 1 });
SessionSchema.index({ ipAddress: 1 });
SessionSchema.index({ 'deviceInfo.fingerprint': 1 });

// Compound indexes for queries
SessionSchema.index({ userId: 1, tenantId: 1, isActive: 1 });
SessionSchema.index({ tenantId: 1, createdAt: -1 });
SessionSchema.index({ userId: 1, lastActivity: -1 });

// Virtual for session duration
SessionSchema.virtual('duration').get(function() {
  return this.terminatedAt ? 
    this.terminatedAt.getTime() - this.createdAt.getTime() : 
    Date.now() - this.createdAt.getTime();
});

// Virtual for session age
SessionSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for session status
SessionSchema.virtual('status').get(function() {
  if (!this.isActive) return 'terminated';
  if (this.expiresAt < new Date()) return 'expired';
  return 'active';
});

// Method to update activity
SessionSchema.methods.updateActivity = function(ipAddress: string, userAgent: string) {
  this.lastActivity = new Date();
  this.ipAddress = ipAddress;
  this.userAgent = userAgent;
  
  this.activityLog.push({
    action: 'activity_update',
    resource: 'session',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    outcome: 'success',
    details: { type: 'activity_update' },
  });
  
  return this.save();
};

// Method to terminate session
SessionSchema.methods.terminate = function(terminatedBy: Types.ObjectId, reason: string) {
  this.isActive = false;
  this.terminatedBy = terminatedBy;
  this.terminatedAt = new Date();
  this.terminationReason = reason;
  
  this.activityLog.push({
    action: 'session_terminated',
    resource: 'session',
    timestamp: new Date(),
    ipAddress: this.ipAddress,
    userAgent: this.userAgent,
    outcome: 'success',
    details: { reason, terminatedBy: terminatedBy.toString() },
  });
  
  return this.save();
};

// Text search index for security analysis
SessionSchema.index({
  ipAddress: 'text',
  userAgent: 'text',
  'deviceInfo.browser': 'text',
  'deviceInfo.os': 'text',
  terminationReason: 'text',
});

// Virtual for session duration
SessionSchema.virtual('duration').get(function() {
  return this.lastActivity.getTime() - this.createdAt.getTime();
});

// Virtual for session age
SessionSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for session status
SessionSchema.virtual('status').get(function() {
  if (!this.isActive) return 'terminated';
  if (this.expiresAt < new Date()) return 'expired';
  if (this.lastActivity < new Date(Date.now() - 30 * 60 * 1000)) return 'idle';
  return 'active';
});

// Pre-save middleware for security validation
SessionSchema.pre('save', function(next) {
  // Validate session token format
  if (!this.sessionToken || this.sessionToken.length < 32) {
    return next(new Error('Invalid session token format'));
  }

  // Validate IP address format
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(this.ipAddress)) {
    return next(new Error('Invalid IP address format'));
  }

  // Set expiration if not provided
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }

  next();
});

// Pre-save middleware for activity logging
SessionSchema.pre('save', function(next) {
  if (this.isModified('lastActivity')) {
    this.activityLog.push({
      action: 'session_activity',
      resource: 'session',
      timestamp: new Date(),
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      outcome: 'success',
      details: { activityType: 'update' },
    });
  }
  next();
});

// Method to update last activity
SessionSchema.methods.updateActivity = function(ipAddress?: string, userAgent?: string) {
  this.lastActivity = new Date();
  if (ipAddress) this.ipAddress = ipAddress;
  if (userAgent) this.userAgent = userAgent;
  
  this.activityLog.push({
    action: 'session_activity',
    resource: 'session',
    timestamp: new Date(),
    ipAddress: this.ipAddress,
    userAgent: this.userAgent,
    outcome: 'success',
    details: { activityType: 'activity_update' },
  });
  
  return this.save();
};

// Method to terminate session
SessionSchema.methods.terminate = function(terminatedBy: Types.ObjectId, reason: string) {
  this.isActive = false;
  this.terminatedBy = terminatedBy;
  this.terminatedAt = new Date();
  this.terminationReason = reason;
  
  this.activityLog.push({
    action: 'session_termination',
    resource: 'session',
    timestamp: new Date(),
    ipAddress: this.ipAddress,
    userAgent: this.userAgent,
    outcome: 'success',
    details: { reason, terminatedBy: terminatedBy.toString() },
  });
  
  return this.save();
};

// Method to add security flag
SessionSchema.methods.addSecurityFlag = function(flag: string) {
  if (!this.securityFlags.includes(flag)) {
    this.securityFlags.push(flag);
  }
  return this.save();
};

// Method to remove security flag
SessionSchema.methods.removeSecurityFlag = function(flag: string) {
  this.securityFlags = this.securityFlags.filter(f => f !== flag);
  return this.save();
};

// Static method to find active sessions for user
SessionSchema.statics.findActiveByUser = function(userId: Types.ObjectId, tenantId: Types.ObjectId) {
  return this.find({
    userId,
    tenantId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ lastActivity: -1 });
};

// Static method to find sessions by device fingerprint
SessionSchema.statics.findByDeviceFingerprint = function(fingerprint: string, tenantId: Types.ObjectId) {
  return this.find({
    'deviceInfo.fingerprint': fingerprint,
    tenantId,
    isActive: true,
  }).sort({ lastActivity: -1 });
};

// Static method to find sessions by IP address
SessionSchema.statics.findByIpAddress = function(ipAddress: string, tenantId: Types.ObjectId) {
  return this.find({
    ipAddress,
    tenantId,
    isActive: true,
  }).sort({ lastActivity: -1 });
};

// Static method to cleanup expired sessions
SessionSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isActive: true,
    },
    {
      $set: {
        isActive: false,
        terminatedAt: new Date(),
        terminationReason: 'expired',
      },
    }
  );
};

// Static method to get session statistics
SessionSchema.statics.getStatistics = function(tenantId: Types.ObjectId) {
  return this.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isActive', true] }, { $gt: ['$expiresAt', new Date()] }] },
              1,
              0,
            ],
          },
        },
        expiredSessions: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isActive', true] }, { $lte: ['$expiresAt', new Date()] }] },
              1,
              0,
            ],
          },
        },
        terminatedSessions: {
          $sum: {
            $cond: [{ $eq: ['$isActive', false] }, 1, 0],
          },
        },
        avgSessionDuration: { $avg: '$duration' },
        avgSessionAge: { $avg: '$age' },
      },
    },
  ]);
}; 