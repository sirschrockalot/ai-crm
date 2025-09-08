import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionStatus {
  GATHERING_DOCS = 'gathering_docs',
  HOLDING_FOR_FUNDING = 'holding_for_funding',
  GATHERING_TITLE = 'gathering_title',
  CLIENT_HELP_NEEDED = 'client_help_needed',
  ON_HOLD = 'on_hold',
  PENDING_CLOSING = 'pending_closing',
  READY_TO_CLOSE = 'ready_to_close',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  MULTI_FAMILY = 'multi_family',
  CONDO = 'condo',
  LAND = 'land',
}

export enum TransactionType {
  ASSIGNMENT = 'assignment',
  DOUBLE_CLOSE = 'double_close',
  WHOLETAIL = 'wholetail',
  CASH_DEAL = 'cash_deal',
}

export enum LoanType {
  CONVENTIONAL = 'conventional',
  FHA = 'fha',
  VA = 'va',
  OTHER = 'other',
}

@Schema({ _id: false })
export class DocumentInfo {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  uploadedAt: Date;

  @Prop()
  uploadedBy?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  mimeType?: string;
}

@Schema({ _id: false })
export class ActivityInfo {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ default: 0 })
  likes: number;

  @Prop()
  mentions?: string[];

  @Prop()
  attachments?: string[];
}

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: TransactionStatus })
  status: TransactionStatus;

  @Prop({ enum: PropertyType })
  propertyType?: PropertyType;

  @Prop({ enum: TransactionType })
  transactionType?: TransactionType;

  @Prop({ enum: LoanType })
  loanType?: LoanType;

  @Prop()
  clientAccount?: string;

  @Prop()
  preliminarySearch?: string;

  @Prop()
  jointVenture?: string;

  @Prop()
  dispoWithEZ?: string;

  // Property Information
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop()
  zip?: string;

  // Seller Information
  @Prop()
  sellerName?: string;

  @Prop()
  sellerPhone?: string;

  @Prop()
  sellerEmail?: string;

  @Prop()
  seller2Name?: string;

  @Prop()
  seller2Phone?: string;

  @Prop()
  seller2Email?: string;

  // Buyer Information
  @Prop()
  buyerName?: string;

  @Prop()
  buyerPhone?: string;

  @Prop()
  buyerEmail?: string;

  // Agent Details
  @Prop()
  acquisitionsAgent?: string;

  @Prop()
  acquisitionsAgentEmail?: string;

  @Prop()
  acquisitionsAgentPhone?: string;

  @Prop()
  dispositionsAgent?: string;

  @Prop()
  dispositionsAgentEmail?: string;

  @Prop()
  dispositionsAgentPhone?: string;

  // Title & Lender Details
  @Prop()
  titleName?: string;

  @Prop()
  titleEmail?: string;

  @Prop()
  titlePhone?: string;

  @Prop()
  titleOfficeAddress?: string;

  @Prop()
  lenderName?: string;

  @Prop()
  lenderEmail?: string;

  @Prop()
  lenderOffice?: string;

  @Prop()
  lenderPhone?: string;

  @Prop()
  lenderType?: string;

  @Prop({ required: true })
  contractDate: Date;

  @Prop()
  coordinatorName?: string;

  @Prop()
  notes?: string;

  @Prop({ type: [DocumentInfo], default: [] })
  documents: DocumentInfo[];

  @Prop({ type: [ActivityInfo], default: [] })
  activities: ActivityInfo[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Add indexes for better performance
TransactionSchema.index({ id: 1 }, { unique: true });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ coordinatorName: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ 'activities.timestamp': -1 });
