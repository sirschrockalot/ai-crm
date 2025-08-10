import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tenantId?: string; // null for global flags
  rolloutPercentage: number; // 0-100
  targetUsers?: string[]; // specific user IDs
  targetRoles?: string[]; // specific roles
  conditions?: FeatureFlagCondition[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface FeatureFlagCondition {
  type: 'user_id' | 'role' | 'tenant' | 'environment' | 'time' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  field: string;
  value: any;
}

export interface FeatureFlagEvaluation {
  flagName: string;
  enabled: boolean;
  reason: string;
  metadata?: any;
}

@Injectable()
export class FeatureFlagsService {
  private readonly cache = new Map<string, FeatureFlag>();
  private readonly cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private readonly cacheTimestamps = new Map<string, number>();

  constructor(
    private readonly configService: ConfigService,
    // TODO: Add feature flag model when schema is created
    // @InjectModel('FeatureFlag') private featureFlagModel: Model<FeatureFlag>,
  ) {}

  /**
   * Check if a feature flag is enabled for a specific context
   */
  async isEnabled(
    flagName: string,
    context: {
      userId?: string;
      tenantId?: string;
      roles?: string[];
      environment?: string;
      customData?: Record<string, any>;
    }
  ): Promise<FeatureFlagEvaluation> {
    try {
      const flag = await this.getFeatureFlag(flagName);
      
      if (!flag) {
        return {
          flagName,
          enabled: false,
          reason: 'Feature flag not found',
        };
      }

      if (!flag.enabled) {
        return {
          flagName,
          enabled: false,
          reason: 'Feature flag is disabled',
        };
      }

      // Check tenant-specific flags
      if (flag.tenantId && flag.tenantId !== context.tenantId) {
        return {
          flagName,
          enabled: false,
          reason: 'Feature flag is tenant-specific and does not match',
        };
      }

      // Check conditions
      if (flag.conditions && flag.conditions.length > 0) {
        const conditionsMet = await this.evaluateConditions(flag.conditions, context);
        if (!conditionsMet) {
          return {
            flagName,
            enabled: false,
            reason: 'Feature flag conditions not met',
          };
        }
      }

      // Check target users
      if (flag.targetUsers && flag.targetUsers.length > 0) {
        if (!context.userId || !flag.targetUsers.includes(context.userId)) {
          return {
            flagName,
            enabled: false,
            reason: 'User not in target list',
          };
        }
      }

      // Check target roles
      if (flag.targetRoles && flag.targetRoles.length > 0) {
        if (!context.roles || !context.roles.some(role => flag.targetRoles!.includes(role))) {
          return {
            flagName,
            enabled: false,
            reason: 'User role not in target list',
          };
        }
      }

      // Check rollout percentage
      if (flag.rolloutPercentage < 100) {
        const isInRollout = this.isUserInRolloutPercentage(
          context.userId || context.tenantId || 'default',
          flag.rolloutPercentage
        );
        
        if (!isInRollout) {
          return {
            flagName,
            enabled: false,
            reason: `User not in rollout percentage (${flag.rolloutPercentage}%)`,
          };
        }
      }

      return {
        flagName,
        enabled: true,
        reason: 'Feature flag is enabled for this context',
        metadata: {
          rolloutPercentage: flag.rolloutPercentage,
          conditions: flag.conditions,
          targetUsers: flag.targetUsers,
          targetRoles: flag.targetRoles,
        },
      };
    } catch (error) {
      console.error('Feature flag evaluation error:', error);
      return {
        flagName,
        enabled: false,
        reason: 'Error evaluating feature flag',
      };
    }
  }

  /**
   * Get all enabled feature flags for a context
   */
  async getEnabledFlags(context: {
    userId?: string;
    tenantId?: string;
    roles?: string[];
    environment?: string;
    customData?: Record<string, any>;
  }): Promise<string[]> {
    try {
      const flags = await this.getAllFeatureFlags();
      const enabledFlags: string[] = [];

      for (const flag of flags) {
        const evaluation = await this.isEnabled(flag.name, context);
        if (evaluation.enabled) {
          enabledFlags.push(flag.name);
        }
      }

      return enabledFlags;
    } catch (error) {
      console.error('Error getting enabled flags:', error);
      return [];
    }
  }

  /**
   * Create a new feature flag
   */
  async createFeatureFlag(
    flagData: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
    createdBy: string
  ): Promise<FeatureFlag> {
    const flag: FeatureFlag = {
      ...flagData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: createdBy,
    };

    // TODO: Save to database when schema is implemented
    // const savedFlag = await this.featureFlagModel.create(flag);
    
    // For now, just add to cache
    this.cache.set(flag.id, flag);
    this.cacheTimestamps.set(flag.id, Date.now());

    return flag;
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(
    flagId: string,
    updates: Partial<Omit<FeatureFlag, 'id' | 'createdAt' | 'createdBy'>>,
    updatedBy: string
  ): Promise<FeatureFlag | null> {
    // TODO: Update in database when schema is implemented
    // const flag = await this.featureFlagModel.findByIdAndUpdate(
    //   flagId,
    //   { ...updates, updatedAt: new Date(), updatedBy },
    //   { new: true }
    // );

    // For now, update in cache
    const flag = this.cache.get(flagId);
    if (flag) {
      const updatedFlag = {
        ...flag,
        ...updates,
        updatedAt: new Date(),
        updatedBy,
      };
      this.cache.set(flagId, updatedFlag);
      this.cacheTimestamps.set(flagId, Date.now());
      return updatedFlag;
    }

    return null;
  }

  /**
   * Delete a feature flag
   */
  async deleteFeatureFlag(flagId: string): Promise<boolean> {
    // TODO: Delete from database when schema is implemented
    // const result = await this.featureFlagModel.findByIdAndDelete(flagId);
    
    // For now, remove from cache
    const removed = this.cache.delete(flagId);
    this.cacheTimestamps.delete(flagId);
    
    return removed;
  }

  /**
   * Get all feature flags
   */
  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    // TODO: Get from database when schema is implemented
    // return this.featureFlagModel.find().exec();
    
    // For now, return from cache
    return Array.from(this.cache.values());
  }

  /**
   * Get a specific feature flag
   */
  async getFeatureFlag(flagName: string): Promise<FeatureFlag | null> {
    // TODO: Get from database when schema is implemented
    // return this.featureFlagModel.findOne({ name: flagName }).exec();
    
    // For now, get from cache
    const flags = Array.from(this.cache.values());
    return flags.find(flag => flag.name === flagName) || null;
  }

  /**
   * Initialize default feature flags
   */
  async initializeDefaultFlags(): Promise<void> {
    const defaultFlags: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[] = [
      {
        name: 'ai_lead_scoring',
        description: 'Enable AI-powered lead scoring',
        enabled: false,
        rolloutPercentage: 0,
        targetRoles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
      },
      {
        name: 'advanced_analytics',
        description: 'Enable advanced analytics features',
        enabled: false,
        rolloutPercentage: 0,
        targetRoles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
      },
      {
        name: 'automation_workflows',
        description: 'Enable automation workflow engine',
        enabled: false,
        rolloutPercentage: 0,
        targetRoles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
      },
      {
        name: 'mobile_app',
        description: 'Enable mobile app features',
        enabled: false,
        rolloutPercentage: 0,
        targetRoles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
      },
      {
        name: 'api_access',
        description: 'Enable API access for integrations',
        enabled: false,
        rolloutPercentage: 0,
        targetRoles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
      },
      {
        name: 'custom_integrations',
        description: 'Enable custom integration capabilities',
        enabled: false,
        rolloutPercentage: 0,
        targetRoles: ['SUPER_ADMIN', 'TENANT_ADMIN'],
      },
    ];

    for (const flagData of defaultFlags) {
      const existingFlag = await this.getFeatureFlag(flagData.name);
      if (!existingFlag) {
        await this.createFeatureFlag(flagData, 'system');
      }
    }
  }

  /**
   * Evaluate feature flag conditions
   */
  private async evaluateConditions(
    conditions: FeatureFlagCondition[],
    context: {
      userId?: string;
      tenantId?: string;
      roles?: string[];
      environment?: string;
      customData?: Record<string, any>;
    }
  ): Promise<boolean> {
    for (const condition of conditions) {
      const conditionMet = this.evaluateCondition(condition, context);
      if (!conditionMet) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: FeatureFlagCondition,
    context: {
      userId?: string;
      tenantId?: string;
      roles?: string[];
      environment?: string;
      customData?: Record<string, any>;
    }
  ): boolean {
    let actualValue: any;

    switch (condition.field) {
      case 'userId':
        actualValue = context.userId;
        break;
      case 'tenantId':
        actualValue = context.tenantId;
        break;
      case 'roles':
        actualValue = context.roles;
        break;
      case 'environment':
        actualValue = context.environment;
        break;
      default:
        actualValue = context.customData?.[condition.field];
    }

    return this.compareValues(actualValue, condition.value, condition.operator);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'contains':
        return Array.isArray(actual) ? actual.includes(expected) : String(actual).includes(String(expected));
      case 'not_contains':
        return Array.isArray(actual) ? !actual.includes(expected) : !String(actual).includes(String(expected));
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'in':
        return Array.isArray(expected) ? expected.includes(actual) : false;
      case 'not_in':
        return Array.isArray(expected) ? !expected.includes(actual) : true;
      default:
        return false;
    }
  }

  /**
   * Determine if a user is in the rollout percentage
   */
  private isUserInRolloutPercentage(userId: string, percentage: number): boolean {
    // Create a deterministic hash for the user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get a number between 0-99
    const userHash = Math.abs(hash) % 100;
    
    return userHash < percentage;
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.cacheExpiry) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }
} 