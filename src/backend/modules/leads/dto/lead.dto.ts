import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsNumber, IsBoolean, IsEmail, IsDateString, ValidateNested, IsUUID, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { LeadStatus, LeadSource, LeadPriority, PropertyType, TransactionType } from '../schemas/lead.schema';

export class ContactInfoDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsObject()
  @IsOptional()
  address?: {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    zipCode: string;

    @IsString()
    country: string;
  };

  @IsIn(['email', 'phone', 'sms', 'mail'])
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'mail';

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class PropertyPreferencesDto {
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  propertyType: PropertyType[];

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minBedrooms?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxBedrooms?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minBathrooms?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxBathrooms?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minSquareFootage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxSquareFootage?: number;

  @IsArray()
  @IsString({ each: true })
  preferredLocations: string[];

  @IsArray()
  @IsString({ each: true })
  mustHaveFeatures: string[];

  @IsArray()
  @IsString({ each: true })
  niceToHaveFeatures: string[];

  @IsArray()
  @IsString({ each: true })
  dealBreakers: string[];

  @IsIn(['immediate', '1-3_months', '3-6_months', '6-12_months', 'flexible'])
  timeline: 'immediate' | '1-3_months' | '3-6_months' | '6-12_months' | 'flexible';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class FinancialInfoDto {
  @IsBoolean()
  preApproved: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  preApprovalAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  downPaymentAmount?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  downPaymentPercentage?: number;

  @IsNumber()
  @Min(300)
  @Max(850)
  @IsOptional()
  creditScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  annualIncome?: number;

  @IsIn(['employed', 'self_employed', 'retired', 'unemployed', 'student', 'other'])
  employmentStatus: 'employed' | 'self_employed' | 'retired' | 'unemployed' | 'student' | 'other';

  @IsNumber()
  @Min(0)
  @IsOptional()
  employmentLength?: number;

  @IsString()
  @IsOptional()
  lender?: string;

  @IsIn(['conventional', 'fha', 'va', 'usda', 'jumbo', 'other'])
  @IsOptional()
  loanType?: 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo' | 'other';

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyDebt?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyIncome?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  debtToIncomeRatio?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CommunicationHistoryDto {
  @IsIn(['call', 'email', 'sms', 'meeting', 'text', 'other'])
  type: 'call' | 'email' | 'sms' | 'meeting' | 'text' | 'other';

  @IsIn(['inbound', 'outbound'])
  direction: 'inbound' | 'outbound';

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  content: string;

  @IsDateString()
  timestamp: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsIn(['successful', 'no_answer', 'voicemail', 'busy', 'wrong_number', 'other'])
  outcome: 'successful' | 'no_answer' | 'voicemail' | 'busy' | 'wrong_number' | 'other';

  @IsBoolean()
  followUpRequired: boolean;

  @IsDateString()
  @IsOptional()
  followUpDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

export class LeadActivityDto {
  @IsIn(['status_change', 'assignment', 'note_added', 'communication', 'appointment', 'property_viewed', 'offer_made', 'other'])
  type: 'status_change' | 'assignment' | 'note_added' | 'communication' | 'appointment' | 'property_viewed' | 'offer_made' | 'other';

  @IsString()
  description: string;

  @IsDateString()
  timestamp: Date;

  @IsUUID()
  userId: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class AppointmentDto {
  @IsDateString()
  date: Date;

  @IsNumber()
  @Min(15)
  @Max(480)
  duration: number;

  @IsIn(['phone_call', 'video_call', 'in_person', 'property_tour', 'open_house', 'closing', 'other'])
  type: 'phone_call' | 'video_call' | 'in_person' | 'property_tour' | 'open_house' | 'closing' | 'other';

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

  @IsBoolean()
  reminderSent: boolean;

  @IsDateString()
  @IsOptional()
  reminderDate?: Date;
}

export class PropertyViewedDto {
  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsString()
  propertyAddress: string;

  @IsDateString()
  date: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsBoolean()
  followUpRequired: boolean;

  @IsDateString()
  @IsOptional()
  followUpDate?: Date;
}

export class OfferDto {
  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsString()
  propertyAddress: string;

  @IsNumber()
  @Min(0)
  offerAmount: number;

  @IsDateString()
  offerDate: Date;

  @IsIn(['draft', 'submitted', 'accepted', 'rejected', 'countered', 'expired'])
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'countered' | 'expired';

  @IsString()
  @IsOptional()
  terms?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contingencies?: string[];

  @IsDateString()
  @IsOptional()
  closingDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateLeadDto {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus = LeadStatus.NEW;

  @IsEnum(LeadSource)
  source: LeadSource;

  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority = LeadPriority.MEDIUM;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @ValidateNested()
  @Type(() => PropertyPreferencesDto)
  @IsOptional()
  propertyPreferences?: PropertyPreferencesDto;

  @ValidateNested()
  @Type(() => FinancialInfoDto)
  @IsOptional()
  financialInfo?: FinancialInfoDto;

  @IsUUID()
  assignedTo: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: Date;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  closeValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionAmount?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionPercentage?: number;

  @IsString()
  @IsOptional()
  marketingCampaign?: string;

  @IsString()
  @IsOptional()
  utmSource?: string;

  @IsString()
  @IsOptional()
  utmMedium?: string;

  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @IsString()
  @IsOptional()
  utmTerm?: string;

  @IsString()
  @IsOptional()
  utmContent?: string;

  @IsString()
  @IsOptional()
  referrer?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsIn(['desktop', 'mobile', 'tablet'])
  @IsOptional()
  deviceType?: 'desktop' | 'mobile' | 'tablet';

  @IsString()
  @IsOptional()
  browser?: string;

  @IsString()
  @IsOptional()
  operatingSystem?: string;

  @IsObject()
  @IsOptional()
  location?: {
    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    country: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;
  };

  @IsNumber()
  @Min(0)
  @IsOptional()
  timeOnSite?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pagesViewed?: string[];

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateLeadDto {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  @IsOptional()
  contactInfo?: Partial<ContactInfoDto>;

  @ValidateNested()
  @Type(() => PropertyPreferencesDto)
  @IsOptional()
  propertyPreferences?: Partial<PropertyPreferencesDto>;

  @ValidateNested()
  @Type(() => FinancialInfoDto)
  @IsOptional()
  financialInfo?: Partial<FinancialInfoDto>;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: Date;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: Date;

  @IsNumber()
  @Min(0)
  @IsOptional()
  closeValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionAmount?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionPercentage?: number;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class LeadResponseDto {
  @IsUUID()
  leadId: string;

  @IsString()
  tenantId: string;

  @IsEnum(LeadStatus)
  status: LeadStatus;

  @IsEnum(LeadSource)
  source: LeadSource;

  @IsEnum(LeadPriority)
  priority: LeadPriority;

  @IsObject()
  contactInfo: ContactInfoDto;

  @IsObject()
  @IsOptional()
  propertyPreferences?: PropertyPreferencesDto;

  @IsObject()
  @IsOptional()
  financialInfo?: FinancialInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommunicationHistoryDto)
  communicationHistory: CommunicationHistoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadActivityDto)
  activities: LeadActivityDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentDto)
  appointments: AppointmentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyViewedDto)
  propertiesViewed: PropertyViewedDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferDto)
  offers: OfferDto[];

  @IsString()
  assignedTo: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: Date;

  @IsDateString()
  @IsOptional()
  lastContactDate?: Date;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: Date;

  @IsDateString()
  @IsOptional()
  actualCloseDate?: Date;

  @IsNumber()
  @IsOptional()
  closeValue?: number;

  @IsNumber()
  @IsOptional()
  commissionAmount?: number;

  @IsNumber()
  @IsOptional()
  commissionPercentage?: number;

  @IsString()
  @IsOptional()
  marketingCampaign?: string;

  @IsString()
  @IsOptional()
  utmSource?: string;

  @IsString()
  @IsOptional()
  utmMedium?: string;

  @IsString()
  @IsOptional()
  utmCampaign?: string;

  @IsString()
  @IsOptional()
  utmTerm?: string;

  @IsString()
  @IsOptional()
  utmContent?: string;

  @IsString()
  @IsOptional()
  referrer?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsString()
  @IsOptional()
  deviceType?: string;

  @IsString()
  @IsOptional()
  browser?: string;

  @IsString()
  @IsOptional()
  operatingSystem?: string;

  @IsObject()
  @IsOptional()
  location?: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @IsNumber()
  @IsOptional()
  timeOnSite?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pagesViewed?: string[];

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

export class LeadListResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadResponseDto)
  leads: LeadResponseDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  totalPages: number;
}

export class LeadSearchDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  createdAfter?: Date;

  @IsDateString()
  @IsOptional()
  createdBefore?: Date;

  @IsDateString()
  @IsOptional()
  lastContactAfter?: Date;

  @IsDateString()
  @IsOptional()
  lastContactBefore?: Date;

  @IsDateString()
  @IsOptional()
  nextFollowUpAfter?: Date;

  @IsDateString()
  @IsOptional()
  nextFollowUpBefore?: Date;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minScore?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxScore?: number;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}

export class BulkLeadOperationDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  leadIds: string[];

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  nextFollowUpDate?: Date;
}

export class BulkLeadCreateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLeadDto)
  leads: CreateLeadDto[];
}

export class LeadStatsDto {
  @IsNumber()
  totalLeads: number;

  @IsNumber()
  newLeads: number;

  @IsNumber()
  contactedLeads: number;

  @IsNumber()
  qualifiedLeads: number;

  @IsNumber()
  interestedLeads: number;

  @IsNumber()
  negotiatingLeads: number;

  @IsNumber()
  closedWonLeads: number;

  @IsNumber()
  closedLostLeads: number;

  @IsNumber()
  averageScore: number;

  @IsNumber()
  totalValue: number;

  @IsNumber()
  conversionRate: number;
} 