import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CreateLeadDto, UpdateLeadDto } from '../dto/lead.dto';
import { LeadStatus, LeadPriority, LeadSource, PropertyType } from '../schemas/lead.schema';

@Injectable()
export class LeadValidationService {
  private readonly logger = new Logger(LeadValidationService.name);

  /**
   * Validate lead creation data
   */
  async validateCreateLead(createLeadDto: CreateLeadDto): Promise<void> {
    // Validate required fields
    this.validateRequiredFields(createLeadDto);

    // Validate contact information
    this.validateContactInfo(createLeadDto);

    // Validate property details
    if (createLeadDto.propertyDetails) {
      this.validatePropertyDetails(createLeadDto.propertyDetails);
    }

    // Validate address
    if (createLeadDto.address) {
      this.validateAddress(createLeadDto.address);
    }

    // Validate business rules
    this.validateBusinessRules(createLeadDto);

    // Validate custom fields
    if (createLeadDto.customFields) {
      this.validateCustomFields(createLeadDto.customFields);
    }
  }

  /**
   * Validate lead update data
   */
  async validateUpdateLead(updateLeadDto: UpdateLeadDto): Promise<void> {
    // Validate contact information if provided
    if (updateLeadDto.phone || updateLeadDto.email) {
      this.validateContactInfo(updateLeadDto);
    }

    // Validate property details if provided
    if (updateLeadDto.propertyDetails) {
      this.validatePropertyDetails(updateLeadDto.propertyDetails);
    }

    // Validate address if provided
    if (updateLeadDto.address) {
      this.validateAddress(updateLeadDto.address);
    }

    // Validate business rules
    this.validateBusinessRules(updateLeadDto);

    // Validate custom fields if provided
    if (updateLeadDto.customFields) {
      this.validateCustomFields(updateLeadDto.customFields);
    }

    // Validate AI fields if provided
    if (updateLeadDto.leadScore !== undefined) {
      this.validateLeadScore(updateLeadDto.leadScore);
    }

    if (updateLeadDto.qualificationProbability !== undefined) {
      this.validateQualificationProbability(updateLeadDto.qualificationProbability);
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(dto: CreateLeadDto): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Lead name is required');
    }

    if (dto.name.trim().length < 2) {
      throw new BadRequestException('Lead name must be at least 2 characters long');
    }

    if (dto.name.trim().length > 100) {
      throw new BadRequestException('Lead name must be less than 100 characters');
    }
  }

  /**
   * Validate contact information
   */
  private validateContactInfo(dto: CreateLeadDto | UpdateLeadDto): void {
    // Validate phone number
    if (dto.phone) {
      this.validatePhoneNumber(dto.phone);
    }

    // Validate email
    if (dto.email) {
      this.validateEmail(dto.email);
    }

    // Require at least one contact method
    if (!dto.phone && !dto.email) {
      throw new BadRequestException('At least one contact method (phone or email) is required');
    }
  }

  /**
   * Validate phone number format
   */
  private validatePhoneNumber(phone: string): void {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if it's a valid US phone number (10 or 11 digits)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      throw new BadRequestException('Phone number must be 10-11 digits');
    }

    // If 11 digits, first digit should be 1 (US country code)
    if (cleanPhone.length === 11 && cleanPhone[0] !== '1') {
      throw new BadRequestException('Invalid phone number format');
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (email.length > 255) {
      throw new BadRequestException('Email address is too long');
    }
  }

  /**
   * Validate property details
   */
  private validatePropertyDetails(propertyDetails: any): void {
    if (propertyDetails.bedrooms !== undefined && (propertyDetails.bedrooms < 0 || propertyDetails.bedrooms > 20)) {
      throw new BadRequestException('Bedrooms must be between 0 and 20');
    }

    if (propertyDetails.bathrooms !== undefined && (propertyDetails.bathrooms < 0 || propertyDetails.bathrooms > 20)) {
      throw new BadRequestException('Bathrooms must be between 0 and 20');
    }

    if (propertyDetails.squareFeet !== undefined && (propertyDetails.squareFeet < 0 || propertyDetails.squareFeet > 100000)) {
      throw new BadRequestException('Square feet must be between 0 and 100,000');
    }

    if (propertyDetails.lotSize !== undefined && (propertyDetails.lotSize < 0 || propertyDetails.lotSize > 1000000)) {
      throw new BadRequestException('Lot size must be between 0 and 1,000,000 square feet');
    }

    if (propertyDetails.yearBuilt !== undefined) {
      const currentYear = new Date().getFullYear();
      if (propertyDetails.yearBuilt < 1800 || propertyDetails.yearBuilt > currentYear) {
        throw new BadRequestException(`Year built must be between 1800 and ${currentYear}`);
      }
    }
  }

  /**
   * Validate address
   */
  private validateAddress(address: any): void {
    // At least one address field should be provided
    const hasAddressFields = address.street || address.city || address.state || address.zipCode;
    if (!hasAddressFields) {
      throw new BadRequestException('At least one address field is required');
    }

    // Validate state (if provided)
    if (address.state) {
      this.validateState(address.state);
    }

    // Validate zip code (if provided)
    if (address.zipCode) {
      this.validateZipCode(address.zipCode);
    }
  }

  /**
   * Validate US state
   */
  private validateState(state: string): void {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    if (!validStates.includes(state.toUpperCase())) {
      throw new BadRequestException('Invalid US state code');
    }
  }

  /**
   * Validate US zip code
   */
  private validateZipCode(zipCode: string): void {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      throw new BadRequestException('Invalid zip code format (use 12345 or 12345-6789)');
    }
  }

  /**
   * Validate business rules
   */
  private validateBusinessRules(dto: CreateLeadDto | UpdateLeadDto): void {
    // Validate asking price vs estimated value
    if (dto.askingPrice && dto.estimatedValue) {
      const ratio = dto.askingPrice / dto.estimatedValue;
      if (ratio > 2) {
        throw new BadRequestException('Asking price cannot be more than 2x the estimated value');
      }
      if (ratio < 0.1) {
        throw new BadRequestException('Asking price cannot be less than 10% of the estimated value');
      }
    }

    // Validate next follow-up date
    if (dto.nextFollowUp) {
      const followUpDate = new Date(dto.nextFollowUp);
      const now = new Date();
      
      if (followUpDate < now) {
        throw new BadRequestException('Next follow-up date cannot be in the past');
      }

      // Check if follow-up is too far in the future (more than 1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (followUpDate > oneYearFromNow) {
        throw new BadRequestException('Next follow-up date cannot be more than 1 year in the future');
      }
    }

    // Validate tags
    if (dto.tags) {
      this.validateTags(dto.tags);
    }
  }

  /**
   * Validate tags
   */
  private validateTags(tags: string[]): void {
    if (tags.length > 20) {
      throw new BadRequestException('Maximum 20 tags allowed');
    }

    for (const tag of tags) {
      if (tag.length < 1 || tag.length > 50) {
        throw new BadRequestException('Tags must be between 1 and 50 characters');
      }

      if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
        throw new BadRequestException('Tags can only contain letters, numbers, spaces, hyphens, and underscores');
      }
    }

    // Check for duplicate tags
    const uniqueTags = new Set(tags.map(tag => tag.toLowerCase()));
    if (uniqueTags.size !== tags.length) {
      throw new BadRequestException('Duplicate tags are not allowed');
    }
  }

  /**
   * Validate custom fields
   */
  private validateCustomFields(customFields: Record<string, any>): void {
    if (Object.keys(customFields).length > 50) {
      throw new BadRequestException('Maximum 50 custom fields allowed');
    }

    for (const [key, value] of Object.entries(customFields)) {
      // Validate field name
      if (key.length < 1 || key.length > 50) {
        throw new BadRequestException('Custom field names must be between 1 and 50 characters');
      }

      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        throw new BadRequestException('Custom field names can only contain letters, numbers, and underscores');
      }

      // Validate field value
      if (typeof value === 'string' && value.length > 1000) {
        throw new BadRequestException(`Custom field '${key}' value is too long (max 1000 characters)`);
      }

      if (typeof value === 'number' && (value < -999999999 || value > 999999999)) {
        throw new BadRequestException(`Custom field '${key}' value is out of range`);
      }
    }
  }

  /**
   * Validate lead score
   */
  private validateLeadScore(leadScore: number): void {
    if (leadScore < 0 || leadScore > 100) {
      throw new BadRequestException('Lead score must be between 0 and 100');
    }
  }

  /**
   * Validate qualification probability
   */
  private validateQualificationProbability(probability: number): void {
    if (probability < 0 || probability > 1) {
      throw new BadRequestException('Qualification probability must be between 0 and 1');
    }
  }

  /**
   * Sanitize lead data
   */
  sanitizeLeadData(dto: CreateLeadDto | UpdateLeadDto): CreateLeadDto | UpdateLeadDto {
    const sanitized = { ...dto };

    // Sanitize name
    if (sanitized.name) {
      sanitized.name = sanitized.name.trim();
    }

    // Sanitize phone
    if (sanitized.phone) {
      sanitized.phone = sanitized.phone.trim();
    }

    // Sanitize email
    if (sanitized.email) {
      sanitized.email = sanitized.email.trim().toLowerCase();
    }

    // Sanitize notes
    if (sanitized.notes) {
      sanitized.notes = sanitized.notes.trim();
    }

    // Sanitize tags
    if (sanitized.tags) {
      sanitized.tags = sanitized.tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // Sanitize address
    if (sanitized.address) {
      if (sanitized.address.street) sanitized.address.street = sanitized.address.street.trim();
      if (sanitized.address.city) sanitized.address.city = sanitized.address.city.trim();
      if (sanitized.address.state) sanitized.address.state = sanitized.address.state.trim().toUpperCase();
      if (sanitized.address.zipCode) sanitized.address.zipCode = sanitized.address.zipCode.trim();
      if (sanitized.address.county) sanitized.address.county = sanitized.address.county.trim();
      if (sanitized.address.fullAddress) sanitized.address.fullAddress = sanitized.address.fullAddress.trim();
    }

    return sanitized;
  }

  /**
   * Check for duplicate leads
   */
  async checkForDuplicates(phone?: string, email?: string, tenantId?: string): Promise<{ isDuplicate: boolean; duplicateFields: string[] }> {
    const duplicateFields: string[] = [];

    // This would typically check against the database
    // For now, we'll return a basic structure
    // In a real implementation, you would query the database here

    return {
      isDuplicate: duplicateFields.length > 0,
      duplicateFields,
    };
  }
} 