import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface SendSmsRequest {
  to: string;
  from: string;
  body: string;
  leadId?: string;
}

export interface SendVoiceRequest {
  to: string;
  from: string;
  twiml: string;
  leadId?: string;
}

export interface CommunicationResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  cost?: number;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'voice';
  content: string;
  variables: string[];
  isActive: boolean;
  tenantId: string;
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

export interface BulkSmsRequest {
  leadIds: string[];
  message: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export interface BulkSmsResult {
  success: boolean;
  results: CommunicationResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalCost: number;
  };
}

class CommunicationService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Send SMS message
   */
  async sendSms(request: SendSmsRequest): Promise<CommunicationResult> {
    try {
      const response = await this.api.post('/leads/communication/sms', request);
      return response.data;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  /**
   * Make voice call
   */
  async makeVoiceCall(request: SendVoiceRequest): Promise<CommunicationResult> {
    try {
      const response = await this.api.post('/leads/communication/voice', request);
      return response.data;
    } catch (error) {
      console.error('Voice call failed:', error);
      throw error;
    }
  }

  /**
   * Send SMS to lead
   */
  async sendSmsToLead(leadId: string, message: string): Promise<CommunicationResult> {
    try {
      const response = await this.api.post(`/leads/communication/lead/${leadId}/sms`, {
        message,
      });
      return response.data;
    } catch (error) {
      console.error('SMS to lead failed:', error);
      throw error;
    }
  }

  /**
   * Make voice call to lead
   */
  async makeVoiceCallToLead(leadId: string, message: string): Promise<CommunicationResult> {
    try {
      const response = await this.api.post(`/leads/communication/lead/${leadId}/voice`, {
        message,
      });
      return response.data;
    } catch (error) {
      console.error('Voice call to lead failed:', error);
      throw error;
    }
  }

  /**
   * Send SMS using template
   */
  async sendSmsWithTemplate(
    leadId: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<CommunicationResult> {
    try {
      const response = await this.api.post(`/leads/communication/sms/template/${leadId}`, {
        templateId,
        variables,
      });
      return response.data;
    } catch (error) {
      console.error('SMS with template failed:', error);
      throw error;
    }
  }

  /**
   * Make voice call using template
   */
  async makeVoiceCallWithTemplate(
    leadId: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<CommunicationResult> {
    try {
      const response = await this.api.post(`/leads/communication/voice/template/${leadId}`, {
        templateId,
        variables,
      });
      return response.data;
    } catch (error) {
      console.error('Voice call with template failed:', error);
      throw error;
    }
  }

  /**
   * Get communication templates
   */
  async getTemplates(): Promise<CommunicationTemplate[]> {
    try {
      const response = await this.api.get('/leads/communication/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to get templates:', error);
      throw error;
    }
  }

  /**
   * Get communication history for a lead
   */
  async getCommunicationHistory(leadId: string): Promise<CommunicationLog[]> {
    try {
      const response = await this.api.get(`/leads/communication/history/${leadId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get communication history:', error);
      throw error;
    }
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats(): Promise<{
    totalSms: number;
    totalVoice: number;
    totalCost: number;
    successRate: number;
  }> {
    try {
      const response = await this.api.get('/leads/communication/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get communication stats:', error);
      throw error;
    }
  }

  /**
   * Check Twilio configuration status
   */
  async getTwilioStatus(): Promise<{
    isConfigured: boolean;
    accountInfo?: {
      accountSid: string;
      phoneNumbers: string[];
      balance: number;
    };
  }> {
    try {
      const response = await this.api.get('/leads/communication/twilio/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get Twilio status:', error);
      throw error;
    }
  }

  /**
   * Send bulk SMS to multiple leads
   */
  async sendBulkSms(request: BulkSmsRequest): Promise<BulkSmsResult> {
    try {
      const response = await this.api.post('/leads/communication/bulk/sms', request);
      return response.data;
    } catch (error) {
      console.error('Bulk SMS failed:', error);
      throw error;
    }
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as US phone number
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    return phone;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
  }

  /**
   * Get template variables from content
   */
  extractTemplateVariables(content: string): string[] {
    const variables: string[] = [];
    const regex = /\{\{(\w+)\}\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }

  /**
   * Replace template variables
   */
  replaceTemplateVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    Object.keys(variables).forEach(key => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });
    return result;
  }
}

export const communicationService = new CommunicationService();
export default communicationService; 