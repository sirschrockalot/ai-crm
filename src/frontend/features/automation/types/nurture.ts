// Nurture SMS campaign types for automation

export type NurtureLeadStatus =
  | 'still_on_cloud'
  | 'wants_retail'
  | 'working_with_competitor'
  | 'no_longer_want_to_sell'
  | 'not_interested'
  | 'rejected_offer'
  | 'interested_not_ready_now'
  | 'listed_with_realtor';

export interface NurtureStep {
  id: string;
  reason: string; // e.g. "Still on Cloud"
  dayOffset: number; // days after lead created / last nurture
  smsTemplate: string;
  isActive: boolean;
}

export interface NurtureCampaign {
  id: string;
  name: string;
  leadStatus: NurtureLeadStatus;
  description?: string;
  isActive: boolean;
  steps: NurtureStep[];
}

export interface NurtureSchedule {
  id: string;
  label: string;
  activeDays: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
}

export interface NurtureConfig {
  campaigns: NurtureCampaign[];
  schedule: NurtureSchedule;
}


