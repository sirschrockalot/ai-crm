import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditEventType, ComplianceFramework } from '../../modules/security-audit/schemas/audit-log.schema';

export interface GDPRRequest {
  requestId: string;
  tenantId: Types.ObjectId;
  dataSubjectId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description: string;
  legalBasis?: string;
  dataCategories: string[];
  estimatedCompletionDate?: Date;
  completedDate?: Date;
  responseData?: any;
  notes?: string;
}

export interface DataProcessingRecord {
  recordId: string;
  tenantId: Types.ObjectId;
  processingPurpose: string;
  legalBasis: string;
  dataCategories: string[];
  dataSubjects: string[];
  retentionPeriod: number; // in days
  dataSources: string[];
  dataRecipients: string[];
  thirdCountryTransfers: string[];
  safeguards: string[];
  processingStartDate: Date;
  processingEndDate?: Date;
  isActive: boolean;
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigationMeasures: string[];
  };
}

export interface DataRetentionPolicy {
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
}

@Injectable()
export class GDPRComplianceService {
  private readonly logger = new Logger(GDPRComplianceService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
  ) {}

  /**
   * Handle GDPR data subject access request
   */
  async handleAccessRequest(
    tenantId: Types.ObjectId,
    dataSubjectId: string,
    requestId: string,
    userId: Types.ObjectId,
    ipAddress: string,
    userAgent: string,
  ): Promise<GDPRRequest> {
    try {
      // Create GDPR request record
      const gdprRequest: GDPRRequest = {
        requestId,
        tenantId,
        dataSubjectId,
        requestType: 'access',
        requestDate: new Date(),
        status: 'pending',
        description: `Data subject access request for ${dataSubjectId}`,
        legalBasis: 'Article 15 - Right of access',
        dataCategories: ['personal_data', 'contact_info', 'activity_logs'],
        estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      // Log the request
      await this.logGDPREvent(
        tenantId,
        AuditEventType.GDPR_REQUEST,
        userId,
        ipAddress,
        userAgent,
        'gdpr',
        'access_request',
        {
          requestId,
          dataSubjectId,
          requestType: 'access',
        },
      );

      this.logger.log(`GDPR access request created: ${requestId} for data subject: ${dataSubjectId}`);

      return gdprRequest;
    } catch (error) {
      this.logger.error('Error handling GDPR access request:', error);
      throw error;
    }
  }

  /**
   * Handle GDPR data subject erasure request
   */
  async handleErasureRequest(
    tenantId: Types.ObjectId,
    dataSubjectId: string,
    requestId: string,
    userId: Types.ObjectId,
    ipAddress: string,
    userAgent: string,
  ): Promise<GDPRRequest> {
    try {
      // Create GDPR request record
      const gdprRequest: GDPRRequest = {
        requestId,
        tenantId,
        dataSubjectId,
        requestType: 'erasure',
        requestDate: new Date(),
        status: 'pending',
        description: `Data subject erasure request for ${dataSubjectId}`,
        legalBasis: 'Article 17 - Right to erasure',
        dataCategories: ['personal_data', 'contact_info', 'activity_logs'],
        estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      // Log the request
      await this.logGDPREvent(
        tenantId,
        AuditEventType.GDPR_REQUEST,
        userId,
        ipAddress,
        userAgent,
        'gdpr',
        'erasure_request',
        {
          requestId,
          dataSubjectId,
          requestType: 'erasure',
        },
      );

      this.logger.log(`GDPR erasure request created: ${requestId} for data subject: ${dataSubjectId}`);

      return gdprRequest;
    } catch (error) {
      this.logger.error('Error handling GDPR erasure request:', error);
      throw error;
    }
  }

  /**
   * Process data subject data for access request
   */
  async processAccessRequest(
    tenantId: Types.ObjectId,
    requestId: string,
    dataSubjectId: string,
    userId: Types.ObjectId,
  ): Promise<any> {
    try {
      // Collect all personal data for the data subject
      const personalData = await this.collectPersonalData(tenantId, dataSubjectId);

      // Anonymize sensitive data
      const anonymizedData = this.anonymizePersonalData(personalData);

      // Log the data processing
      await this.logGDPREvent(
        tenantId,
        AuditEventType.GDPR_EXPORT,
        userId,
        'system',
        'system',
        'gdpr',
        'data_export',
        {
          requestId,
          dataSubjectId,
          dataCategories: Object.keys(personalData),
        },
      );

      this.logger.log(`GDPR access request processed: ${requestId} for data subject: ${dataSubjectId}`);

      return {
        requestId,
        dataSubjectId,
        exportDate: new Date(),
        dataCategories: Object.keys(personalData),
        data: anonymizedData,
        format: 'json',
        size: JSON.stringify(anonymizedData).length,
      };
    } catch (error) {
      this.logger.error('Error processing GDPR access request:', error);
      throw error;
    }
  }

  /**
   * Process data subject erasure request
   */
  async processErasureRequest(
    tenantId: Types.ObjectId,
    requestId: string,
    dataSubjectId: string,
    userId: Types.ObjectId,
  ): Promise<void> {
    try {
      // Identify all data for the data subject
      const dataToErase = await this.identifyDataForErasure(tenantId, dataSubjectId);

      // Perform data erasure
      await this.erasePersonalData(tenantId, dataSubjectId, dataToErase);

      // Log the erasure
      await this.logGDPREvent(
        tenantId,
        AuditEventType.GDPR_DELETION,
        userId,
        'system',
        'system',
        'gdpr',
        'data_erasure',
        {
          requestId,
          dataSubjectId,
          erasedDataCategories: Object.keys(dataToErase),
        },
      );

      this.logger.log(`GDPR erasure request processed: ${requestId} for data subject: ${dataSubjectId}`);
    } catch (error) {
      this.logger.error('Error processing GDPR erasure request:', error);
      throw error;
    }
  }

  /**
   * Create data processing record
   */
  async createDataProcessingRecord(
    tenantId: Types.ObjectId,
    processingPurpose: string,
    legalBasis: string,
    dataCategories: string[],
    dataSubjects: string[],
    retentionPeriod: number,
    userId: Types.ObjectId,
  ): Promise<DataProcessingRecord> {
    try {
      const record: DataProcessingRecord = {
        recordId: `dpr_${Date.now()}`,
        tenantId,
        processingPurpose,
        legalBasis,
        dataCategories,
        dataSubjects,
        retentionPeriod,
        dataSources: [],
        dataRecipients: [],
        thirdCountryTransfers: [],
        safeguards: [],
        processingStartDate: new Date(),
        isActive: true,
      };

      // Log the creation
      await this.logGDPREvent(
        tenantId,
        AuditEventType.CONFIGURATION_CHANGE,
        userId,
        'system',
        'system',
        'gdpr',
        'processing_record_created',
        {
          recordId: record.recordId,
          processingPurpose,
          legalBasis,
        },
      );

      this.logger.log(`Data processing record created: ${record.recordId}`);

      return record;
    } catch (error) {
      this.logger.error('Error creating data processing record:', error);
      throw error;
    }
  }

  /**
   * Create data retention policy
   */
  async createDataRetentionPolicy(
    tenantId: Types.ObjectId,
    dataCategory: string,
    retentionPeriod: number,
    legalBasis: string,
    disposalMethod: 'delete' | 'anonymize' | 'archive',
    userId: Types.ObjectId,
  ): Promise<DataRetentionPolicy> {
    try {
      const policy: DataRetentionPolicy = {
        policyId: `drp_${Date.now()}`,
        tenantId,
        dataCategory,
        retentionPeriod,
        legalBasis,
        disposalMethod,
        reviewFrequency: 365, // 1 year
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      };

      // Log the creation
      await this.logGDPREvent(
        tenantId,
        AuditEventType.CONFIGURATION_CHANGE,
        userId,
        'system',
        'system',
        'gdpr',
        'retention_policy_created',
        {
          policyId: policy.policyId,
          dataCategory,
          retentionPeriod,
        },
      );

      this.logger.log(`Data retention policy created: ${policy.policyId}`);

      return policy;
    } catch (error) {
      this.logger.error('Error creating data retention policy:', error);
      throw error;
    }
  }

  /**
   * Generate GDPR compliance report
   */
  async generateComplianceReport(
    tenantId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    userId: Types.ObjectId,
  ): Promise<any> {
    try {
      // Get GDPR-related audit events
      const gdprEvents = await this.auditLogModel.find({
        tenantId,
        complianceFrameworks: ComplianceFramework.GDPR,
        timestamp: { $gte: startDate, $lte: endDate },
      }).sort({ timestamp: -1 });

      // Calculate compliance metrics
      const metrics = this.calculateGDPRMetrics(gdprEvents);

      // Generate report
      const report = {
        reportId: `gdpr_report_${Date.now()}`,
        tenantId,
        period: { startDate, endDate },
        generatedAt: new Date(),
        generatedBy: userId,
        metrics,
        events: gdprEvents.length,
        recommendations: this.generateGDPRRecommendations(metrics),
      };

      // Log the report generation
      await this.logGDPREvent(
        tenantId,
        AuditEventType.COMPLIANCE_REPORT,
        userId,
        'system',
        'system',
        'gdpr',
        'compliance_report_generated',
        {
          reportId: report.reportId,
          period: { startDate, endDate },
        },
      );

      this.logger.log(`GDPR compliance report generated: ${report.reportId}`);

      return report;
    } catch (error) {
      this.logger.error('Error generating GDPR compliance report:', error);
      throw error;
    }
  }

  /**
   * Log GDPR-related audit event
   */
  private async logGDPREvent(
    tenantId: Types.ObjectId,
    eventType: AuditEventType,
    userId: Types.ObjectId,
    ipAddress: string,
    userAgent: string,
    resource: string,
    action: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      const auditLog = new this.auditLogModel({
        tenantId,
        eventType,
        eventName: `GDPR ${action.replace('_', ' ')}`,
        description: `GDPR compliance event: ${action}`,
        severity: 'medium',
        userId,
        ipAddress,
        userAgent,
        resource,
        action,
        metadata,
        complianceFrameworks: [ComplianceFramework.GDPR],
        isSensitive: true,
        tags: ['gdpr', 'compliance'],
      });

      await auditLog.save();
    } catch (error) {
      this.logger.error('Error logging GDPR event:', error);
    }
  }

  /**
   * Collect personal data for a data subject
   */
  private async collectPersonalData(tenantId: Types.ObjectId, dataSubjectId: string): Promise<any> {
    // This would integrate with actual data models
    // For now, return mock data
    return {
      personal_data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
      },
      contact_info: {
        address: '123 Main St, City, State',
        emergency_contact: 'Jane Doe',
      },
      activity_logs: [
        { timestamp: new Date(), action: 'login', ip: '192.168.1.1' },
        { timestamp: new Date(), action: 'data_access', resource: 'leads' },
      ],
    };
  }

  /**
   * Anonymize personal data
   */
  private anonymizePersonalData(data: any): any {
    const anonymized = { ...data };

    // Anonymize personal data
    if (anonymized.personal_data) {
      anonymized.personal_data.name = '***';
      anonymized.personal_data.email = '***@***.com';
      anonymized.personal_data.phone = '***-***-****';
    }

    // Anonymize contact info
    if (anonymized.contact_info) {
      anonymized.contact_info.address = '***';
      anonymized.contact_info.emergency_contact = '***';
    }

    // Anonymize activity logs
    if (anonymized.activity_logs) {
      anonymized.activity_logs = anonymized.activity_logs.map((log: any) => ({
        ...log,
        ip: '***.***.***.***',
      }));
    }

    return anonymized;
  }

  /**
   * Identify data for erasure
   */
  private async identifyDataForErasure(tenantId: Types.ObjectId, dataSubjectId: string): Promise<any> {
    // This would query actual data models
    // For now, return mock data structure
    return {
      users: [`user_${dataSubjectId}`],
      leads: [`lead_${dataSubjectId}`],
      sessions: [`session_${dataSubjectId}`],
      audit_logs: [`audit_${dataSubjectId}`],
    };
  }

  /**
   * Erase personal data
   */
  private async erasePersonalData(tenantId: Types.ObjectId, dataSubjectId: string, dataToErase: any): Promise<void> {
    // This would perform actual data deletion
    // For now, just log the erasure
    this.logger.log(`Erasing data for subject ${dataSubjectId}:`, dataToErase);
  }

  /**
   * Calculate GDPR compliance metrics
   */
  private calculateGDPRMetrics(events: any[]): any {
    const metrics = {
      totalRequests: 0,
      accessRequests: 0,
      erasureRequests: 0,
      averageProcessingTime: 0,
      complianceScore: 0,
      dataBreaches: 0,
      retentionViolations: 0,
    };

    events.forEach(event => {
      if (event.eventType === AuditEventType.GDPR_REQUEST) {
        metrics.totalRequests++;
        if (event.metadata?.requestType === 'access') {
          metrics.accessRequests++;
        } else if (event.metadata?.requestType === 'erasure') {
          metrics.erasureRequests++;
        }
      }
    });

    // Calculate compliance score (simplified)
    metrics.complianceScore = Math.min(100, 100 - metrics.dataBreaches * 10 - metrics.retentionViolations * 5);

    return metrics;
  }

  /**
   * Generate GDPR compliance recommendations
   */
  private generateGDPRRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.dataBreaches > 0) {
      recommendations.push('Implement additional data protection measures');
    }

    if (metrics.retentionViolations > 0) {
      recommendations.push('Review and update data retention policies');
    }

    if (metrics.averageProcessingTime > 30) {
      recommendations.push('Optimize GDPR request processing workflows');
    }

    if (metrics.complianceScore < 80) {
      recommendations.push('Conduct comprehensive GDPR compliance audit');
    }

    return recommendations;
  }
} 