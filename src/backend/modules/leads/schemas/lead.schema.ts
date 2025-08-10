import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  INTERESTED = 'interested',
  NEGOTIATING = 'negotiating',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
  INACTIVE = 'inactive',
  FOLLOW_UP = 'follow_up',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  PROPERTY_VIEWED = 'property_viewed',
  OFFER_MADE = 'offer_made',
  UNDER_CONTRACT = 'under_contract',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  COLD_CALL = 'cold_call',
  EMAIL_CAMPAIGN = 'email_campaign',
  SMS_CAMPAIGN = 'sms_campaign',
  OPEN_HOUSE = 'open_house',
  FOR_SALE_SIGN = 'for_sale_sign',
  ONLINE_AD = 'online_ad',
  PRINT_AD = 'print_ad',
  RADIO_AD = 'radio_ad',
  TV_AD = 'tv_ad',
  EVENT = 'event',
  PARTNER = 'partner',
  OTHER = 'other',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  TOWNHOUSE = 'townhouse',
  CONDOMINIUM = 'condominium',
  DUPLEX = 'duplex',
  TRIPLEX = 'triplex',
  FOURPLEX = 'fourplex',
  MULTI_FAMILY = 'multi_family',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  OTHER = 'other',
}

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  RENT = 'rent',
  INVEST = 'invest',
  REFINANCE = 'refinance',
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'mail';
  timeZone?: string;
  language?: string;
}

export interface PropertyPreferences {
  propertyType: PropertyType[];
  transactionType: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  preferredLocations: string[];
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  dealBreakers: string[];
  timeline: 'immediate' | '1-3_months' | '3-6_months' | '6-12_months' | 'flexible';
  notes?: string;
}

export interface FinancialInfo {
  preApproved: boolean;
  preApprovalAmount?: number;
  downPaymentAmount?: number;
  downPaymentPercentage?: number;
  creditScore?: number;
  annualIncome?: number;
  employmentStatus: 'employed' | 'self_employed' | 'retired' | 'unemployed' | 'student' | 'other';
  employmentLength?: number; // in months
  lender?: string;
  loanType?: 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo' | 'other';
  monthlyDebt?: number;
  monthlyIncome?: number;
  debtToIncomeRatio?: number;
  notes?: string;
}

export interface CommunicationHistory {
  type: 'call' | 'email' | 'sms' | 'meeting' | 'text' | 'other';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: Date;
  duration?: number; // for calls, in seconds
  outcome: 'successful' | 'no_answer' | 'voicemail' | 'busy' | 'wrong_number' | 'other';
  followUpRequired: boolean;
  followUpDate?: Date;
  notes?: string;
  attachments?: string[]; // file URLs
}

export interface LeadActivity {
  type: 'status_change' | 'assignment' | 'note_added' | 'communication' | 'appointment' | 'property_viewed' | 'offer_made' | 'other';
  description: string;
  timestamp: Date;
  userId: Types.ObjectId;
  metadata?: any;
}

export interface Appointment {
  date: Date;
  duration: number; // in minutes
  type: 'phone_call' | 'video_call' | 'in_person' | 'property_tour' | 'open_house' | 'closing' | 'other';
  location?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reminderSent: boolean;
  reminderDate?: Date;
}

export interface PropertyViewed {
  propertyId?: string;
  propertyAddress: string;
  date: Date;
  notes?: string;
  rating?: number; // 1-5 stars
  feedback?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface Offer {
  propertyId?: string;
  propertyAddress: string;
  offerAmount: number;
  offerDate: Date;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'countered' | 'expired';
  terms?: string;
  contingencies?: string[];
  closingDate?: Date;
  notes?: string;
}

@Schema({ timestamps: true })
export class Lead {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  leadId: string; // UUID

  @Prop({ required: true })
  tenantId: string; // Multi-tenant support

  @Prop({ required: true })
  status: LeadStatus;

  @Prop({ required: true })
  source: LeadSource;

  @Prop({ required: true, enum: LeadPriority, default: LeadPriority.MEDIUM })
  priority: LeadPriority;

  @Prop({ type: Types.ObjectId, ref: 'Stage' })
  stageId?: Types.ObjectId;

  @Prop({ required: true, type: Object })
  contactInfo: ContactInfo;

  @Prop({ type: Object })
  propertyPreferences: PropertyPreferences;

  @Prop({ type: Object })
  financialInfo: FinancialInfo;

  @Prop({ type: [Object], default: [] })
  communicationHistory: CommunicationHistory[];

  @Prop({ type: [Object], default: [] })
  activities: LeadActivity[];

  @Prop({ type: [Object], default: [] })
  appointments: Appointment[];

  @Prop({ type: [Object], default: [] })
  propertiesViewed: PropertyViewed[];

  @Prop({ type: [Object], default: [] })
  offers: Offer[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop()
  score?: number; // Lead scoring (0-100)

  @Prop()
  tags: string[];

  @Prop()
  notes?: string;

  @Prop()
  nextFollowUpDate?: Date;

  @Prop()
  lastContactDate?: Date;

  @Prop()
  expectedCloseDate?: Date;

  @Prop()
  actualCloseDate?: Date;

  @Prop()
  closeValue?: number;

  @Prop()
  commissionAmount?: number;

  @Prop()
  commissionPercentage?: number;

  @Prop()
  marketingCampaign?: string;

  @Prop()
  utmSource?: string;

  @Prop()
  utmMedium?: string;

  @Prop()
  utmCampaign?: string;

  @Prop()
  utmTerm?: string;

  @Prop()
  utmContent?: string;

  @Prop()
  referrer?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  deviceType?: 'desktop' | 'mobile' | 'tablet';

  @Prop()
  browser?: string;

  @Prop()
  operatingSystem?: string;

  @Prop({ type: Object })
  location?: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @Prop()
  timeOnSite?: number; // in seconds

  @Prop()
  pagesViewed?: string[];

  @Prop({ type: [Object] })
  formSubmissions?: {
    formName: string;
    submittedAt: Date;
    data: any;
  }[];

  @Prop({ type: [Object] })
  emailOpens?: {
    emailId: string;
    openedAt: Date;
    ipAddress?: string;
  }[];

  @Prop({ type: [Object] })
  emailClicks?: {
    emailId: string;
    linkUrl: string;
    clickedAt: Date;
    ipAddress?: string;
  }[];

  @Prop({ type: [Object] })
  smsResponses?: {
    messageId: string;
    response: string;
    timestamp: Date;
  }[];

  @Prop({ type: [Object] })
  socialMediaEngagement?: {
    platform: string;
    action: string;
    timestamp: Date;
    metadata?: any;
  }[];

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Indexes for performance
LeadSchema.index({ leadId: 1 });
LeadSchema.index({ tenantId: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ source: 1 });
LeadSchema.index({ priority: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ createdBy: 1 });
LeadSchema.index({ 'contactInfo.email': 1 });
LeadSchema.index({ 'contactInfo.phone': 1 });
LeadSchema.index({ createdAt: 1 });
LeadSchema.index({ updatedAt: 1 });
LeadSchema.index({ nextFollowUpDate: 1 });
LeadSchema.index({ lastContactDate: 1 });
LeadSchema.index({ expectedCloseDate: 1 });
LeadSchema.index({ score: 1 });

// Compound indexes
LeadSchema.index({ tenantId: 1, status: 1 });
LeadSchema.index({ tenantId: 1, assignedTo: 1 });
LeadSchema.index({ tenantId: 1, source: 1 });
LeadSchema.index({ tenantId: 1, priority: 1 });
LeadSchema.index({ tenantId: 1, createdAt: 1 });
LeadSchema.index({ tenantId: 1, nextFollowUpDate: 1 });
LeadSchema.index({ tenantId: 1, lastContactDate: 1 });

// Text search index
LeadSchema.index({
  'contactInfo.firstName': 'text',
  'contactInfo.lastName': 'text',
  'contactInfo.email': 'text',
  'contactInfo.phone': 'text',
  notes: 'text',
  tags: 'text',
});

// Geospatial index for location-based queries
LeadSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// TTL index for soft delete
LeadSchema.index({ deletedAt: 1 });

// Sparse indexes for optional fields
LeadSchema.index({ score: 1 }, { sparse: true });
LeadSchema.index({ expectedCloseDate: 1 }, { sparse: true });
LeadSchema.index({ closeValue: 1 }, { sparse: true }); 