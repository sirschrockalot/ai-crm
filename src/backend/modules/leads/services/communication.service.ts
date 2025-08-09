import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as twilio from 'twilio';
import { Lead } from '../schemas/lead.schema';
import { CommunicationTrackingService } from './communication-tracking.service';

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'voice';
  content: string;
  variables: string[];
  isActive: boolean;
  tenantId: string;
}

export interface SendSmsRequest {
  to: string;
  from: string;
  body: string;
  leadId?: string;
  userId: string;
  tenantId: string;
}

export interface SendVoiceRequest {
  to: string;
  from: string;
  twiml: string;
  leadId?: string;
  userId: string;
  tenantId: string;
}

export interface CommunicationResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  cost?: number;
}

export interface CommunicationLog {
  id: string;
  leadId?: string;
  userId: string;
  tenantId: string;
  type: 'sms' | 'voice' | 'email';
  direction: 'outbound' | 'inbound';
  to: string;
  from: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  messageId?: string;
  cost?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);
  private twilioClient: twilio.Twilio;

  constructor(
    private configService: ConfigService,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    private communicationTrackingService: CommunicationTrackingService,
  ) {
    // Initialize Twilio client
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not configured. Communication features will be disabled.');
    }
  }

  /**
   * Send SMS message
   */
  async sendSms(request: SendSmsRequest): Promise<CommunicationResult> {
    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    try {
      // Validate phone number
      const validatedNumber = this.validatePhoneNumber(request.to);
      if (!validatedNumber) {
        throw new BadRequestException('Invalid phone number format');
      }

      // Log communication attempt
      const logEntry = await this.communicationTrackingService.logCommunication({
        leadId: request.leadId ? new Types.ObjectId(request.leadId) : undefined,
        userId: request.userId,
        tenantId: request.tenantId,
        type: 'sms',
        direction: 'outbound',
        to: validatedNumber,
        from: request.from,
        content: request.body,
        status: 'queued',
      });

      // Send SMS via Twilio
      const message = await this.twilioClient.messages.create({
        body: request.body,
        from: request.from,
        to: validatedNumber,
      });

      // Update log with result
      await this.communicationTrackingService.updateCommunicationStatus(
        logEntry.messageId || message.sid,
        message.status as any,
      );

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        cost: parseFloat(message.price || '0'),
      };
    } catch (error) {
      this.logger.error('SMS sending failed:', error);

      // Update log with error
      if (request.leadId) {
        await this.communicationTrackingService.updateCommunicationStatus(
          'temp-id',
          'failed',
          error.message,
        );
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Make voice call
   */
  async makeVoiceCall(request: SendVoiceRequest): Promise<CommunicationResult> {
    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    try {
      // Validate phone number
      const validatedNumber = this.validatePhoneNumber(request.to);
      if (!validatedNumber) {
        throw new BadRequestException('Invalid phone number format');
      }

      // Log communication attempt
      const logEntry = await this.communicationTrackingService.logCommunication({
        leadId: request.leadId ? new Types.ObjectId(request.leadId) : undefined,
        userId: request.userId,
        tenantId: request.tenantId,
        type: 'voice',
        direction: 'outbound',
        to: validatedNumber,
        from: request.from,
        content: request.twiml,
        status: 'queued',
      });

      // Make voice call via Twilio
      const call = await this.twilioClient.calls.create({
        twiml: request.twiml,
        from: request.from,
        to: validatedNumber,
      });

      // Update log with result
      await this.communicationTrackingService.updateCommunicationStatus(
        logEntry.messageId || call.sid,
        call.status as any,
      );

      return {
        success: true,
        messageId: call.sid,
        status: call.status,
        cost: parseFloat(call.price || '0'),
      };
    } catch (error) {
      this.logger.error('Voice call failed:', error);

      // Update log with error
      if (request.leadId) {
        await this.communicationTrackingService.updateCommunicationStatus(
          'temp-id',
          'failed',
          error.message,
        );
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send SMS using template
   */
  async sendSmsWithTemplate(
    leadId: string,
    templateId: string,
    variables: Record<string, string>,
    userId: string,
    tenantId: string,
  ): Promise<CommunicationResult> {
    // Get lead information
    const lead = await this.leadModel.findById(leadId).exec();
    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    if (!lead.contactInfo?.phone) {
      throw new BadRequestException('Lead has no phone number');
    }

    // Get template (in real implementation, this would come from database)
    const template = await this.getTemplate(templateId, tenantId);
    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // Replace variables in template
    let content = template.content;
    Object.keys(variables).forEach(key => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });

    // Send SMS
    return await this.sendSms({
      to: lead.contactInfo.phone,
      from: this.configService.get<string>('TWILIO_PHONE_NUMBER') || '',
      body: content,
      leadId,
      userId,
      tenantId,
    });
  }

  /**
   * Make voice call using template
   */
  async makeVoiceCallWithTemplate(
    leadId: string,
    templateId: string,
    variables: Record<string, string>,
    userId: string,
    tenantId: string,
  ): Promise<CommunicationResult> {
    // Get lead information
    const lead = await this.leadModel.findById(leadId).exec();
    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    if (!lead.contactInfo?.phone) {
      throw new BadRequestException('Lead has no phone number');
    }

    // Get template (in real implementation, this would come from database)
    const template = await this.getTemplate(templateId, tenantId);
    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // Replace variables in template
    let twiml = template.content;
    Object.keys(variables).forEach(key => {
      twiml = twiml.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });

    // Make voice call
    return await this.makeVoiceCall({
      to: lead.contactInfo.phone,
      from: this.configService.get<string>('TWILIO_PHONE_NUMBER') || '',
      twiml,
      leadId,
      userId,
      tenantId,
    });
  }

  /**
   * Get communication templates
   */
  async getTemplates(tenantId: string): Promise<CommunicationTemplate[]> {
    // In real implementation, this would fetch from database
    return [
      {
        id: 'welcome-sms',
        name: 'Welcome SMS',
        type: 'sms',
        content: 'Hi {{firstName}}, welcome to our service! We\'re excited to work with you.',
        variables: ['firstName'],
        isActive: true,
        tenantId,
      },
      {
        id: 'follow-up-sms',
        name: 'Follow-up SMS',
        type: 'sms',
        content: 'Hi {{firstName}}, just following up on our conversation. When would be a good time to call?',
        variables: ['firstName'],
        isActive: true,
        tenantId,
      },
      {
        id: 'voice-greeting',
        name: 'Voice Greeting',
        type: 'voice',
        content: '<Response><Say>Hello {{firstName}}, this is a call from our team. Please call us back at {{phoneNumber}}.</Say></Response>',
        variables: ['firstName', 'phoneNumber'],
        isActive: true,
        tenantId,
      },
    ];
  }

  /**
   * Get communication history for a lead
   */
  async getCommunicationHistory(leadId: string, tenantId: string): Promise<CommunicationLog[]> {
    return await this.communicationTrackingService.getCommunicationHistory(leadId, tenantId);
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats(tenantId: string): Promise<{
    totalSms: number;
    totalVoice: number;
    totalCost: number;
    successRate: number;
  }> {
    const stats = await this.communicationTrackingService.getCommunicationStats(tenantId);
    return {
      totalSms: stats.totalSms,
      totalVoice: stats.totalVoice,
      totalCost: stats.totalCost,
      successRate: stats.successRate,
    };
  }

  /**
   * Get communication analytics
   */
  async getCommunicationAnalytics(tenantId: string, dateFrom?: Date, dateTo?: Date) {
    return await this.communicationTrackingService.getCommunicationAnalytics(tenantId, dateFrom, dateTo);
  }

  /**
   * Search communications
   */
  async searchCommunications(tenantId: string, filters: any, limit: number = 50, offset: number = 0) {
    return await this.communicationTrackingService.searchCommunications(tenantId, filters, limit, offset);
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis(tenantId: string, dateFrom?: Date, dateTo?: Date) {
    return await this.communicationTrackingService.getCostAnalysis(tenantId, dateFrom, dateTo);
  }

  /**
   * Validate phone number format
   */
  private validatePhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid US number
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // Check if it's already in international format
    if (phone.startsWith('+')) {
      return phone;
    }
    
    return null;
  }

  /**
   * Get template by ID
   */
  private async getTemplate(templateId: string, tenantId: string): Promise<CommunicationTemplate | null> {
    const templates = await this.getTemplates(tenantId);
    return templates.find(t => t.id === templateId) || null;
  }

  /**
   * Check if Twilio is configured
   */
  isTwilioConfigured(): boolean {
    return !!this.twilioClient;
  }

  /**
   * Get Twilio account information
   */
  async getTwilioAccountInfo(): Promise<{
    accountSid: string;
    phoneNumbers: string[];
    balance: number;
  } | null> {
    if (!this.twilioClient) {
      return null;
    }

    try {
      const account = await this.twilioClient.api.accounts(this.configService.get<string>('TWILIO_ACCOUNT_SID')).fetch();
      const incomingPhoneNumbers = await this.twilioClient.incomingPhoneNumbers.list();
      
      return {
        accountSid: account.sid,
        phoneNumbers: incomingPhoneNumbers.map(p => p.phoneNumber),
        balance: parseFloat((account.balance as any) || '0'),
      };
    } catch (error) {
      this.logger.error('Failed to get Twilio account info:', error);
      return null;
    }
  }
} 