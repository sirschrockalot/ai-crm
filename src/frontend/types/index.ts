// Shared TypeScript types for the application

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

// Lead types
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  propertyAddress?: string; // Alternative property address field
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
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType = 'single_family' | 'multi_family' | 'commercial' | 'land';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost'
  // Extended nurture / disposition statuses
  | 'still_on_cloud'
  | 'wants_retail'
  | 'working_with_competitor'
  | 'no_longer_want_to_sell'
  | 'not_interested'
  | 'rejected_offer'
  | 'interested_not_ready_now'
  | 'listed_with_realtor';

// Lead Note types
export interface LeadNote {
  id: string;
  leadId: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status Change History types
export interface StatusChangeHistory {
  id: string;
  leadId: string;
  oldStatus: LeadStatus;
  newStatus: LeadStatus;
  reason: string;
  changedBy: string;
  changedById: string;
  createdAt: Date;
}

// Transaction Details types
export interface TransactionDetails {
  leadId: string;
  acquisitionPrice?: number;
  listingPrice?: number;
  commission?: number;
  repairCosts?: number;
  closingCosts?: number;
  contractDate?: Date;
  inspectionDate?: Date;
  closingDate?: Date;
  arv?: number; // After Repair Value
  estimatedRepairs?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Property Details types
export interface ComparableProperty {
  id: string;
  link?: string;
  price?: number;
  notes?: string;
}

export interface PropertyDetails {
  leadId: string;
  // Basic Property Info
  yearHouseBuilt?: number;
  yearHousePurchased?: number;
  permitted?: string;
  lotSize?: string;
  customerSqFt?: number;
  zillowSqFt?: number;
  propstreamSqFt?: number;
  propertyType?: string;
  blockOrWoodFrame?: string;
  bedrooms?: string;
  bedroomsPermitted?: string;
  bath?: string;
  bathPermitted?: string;
  foundation?: string;
  
  // HVAC & Roof
  yearOutsideACUnit?: number;
  yearInsideHVAC?: number;
  airConditioning?: string;
  yearRoof?: number;
  
  // Features
  garage?: string;
  pool?: string;
  poolFunctional?: string;
  ageOfWindows?: number;
  floodZone?: string;
  
  // Plumbing
  ageOfHotWaterHeater?: number;
  anyPlumbingIssues?: string;
  typeOfPlumbing?: string;
  
  // Electrical
  ageOfElectricalPanel?: number;
  electrical?: string;
  
  // Utilities
  heatSource?: string;
  propaneLastServiced?: string;
  propaneTankOwnedBy?: string;
  water?: string;
  wellLastServiced?: string;
  wellPumpAge?: number;
  waste?: string;
  septicLastServiced?: string;
  septicTankAge?: number;
  electric?: string;
  gas?: string;
  
  // Appliances
  microwaveBuiltIn?: string;
  stoveAge?: number;
  stoveColor?: string;
  stove?: string;
  fridgeAge?: number;
  fridgeColor?: string;
  fridge?: string;
  washerAge?: number;
  washerColor?: string;
  washer?: string;
  dryerAge?: number;
  dryerColor?: string;
  dryer?: string;
  
  // Property Status
  hoa?: string;
  rentalRestrictions?: string;
  liens?: string;
  propertyOccupied?: string;
  howLongVacant?: string;
  whenWillItBeVacated?: string;
  lengthOfLease?: string;
  leaseEnds?: string;
  amountOfRent?: number;
  
  // Property Notes
  reasonForSelling?: string;
  updatesCompleted?: string;
  immediateRepairsNeeded?: string;
  propertyNotes?: string;
  
  // Acquisition Financials
  customerAskingPrice?: number;
  acquisitionARVMin?: number;
  acquisitionARVMax?: number;
  acquisitionRehabEstimateMin?: number;
  acquisitionRehabEstimateMax?: number;
  acquisitionOfferMin?: number;
  acquisitionOfferMax?: number;
  acquisitionSellAtMin?: number;
  acquisitionSellAtMax?: number;
  
  // Disposition Financials
  dispositionARVMin?: number;
  dispositionARVMax?: number;
  dispositionRehabEstimateMin?: number;
  dispositionRehabEstimateMax?: number;
  dispositionOfferMin?: number;
  dispositionOfferMax?: number;
  dispositionSellAtMin?: number;
  dispositionSellAtMax?: number;
  investorProfitMin?: number;
  investorProfitMax?: number;
  
  // Comparables
  soldComparables?: ComparableProperty[];
  pendingComparables?: ComparableProperty[];
  cashComparables?: ComparableProperty[];
  rentalsComparables?: ComparableProperty[];
  
  // Mortgage Data
  hasMortgage?: string;
  mortgageBalance?: number;
  monthlyPaymentAmount?: number;
  taxesAndInsurance?: string;
  interestRate?: number;
  yearsLeftOnMortgage?: number;
  mortgageCurrent?: string;
  
  // TC Section (Transaction Coordination)
  targetCloseDate?: Date;
  inspectionPeriodDate?: Date;
  emdReceivedDate?: Date;
  nextStep?: string;
  buyerName?: string;
  buyerPhoneNumber?: string;
  buyerEmailAddress?: string;
  buyerEMDAmount?: number;
  pdrEMD?: number;
  picturesTakenBy?: string;
  whoIsGrantingAccess?: string;
  lockboxCode?: string;
  titleCompanyAssigned?: string;
  listedOnMLS?: string;
  photosLink?: string;
  dateOfSignedContract?: Date;
  dateOfPhotosReceived?: Date;
  
  createdAt?: Date;
  updatedAt?: Date;
}

// Buyer types
export interface Buyer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  buyerType: BuyerType;
  investmentRange: InvestmentRange;
  preferredPropertyTypes: PropertyType[];
  // Buy Box - geographic areas where buyer purchases properties
  buyBox?: {
    zipCodes: string[];
    states: string[];
    cities: string[];
  };
  // Optional fields used by mock data and UI
  preferredLocations?: string[];
  maxPurchasePrice?: number;
  minPurchasePrice?: number;
  cashAvailable?: number;
  financingType?: 'cash' | 'hard_money' | 'conventional';
  closingTimeframe?: string;
  source?: string;
  assignedTo?: string;
  lastContactDate?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BuyerType = 'individual' | 'company' | 'investor' | 'wholesaler' | 'flipper' | 'end_buyer';
export type InvestmentRange =
  | '0-50k'
  | '50k-100k'
  | '100k-250k'
  | '250k-500k'
  | '500k-1m'
  | '1m-2m'
  | '2m+'
  | '500k+';

// Communication types
export interface Communication {
  id: string;
  leadId: string;
  buyerId?: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CommunicationType = 'email' | 'sms' | 'phone' | 'meeting' | 'note';
export type CommunicationDirection = 'inbound' | 'outbound';
export type CommunicationStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'completed';

// Workflow types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  triggerCondition: string;
  actions: WorkflowAction[];
  isActive: boolean;
  priority: WorkflowPriority;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowTriggerType = 'manual' | 'automatic' | 'scheduled';
export type WorkflowPriority = 'low' | 'medium' | 'high';

export interface WorkflowAction {
  type: 'email' | 'sms' | 'notification' | 'status_change';
  config: Record<string, any>;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
  validation?: ValidationRule[];
}

export interface FormOption {
  value: string;
  label: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableSortConfig<T = any> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface TableFilterConfig<T = any> {
  key: keyof T;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
}

// Chart types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie';
  data: ChartData[];
  width?: number;
  height?: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// Filter types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'numberRange' | 'text';
  options?: FilterOption[];
  placeholder?: string;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavigationItem[];
  badge?: string | number;
  isActive?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  isRead?: boolean;
  createdAt: Date;
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    defaultView: string;
  };
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: TenantSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  features: string[];
  limits: {
    users: number;
    leads: number;
    storage: number;
  };
  branding: {
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: any;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} 