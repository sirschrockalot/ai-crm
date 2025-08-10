import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_VERIFICATION = 'mfa_verification',
  MFA_FAILED = 'mfa_failed',
  
  // Authorization Events
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',
  ROLE_CREATED = 'role_created',
  ROLE_MODIFIED = 'role_modified',
  ROLE_DELETED = 'role_deleted',
  
  // Data Access Events
  DATA_ACCESSED = 'data_accessed',
  DATA_CREATED = 'data_created',
  DATA_MODIFIED = 'data_modified',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',
  
  // Security Events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SESSION_EXPIRED = 'session_expired',
  SESSION_TERMINATED = 'session_terminated',
  
  // Compliance Events
  GDPR_REQUEST = 'gdpr_request',
  GDPR_DELETION = 'gdpr_deletion',
  GDPR_EXPORT = 'gdpr_export',
  DATA_RETENTION = 'data_retention',
  DATA_ANONYMIZATION = 'data_anonymization',
  COMPLIANCE_REPORT = 'compliance_report',
  
  // System Events
  CONFIGURATION_CHANGE = 'configuration_change',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  MAINTENANCE_MODE = 'maintenance_mode',
  SECURITY_PATCH = 'security_patch',
  
  // User Management Events
  USER_CREATED = 'user_created',
  USER_MODIFIED = 'user_modified',
  USER_DELETED = 'user_deleted',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',
  
  // API Events
  API_ACCESS = 'api_access',
  API_RATE_LIMIT = 'api_rate_limit',
  API_ERROR = 'api_error',
  API_DEPRECATED = 'api_deprecated',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ComplianceFramework {
  GDPR = 'gdpr',
  SOC2 = 'soc2',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO27001 = 'iso27001',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ required: true, enum: AuditEventType })
  eventType: AuditEventType;

  @Prop({ required: true })
  eventName: string; // Human-readable event name

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: AuditSeverity, default: AuditSeverity.LOW })
  severity: AuditSeverity;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId; // User who performed the action

  @Prop({ type: Types.ObjectId, ref: 'User' })
  targetUserId?: Types.ObjectId; // User affected by the action

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ type: [String], default: [] })
  userRoles: string[]; // Roles of the user at the time of the event

  @Prop({ type: [String], default: [] })
  userPermissions: string[]; // Permissions of the user at the time of the event

  @Prop({ required: true })
  resource: string; // e.g., 'users', 'leads', 'api'

  @Prop({ required: true })
  action: string; // e.g., 'create', 'read', 'update', 'delete'

  @Prop({ type: Object })
  requestData: Record<string, any>; // Request data (sanitized)

  @Prop({ type: Object })
  responseData: Record<string, any>; // Response data (sanitized)

  @Prop({ type: Object })
  metadata: Record<string, any>; // Additional event metadata

  @Prop({ type: [String], default: [] })
  tags: string[]; // For categorization and filtering

  @Prop({ type: [ComplianceFramework], default: [] })
  complianceFrameworks: ComplianceFramework[]; // Relevant compliance frameworks

  @Prop({ required: true, default: false })
  isSensitive: boolean; // Whether this event contains sensitive data

  @Prop({ required: true, default: false })
  isAnonymized: boolean; // Whether sensitive data has been anonymized

  @Prop({ type: Object })
  locationData: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  @Prop({ type: Object })
  deviceData: {
    deviceType?: string;
    browser?: string;
    os?: string;
    fingerprint?: string;
  };

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date })
  retentionDate?: Date; // When this log should be deleted/anonymized

  @Prop({ type: [String], default: [] })
  alerts: string[]; // Alert IDs triggered by this event

  @Prop({ type: Object })
  riskScore: {
    score: number; // 0-100
    factors: string[]; // Factors contributing to the score
    threshold: number; // Threshold for this event type
  };

  @Prop({ type: Object })
  complianceData: {
    gdprArticle?: string; // Relevant GDPR article
    dataSubject?: string; // Data subject identifier
    legalBasis?: string; // Legal basis for processing
    retentionPeriod?: number; // Retention period in days
    dataCategories?: string[]; // Categories of data involved
  };

  // Methods (optional for TypeScript interface)
  calculateRetentionDate?: () => Date;
  calculateRiskScore?: () => { score: number; factors: string[]; threshold: number };
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for performance and compliance
AuditLogSchema.index({ tenantId: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, eventType: 1 });
AuditLogSchema.index({ tenantId: 1, severity: 1 });
AuditLogSchema.index({ tenantId: 1, userId: 1 });
AuditLogSchema.index({ tenantId: 1, resource: 1 });
AuditLogSchema.index({ tenantId: 1, action: 1 });
AuditLogSchema.index({ tenantId: 1, ipAddress: 1 });
AuditLogSchema.index({ tenantId: 1, isSensitive: 1 });
AuditLogSchema.index({ tenantId: 1, complianceFrameworks: 1 });

// Compound indexes for common queries
AuditLogSchema.index({ tenantId: 1, eventType: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, severity: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, userId: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, resource: 1, action: 1 });

// Text search index
AuditLogSchema.index({
  eventName: 'text',
  description: 'text',
  tags: 'text',
});

// TTL index for automatic deletion
AuditLogSchema.index({ retentionDate: 1 }, { expireAfterSeconds: 0 });

// Virtual for event category
AuditLogSchema.virtual('eventCategory').get(function() {
  const categories = {
    authentication: [AuditEventType.LOGIN_SUCCESS, AuditEventType.LOGIN_FAILED, AuditEventType.LOGOUT],
    authorization: [AuditEventType.PERMISSION_GRANTED, AuditEventType.PERMISSION_DENIED],
    dataAccess: [AuditEventType.DATA_ACCESSED, AuditEventType.DATA_CREATED, AuditEventType.DATA_MODIFIED],
    security: [AuditEventType.SUSPICIOUS_ACTIVITY, AuditEventType.BRUTE_FORCE_ATTEMPT],
    compliance: [AuditEventType.GDPR_REQUEST, AuditEventType.GDPR_DELETION],
  };
  
  for (const [category, events] of Object.entries(categories)) {
    if (events.includes(this.eventType)) {
      return category;
    }
  }
  
  return 'other';
});

// Virtual for compliance status
AuditLogSchema.virtual('complianceStatus').get(function() {
  if (this.complianceFrameworks.length === 0) return 'none';
  return this.complianceFrameworks.join(',');
});

// Pre-save middleware for validation and enrichment
AuditLogSchema.pre('save', function(next) {
  // Validate event type
  if (!Object.values(AuditEventType).includes(this.eventType)) {
    return next(new Error('Invalid event type'));
  }

  // Validate severity
  if (!Object.values(AuditSeverity).includes(this.severity)) {
    return next(new Error('Invalid severity level'));
  }

  // Set retention date based on compliance requirements
  if (!this.retentionDate) {
    this.retentionDate = this.calculateRetentionDate();
  }

  // Calculate risk score
  if (!this.riskScore) {
    this.riskScore = this.calculateRiskScore();
  }

  // Set updated timestamp
  this.updatedAt = new Date();

  next();
});

// Static method to find events by type
AuditLogSchema.statics.findByEventType = function(tenantId: Types.ObjectId, eventType: AuditEventType) {
  return this.find({ tenantId, eventType }).sort({ timestamp: -1 });
};

// Static method to find events by severity
AuditLogSchema.statics.findBySeverity = function(tenantId: Types.ObjectId, severity: AuditSeverity) {
  return this.find({ tenantId, severity }).sort({ timestamp: -1 });
};

// Static method to find events by user
AuditLogSchema.statics.findByUser = function(tenantId: Types.ObjectId, userId: Types.ObjectId) {
  return this.find({ tenantId, userId }).sort({ timestamp: -1 });
};

// Static method to find events by resource
AuditLogSchema.statics.findByResource = function(tenantId: Types.ObjectId, resource: string) {
  return this.find({ tenantId, resource }).sort({ timestamp: -1 });
};

// Static method to find sensitive events
AuditLogSchema.statics.findSensitiveEvents = function(tenantId: Types.ObjectId) {
  return this.find({ tenantId, isSensitive: true }).sort({ timestamp: -1 });
};

// Static method to find compliance events
AuditLogSchema.statics.findComplianceEvents = function(tenantId: Types.ObjectId, framework: ComplianceFramework) {
  return this.find({ tenantId, complianceFrameworks: framework }).sort({ timestamp: -1 });
};

// Static method to get audit statistics
AuditLogSchema.statics.getStatistics = function(tenantId: Types.ObjectId, startDate?: Date, endDate?: Date) {
  const match: any = { tenantId };
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        eventsByType: {
          $push: {
            eventType: '$eventType',
            count: 1,
          },
        },
        eventsBySeverity: {
          $push: {
            severity: '$severity',
            count: 1,
          },
        },
        averageRiskScore: { $avg: '$riskScore.score' },
        highRiskEvents: {
          $sum: {
            $cond: [{ $gte: ['$riskScore.score', 70] }, 1, 0],
          },
        },
        sensitiveEvents: {
          $sum: {
            $cond: [{ $eq: ['$isSensitive', true] }, 1, 0],
          },
        },
      },
    },
  ]);
};

// Method to calculate retention date
AuditLogSchema.methods.calculateRetentionDate = function(): Date {
  const now = new Date();
  let retentionDays = 2555; // Default: 7 years

  // Adjust based on compliance frameworks
  if (this.complianceFrameworks.includes(ComplianceFramework.GDPR)) {
    retentionDays = 2555; // 7 years for GDPR
  }
  if (this.complianceFrameworks.includes(ComplianceFramework.SOC2)) {
    retentionDays = 2555; // 7 years for SOC2
  }
  if (this.complianceFrameworks.includes(ComplianceFramework.HIPAA)) {
    retentionDays = 3650; // 10 years for HIPAA
  }

  // Adjust based on severity
  if (this.severity === AuditSeverity.CRITICAL) {
    retentionDays += 365; // Add 1 year for critical events
  }

  return new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);
};

// Method to calculate risk score
AuditLogSchema.methods.calculateRiskScore = function(): { score: number; factors: string[]; threshold: number } {
  let score = 0;
  const factors: string[] = [];
  let threshold = 50;

  // Base score by event type
  const eventTypeScores = {
    [AuditEventType.LOGIN_FAILED]: 20,
    [AuditEventType.BRUTE_FORCE_ATTEMPT]: 80,
    [AuditEventType.SUSPICIOUS_ACTIVITY]: 70,
    [AuditEventType.ACCOUNT_LOCKED]: 60,
    [AuditEventType.DATA_DELETED]: 50,
    [AuditEventType.PERMISSION_DENIED]: 30,
    [AuditEventType.GDPR_DELETION]: 40,
  };

  if (eventTypeScores[this.eventType]) {
    score += eventTypeScores[this.eventType];
    factors.push(`Event type: ${this.eventType}`);
  }

  // Severity multiplier
  const severityMultipliers = {
    [AuditSeverity.LOW]: 1,
    [AuditSeverity.MEDIUM]: 1.5,
    [AuditSeverity.HIGH]: 2,
    [AuditSeverity.CRITICAL]: 3,
  };

  score *= severityMultipliers[this.severity];
  factors.push(`Severity: ${this.severity}`);

  // Sensitive data factor
  if (this.isSensitive) {
    score += 20;
    factors.push('Sensitive data involved');
  }

  // Compliance factor
  if (this.complianceFrameworks.length > 0) {
    score += 10;
    factors.push('Compliance frameworks involved');
  }

  // Threshold adjustment
  if (this.eventType === AuditEventType.BRUTE_FORCE_ATTEMPT) {
    threshold = 70;
  }

  return {
    score: Math.min(score, 100),
    factors,
    threshold,
  };
};

// Method to anonymize sensitive data
AuditLogSchema.methods.anonymize = function(): void {
  if (this.isSensitive && !this.isAnonymized) {
    // Anonymize IP address
    if (this.ipAddress) {
      const parts = this.ipAddress.split('.');
      this.ipAddress = `${parts[0]}.${parts[1]}.*.*`;
    }

    // Anonymize user agent
    if (this.userAgent) {
      this.userAgent = 'ANONYMIZED';
    }

    // Anonymize request/response data
    if (this.requestData) {
      this.requestData = { anonymized: true };
    }
    if (this.responseData) {
      this.responseData = { anonymized: true };
    }

    // Anonymize location data
    if (this.locationData) {
      this.locationData = { anonymized: true };
    }

    // Anonymize device data
    if (this.deviceData) {
      this.deviceData = { anonymized: true };
    }

    this.isAnonymized = true;
  }
};

// Method to add alert
AuditLogSchema.methods.addAlert = function(alertId: string): void {
  if (!this.alerts.includes(alertId)) {
    this.alerts.push(alertId);
  }
};

// Method to check if event is high risk
AuditLogSchema.methods.isHighRisk = function(): boolean {
  return this.riskScore.score >= this.riskScore.threshold;
};

// Method to check if event requires immediate attention
AuditLogSchema.methods.requiresImmediateAttention = function(): boolean {
  return this.severity === AuditSeverity.CRITICAL || 
         this.eventType === AuditEventType.BRUTE_FORCE_ATTEMPT ||
         this.eventType === AuditEventType.SUSPICIOUS_ACTIVITY;
}; 