import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditEventType, ComplianceFramework } from '../../modules/security-audit/schemas/audit-log.schema';

export interface RetentionPolicy {
  policyId: string;
  tenantId: Types.ObjectId;
  dataCategory: string;
  retentionPeriod: number; // in days
  legalBasis: string;
  disposalMethod: 'delete' | 'anonymize' | 'archive';
  reviewFrequency: number; // in days
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  isActive: boolean;
  exceptions?: string[];
  dataTypes: string[];
  retentionTriggers: string[];
}

export interface DataLifecycleEvent {
  eventId: string;
  tenantId: Types.ObjectId;
  dataId: string;
  dataType: string;
  dataCategory: string;
  eventType: 'created' | 'accessed' | 'modified' | 'archived' | 'anonymized' | 'deleted';
  timestamp: Date;
  userId?: Types.ObjectId;
  metadata: Record<string, any>;
  retentionPolicyId?: string;
  nextReviewDate?: Date;
}

export interface AnonymizationRule {
  ruleId: string;
  tenantId: Types.ObjectId;
  dataType: string;
  fieldName: string;
  anonymizationMethod: 'hash' | 'mask' | 'random' | 'null' | 'custom';
  customPattern?: string;
  salt?: string;
  isActive: boolean;
  priority: number;
}

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  /**
   * Create a new retention policy
   */
  async createRetentionPolicy(
    tenantId: Types.ObjectId,
    dataCategory: string,
    retentionPeriod: number,
    legalBasis: string,
    disposalMethod: 'delete' | 'anonymize' | 'archive',
    dataTypes: string[],
    userId: Types.ObjectId,
  ): Promise<RetentionPolicy> {
    try {
      const policy: RetentionPolicy = {
        policyId: `retention_${Date.now()}`,
        tenantId,
        dataCategory,
        retentionPeriod,
        legalBasis,
        disposalMethod,
        reviewFrequency: 365, // 1 year
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        dataTypes,
        retentionTriggers: ['time_based', 'event_based'],
      };

      // Log the policy creation
      await this.logRetentionEvent(
        tenantId,
        'retention_policy_created',
        userId,
        'system',
        'system',
        'retention',
        'policy_created',
        {
          policyId: policy.policyId,
          dataCategory,
          retentionPeriod,
          disposalMethod,
        },
      );

      this.logger.log(`Retention policy created: ${policy.policyId} for ${dataCategory}`);

      return policy;
    } catch (error) {
      this.logger.error('Error creating retention policy:', error);
      throw error;
    }
  }

  /**
   * Apply retention policy to data
   */
  async applyRetentionPolicy(
    tenantId: Types.ObjectId,
    dataId: string,
    dataType: string,
    dataCategory: string,
    policy: RetentionPolicy,
    userId: Types.ObjectId,
  ): Promise<void> {
    try {
      // Calculate retention date
      const retentionDate = new Date(Date.now() + policy.retentionPeriod * 24 * 60 * 60 * 1000);

      // Create lifecycle event
      const lifecycleEvent: DataLifecycleEvent = {
        eventId: `lifecycle_${Date.now()}`,
        tenantId,
        dataId,
        dataType,
        dataCategory,
        eventType: 'created',
        timestamp: new Date(),
        userId,
        metadata: {
          retentionPolicyId: policy.policyId,
          retentionDate,
          disposalMethod: policy.disposalMethod,
        },
        retentionPolicyId: policy.policyId,
        nextReviewDate: retentionDate,
      };

      // Log the lifecycle event
      await this.logRetentionEvent(
        tenantId,
        'data_lifecycle_event',
        userId,
        'system',
        'system',
        'retention',
        'policy_applied',
        {
          dataId,
          dataType,
          policyId: policy.policyId,
          retentionDate,
        },
      );

      this.logger.log(`Retention policy applied to data: ${dataId} with policy: ${policy.policyId}`);
    } catch (error) {
      this.logger.error('Error applying retention policy:', error);
      throw error;
    }
  }

  /**
   * Process data retention (run as scheduled job)
   */
  async processDataRetention(tenantId: Types.ObjectId): Promise<any> {
    try {
      const results = {
        processed: 0,
        anonymized: 0,
        deleted: 0,
        archived: 0,
        errors: 0,
        details: [] as any[],
      };

      // Get data that has reached retention date
      const expiredData = await this.getExpiredData(tenantId);

      for (const data of expiredData) {
        try {
          const policy = await this.getRetentionPolicy(data.retentionPolicyId);
          
          if (!policy) {
            this.logger.warn(`No retention policy found for data: ${data.dataId}`);
            continue;
          }

          // Apply disposal method
          switch (policy.disposalMethod) {
            case 'anonymize':
              await this.anonymizeData(tenantId, data.dataId, data.dataType);
              results.anonymized++;
              break;
            case 'delete':
              await this.deleteData(tenantId, data.dataId, data.dataType);
              results.deleted++;
              break;
            case 'archive':
              await this.archiveData(tenantId, data.dataId, data.dataType);
              results.archived++;
              break;
          }

          results.processed++;
          results.details.push({
            dataId: data.dataId,
            dataType: data.dataType,
            action: policy.disposalMethod,
            timestamp: new Date(),
          });

        } catch (error) {
          this.logger.error(`Error processing data retention for ${data.dataId}:`, error);
          results.errors++;
        }
      }

      // Log retention processing
      await this.logRetentionEvent(
        tenantId,
        'retention_processing_completed',
        null,
        'system',
        'system',
        'retention',
        'batch_processed',
        results,
      );

      this.logger.log(`Data retention processing completed: ${results.processed} items processed`);

      return results;
    } catch (error) {
      this.logger.error('Error processing data retention:', error);
      throw error;
    }
  }

  /**
   * Anonymize data according to rules
   */
  async anonymizeData(
    tenantId: Types.ObjectId,
    dataId: string,
    dataType: string,
    userId?: Types.ObjectId,
  ): Promise<void> {
    try {
      // Get anonymization rules for this data type
      const rules = await this.getAnonymizationRules(tenantId, dataType);

      // Apply anonymization rules
      const anonymizedData = await this.applyAnonymizationRules(dataId, dataType, rules);

      // Update the data with anonymized version
      await this.updateDataWithAnonymizedVersion(tenantId, dataId, dataType, anonymizedData);

      // Log the anonymization
      await this.logRetentionEvent(
        tenantId,
        'data_anonymized',
        userId,
        'system',
        'system',
        'retention',
        'data_anonymized',
        {
          dataId,
          dataType,
          rulesApplied: rules.length,
        },
      );

      this.logger.log(`Data anonymized: ${dataId} of type ${dataType}`);
    } catch (error) {
      this.logger.error('Error anonymizing data:', error);
      throw error;
    }
  }

  /**
   * Delete data permanently
   */
  async deleteData(
    tenantId: Types.ObjectId,
    dataId: string,
    dataType: string,
    userId?: Types.ObjectId,
  ): Promise<void> {
    try {
      // Perform soft delete first (mark as deleted)
      await this.softDeleteData(tenantId, dataId, dataType);

      // Schedule permanent deletion after grace period
      await this.schedulePermanentDeletion(tenantId, dataId, dataType, 30); // 30 days grace period

      // Log the deletion
      await this.logRetentionEvent(
        tenantId,
        'data_deleted',
        userId,
        'system',
        'system',
        'retention',
        'data_deleted',
        {
          dataId,
          dataType,
          deletionType: 'soft',
        },
      );

      this.logger.log(`Data deleted: ${dataId} of type ${dataType}`);
    } catch (error) {
      this.logger.error('Error deleting data:', error);
      throw error;
    }
  }

  /**
   * Archive data
   */
  async archiveData(
    tenantId: Types.ObjectId,
    dataId: string,
    dataType: string,
    userId?: Types.ObjectId,
  ): Promise<void> {
    try {
      // Move data to archive storage
      await this.moveToArchive(tenantId, dataId, dataType);

      // Update data status
      await this.updateDataStatus(tenantId, dataId, dataType, 'archived');

      // Log the archiving
      await this.logRetentionEvent(
        tenantId,
        'data_archived',
        userId,
        'system',
        'system',
        'retention',
        'data_archived',
        {
          dataId,
          dataType,
          archiveLocation: 'cold_storage',
        },
      );

      this.logger.log(`Data archived: ${dataId} of type ${dataType}`);
    } catch (error) {
      this.logger.error('Error archiving data:', error);
      throw error;
    }
  }

  /**
   * Create anonymization rule
   */
  async createAnonymizationRule(
    tenantId: Types.ObjectId,
    dataType: string,
    fieldName: string,
    anonymizationMethod: 'hash' | 'mask' | 'random' | 'null' | 'custom',
    userId: Types.ObjectId,
    customPattern?: string,
  ): Promise<AnonymizationRule> {
    try {
      const rule: AnonymizationRule = {
        ruleId: `anonymization_${Date.now()}`,
        tenantId,
        dataType,
        fieldName,
        anonymizationMethod,
        customPattern,
        isActive: true,
        priority: 1,
      };

      // Log the rule creation
      await this.logRetentionEvent(
        tenantId,
        'anonymization_rule_created',
        userId,
        'system',
        'system',
        'retention',
        'rule_created',
        {
          ruleId: rule.ruleId,
          dataType,
          fieldName,
          method: anonymizationMethod,
        },
      );

      this.logger.log(`Anonymization rule created: ${rule.ruleId} for ${dataType}.${fieldName}`);

      return rule;
    } catch (error) {
      this.logger.error('Error creating anonymization rule:', error);
      throw error;
    }
  }

  /**
   * Generate retention compliance report
   */
  async generateRetentionReport(
    tenantId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    userId: Types.ObjectId,
  ): Promise<any> {
    try {
      // Get retention-related events
      const retentionEvents = await this.auditLogModel.find({
        tenantId,
        tags: 'retention',
        timestamp: { $gte: startDate, $lte: endDate },
      }).sort({ timestamp: -1 });

      // Calculate retention metrics
      const metrics = this.calculateRetentionMetrics(retentionEvents);

      // Generate report
      const report = {
        reportId: `retention_report_${Date.now()}`,
        tenantId,
        period: { startDate, endDate },
        generatedAt: new Date(),
        generatedBy: userId,
        metrics,
        events: retentionEvents.length,
        recommendations: this.generateRetentionRecommendations(metrics),
      };

      // Log the report generation
      await this.logRetentionEvent(
        tenantId,
        'retention_report_generated',
        userId,
        'system',
        'system',
        'retention',
        'report_generated',
        {
          reportId: report.reportId,
          period: { startDate, endDate },
        },
      );

      this.logger.log(`Retention compliance report generated: ${report.reportId}`);

      return report;
    } catch (error) {
      this.logger.error('Error generating retention report:', error);
      throw error;
    }
  }

  /**
   * Log retention-related audit event
   */
  private async logRetentionEvent(
    tenantId: Types.ObjectId,
    eventType: string,
    userId: Types.ObjectId | null,
    ipAddress: string,
    userAgent: string,
    resource: string,
    action: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      const auditLog = new this.auditLogModel({
        tenantId,
        eventType: AuditEventType.DATA_RETENTION,
        eventName: `Data Retention ${action.replace('_', ' ')}`,
        description: `Data retention event: ${action}`,
        severity: 'medium',
        userId,
        ipAddress,
        userAgent,
        resource,
        action,
        metadata,
        complianceFrameworks: [ComplianceFramework.GDPR],
        isSensitive: false,
        tags: ['retention', 'compliance'],
      });

      await auditLog.save();
    } catch (error) {
      this.logger.error('Error logging retention event:', error);
    }
  }

  /**
   * Get expired data
   */
  private async getExpiredData(tenantId: Types.ObjectId): Promise<any[]> {
    // This would query actual data models
    // For now, return mock data
    return [
      {
        dataId: 'data_1',
        dataType: 'user_profile',
        retentionPolicyId: 'retention_1',
        retentionDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
      },
      {
        dataId: 'data_2',
        dataType: 'audit_log',
        retentionPolicyId: 'retention_2',
        retentionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Expired a week ago
      },
    ];
  }

  /**
   * Get retention policy
   */
  private async getRetentionPolicy(policyId: string): Promise<RetentionPolicy | null> {
    // This would query actual policy models
    // For now, return mock policy
    return {
      policyId,
      tenantId: new Types.ObjectId(),
      dataCategory: 'personal_data',
      retentionPeriod: 2555,
      legalBasis: 'GDPR Article 5',
      disposalMethod: 'anonymize',
      reviewFrequency: 365,
      isActive: true,
      dataTypes: ['user_profile', 'contact_info'],
      retentionTriggers: ['time_based'],
    };
  }

  /**
   * Get anonymization rules
   */
  private async getAnonymizationRules(tenantId: Types.ObjectId, dataType: string): Promise<AnonymizationRule[]> {
    // This would query actual rule models
    // For now, return mock rules
    return [
      {
        ruleId: 'rule_1',
        tenantId,
        dataType,
        fieldName: 'email',
        anonymizationMethod: 'hash',
        isActive: true,
        priority: 1,
      },
      {
        ruleId: 'rule_2',
        tenantId,
        dataType,
        fieldName: 'phone',
        anonymizationMethod: 'mask',
        customPattern: '***-***-****',
        isActive: true,
        priority: 1,
      },
    ];
  }

  /**
   * Apply anonymization rules
   */
  private async applyAnonymizationRules(
    dataId: string,
    dataType: string,
    rules: AnonymizationRule[],
  ): Promise<any> {
    // This would apply actual anonymization rules
    // For now, return mock anonymized data
    return {
      email: 'hashed_email_123',
      phone: '***-***-****',
      name: '***',
      address: '***',
    };
  }

  /**
   * Update data with anonymized version
   */
  private async updateDataWithAnonymizedVersion(
    tenantId: Types.ObjectId,
    dataId: string,
    dataType: string,
    anonymizedData: any,
  ): Promise<void> {
    // This would update actual data models
    this.logger.log(`Updated data ${dataId} with anonymized version`);
  }

  /**
   * Soft delete data
   */
  private async softDeleteData(tenantId: Types.ObjectId, dataId: string, dataType: string): Promise<void> {
    // This would perform soft delete on actual data models
    this.logger.log(`Soft deleted data ${dataId} of type ${dataType}`);
  }

  /**
   * Schedule permanent deletion
   */
  private async schedulePermanentDeletion(
    tenantId: Types.ObjectId,
    dataId: string,
    dataType: string,
    gracePeriodDays: number,
  ): Promise<void> {
    // This would schedule permanent deletion
    this.logger.log(`Scheduled permanent deletion for data ${dataId} in ${gracePeriodDays} days`);
  }

  /**
   * Move data to archive
   */
  private async moveToArchive(tenantId: Types.ObjectId, dataId: string, dataType: string): Promise<void> {
    // This would move data to archive storage
    this.logger.log(`Moved data ${dataId} to archive storage`);
  }

  /**
   * Update data status
   */
  private async updateDataStatus(
    tenantId: Types.ObjectId,
    dataId: string,
    dataType: string,
    status: string,
  ): Promise<void> {
    // This would update data status in actual models
    this.logger.log(`Updated data ${dataId} status to ${status}`);
  }

  /**
   * Calculate retention metrics
   */
  private calculateRetentionMetrics(events: any[]): any {
    const metrics = {
      totalEvents: events.length,
      anonymizedData: 0,
      deletedData: 0,
      archivedData: 0,
      complianceScore: 0,
      retentionViolations: 0,
    };

    events.forEach(event => {
      if (event.metadata?.action === 'data_anonymized') {
        metrics.anonymizedData++;
      } else if (event.metadata?.action === 'data_deleted') {
        metrics.deletedData++;
      } else if (event.metadata?.action === 'data_archived') {
        metrics.archivedData++;
      }
    });

    // Calculate compliance score (simplified)
    metrics.complianceScore = Math.min(100, 100 - metrics.retentionViolations * 5);

    return metrics;
  }

  /**
   * Generate retention recommendations
   */
  private generateRetentionRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.retentionViolations > 0) {
      recommendations.push('Review and update data retention policies');
    }

    if (metrics.complianceScore < 80) {
      recommendations.push('Implement automated retention processing');
    }

    if (metrics.archivedData > metrics.deletedData) {
      recommendations.push('Consider more aggressive data deletion policies');
    }

    return recommendations;
  }
} 