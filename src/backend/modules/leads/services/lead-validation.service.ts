import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateLeadDto, UpdateLeadDto } from '../dto/lead.dto';
import { LeadStatus, LeadSource, LeadPriority } from '../schemas/lead.schema';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

@Injectable()
export class LeadValidationService {
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

    if (!leadData.source) {
      errors.push({
        field: 'source',
        message: 'Lead source is required',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!leadData.assignedTo) {
      errors.push({
        field: 'assignedTo',
        message: 'Assigned user is required',
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

    if (contactInfo?.firstName && contactInfo.firstName.length < 2) {
      errors.push({
        field: 'contactInfo.firstName',
        message: 'First name must be at least 2 characters long',
        code: 'MIN_LENGTH',
      });
    }

    if (contactInfo?.firstName && contactInfo.firstName.length > 50) {
      errors.push({
        field: 'contactInfo.firstName',
        message: 'First name must be less than 50 characters',
        code: 'MAX_LENGTH',
      });
    }

    if (contactInfo?.lastName && contactInfo.lastName.length < 2) {
      errors.push({
        field: 'contactInfo.lastName',
        message: 'Last name must be at least 2 characters long',
        code: 'MIN_LENGTH',
      });
    }

    if (contactInfo?.lastName && contactInfo.lastName.length > 50) {
      errors.push({
        field: 'contactInfo.lastName',
        message: 'Last name must be less than 50 characters',
        code: 'MAX_LENGTH',
      });
    }

    if (contactInfo?.email && !this.isValidEmail(contactInfo.email)) {
      errors.push({
        field: 'contactInfo.email',
        message: 'Invalid email format',
        code: 'INVALID_FORMAT',
      });
    }

    if (contactInfo?.phone && !this.isValidPhone(contactInfo.phone)) {
      errors.push({
        field: 'contactInfo.phone',
        message: 'Invalid phone number format',
        code: 'INVALID_FORMAT',
      });
    }

    if (contactInfo?.alternatePhone && !this.isValidPhone(contactInfo.alternatePhone)) {
      errors.push({
        field: 'contactInfo.alternatePhone',
        message: 'Invalid alternate phone number format',
        code: 'INVALID_FORMAT',
      });
    }

    if (contactInfo?.address) {
      errors.push(...this.validateAddress(contactInfo.address));
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

    if (propertyPreferences.propertyType && (!Array.isArray(propertyPreferences.propertyType) || propertyPreferences.propertyType.length === 0)) {
      errors.push({
        field: 'propertyPreferences.propertyType',
        message: 'At least one property type must be selected',
        code: 'REQUIRED_FIELD',
      });
    }

    if (propertyPreferences.minPrice && propertyPreferences.maxPrice && propertyPreferences.minPrice > propertyPreferences.maxPrice) {
      errors.push({
        field: 'propertyPreferences.minPrice',
        message: 'Minimum price cannot be greater than maximum price',
        code: 'INVALID_RANGE',
      });
    }

    if (propertyPreferences.minBedrooms && propertyPreferences.maxBedrooms && propertyPreferences.minBedrooms > propertyPreferences.maxBedrooms) {
      errors.push({
        field: 'propertyPreferences.minBedrooms',
        message: 'Minimum bedrooms cannot be greater than maximum bedrooms',
        code: 'INVALID_RANGE',
      });
    }

    if (propertyPreferences.minBathrooms && propertyPreferences.maxBathrooms && propertyPreferences.minBathrooms > propertyPreferences.maxBathrooms) {
      errors.push({
        field: 'propertyPreferences.minBathrooms',
        message: 'Minimum bathrooms cannot be greater than maximum bathrooms',
        code: 'INVALID_RANGE',
      });
    }

    if (propertyPreferences.minSquareFootage && propertyPreferences.maxSquareFootage && propertyPreferences.minSquareFootage > propertyPreferences.maxSquareFootage) {
      errors.push({
        field: 'propertyPreferences.minSquareFootage',
        message: 'Minimum square footage cannot be greater than maximum square footage',
        code: 'INVALID_RANGE',
      });
    }

    if (propertyPreferences.preferredLocations && (!Array.isArray(propertyPreferences.preferredLocations) || propertyPreferences.preferredLocations.length === 0)) {
      errors.push({
        field: 'propertyPreferences.preferredLocations',
        message: 'At least one preferred location must be specified',
        code: 'REQUIRED_FIELD',
      });
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

    if (financialInfo.preApprovalAmount && financialInfo.preApprovalAmount < 0) {
      errors.push({
        field: 'financialInfo.preApprovalAmount',
        message: 'Pre-approval amount cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    if (financialInfo.downPaymentAmount && financialInfo.downPaymentAmount < 0) {
      errors.push({
        field: 'financialInfo.downPaymentAmount',
        message: 'Down payment amount cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    if (financialInfo.downPaymentPercentage && (financialInfo.downPaymentPercentage < 0 || financialInfo.downPaymentPercentage > 100)) {
      errors.push({
        field: 'financialInfo.downPaymentPercentage',
        message: 'Down payment percentage must be between 0 and 100',
        code: 'INVALID_RANGE',
      });
    }

    if (financialInfo.creditScore && (financialInfo.creditScore < 300 || financialInfo.creditScore > 850)) {
      errors.push({
        field: 'financialInfo.creditScore',
        message: 'Credit score must be between 300 and 850',
        code: 'INVALID_RANGE',
      });
    }

    if (financialInfo.annualIncome && financialInfo.annualIncome < 0) {
      errors.push({
        field: 'financialInfo.annualIncome',
        message: 'Annual income cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    if (financialInfo.employmentLength && financialInfo.employmentLength < 0) {
      errors.push({
        field: 'financialInfo.employmentLength',
        message: 'Employment length cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    if (financialInfo.monthlyDebt && financialInfo.monthlyDebt < 0) {
      errors.push({
        field: 'financialInfo.monthlyDebt',
        message: 'Monthly debt cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    if (financialInfo.monthlyIncome && financialInfo.monthlyIncome < 0) {
      errors.push({
        field: 'financialInfo.monthlyIncome',
        message: 'Monthly income cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    if (financialInfo.debtToIncomeRatio && (financialInfo.debtToIncomeRatio < 0 || financialInfo.debtToIncomeRatio > 100)) {
      errors.push({
        field: 'financialInfo.debtToIncomeRatio',
        message: 'Debt-to-income ratio must be between 0 and 100',
        code: 'INVALID_RANGE',
      });
    }

    return errors;
  }

  /**
   * Validate address
   */
  private validateAddress(address: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (address.street && address.street.length < 5) {
      errors.push({
        field: 'contactInfo.address.street',
        message: 'Street address must be at least 5 characters long',
        code: 'MIN_LENGTH',
      });
    }

    if (address.city && address.city.length < 2) {
      errors.push({
        field: 'contactInfo.address.city',
        message: 'City must be at least 2 characters long',
        code: 'MIN_LENGTH',
      });
    }

    if (address.state && address.state.length < 2) {
      errors.push({
        field: 'contactInfo.address.state',
        message: 'State must be at least 2 characters long',
        code: 'MIN_LENGTH',
      });
    }

    if (address.zipCode && !this.isValidZipCode(address.zipCode)) {
      errors.push({
        field: 'contactInfo.address.zipCode',
        message: 'Invalid ZIP code format',
        code: 'INVALID_FORMAT',
      });
    }

    if (address.country && address.country.length < 2) {
      errors.push({
        field: 'contactInfo.address.country',
        message: 'Country must be at least 2 characters long',
        code: 'MIN_LENGTH',
      });
    }

    return errors;
  }

  /**
   * Validate business rules
   */
  private validateBusinessRules(leadData: CreateLeadDto | UpdateLeadDto): ValidationError[] {
    const errors: ValidationError[] = [];

    // Score validation
    if (leadData.score !== undefined && (leadData.score < 0 || leadData.score > 100)) {
      errors.push({
        field: 'score',
        message: 'Lead score must be between 0 and 100',
        code: 'INVALID_RANGE',
      });
    }

    // Commission percentage validation
    if (leadData.commissionPercentage !== undefined && (leadData.commissionPercentage < 0 || leadData.commissionPercentage > 100)) {
      errors.push({
        field: 'commissionPercentage',
        message: 'Commission percentage must be between 0 and 100',
        code: 'INVALID_RANGE',
      });
    }

    // Close value validation
    if (leadData.closeValue !== undefined && leadData.closeValue < 0) {
      errors.push({
        field: 'closeValue',
        message: 'Close value cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    // Commission amount validation
    if (leadData.commissionAmount !== undefined && leadData.commissionAmount < 0) {
      errors.push({
        field: 'commissionAmount',
        message: 'Commission amount cannot be negative',
        code: 'INVALID_VALUE',
      });
    }

    // Date validations
    if (leadData.nextFollowUpDate && new Date(leadData.nextFollowUpDate) < new Date()) {
      errors.push({
        field: 'nextFollowUpDate',
        message: 'Next follow-up date cannot be in the past',
        code: 'INVALID_DATE',
      });
    }

    if (leadData.expectedCloseDate && new Date(leadData.expectedCloseDate) < new Date()) {
      errors.push({
        field: 'expectedCloseDate',
        message: 'Expected close date cannot be in the past',
        code: 'INVALID_DATE',
      });
    }

    return errors;
  }

  /**
   * Validate cross-field relationships
   */
  private validateCrossFields(leadData: CreateLeadDto | UpdateLeadDto): ValidationError[] {
    const errors: ValidationError[] = [];

    // Financial cross-field validations
    if (leadData.financialInfo) {
      const financial = leadData.financialInfo;

      // If pre-approved, should have pre-approval amount
      if (financial.preApproved && !financial.preApprovalAmount) {
        errors.push({
          field: 'financialInfo.preApprovalAmount',
          message: 'Pre-approval amount is required when pre-approved is true',
          code: 'CROSS_FIELD_REQUIRED',
        });
      }

      // If has monthly income and debt, validate debt-to-income ratio
      if (financial.monthlyIncome && financial.monthlyDebt) {
        const calculatedRatio = (financial.monthlyDebt / financial.monthlyIncome) * 100;
        if (financial.debtToIncomeRatio && Math.abs(calculatedRatio - financial.debtToIncomeRatio) > 1) {
          errors.push({
            field: 'financialInfo.debtToIncomeRatio',
            message: 'Debt-to-income ratio does not match calculated value',
            code: 'CROSS_FIELD_MISMATCH',
          });
        }
      }

      // If has down payment amount and percentage, validate relationship
      if (financial.downPaymentAmount && financial.downPaymentPercentage && financial.preApprovalAmount) {
        const calculatedAmount = (financial.preApprovalAmount * financial.downPaymentPercentage) / 100;
        if (Math.abs(calculatedAmount - financial.downPaymentAmount) > 1) {
          errors.push({
            field: 'financialInfo.downPaymentAmount',
            message: 'Down payment amount does not match percentage calculation',
            code: 'CROSS_FIELD_MISMATCH',
          });
        }
      }
    }

    // Property preferences cross-field validations
    if (leadData.propertyPreferences) {
      const prefs = leadData.propertyPreferences;

      // If has price range, validate with financial info
      if (prefs.maxPrice && leadData.financialInfo?.preApprovalAmount && prefs.maxPrice > leadData.financialInfo.preApprovalAmount * 1.2) {
        errors.push({
          field: 'propertyPreferences.maxPrice',
          message: 'Maximum price significantly exceeds pre-approval amount',
          code: 'CROSS_FIELD_WARNING',
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
} 