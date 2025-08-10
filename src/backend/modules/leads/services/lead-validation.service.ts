import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLeadDto, UpdateLeadDto } from '../dto/lead.dto';
import { Lead, LeadStatus, LeadSource, LeadPriority, PropertyType, TransactionType } from '../schemas/lead.schema';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface DataQualityMetrics {
  totalFields: number;
  validFields: number;
  invalidFields: number;
  qualityScore: number;
  duplicateCount: number;
  normalizedFields: number;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  duplicateLeads: Lead[];
  confidence: number;
  matchCriteria: string[];
}

@Injectable()
export class LeadValidationService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
  ) {}

  /**
   * Validate lead creation data
   */
  async validateCreateLead(createLeadDto: CreateLeadDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Field validation
    errors.push(...this.validateRequiredFields(createLeadDto));
    errors.push(...this.validateContactInfo(createLeadDto.contactInfo));
    errors.push(...this.validatePropertyPreferences(createLeadDto.propertyPreferences));
    errors.push(...this.validateFinancialInfo(createLeadDto.financialInfo));

    // Business logic validation
    errors.push(...this.validateBusinessRules(createLeadDto));

    // Cross-field validation
    errors.push(...this.validateCrossFields(createLeadDto));

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate lead update data
   */
  async validateUpdateLead(updateLeadDto: UpdateLeadDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Field validation for provided fields
    if (updateLeadDto.contactInfo) {
      errors.push(...this.validateContactInfo(updateLeadDto.contactInfo));
    }

    if (updateLeadDto.propertyPreferences) {
      errors.push(...this.validatePropertyPreferences(updateLeadDto.propertyPreferences));
    }

    if (updateLeadDto.financialInfo) {
      errors.push(...this.validateFinancialInfo(updateLeadDto.financialInfo));
    }

    // Business logic validation
    errors.push(...this.validateBusinessRules(updateLeadDto));

    // Cross-field validation
    errors.push(...this.validateCrossFields(updateLeadDto));

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(leadData: CreateLeadDto): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!leadData.contactInfo?.firstName?.trim()) {
      errors.push({
        field: 'contactInfo.firstName',
        message: 'First name is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!leadData.contactInfo?.lastName?.trim()) {
      errors.push({
        field: 'contactInfo.lastName',
        message: 'Last name is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!leadData.contactInfo?.email?.trim()) {
      errors.push({
        field: 'contactInfo.email',
        message: 'Email is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!leadData.contactInfo?.phone?.trim()) {
      errors.push({
        field: 'contactInfo.phone',
        message: 'Phone number is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!leadData.status) {
      errors.push({
        field: 'status',
        message: 'Lead status is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!leadData.source) {
      errors.push({
        field: 'source',
        message: 'Lead source is required',
        code: 'REQUIRED_FIELD',
      });
    }

    return errors;
  }

  /**
   * Validate contact information
   */
  private validateContactInfo(contactInfo: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!contactInfo) {
      return errors;
    }

    // Email validation
    if (contactInfo.email && !this.isValidEmail(contactInfo.email)) {
      errors.push({
        field: 'contactInfo.email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    // Phone validation
    if (contactInfo.phone && !this.isValidPhone(contactInfo.phone)) {
      errors.push({
        field: 'contactInfo.phone',
        message: 'Invalid phone number format',
        code: 'INVALID_PHONE',
      });
    }

    // Address validation
    if (contactInfo.address) {
      errors.push(...this.validateAddress(contactInfo.address));
    }

    // Preferred contact method validation
    if (contactInfo.preferredContactMethod) {
      const validMethods = ['email', 'phone', 'sms', 'mail'];
      if (!validMethods.includes(contactInfo.preferredContactMethod)) {
        errors.push({
          field: 'contactInfo.preferredContactMethod',
          message: 'Invalid preferred contact method',
          code: 'INVALID_CONTACT_METHOD',
        });
      }
    }

    return errors;
  }

  /**
   * Validate property preferences
   */
  private validatePropertyPreferences(propertyPreferences: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!propertyPreferences) {
      return errors;
    }

    // Property type validation
    if (propertyPreferences.propertyType) {
      const validTypes = Object.values(PropertyType);
      for (const type of propertyPreferences.propertyType) {
        if (!validTypes.includes(type)) {
          errors.push({
            field: 'propertyPreferences.propertyType',
            message: `Invalid property type: ${type}`,
            code: 'INVALID_PROPERTY_TYPE',
          });
        }
      }
    }

    // Transaction type validation
    if (propertyPreferences.transactionType) {
      const validTransactionTypes = Object.values(TransactionType);
      if (!validTransactionTypes.includes(propertyPreferences.transactionType)) {
        errors.push({
          field: 'propertyPreferences.transactionType',
          message: 'Invalid transaction type',
          code: 'INVALID_TRANSACTION_TYPE',
          });
      }
    }

    // Price range validation
    if (propertyPreferences.minPrice && propertyPreferences.maxPrice) {
      if (propertyPreferences.minPrice > propertyPreferences.maxPrice) {
        errors.push({
          field: 'propertyPreferences.priceRange',
          message: 'Minimum price cannot be greater than maximum price',
          code: 'INVALID_PRICE_RANGE',
        });
      }
    }

    return errors;
  }

  /**
   * Validate financial information
   */
  private validateFinancialInfo(financialInfo: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!financialInfo) {
      return errors;
    }

    // Employment status validation
    if (financialInfo.employmentStatus) {
      const validStatuses = ['employed', 'self_employed', 'retired', 'unemployed', 'student', 'other'];
      if (!validStatuses.includes(financialInfo.employmentStatus)) {
        errors.push({
          field: 'financialInfo.employmentStatus',
          message: 'Invalid employment status',
          code: 'INVALID_EMPLOYMENT_STATUS',
        });
      }
    }

    // Loan type validation
    if (financialInfo.loanType) {
      const validLoanTypes = ['conventional', 'fha', 'va', 'usda', 'jumbo', 'other'];
      if (!validLoanTypes.includes(financialInfo.loanType)) {
        errors.push({
          field: 'financialInfo.loanType',
          message: 'Invalid loan type',
          code: 'INVALID_LOAN_TYPE',
        });
      }
    }

    // Credit score validation
    if (financialInfo.creditScore && (financialInfo.creditScore < 300 || financialInfo.creditScore > 850)) {
      errors.push({
        field: 'financialInfo.creditScore',
        message: 'Credit score must be between 300 and 850',
        code: 'INVALID_CREDIT_SCORE',
      });
    }

    return errors;
  }

  /**
   * Validate address
   */
  private validateAddress(address: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!address) {
      return errors;
    }

    if (!address.street?.trim()) {
      errors.push({
        field: 'address.street',
        message: 'Street address is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!address.city?.trim()) {
      errors.push({
        field: 'address.city',
        message: 'City is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!address.state?.trim()) {
      errors.push({
        field: 'address.state',
        message: 'State is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!address.zipCode?.trim()) {
      errors.push({
        field: 'address.zipCode',
        message: 'ZIP code is required',
        code: 'REQUIRED_FIELD',
      });
    } else if (!this.isValidZipCode(address.zipCode)) {
      errors.push({
        field: 'address.zipCode',
        message: 'Invalid ZIP code format',
        code: 'INVALID_ZIP_CODE',
      });
    }

    return errors;
  }

  /**
   * Validate business rules
   */
  private validateBusinessRules(leadData: CreateLeadDto | UpdateLeadDto): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate status transitions if status is being updated
    if (leadData.status) {
      // This would need the current lead status from the database
      // For now, we'll validate that the status is valid
      const validStatuses = Object.values(LeadStatus);
      if (!validStatuses.includes(leadData.status)) {
        errors.push({
          field: 'status',
          message: 'Invalid lead status',
          code: 'INVALID_STATUS',
        });
      }
    }

    // Validate source if provided
    if (leadData.source) {
      const validSources = Object.values(LeadSource);
      if (!validSources.includes(leadData.source)) {
        errors.push({
          field: 'source',
          message: 'Invalid lead source',
          code: 'INVALID_SOURCE',
        });
      }
    }

    // Validate priority if provided
    if (leadData.priority) {
      const validPriorities = Object.values(LeadPriority);
      if (!validPriorities.includes(leadData.priority)) {
        errors.push({
          field: 'priority',
          message: 'Invalid lead priority',
          code: 'INVALID_PRIORITY',
        });
      }
    }

    return errors;
  }

  /**
   * Validate cross-field relationships
   */
  private validateCrossFields(leadData: CreateLeadDto | UpdateLeadDto): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate that if financial info is provided, required fields are present
    if (leadData.financialInfo) {
      if (leadData.financialInfo.preApproved && !leadData.financialInfo.preApprovalAmount) {
        errors.push({
          field: 'financialInfo.preApprovalAmount',
          message: 'Pre-approval amount is required when pre-approved is true',
          code: 'MISSING_PREAPPROVAL_AMOUNT',
        });
      }
    }

    return errors;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's a valid US phone number (10 or 11 digits)
    if (digitsOnly.length === 10 || digitsOnly.length === 11) {
      return true;
    }

    // Check for international format
    const internationalRegex = /^\+[1-9]\d{1,14}$/;
    return internationalRegex.test(phone);
  }

  /**
   * Validate ZIP code format
   */
  private isValidZipCode(zipCode: string): boolean {
    // US ZIP code format (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  /**
   * Normalize company name
   */
  normalizeCompanyName(companyName: string): string {
    if (!companyName) return '';

    return companyName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s]/g, '') // Remove special characters except spaces
      .replace(/\b(inc|corp|corporation|company|co|llc|ltd|limited)\b/g, '') // Remove common business suffixes
      .trim();
  }

  /**
   * Detect duplicates based on multiple criteria
   */
  async detectDuplicates(leadData: Partial<Lead>, tenantId: string): Promise<DuplicateDetectionResult> {
    const duplicateLeads: Lead[] = [];
    const matchCriteria: string[] = [];
    let confidence = 0;

    // Check by email (highest confidence)
    if (leadData.contactInfo?.email) {
      const emailMatches = await this.leadModel.find({
        'contactInfo.email': leadData.contactInfo.email,
        tenantId,
        deletedAt: { $exists: false },
      }).exec();

      if (emailMatches.length > 0) {
        duplicateLeads.push(...emailMatches);
        matchCriteria.push('email');
        confidence = Math.max(confidence, 0.9);
      }
    }

    // Check by phone number (high confidence)
    if (leadData.contactInfo?.phone) {
      const normalizedPhone = this.normalizePhoneNumber(leadData.contactInfo.phone);
      const phoneMatches = await this.leadModel.find({
        'contactInfo.phone': { $regex: normalizedPhone.replace(/\D/g, '') },
        tenantId,
        deletedAt: { $exists: false },
      }).exec();

      if (phoneMatches.length > 0) {
        duplicateLeads.push(...phoneMatches);
        matchCriteria.push('phone');
        confidence = Math.max(confidence, 0.8);
      }
    }

    // Check by name and address (medium confidence)
    if (leadData.contactInfo?.firstName && leadData.contactInfo?.lastName && leadData.contactInfo?.address) {
      const nameMatches = await this.leadModel.find({
        'contactInfo.firstName': { $regex: leadData.contactInfo.firstName, $options: 'i' },
        'contactInfo.lastName': { $regex: leadData.contactInfo.lastName, $options: 'i' },
        'contactInfo.address.street': { $regex: leadData.contactInfo.address.street, $options: 'i' },
        tenantId,
        deletedAt: { $exists: false },
      }).exec();

      if (nameMatches.length > 0) {
        duplicateLeads.push(...nameMatches);
        matchCriteria.push('name_and_address');
        confidence = Math.max(confidence, 0.7);
      }
    }

    // Remove duplicates from the array
    const uniqueDuplicates = duplicateLeads.filter((lead, index, self) => 
      index === self.findIndex(l => l._id?.toString() === lead._id?.toString())
    );

    return {
      isDuplicate: uniqueDuplicates.length > 0,
      duplicateLeads: uniqueDuplicates,
      confidence,
      matchCriteria,
    };
  }

  /**
   * Clean and normalize lead data
   */
  cleanseLeadData(leadData: Partial<Lead>): Partial<Lead> {
    const cleansed = { ...leadData };

    // Clean contact info
    if (cleansed.contactInfo) {
      if (cleansed.contactInfo.firstName) {
        cleansed.contactInfo.firstName = this.normalizeName(cleansed.contactInfo.firstName);
      }
      if (cleansed.contactInfo.lastName) {
        cleansed.contactInfo.lastName = this.normalizeName(cleansed.contactInfo.lastName);
      }
      if (cleansed.contactInfo.email) {
        cleansed.contactInfo.email = cleansed.contactInfo.email.toLowerCase().trim();
      }
      if (cleansed.contactInfo.phone) {
        cleansed.contactInfo.phone = this.normalizePhoneNumber(cleansed.contactInfo.phone);
      }
      if (cleansed.contactInfo.address) {
        cleansed.contactInfo.address = this.normalizeAddress(cleansed.contactInfo.address);
      }
    }

    // Clean company name if present
    // Note: companyName is not part of ContactInfo interface, so we'll skip this

    // Normalize status and priority
    if (cleansed.status) {
      cleansed.status = cleansed.status.toLowerCase() as LeadStatus;
    }
    if (cleansed.priority) {
      cleansed.priority = cleansed.priority.toLowerCase() as LeadPriority;
    }
    if (cleansed.source) {
      cleansed.source = cleansed.source.toLowerCase() as LeadSource;
    }

    return cleansed;
  }

  /**
   * Calculate data quality metrics
   */
  calculateDataQualityMetrics(leadData: Partial<Lead>): DataQualityMetrics {
    const fields = this.flattenObject(leadData);
    const totalFields = Object.keys(fields).length;
    let validFields = 0;
    let invalidFields = 0;
    let normalizedFields = 0;

    for (const [key, value] of Object.entries(fields)) {
      if (value !== null && value !== undefined && value !== '') {
        validFields++;
      } else {
        invalidFields++;
      }

      // Check if field was normalized
      if (this.isNormalizedField(key, value)) {
        normalizedFields++;
      }
    }

    const qualityScore = totalFields > 0 ? (validFields / totalFields) * 100 : 0;

    return {
      totalFields,
      validFields,
      invalidFields,
      qualityScore,
      duplicateCount: 0, // This would be calculated separately
      normalizedFields,
    };
  }

  /**
   * Generate comprehensive validation report
   */
  async generateValidationReport(leadData: Partial<Lead>, tenantId: string): Promise<{
    validationResult: ValidationResult;
    duplicateResult: DuplicateDetectionResult;
    qualityMetrics: DataQualityMetrics;
    recommendations: string[];
  }> {
    // Validate the data - ensure proper type conversion
    const createLeadData = {
      ...leadData,
      assignedTo: typeof leadData.assignedTo === 'object' ? leadData.assignedTo.toString() : leadData.assignedTo,
    } as CreateLeadDto;
    const validationResult = await this.validateCreateLead(createLeadData);

    // Detect duplicates
    const duplicateResult = await this.detectDuplicates(leadData, tenantId);

    // Calculate quality metrics
    const qualityMetrics = this.calculateDataQualityMetrics(leadData);

    // Generate recommendations
    const recommendations = this.generateRecommendations(validationResult, duplicateResult, qualityMetrics);

    return {
      validationResult,
      duplicateResult,
      qualityMetrics,
      recommendations,
    };
  }

  /**
   * Validate lead status transition
   */
  validateStatusTransition(currentStatus: LeadStatus, newStatus: LeadStatus): ValidationResult {
    const errors: ValidationError[] = [];

    // Define valid status transitions
    const validTransitions: Record<LeadStatus, LeadStatus[]> = {
      [LeadStatus.NEW]: [LeadStatus.CONTACTED, LeadStatus.INACTIVE],
      [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.INTERESTED, LeadStatus.INACTIVE, LeadStatus.FOLLOW_UP],
      [LeadStatus.QUALIFIED]: [LeadStatus.INTERESTED, LeadStatus.APPOINTMENT_SCHEDULED, LeadStatus.INACTIVE],
      [LeadStatus.INTERESTED]: [LeadStatus.APPOINTMENT_SCHEDULED, LeadStatus.PROPERTY_VIEWED, LeadStatus.NEGOTIATING, LeadStatus.INACTIVE],
      [LeadStatus.APPOINTMENT_SCHEDULED]: [LeadStatus.PROPERTY_VIEWED, LeadStatus.INTERESTED, LeadStatus.INACTIVE],
      [LeadStatus.PROPERTY_VIEWED]: [LeadStatus.INTERESTED, LeadStatus.OFFER_MADE, LeadStatus.NEGOTIATING, LeadStatus.INACTIVE],
      [LeadStatus.OFFER_MADE]: [LeadStatus.NEGOTIATING, LeadStatus.UNDER_CONTRACT, LeadStatus.INACTIVE],
      [LeadStatus.NEGOTIATING]: [LeadStatus.UNDER_CONTRACT, LeadStatus.CLOSED_WON, LeadStatus.CLOSED_LOST, LeadStatus.INACTIVE],
      [LeadStatus.UNDER_CONTRACT]: [LeadStatus.CLOSED_WON, LeadStatus.CLOSED_LOST, LeadStatus.INACTIVE],
      [LeadStatus.CLOSED_WON]: [],
      [LeadStatus.CLOSED_LOST]: [],
      [LeadStatus.INACTIVE]: [LeadStatus.CONTACTED, LeadStatus.INTERESTED],
      [LeadStatus.FOLLOW_UP]: [LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.INTERESTED, LeadStatus.INACTIVE],
    };

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      errors.push({
        field: 'status',
        message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        code: 'INVALID_STATUS_TRANSITION',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate lead source
   */
  validateLeadSource(source: LeadSource): ValidationResult {
    const errors: ValidationError[] = [];

    const validSources = Object.values(LeadSource);
    if (!validSources.includes(source)) {
      errors.push({
        field: 'source',
        message: `Invalid lead source: ${source}`,
        code: 'INVALID_SOURCE',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate lead priority
   */
  validateLeadPriority(priority: LeadPriority): ValidationResult {
    const errors: ValidationError[] = [];

    const validPriorities = Object.values(LeadPriority);
    if (!validPriorities.includes(priority)) {
      errors.push({
        field: 'priority',
        message: `Invalid lead priority: ${priority}`,
        code: 'INVALID_PRIORITY',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Throw validation exception if validation fails
   */
  throwIfInvalid(validationResult: ValidationResult): void {
    if (!validationResult.isValid) {
      throw new BadRequestException({
        message: 'Lead validation failed',
        errors: validationResult.errors,
      });
    }
  }

  // Helper methods for data cleansing and normalization

  private normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Format as US phone number
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
    }
    
    return phone; // Return original if can't normalize
  }

  private normalizeAddress(address: any): any {
    if (!address) return address;

    const normalized = { ...address };

    if (normalized.street) {
      normalized.street = normalized.street.trim();
    }
    if (normalized.city) {
      normalized.city = this.normalizeName(normalized.city);
    }
    if (normalized.state) {
      normalized.state = normalized.state.toUpperCase().trim();
    }
    if (normalized.zipCode) {
      normalized.zipCode = normalized.zipCode.trim();
    }

    return normalized;
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  private isNormalizedField(key: string, value: any): boolean {
    // Check if the field has been normalized
    if (typeof value === 'string') {
      const normalizedValue = this.normalizeFieldValue(key, value);
      return normalizedValue !== value;
    }
    return false;
  }

  private normalizeFieldValue(key: string, value: string): string {
    if (key.includes('email')) {
      return value.toLowerCase().trim();
    }
    if (key.includes('phone')) {
      return this.normalizePhoneNumber(value);
    }
    if (key.includes('name')) {
      return this.normalizeName(value);
    }
    if (key.includes('company')) {
      return this.normalizeCompanyName(value);
    }
    return value;
  }

  private generateRecommendations(
    validationResult: ValidationResult,
    duplicateResult: DuplicateDetectionResult,
    qualityMetrics: DataQualityMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Validation recommendations
    if (!validationResult.isValid) {
      recommendations.push('Fix validation errors before proceeding');
    }

    // Duplicate recommendations
    if (duplicateResult.isDuplicate) {
      recommendations.push(`Potential duplicate detected (confidence: ${(duplicateResult.confidence * 100).toFixed(1)}%)`);
      recommendations.push('Review duplicate leads before creating new record');
    }

    // Quality recommendations
    if (qualityMetrics.qualityScore < 80) {
      recommendations.push('Data quality is below recommended threshold (80%)');
      recommendations.push('Consider adding more complete information');
    }

    if (qualityMetrics.invalidFields > 0) {
      recommendations.push(`Fix ${qualityMetrics.invalidFields} invalid or missing fields`);
    }

    return recommendations;
  }
} 