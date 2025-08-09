import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { CommunicationService, SendSmsRequest, SendVoiceRequest, CommunicationResult } from '../services/communication.service';

export interface SendSmsDto {
  to: string;
  from: string;
  body: string;
  leadId?: string;
}

export interface SendVoiceDto {
  to: string;
  from: string;
  twiml: string;
  leadId?: string;
}

export interface SendTemplateDto {
  templateId: string;
  variables: Record<string, string>;
}

@Controller('leads/communication')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CommunicationController {
  constructor(
    private readonly communicationService: CommunicationService,
  ) {}

  /**
   * Send SMS message
   */
  @Post('sms')
  @Roles('admin', 'manager', 'user')
  async sendSms(
    @Body() sendSmsDto: SendSmsDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<CommunicationResult> {
    const request: SendSmsRequest = {
      ...sendSmsDto,
      userId,
      tenantId,
    };

    return await this.communicationService.sendSms(request);
  }

  /**
   * Make voice call
   */
  @Post('voice')
  @Roles('admin', 'manager', 'user')
  async makeVoiceCall(
    @Body() sendVoiceDto: SendVoiceDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<CommunicationResult> {
    const request: SendVoiceRequest = {
      ...sendVoiceDto,
      userId,
      tenantId,
    };

    return await this.communicationService.makeVoiceCall(request);
  }

  /**
   * Send SMS using template
   */
  @Post('sms/template/:leadId')
  @Roles('admin', 'manager', 'user')
  async sendSmsWithTemplate(
    @Param('leadId') leadId: string,
    @Body() sendTemplateDto: SendTemplateDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<CommunicationResult> {
    return await this.communicationService.sendSmsWithTemplate(
      leadId,
      sendTemplateDto.templateId,
      sendTemplateDto.variables,
      userId,
      tenantId,
    );
  }

  /**
   * Make voice call using template
   */
  @Post('voice/template/:leadId')
  @Roles('admin', 'manager', 'user')
  async makeVoiceCallWithTemplate(
    @Param('leadId') leadId: string,
    @Body() sendTemplateDto: SendTemplateDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<CommunicationResult> {
    return await this.communicationService.makeVoiceCallWithTemplate(
      leadId,
      sendTemplateDto.templateId,
      sendTemplateDto.variables,
      userId,
      tenantId,
    );
  }

  /**
   * Get communication templates
   */
  @Get('templates')
  @Roles('admin', 'manager', 'user')
  async getTemplates(@TenantId() tenantId: string) {
    return await this.communicationService.getTemplates(tenantId);
  }

  /**
   * Get communication history for a lead
   */
  @Get('history/:leadId')
  @Roles('admin', 'manager', 'user')
  async getCommunicationHistory(
    @Param('leadId') leadId: string,
    @TenantId() tenantId: string,
  ) {
    return await this.communicationService.getCommunicationHistory(leadId, tenantId);
  }

  /**
   * Get communication statistics
   */
  @Get('stats')
  @Roles('admin', 'manager')
  async getCommunicationStats(@TenantId() tenantId: string) {
    return await this.communicationService.getCommunicationStats(tenantId);
  }

  /**
   * Check Twilio configuration
   */
  @Get('twilio/status')
  @Roles('admin', 'manager')
  async getTwilioStatus() {
    const isConfigured = this.communicationService.isTwilioConfigured();
    const accountInfo = isConfigured ? await this.communicationService.getTwilioAccountInfo() : null;

    return {
      isConfigured,
      accountInfo,
    };
  }

  /**
   * Send SMS to lead
   */
  @Post('lead/:leadId/sms')
  @Roles('admin', 'manager', 'user')
  async sendSmsToLead(
    @Param('leadId') leadId: string,
    @Body() body: { message: string },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<CommunicationResult> {
    // Get lead information
    const lead = await this.communicationService['leadModel'].findById(leadId).exec();
    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    if (!lead.contactInfo?.phone) {
      throw new BadRequestException('Lead has no phone number');
    }

    const request: SendSmsRequest = {
      to: lead.contactInfo.phone,
      from: process.env.TWILIO_PHONE_NUMBER || '',
      body: body.message,
      leadId,
      userId,
      tenantId,
    };

    return await this.communicationService.sendSms(request);
  }

  /**
   * Make voice call to lead
   */
  @Post('lead/:leadId/voice')
  @Roles('admin', 'manager', 'user')
  async makeVoiceCallToLead(
    @Param('leadId') leadId: string,
    @Body() body: { message: string },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<CommunicationResult> {
    // Get lead information
    const lead = await this.communicationService['leadModel'].findById(leadId).exec();
    if (!lead) {
      throw new BadRequestException('Lead not found');
    }

    if (!lead.contactInfo?.phone) {
      throw new BadRequestException('Lead has no phone number');
    }

    const twiml = `<Response><Say>${body.message}</Say></Response>`;

    const request: SendVoiceRequest = {
      to: lead.contactInfo.phone,
      from: process.env.TWILIO_PHONE_NUMBER || '',
      twiml,
      leadId,
      userId,
      tenantId,
    };

    return await this.communicationService.makeVoiceCall(request);
  }

  /**
   * Send bulk SMS to multiple leads
   */
  @Post('bulk/sms')
  @Roles('admin', 'manager')
  async sendBulkSms(
    @Body() body: {
      leadIds: string[];
      message: string;
      templateId?: string;
      variables?: Record<string, string>;
    },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<{
    success: boolean;
    results: CommunicationResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      totalCost: number;
    };
  }> {
    const results: CommunicationResult[] = [];
    let successful = 0;
    let failed = 0;
    let totalCost = 0;

    for (const leadId of body.leadIds) {
      try {
        let result: CommunicationResult;

        if (body.templateId) {
          result = await this.communicationService.sendSmsWithTemplate(
            leadId,
            body.templateId,
            body.variables || {},
            userId,
            tenantId,
          );
        } else {
          // Get lead information
          const lead = await this.communicationService['leadModel'].findById(leadId).exec();
          if (!lead || !lead.contactInfo?.phone) {
            result = {
              success: false,
              error: 'Lead not found or has no phone number',
            };
          } else {
            const request: SendSmsRequest = {
              to: lead.contactInfo.phone,
              from: process.env.TWILIO_PHONE_NUMBER || '',
              body: body.message,
              leadId,
              userId,
              tenantId,
            };
            result = await this.communicationService.sendSms(request);
          }
        }

        results.push(result);
        if (result.success) {
          successful++;
          totalCost += result.cost || 0;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
        });
        failed++;
      }
    }

    return {
      success: failed === 0,
      results,
      summary: {
        total: body.leadIds.length,
        successful,
        failed,
        totalCost,
      },
    };
  }
} 