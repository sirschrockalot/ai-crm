import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';

export interface MFAModel extends Model<MFADocument> {
  findByUser(userId: Types.ObjectId, tenantId: Types.ObjectId): Promise<MFADocument | null>;
  findEnabledByUser(userId: Types.ObjectId, tenantId: Types.ObjectId): Promise<MFADocument | null>;
  getStatistics(tenantId: Types.ObjectId): Promise<any[]>;
  cleanupExpiredLocks(): Promise<any>;
}

export type MFADocument = MFA & Document & {
  status: string;
  remainingBackupCodes: string[];
  enable(): Promise<MFADocument>;
  disable(): Promise<MFADocument>;
  recordFailedAttempt(ipAddress: string, userAgent: string): Promise<MFADocument>;
  verify(ipAddress: string, userAgent: string): Promise<MFADocument>;
  useBackupCode(code: string, ipAddress: string, userAgent: string): Promise<MFADocument>;
  addSecurityFlag(flag: string): Promise<MFADocument>;
  removeSecurityFlag(flag: string): Promise<MFADocument>;
  regenerateBackupCodes(): Promise<MFADocument>;
};

@Schema({ timestamps: true })
export class MFA {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  secret: string; // Encrypted TOTP secret

  @Prop({ required: true, default: false })
  isEnabled: boolean;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ type: [String], default: [] })
  backupCodes: string[]; // Encrypted backup codes

  @Prop({ type: [String], default: [] })
  usedBackupCodes: string[]; // Track used backup codes

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop()
  verifiedAt?: Date;

  @Prop({ required: true, default: Date.now })
  lastUsedAt?: Date;

  @Prop({ required: true, default: 0 })
  failedAttempts: number;

  @Prop()
  lockedUntil?: Date;

  @Prop({ type: [String], default: [] })
  securityFlags: string[];

  @Prop({ type: [Object], default: [] })
  activityLog: Array<{
    action: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    outcome: string;
    details: Record<string, any>;
  }>;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const MFASchema = SchemaFactory.createForClass(MFA);

// Indexes for performance
MFASchema.index({ userId: 1 }, { unique: true });
MFASchema.index({ tenantId: 1 });
MFASchema.index({ isEnabled: 1 });
MFASchema.index({ isVerified: 1 });
MFASchema.index({ createdAt: 1 });

// Compound indexes for queries
MFASchema.index({ userId: 1, tenantId: 1 });
MFASchema.index({ tenantId: 1, isEnabled: 1 });

// Text search index for security analysis
MFASchema.index({
  'activityLog.action': 'text',
  'activityLog.outcome': 'text',
  securityFlags: 'text',
});

// Virtual for MFA status
MFASchema.virtual('status').get(function() {
  if (!this.isEnabled) return 'disabled';
  if (!this.isVerified) return 'pending';
  if (this.lockedUntil && this.lockedUntil > new Date()) return 'locked';
  return 'active';
});

// Virtual for remaining backup codes
MFASchema.virtual('remainingBackupCodes').get(function() {
  return this.backupCodes.filter(code => !this.usedBackupCodes.includes(code));
});

// Pre-save middleware for security validation
MFASchema.pre('save', function(next) {
  // Validate secret format (should be base32 encoded)
  if (this.secret && !/^[A-Z2-7]+=*$/.test(this.secret)) {
    return next(new Error('Invalid TOTP secret format'));
  }

  // Validate backup codes format
  if (this.backupCodes && this.backupCodes.length > 0) {
    for (const code of this.backupCodes) {
      if (!/^[A-Z0-9]{8}$/.test(code)) {
        return next(new Error('Invalid backup code format'));
      }
    }
  }

  // Set verification timestamp if verified
  if (this.isVerified && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }

  next();
});

// Pre-save middleware for activity logging
MFASchema.pre('save', function(next) {
  if (this.isModified('lastUsedAt') || this.isModified('failedAttempts')) {
    this.activityLog.push({
      action: 'mfa_activity',
      timestamp: new Date(),
      ipAddress: 'unknown', // Will be set by service
      userAgent: 'unknown', // Will be set by service
      outcome: 'success',
      details: { activityType: 'update' },
    });
  }
  next();
});

// Method to enable MFA
MFASchema.methods.enable = function() {
  this.isEnabled = true;
  return this.save();
};

// Method to disable MFA
MFASchema.methods.disable = function() {
  this.isEnabled = false;
  this.isVerified = false;
  this.verifiedAt = undefined;
  return this.save();
};

// Method to verify MFA
MFASchema.methods.verify = function(ipAddress?: string, userAgent?: string) {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.lastUsedAt = new Date();
  this.failedAttempts = 0;
  this.lockedUntil = undefined;
  
  this.activityLog.push({
    action: 'mfa_verified',
    timestamp: new Date(),
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown',
    outcome: 'success',
    details: { verificationType: 'totp' },
  });
  
  return this.save();
};

// Method to record failed attempt
MFASchema.methods.recordFailedAttempt = function(ipAddress?: string, userAgent?: string) {
  this.failedAttempts += 1;
  this.lastUsedAt = new Date();
  
  // Lock MFA after 5 failed attempts for 30 minutes
  if (this.failedAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  this.activityLog.push({
    action: 'mfa_failed_attempt',
    timestamp: new Date(),
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown',
    outcome: 'failure',
    details: { 
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil,
    },
  });
  
  return this.save();
};

// Method to use backup code
MFASchema.methods.useBackupCode = function(code: string, ipAddress?: string, userAgent?: string) {
  if (!this.backupCodes.includes(code)) {
    throw new Error('Invalid backup code');
  }
  
  if (this.usedBackupCodes.includes(code)) {
    throw new Error('Backup code already used');
  }
  
  // Move code from backupCodes to usedBackupCodes
  this.backupCodes = this.backupCodes.filter(c => c !== code);
  this.usedBackupCodes.push(code);
  this.lastUsedAt = new Date();
  this.failedAttempts = 0;
  this.lockedUntil = undefined;
  
  this.activityLog.push({
    action: 'mfa_backup_code_used',
    timestamp: new Date(),
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown',
    outcome: 'success',
    details: { 
      backupCode: code.substring(0, 4) + '****',
      remainingCodes: this.backupCodes.length,
    },
  });
  
  return this.save();
};

// Method to regenerate backup codes
MFASchema.methods.regenerateBackupCodes = function() {
  // This would typically generate new backup codes
  // For now, we'll just clear the existing ones
  this.backupCodes = [];
  this.usedBackupCodes = [];
  
  this.activityLog.push({
    action: 'mfa_backup_codes_regenerated',
    timestamp: new Date(),
    ipAddress: 'unknown',
    userAgent: 'unknown',
    outcome: 'success',
    details: { reason: 'regeneration' },
  });
  
  return this.save();
};

// Method to add security flag
MFASchema.methods.addSecurityFlag = function(flag: string) {
  if (!this.securityFlags.includes(flag)) {
    this.securityFlags.push(flag);
  }
  return this.save();
};

// Method to remove security flag
MFASchema.methods.removeSecurityFlag = function(flag: string) {
  this.securityFlags = this.securityFlags.filter(f => f !== flag);
  return this.save();
};

// Method to enable MFA
MFASchema.methods.enable = function() {
  this.isEnabled = true;
  this.activityLog.push({
    action: 'mfa_enabled',
    timestamp: new Date(),
    ipAddress: 'unknown',
    userAgent: 'unknown',
    outcome: 'success',
    details: { reason: 'manual_enable' },
  });
  return this.save();
};

// Method to disable MFA
MFASchema.methods.disable = function() {
  this.isEnabled = false;
  this.activityLog.push({
    action: 'mfa_disabled',
    timestamp: new Date(),
    ipAddress: 'unknown',
    userAgent: 'unknown',
    outcome: 'success',
    details: { reason: 'manual_disable' },
  });
  return this.save();
};

// Method to record failed attempt
MFASchema.methods.recordFailedAttempt = function(ipAddress: string, userAgent: string) {
  this.failedAttempts += 1;
  this.lastUsedAt = new Date();
  
  this.activityLog.push({
    action: 'mfa_failed_attempt',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    outcome: 'failure',
    details: { failedAttempts: this.failedAttempts },
  });
  
  return this.save();
};

// Method to verify MFA
MFASchema.methods.verify = function(ipAddress: string, userAgent: string) {
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.lastUsedAt = new Date();
  this.failedAttempts = 0;
  
  this.activityLog.push({
    action: 'mfa_verified',
    timestamp: new Date(),
    ipAddress,
    userAgent,
    outcome: 'success',
    details: { verificationMethod: 'totp' },
  });
  
  return this.save();
};

// Method to use backup code
MFASchema.methods.useBackupCode = function(code: string, ipAddress: string, userAgent: string) {
  if (this.backupCodes.includes(code) && !this.usedBackupCodes.includes(code)) {
    this.usedBackupCodes.push(code);
    this.lastUsedAt = new Date();
    this.failedAttempts = 0;
    
    this.activityLog.push({
      action: 'mfa_backup_code_used',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      outcome: 'success',
      details: { 
        backupCode: code.substring(0, 4) + '****',
        remainingCodes: this.backupCodes.length - this.usedBackupCodes.length,
      },
    });
    
    return this.save();
  }
  throw new Error('Invalid or already used backup code');
};

// Static method to find MFA by user
MFASchema.statics.findByUser = function(userId: Types.ObjectId, tenantId: Types.ObjectId) {
  return this.findOne({ userId, tenantId });
};

// Static method to find enabled MFA for user
MFASchema.statics.findEnabledByUser = function(userId: Types.ObjectId, tenantId: Types.ObjectId) {
  return this.findOne({ userId, tenantId, isEnabled: true });
};

// Static method to get MFA statistics
MFASchema.statics.getStatistics = function(tenantId: Types.ObjectId) {
  return this.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: null,
        totalMFA: { $sum: 1 },
        enabledMFA: {
          $sum: {
            $cond: [{ $eq: ['$isEnabled', true] }, 1, 0],
          },
        },
        verifiedMFA: {
          $sum: {
            $cond: [{ $eq: ['$isVerified', true] }, 1, 0],
          },
        },
        lockedMFA: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ['$lockedUntil', null] }, { $gt: ['$lockedUntil', new Date()] }] },
              1,
              0,
            ],
          },
        },
        avgFailedAttempts: { $avg: '$failedAttempts' },
      },
    },
  ]);
};

// Static method to cleanup expired locks
MFASchema.statics.cleanupExpiredLocks = function() {
  return this.updateMany(
    {
      lockedUntil: { $lt: new Date() },
    },
    {
      $set: {
        lockedUntil: null,
      },
    }
  );
}; 