import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

export enum ActivityType {
  // Navigation Events
  PAGE_VIEW = 'page_view',
  PAGE_LEAVE = 'page_leave',
  NAVIGATION = 'navigation',
  SEARCH = 'search',
  FILTER = 'filter',
  
  // Interaction Events
  CLICK = 'click',
  HOVER = 'hover',
  SCROLL = 'scroll',
  FORM_START = 'form_start',
  FORM_COMPLETE = 'form_complete',
  FORM_ABANDON = 'form_abandon',
  
  // Data Events
  DATA_VIEW = 'data_view',
  DATA_CREATE = 'data_create',
  DATA_UPDATE = 'data_update',
  DATA_DELETE = 'data_delete',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  
  // Feature Events
  FEATURE_USE = 'feature_use',
  FEATURE_DISCOVER = 'feature_discover',
  FEATURE_ERROR = 'feature_error',
  
  // Performance Events
  PERFORMANCE_SLOW = 'performance_slow',
  PERFORMANCE_ERROR = 'performance_error',
  PERFORMANCE_TIMEOUT = 'performance_timeout',
  
  // Security Events
  SECURITY_ATTEMPT = 'security_attempt',
  SECURITY_BLOCK = 'security_block',
  SECURITY_ALERT = 'security_alert',
  
  // Session Events
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  SESSION_TIMEOUT = 'session_timeout',
  SESSION_REFRESH = 'session_refresh',
  
  // User Events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  USER_PROFILE_UPDATE = 'user_profile_update',
  
  // Business Events
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  LEAD_CONVERTED = 'lead_converted',
  DEAL_CREATED = 'deal_created',
  DEAL_CLOSED = 'deal_closed',
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
}

export enum ActivityCategory {
  NAVIGATION = 'navigation',
  INTERACTION = 'interaction',
  DATA_OPERATION = 'data_operation',
  FEATURE_USAGE = 'feature_usage',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  SESSION = 'session',
  USER_MANAGEMENT = 'user_management',
  BUSINESS = 'business',
}

export enum ActivitySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({ timestamps: true })
export class UserActivity {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant' })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true, enum: ActivityType })
  activityType: ActivityType;

  @Prop({ required: true, enum: ActivityCategory })
  activityCategory: ActivityCategory;

  @Prop({ required: true })
  activityName: string; // Human-readable activity name

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ActivitySeverity, default: ActivitySeverity.LOW })
  severity: ActivitySeverity;

  @Prop({ required: true })
  resource: string; // e.g., 'leads', 'dashboard', 'reports'

  @Prop({ required: true })
  action: string; // e.g., 'view', 'create', 'update', 'delete'

  @Prop({ type: Object })
  context: {
    page?: string;
    section?: string;
    element?: string;
    url?: string;
    referrer?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    screenResolution?: string;
    viewport?: string;
    language?: string;
    timezone?: string;
  };

  @Prop({ type: Object })
  data: {
    entityId?: string;
    entityType?: string;
    fieldName?: string;
    oldValue?: any;
    newValue?: any;
    metadata?: Record<string, any>;
  };

  @Prop({ type: Object })
  performance: {
    loadTime?: number;
    responseTime?: number;
    renderTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    networkLatency?: number;
  };

  @Prop({ type: Object })
  behavior: {
    sessionDuration?: number;
    timeOnPage?: number;
    scrollDepth?: number;
    clickCount?: number;
    hoverCount?: number;
    formCompletionRate?: number;
    errorCount?: number;
    retryCount?: number;
  };

  @Prop({ type: Object })
  security: {
    ipAddress?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    };
    deviceFingerprint?: string;
    riskScore?: number;
    threatLevel?: string;
    suspiciousPatterns?: string[];
  };

  @Prop({ type: [String], default: [] })
  tags: string[]; // For categorization and filtering

  @Prop({ type: [String], default: [] })
  userRoles: string[]; // User roles at the time of activity

  @Prop({ type: [String], default: [] })
  userPermissions: string[]; // User permissions at the time of activity

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Object })
  analytics: {
    sessionId?: string;
    visitId?: string;
    funnelStep?: string;
    conversionGoal?: string;
    abTestVariant?: string;
    cohort?: string;
    segment?: string;
  };

  @Prop({ type: Object })
  business: {
    leadId?: string;
    dealId?: string;
    taskId?: string;
    pipelineStage?: string;
    dealValue?: number;
    conversionType?: string;
    revenueImpact?: number;
  };

  @Prop({ type: Object })
  patterns: {
    isAnomalous?: boolean;
    anomalyScore?: number;
    patternType?: string;
    confidence?: number;
    similarActivities?: string[];
  };

  @Prop({ type: Object })
  insights: {
    userIntent?: string;
    userSatisfaction?: number;
    taskSuccess?: boolean;
    efficiencyScore?: number;
    learningCurve?: string;
    featureAdoption?: string;
  };
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

// Indexes for performance and analytics
UserActivitySchema.index({ tenantId: 1, timestamp: -1 });
UserActivitySchema.index({ tenantId: 1, userId: 1 });
UserActivitySchema.index({ tenantId: 1, activityType: 1 });
UserActivitySchema.index({ tenantId: 1, activityCategory: 1 });
UserActivitySchema.index({ tenantId: 1, resource: 1 });
UserActivitySchema.index({ tenantId: 1, severity: 1 });

// Compound indexes for common queries
UserActivitySchema.index({ tenantId: 1, userId: 1, timestamp: -1 });
UserActivitySchema.index({ tenantId: 1, activityType: 1, timestamp: -1 });
UserActivitySchema.index({ tenantId: 1, resource: 1, action: 1 });
UserActivitySchema.index({ tenantId: 1, 'security.ipAddress': 1 });

// Text search index
UserActivitySchema.index({
  activityName: 'text',
  description: 'text',
  tags: 'text',
});

// TTL index for automatic cleanup (keep for 2 years)
UserActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

// Virtual for activity duration
UserActivitySchema.virtual('duration').get(function() {
  if (this.behavior?.sessionDuration) {
    return this.behavior.sessionDuration;
  }
  return null;
});

// Virtual for performance score
UserActivitySchema.virtual('performanceScore').get(function() {
  if (this.performance?.loadTime && this.performance?.responseTime) {
    const loadScore = Math.max(0, 100 - (this.performance.loadTime / 1000) * 10);
    const responseScore = Math.max(0, 100 - (this.performance.responseTime / 1000) * 10);
    return Math.round((loadScore + responseScore) / 2);
  }
  return null;
});

// Virtual for behavior score
UserActivitySchema.virtual('behaviorScore').get(function() {
  if (this.behavior) {
    let score = 100;
    
    if (this.behavior.errorCount > 0) {
      score -= this.behavior.errorCount * 10;
    }
    
    if (this.behavior.retryCount > 0) {
      score -= this.behavior.retryCount * 5;
    }
    
    if (this.behavior.formCompletionRate !== undefined) {
      score += this.behavior.formCompletionRate * 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  return null;
});

// Pre-save middleware for validation and enrichment
UserActivitySchema.pre('save', function(next) {
  // Validate activity type
  if (!Object.values(ActivityType).includes(this.activityType)) {
    return next(new Error('Invalid activity type'));
  }

  // Validate activity category
  if (!Object.values(ActivityCategory).includes(this.activityCategory)) {
    return next(new Error('Invalid activity category'));
  }

  // Validate severity
  if (!Object.values(ActivitySeverity).includes(this.severity)) {
    return next(new Error('Invalid severity level'));
  }

  // Set updated timestamp
  this.updatedAt = new Date();

  next();
});

// Static method to find activities by user
UserActivitySchema.statics.findByUser = function(tenantId: Types.ObjectId, userId: Types.ObjectId) {
  return this.find({ tenantId, userId }).sort({ timestamp: -1 });
};

// Static method to find activities by type
UserActivitySchema.statics.findByType = function(tenantId: Types.ObjectId, activityType: ActivityType) {
  return this.find({ tenantId, activityType }).sort({ timestamp: -1 });
};

// Static method to find activities by category
UserActivitySchema.statics.findByCategory = function(tenantId: Types.ObjectId, category: ActivityCategory) {
  return this.find({ tenantId, activityCategory: category }).sort({ timestamp: -1 });
};

// Static method to find activities by resource
UserActivitySchema.statics.findByResource = function(tenantId: Types.ObjectId, resource: string) {
  return this.find({ tenantId, resource }).sort({ timestamp: -1 });
};

// Static method to find activities by severity
UserActivitySchema.statics.findBySeverity = function(tenantId: Types.ObjectId, severity: ActivitySeverity) {
  return this.find({ tenantId, severity }).sort({ timestamp: -1 });
};

// Static method to find anomalous activities
UserActivitySchema.statics.findAnomalous = function(tenantId: Types.ObjectId) {
  return this.find({ tenantId, 'patterns.isAnomalous': true }).sort({ timestamp: -1 });
};

// Static method to get activity statistics
UserActivitySchema.statics.getStatistics = function(tenantId: Types.ObjectId, startDate?: Date, endDate?: Date) {
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
        totalActivities: { $sum: 1 },
        activitiesByType: {
          $push: {
            activityType: '$activityType',
            count: 1,
          },
        },
        activitiesByCategory: {
          $push: {
            category: '$activityCategory',
            count: 1,
          },
        },
        activitiesBySeverity: {
          $push: {
            severity: '$severity',
            count: 1,
          },
        },
        averagePerformanceScore: { $avg: '$performanceScore' },
        averageBehaviorScore: { $avg: '$behaviorScore' },
        anomalousActivities: {
          $sum: {
            $cond: [{ $eq: ['$patterns.isAnomalous', true] }, 1, 0],
          },
        },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueResources: { $addToSet: '$resource' },
      },
    },
  ]);
};

// Static method to get user behavior patterns
UserActivitySchema.statics.getUserBehaviorPatterns = function(tenantId: Types.ObjectId, userId: Types.ObjectId) {
  return this.aggregate([
    { $match: { tenantId, userId } },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        avgTimeOnPage: { $avg: '$behavior.timeOnPage' },
        avgScrollDepth: { $avg: '$behavior.scrollDepth' },
        avgClickCount: { $avg: '$behavior.clickCount' },
        avgHoverCount: { $avg: '$behavior.hoverCount' },
        formCompletionRate: { $avg: '$behavior.formCompletionRate' },
        errorRate: { $avg: '$behavior.errorCount' },
        lastActivity: { $max: '$timestamp' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to get performance analytics
UserActivitySchema.statics.getPerformanceAnalytics = function(tenantId: Types.ObjectId, startDate?: Date, endDate?: Date) {
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
        _id: '$resource',
        avgLoadTime: { $avg: '$performance.loadTime' },
        avgResponseTime: { $avg: '$performance.responseTime' },
        avgRenderTime: { $avg: '$performance.renderTime' },
        slowPages: {
          $sum: {
            $cond: [{ $gt: ['$performance.loadTime', 3000] }, 1, 0],
          },
        },
        errorPages: {
          $sum: {
            $cond: [{ $gt: ['$performance.errorCount', 0] }, 1, 0],
          },
        },
        totalActivities: { $sum: 1 },
      },
    },
    { $sort: { avgLoadTime: -1 } },
  ]);
};

// Static method to get security analytics
UserActivitySchema.statics.getSecurityAnalytics = function(tenantId: Types.ObjectId, startDate?: Date, endDate?: Date) {
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
        totalActivities: { $sum: 1 },
        highRiskActivities: {
          $sum: {
            $cond: [{ $gte: ['$security.riskScore', 70] }, 1, 0],
          },
        },
        suspiciousIPs: { $addToSet: '$security.ipAddress' },
        uniqueLocations: { $addToSet: '$security.location' },
        avgRiskScore: { $avg: '$security.riskScore' },
        threatLevels: {
          $push: {
            threatLevel: '$security.threatLevel',
            count: 1,
          },
        },
      },
    },
  ]);
};

// Method to calculate behavior score
UserActivitySchema.methods.calculateBehaviorScore = function(): number {
  let score = 100;
  
  if (this.behavior) {
    if (this.behavior.errorCount > 0) {
      score -= this.behavior.errorCount * 10;
    }
    
    if (this.behavior.retryCount > 0) {
      score -= this.behavior.retryCount * 5;
    }
    
    if (this.behavior.formCompletionRate !== undefined) {
      score += this.behavior.formCompletionRate * 20;
    }
  }
  
  return Math.max(0, Math.min(100, score));
};

// Method to detect anomalies
UserActivitySchema.methods.detectAnomalies = function(): void {
  const anomalies: string[] = [];
  
  // Performance anomalies
  if (this.performance?.loadTime > 5000) {
    anomalies.push('slow_load_time');
  }
  
  if (this.performance?.responseTime > 3000) {
    anomalies.push('slow_response_time');
  }
  
  // Security anomalies
  if (this.security?.riskScore > 70) {
    anomalies.push('high_risk_activity');
  }
  
  // Behavior anomalies
  if (this.behavior?.errorCount > 5) {
    anomalies.push('high_error_rate');
  }
  
  if (this.behavior?.retryCount > 3) {
    anomalies.push('multiple_retries');
  }
  
  // Update patterns
  this.patterns = {
    isAnomalous: anomalies.length > 0,
    anomalyScore: anomalies.length * 20,
    patternType: anomalies.join(','),
    confidence: Math.min(100, anomalies.length * 25),
    similarActivities: [],
  };
};

// Method to calculate insights
UserActivitySchema.methods.calculateInsights = function(): void {
  const insights: any = {};
  
  // User intent based on activity
  if (this.activityType === ActivityType.DATA_CREATE) {
    insights.userIntent = 'data_entry';
  } else if (this.activityType === ActivityType.SEARCH) {
    insights.userIntent = 'information_seeking';
  } else if (this.activityType === ActivityType.FEATURE_USE) {
    insights.userIntent = 'feature_exploration';
  }
  
  // User satisfaction based on behavior
  if (this.behavior) {
    if (this.behavior.formCompletionRate > 0.8) {
      insights.userSatisfaction = 90;
    } else if (this.behavior.formCompletionRate > 0.6) {
      insights.userSatisfaction = 70;
    } else {
      insights.userSatisfaction = 50;
    }
  }
  
  // Task success based on activity outcome
  if (this.activityType === ActivityType.FORM_COMPLETE) {
    insights.taskSuccess = true;
  } else if (this.activityType === ActivityType.FORM_ABANDON) {
    insights.taskSuccess = false;
  }
  
  // Efficiency score
  if (this.behavior?.timeOnPage && this.behavior?.clickCount) {
    insights.efficiencyScore = Math.round((this.behavior.clickCount / this.behavior.timeOnPage) * 100);
  }
  
  this.insights = insights;
}; 