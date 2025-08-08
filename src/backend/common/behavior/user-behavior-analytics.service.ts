import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserActivity, ActivityType, ActivityCategory } from '../../modules/user-analytics/schemas/user-activity.schema';

export interface BehaviorPattern {
  patternId: string;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  patternType: 'navigation' | 'interaction' | 'data_usage' | 'feature_adoption' | 'performance' | 'security';
  patternName: string;
  description: string;
  frequency: number;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  metadata: Record<string, any>;
  isAnomalous: boolean;
  riskScore: number;
}

export interface UserSegment {
  segmentId: string;
  tenantId: Types.ObjectId;
  segmentName: string;
  description: string;
  criteria: Record<string, any>;
  userCount: number;
  averageBehaviorScore: number;
  averagePerformanceScore: number;
  averageSecurityScore: number;
  topFeatures: string[];
  commonPatterns: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BehaviorInsight {
  insightId: string;
  tenantId: Types.ObjectId;
  userId?: Types.ObjectId;
  insightType: 'pattern' | 'anomaly' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  metadata: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserJourney {
  journeyId: string;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  steps: Array<{
    stepNumber: number;
    activityType: ActivityType;
    resource: string;
    action: string;
    timestamp: Date;
    duration: number;
    context: Record<string, any>;
  }>;
  conversionGoal?: string;
  conversionAchieved: boolean;
  funnelDropOff?: string;
  efficiencyScore: number;
  satisfactionScore: number;
}

@Injectable()
export class UserBehaviorAnalyticsService {
  private readonly logger = new Logger(UserBehaviorAnalyticsService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(UserActivity.name) private readonly userActivityModel: Model<UserActivity>,
  ) {}

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehavior(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BehaviorPattern[]> {
    try {
      const match: any = { tenantId, userId };
      if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = startDate;
        if (endDate) match.timestamp.$lte = endDate;
      }

      // Get user activities
      const activities = await this.userActivityModel.find(match).sort({ timestamp: 1 });

      // Analyze patterns
      const patterns = await this.detectBehaviorPatterns(activities);

      // Calculate risk scores
      const patternsWithRisk = patterns.map(pattern => ({
        ...pattern,
        riskScore: this.calculatePatternRiskScore(pattern),
      }));

      this.logger.log(`Analyzed behavior patterns for user ${userId}: ${patternsWithRisk.length} patterns found`);

      return patternsWithRisk;
    } catch (error) {
      this.logger.error('Error analyzing user behavior:', error);
      throw error;
    }
  }

  /**
   * Detect behavior patterns from activities
   */
  private async detectBehaviorPatterns(activities: any[]): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];

    // Navigation patterns
    const navigationPatterns = this.detectNavigationPatterns(activities);
    patterns.push(...navigationPatterns);

    // Interaction patterns
    const interactionPatterns = this.detectInteractionPatterns(activities);
    patterns.push(...interactionPatterns);

    // Data usage patterns
    const dataUsagePatterns = this.detectDataUsagePatterns(activities);
    patterns.push(...dataUsagePatterns);

    // Feature adoption patterns
    const featurePatterns = this.detectFeatureAdoptionPatterns(activities);
    patterns.push(...featurePatterns);

    // Performance patterns
    const performancePatterns = this.detectPerformancePatterns(activities);
    patterns.push(...performancePatterns);

    // Security patterns
    const securityPatterns = this.detectSecurityPatterns(activities);
    patterns.push(...securityPatterns);

    return patterns;
  }

  /**
   * Detect navigation patterns
   */
  private detectNavigationPatterns(activities: any[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const navigationActivities = activities.filter(a => a.activityCategory === ActivityCategory.NAVIGATION);

    // Page visit patterns
    const pageVisits = navigationActivities.filter(a => a.activityType === ActivityType.PAGE_VIEW);
    const pageFrequency = this.calculateFrequency(pageVisits, 'resource');

    for (const [page, frequency] of Object.entries(pageFrequency)) {
      if (frequency > 5) {
        patterns.push({
          patternId: `nav_${Date.now()}_${Math.random()}`,
          tenantId: activities[0].tenantId,
          userId: activities[0].userId,
          patternType: 'navigation',
          patternName: `Frequent ${page} visits`,
          description: `User frequently visits ${page} (${frequency} times)`,
          frequency,
          confidence: Math.min(100, frequency * 10),
          firstSeen: pageVisits[0]?.timestamp || new Date(),
          lastSeen: pageVisits[pageVisits.length - 1]?.timestamp || new Date(),
          metadata: { page, visitCount: frequency },
          isAnomalous: false,
          riskScore: 0,
        });
      }
    }

    return patterns;
  }

  /**
   * Detect interaction patterns
   */
  private detectInteractionPatterns(activities: any[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const interactionActivities = activities.filter(a => a.activityCategory === ActivityCategory.INTERACTION);

    // Form interaction patterns
    const formActivities = interactionActivities.filter(a => 
      [ActivityType.FORM_START, ActivityType.FORM_COMPLETE, ActivityType.FORM_ABANDON].includes(a.activityType)
    );

    if (formActivities.length > 0) {
      const completionRate = formActivities.filter(a => a.activityType === ActivityType.FORM_COMPLETE).length / formActivities.length;
      
      patterns.push({
        patternId: `interaction_${Date.now()}_${Math.random()}`,
        tenantId: activities[0].tenantId,
        userId: activities[0].userId,
        patternType: 'interaction',
        patternName: `Form completion pattern`,
        description: `User has ${(completionRate * 100).toFixed(1)}% form completion rate`,
        frequency: formActivities.length,
        confidence: Math.min(100, formActivities.length * 5),
        firstSeen: formActivities[0]?.timestamp || new Date(),
        lastSeen: formActivities[formActivities.length - 1]?.timestamp || new Date(),
        metadata: { completionRate, formCount: formActivities.length },
        isAnomalous: completionRate < 0.5,
        riskScore: completionRate < 0.5 ? 30 : 0,
      });
    }

    return patterns;
  }

  /**
   * Detect data usage patterns
   */
  private detectDataUsagePatterns(activities: any[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const dataActivities = activities.filter(a => a.activityCategory === ActivityCategory.DATA_OPERATION);

    // Data operation patterns
    const operationTypes = ['create', 'read', 'update', 'delete'];
    for (const operation of operationTypes) {
      const operationActivities = dataActivities.filter(a => a.action === operation);
      
      if (operationActivities.length > 0) {
        patterns.push({
          patternId: `data_${operation}_${Date.now()}_${Math.random()}`,
          tenantId: activities[0].tenantId,
          userId: activities[0].userId,
          patternType: 'data_usage',
          patternName: `Data ${operation} pattern`,
          description: `User performs ${operation} operations frequently`,
          frequency: operationActivities.length,
          confidence: Math.min(100, operationActivities.length * 8),
          firstSeen: operationActivities[0]?.timestamp || new Date(),
          lastSeen: operationActivities[operationActivities.length - 1]?.timestamp || new Date(),
          metadata: { operation, resourceTypes: [...new Set(operationActivities.map(a => a.resource))] },
          isAnomalous: operation === 'delete' && operationActivities.length > 10,
          riskScore: operation === 'delete' ? 20 : 0,
        });
      }
    }

    return patterns;
  }

  /**
   * Detect feature adoption patterns
   */
  private detectFeatureAdoptionPatterns(activities: any[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const featureActivities = activities.filter(a => a.activityCategory === ActivityCategory.FEATURE_USAGE);

    // Feature usage patterns
    const featureUsage = this.calculateFrequency(featureActivities, 'resource');

    for (const [feature, usage] of Object.entries(featureUsage)) {
      if (usage > 3) {
        patterns.push({
          patternId: `feature_${Date.now()}_${Math.random()}`,
          tenantId: activities[0].tenantId,
          userId: activities[0].userId,
          patternType: 'feature_adoption',
          patternName: `Feature adoption: ${feature}`,
          description: `User frequently uses ${feature} feature`,
          frequency: usage,
          confidence: Math.min(100, usage * 15),
          firstSeen: featureActivities[0]?.timestamp || new Date(),
          lastSeen: featureActivities[featureActivities.length - 1]?.timestamp || new Date(),
          metadata: { feature, usageCount: usage },
          isAnomalous: false,
          riskScore: 0,
        });
      }
    }

    return patterns;
  }

  /**
   * Detect performance patterns
   */
  private detectPerformancePatterns(activities: any[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const performanceActivities = activities.filter(a => a.activityCategory === ActivityCategory.PERFORMANCE);

    // Performance issues
    const slowActivities = performanceActivities.filter(a => a.activityType === ActivityType.PERFORMANCE_SLOW);
    const errorActivities = performanceActivities.filter(a => a.activityType === ActivityType.PERFORMANCE_ERROR);

    if (slowActivities.length > 0) {
      patterns.push({
        patternId: `perf_slow_${Date.now()}_${Math.random()}`,
        tenantId: activities[0].tenantId,
        userId: activities[0].userId,
        patternType: 'performance',
        patternName: 'Performance issues',
        description: `User experiences ${slowActivities.length} performance issues`,
        frequency: slowActivities.length,
        confidence: Math.min(100, slowActivities.length * 20),
        firstSeen: slowActivities[0]?.timestamp || new Date(),
        lastSeen: slowActivities[slowActivities.length - 1]?.timestamp || new Date(),
        metadata: { slowCount: slowActivities.length, errorCount: errorActivities.length },
        isAnomalous: true,
        riskScore: slowActivities.length * 10,
      });
    }

    return patterns;
  }

  /**
   * Detect security patterns
   */
  private detectSecurityPatterns(activities: any[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const securityActivities = activities.filter(a => a.activityCategory === ActivityCategory.SECURITY);

    // Security issues
    const securityAttempts = securityActivities.filter(a => a.activityType === ActivityType.SECURITY_ATTEMPT);
    const securityBlocks = securityActivities.filter(a => a.activityType === ActivityType.SECURITY_BLOCK);

    if (securityAttempts.length > 0 || securityBlocks.length > 0) {
      patterns.push({
        patternId: `security_${Date.now()}_${Math.random()}`,
        tenantId: activities[0].tenantId,
        userId: activities[0].userId,
        patternType: 'security',
        patternName: 'Security concerns',
        description: `User has ${securityAttempts.length} security attempts and ${securityBlocks.length} blocks`,
        frequency: securityAttempts.length + securityBlocks.length,
        confidence: Math.min(100, (securityAttempts.length + securityBlocks.length) * 25),
        firstSeen: securityActivities[0]?.timestamp || new Date(),
        lastSeen: securityActivities[securityActivities.length - 1]?.timestamp || new Date(),
        metadata: { attempts: securityAttempts.length, blocks: securityBlocks.length },
        isAnomalous: true,
        riskScore: (securityAttempts.length + securityBlocks.length) * 15,
      });
    }

    return patterns;
  }

  /**
   * Calculate pattern risk score
   */
  private calculatePatternRiskScore(pattern: BehaviorPattern): number {
    let riskScore = 0;

    // Base risk by pattern type
    const typeRiskScores = {
      navigation: 5,
      interaction: 10,
      data_usage: 15,
      feature_adoption: 5,
      performance: 20,
      security: 30,
    };

    riskScore += typeRiskScores[pattern.patternType] || 0;

    // Risk based on frequency
    if (pattern.frequency > 20) {
      riskScore += 10;
    } else if (pattern.frequency > 10) {
      riskScore += 5;
    }

    // Risk based on anomalous behavior
    if (pattern.isAnomalous) {
      riskScore += 25;
    }

    // Risk based on confidence
    if (pattern.confidence > 80) {
      riskScore += 10;
    }

    return Math.min(100, riskScore);
  }

  /**
   * Create user segments based on behavior
   */
  async createUserSegments(tenantId: Types.ObjectId): Promise<UserSegment[]> {
    try {
      const segments: UserSegment[] = [];

      // Power users segment
      const powerUsers = await this.identifyPowerUsers(tenantId);
      if (powerUsers.length > 0) {
        segments.push({
          segmentId: `power_users_${Date.now()}`,
          tenantId,
          segmentName: 'Power Users',
          description: 'Users with high activity and feature adoption',
          criteria: { activityThreshold: 50, featureAdoption: 0.8 },
          userCount: powerUsers.length,
          averageBehaviorScore: 85,
          averagePerformanceScore: 90,
          averageSecurityScore: 95,
          topFeatures: ['dashboard', 'reports', 'analytics'],
          commonPatterns: ['high_activity', 'feature_adoption'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Casual users segment
      const casualUsers = await this.identifyCasualUsers(tenantId);
      if (casualUsers.length > 0) {
        segments.push({
          segmentId: `casual_users_${Date.now()}`,
          tenantId,
          segmentName: 'Casual Users',
          description: 'Users with moderate activity and basic feature usage',
          criteria: { activityThreshold: 10, featureAdoption: 0.3 },
          userCount: casualUsers.length,
          averageBehaviorScore: 60,
          averagePerformanceScore: 75,
          averageSecurityScore: 80,
          topFeatures: ['leads', 'basic_reports'],
          commonPatterns: ['moderate_activity', 'basic_features'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // At-risk users segment
      const atRiskUsers = await this.identifyAtRiskUsers(tenantId);
      if (atRiskUsers.length > 0) {
        segments.push({
          segmentId: `at_risk_users_${Date.now()}`,
          tenantId,
          segmentName: 'At-Risk Users',
          description: 'Users with performance issues or security concerns',
          criteria: { performanceIssues: true, securityConcerns: true },
          userCount: atRiskUsers.length,
          averageBehaviorScore: 40,
          averagePerformanceScore: 50,
          averageSecurityScore: 30,
          topFeatures: ['basic_features'],
          commonPatterns: ['performance_issues', 'security_concerns'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      this.logger.log(`Created ${segments.length} user segments for tenant ${tenantId}`);

      return segments;
    } catch (error) {
      this.logger.error('Error creating user segments:', error);
      throw error;
    }
  }

  /**
   * Generate behavioral insights
   */
  async generateBehavioralInsights(
    tenantId: Types.ObjectId,
    userId?: Types.ObjectId,
  ): Promise<BehaviorInsight[]> {
    try {
      const insights: BehaviorInsight[] = [];

      const match: any = { tenantId };
      if (userId) match.userId = userId;

      const activities = await this.userActivityModel.find(match).sort({ timestamp: -1 }).limit(1000);

      // Pattern insights
      const patternInsights = this.generatePatternInsights(activities);
      insights.push(...patternInsights);

      // Anomaly insights
      const anomalyInsights = this.generateAnomalyInsights(activities);
      insights.push(...anomalyInsights);

      // Trend insights
      const trendInsights = this.generateTrendInsights(activities);
      insights.push(...trendInsights);

      // Recommendation insights
      const recommendationInsights = this.generateRecommendationInsights(activities);
      insights.push(...recommendationInsights);

      this.logger.log(`Generated ${insights.length} behavioral insights`);

      return insights;
    } catch (error) {
      this.logger.error('Error generating behavioral insights:', error);
      throw error;
    }
  }

  /**
   * Track user journey
   */
  async trackUserJourney(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    sessionId: string,
    startTime: Date,
  ): Promise<UserJourney> {
    try {
      // Get session activities
      const sessionActivities = await this.userActivityModel.find({
        tenantId,
        userId,
        'analytics.sessionId': sessionId,
      }).sort({ timestamp: 1 });

      // Build journey steps
      const steps = sessionActivities.map((activity, index) => ({
        stepNumber: index + 1,
        activityType: activity.activityType,
        resource: activity.resource,
        action: activity.action,
        timestamp: activity.timestamp,
        duration: index > 0 ? 
          activity.timestamp.getTime() - sessionActivities[index - 1].timestamp.getTime() : 0,
        context: activity.context,
      }));

      // Calculate journey metrics
      const duration = sessionActivities.length > 0 ? 
        sessionActivities[sessionActivities.length - 1].timestamp.getTime() - startTime.getTime() : 0;

      const efficiencyScore = this.calculateJourneyEfficiency(steps);
      const satisfactionScore = this.calculateJourneySatisfaction(sessionActivities);

      const journey: UserJourney = {
        journeyId: `journey_${Date.now()}_${Math.random()}`,
        tenantId,
        userId,
        sessionId,
        startTime,
        endTime: sessionActivities.length > 0 ? sessionActivities[sessionActivities.length - 1].timestamp : undefined,
        duration,
        steps,
        conversionGoal: this.detectConversionGoal(sessionActivities),
        conversionAchieved: this.checkConversionAchievement(sessionActivities),
        funnelDropOff: this.detectFunnelDropOff(steps),
        efficiencyScore,
        satisfactionScore,
      };

      this.logger.log(`Tracked user journey: ${journey.journeyId} with ${steps.length} steps`);

      return journey;
    } catch (error) {
      this.logger.error('Error tracking user journey:', error);
      throw error;
    }
  }

  /**
   * Helper method to calculate frequency
   */
  private calculateFrequency(activities: any[], field: string): Record<string, number> {
    const frequency: Record<string, number> = {};
    
    activities.forEach(activity => {
      const value = activity[field];
      frequency[value] = (frequency[value] || 0) + 1;
    });
    
    return frequency;
  }

  /**
   * Helper methods for user identification
   */
  private async identifyPowerUsers(tenantId: Types.ObjectId): Promise<Types.ObjectId[]> {
    // Implementation would query actual data
    return [];
  }

  private async identifyCasualUsers(tenantId: Types.ObjectId): Promise<Types.ObjectId[]> {
    // Implementation would query actual data
    return [];
  }

  private async identifyAtRiskUsers(tenantId: Types.ObjectId): Promise<Types.ObjectId[]> {
    // Implementation would query actual data
    return [];
  }

  /**
   * Helper methods for insight generation
   */
  private generatePatternInsights(activities: any[]): BehaviorInsight[] {
    // Implementation for pattern insights
    return [];
  }

  private generateAnomalyInsights(activities: any[]): BehaviorInsight[] {
    // Implementation for anomaly insights
    return [];
  }

  private generateTrendInsights(activities: any[]): BehaviorInsight[] {
    // Implementation for trend insights
    return [];
  }

  private generateRecommendationInsights(activities: any[]): BehaviorInsight[] {
    // Implementation for recommendation insights
    return [];
  }

  /**
   * Helper methods for journey tracking
   */
  private calculateJourneyEfficiency(steps: any[]): number {
    // Implementation for efficiency calculation
    return 75;
  }

  private calculateJourneySatisfaction(activities: any[]): number {
    // Implementation for satisfaction calculation
    return 80;
  }

  private detectConversionGoal(activities: any[]): string {
    // Implementation for conversion goal detection
    return 'lead_creation';
  }

  private checkConversionAchievement(activities: any[]): boolean {
    // Implementation for conversion achievement check
    return true;
  }

  private detectFunnelDropOff(steps: any[]): string {
    // Implementation for funnel drop-off detection
    return 'form_completion';
  }
} 