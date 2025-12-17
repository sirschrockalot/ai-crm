export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  propertyAddress?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  estimatedValue: number;
  status: LeadStatus;
  assignedTo?: string;
  notes?: string;
  source?: string;
  company?: string;
  score?: number;
  priority?: 'low' | 'medium' | 'high';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  leads: Lead[];
  maxLeads?: number;
}

export type PropertyType = 'single_family' | 'multi_family' | 'commercial' | 'land';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost'
  | 'still_on_cloud'
  | 'wants_retail'
  | 'working_with_competitor'
  | 'no_longer_want_to_sell'
  | 'not_interested'
  | 'rejected_offer'
  | 'interested_not_ready_now'
  | 'listed_with_realtor';

export interface LeadMoveRequest {
  leadId: string;
  fromStageId: string;
  toStageId: string;
}

export interface LeadMoveResponse {
  success: boolean;
  lead: Lead;
  message?: string;
}

export interface PipelineData {
  stages: PipelineStage[];
  leads: Lead[];
  loading: boolean;
  error: string | null;
}

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  propertyAddress?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  estimatedValue: number;
  status: LeadStatus;
  assignedTo?: string;
  notes?: string;
  source?: string;
  company?: string;
  score?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface CommunicationMessage {
  id: string;
  leadId: string;
  type: 'sms' | 'email' | 'call';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed';
}

export interface ImportExportProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: string[];
}
