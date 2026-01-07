/**
 * ATS Service
 * Manages Application Tracking System operations
 */

export enum CandidateStatus {
  APPLICATION_RECEIVED = 'application_received',
  RESUME_REVIEW = 'resume_review',
  PHONE_SCREEN_SCHEDULED = 'phone_screen_scheduled',
  PHONE_SCREEN_COMPLETED = 'phone_screen_completed',
  TEAM_REVIEW = 'team_review',
  VIDEO_INTERVIEW_SCHEDULED = 'video_interview_scheduled',
  VIDEO_INTERVIEW_COMPLETED = 'video_interview_completed',
  OFFER_EXTENDED = 'offer_extended',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
}

export interface Skill {
  name: string;
  level?: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  contact: ContactInfo;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  certifications?: string[];
  documents?: any[];
  status: CandidateStatus;
  resumeText?: string;
  coverLetterText?: string;
  notes?: string;
  tags?: string[];
  source?: string;
  applicationDate?: string;
  lastContactDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryCandidatesParams {
  search?: string;
  status?: CandidateStatus;
  source?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
}

const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

const getLiveAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

const apiCall = async (endpoint: string, options: any = {}) => {
  const url = `${API_BASE_URL}/api/ats${endpoint}`;
  
  const token = getLiveAuthToken();
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  if (!token && !bypassAuth) {
    console.error('Authentication token not found for API call to:', url);
    throw new Error('Authentication token not found. Please log in again.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });

    if (response.status === 401) {
      if (!bypassAuth && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'true') {
          window.location.href = '/auth/login';
        }
      }
      throw new Error('Authentication failed. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API call failed: ${response.status} ${errorData.message || response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error('ATS Service API call error:', error);
    throw error;
  }
};

class AtsService {
  // Candidates
  async listCandidates(params?: QueryCandidatesParams): Promise<CandidatesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.source) queryParams.append('source', params.source);
      if (params?.tag) queryParams.append('tag', params.tag);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const endpoint = `/candidates${queryString ? `?${queryString}` : ''}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Error loading candidates:', error);
      throw error;
    }
  }

  async getCandidate(id: string): Promise<Candidate> {
    try {
      return await apiCall(`/candidates/${id}`);
    } catch (error) {
      console.error('Error loading candidate:', error);
      throw error;
    }
  }

  async createCandidate(candidate: Partial<Candidate>): Promise<Candidate> {
    try {
      return await apiCall('/candidates', {
        method: 'POST',
        body: JSON.stringify(candidate),
      });
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    try {
      return await apiCall(`/candidates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }

  async deleteCandidate(id: string): Promise<void> {
    try {
      await apiCall(`/candidates/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }

  async updateCandidateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return this.updateCandidate(id, { status });
  }

  // Interviews
  async listInterviews(params?: {
    candidateId?: string;
    jobPostingId?: string;
    type?: string;
    status?: string;
    interviewerId?: string;
    scheduledDateFrom?: string;
    scheduledDateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ interviews: any[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.candidateId) queryParams.append('candidateId', params.candidateId);
      if (params?.jobPostingId) queryParams.append('jobPostingId', params.jobPostingId);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.interviewerId) queryParams.append('interviewerId', params.interviewerId);
      if (params?.scheduledDateFrom) queryParams.append('scheduledDateFrom', params.scheduledDateFrom);
      if (params?.scheduledDateTo) queryParams.append('scheduledDateTo', params.scheduledDateTo);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/interviews${queryString ? `?${queryString}` : ''}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Error loading interviews:', error);
      throw error;
    }
  }

  async getInterview(id: string): Promise<any> {
    try {
      return await apiCall(`/interviews/${id}`);
    } catch (error) {
      console.error('Error loading interview:', error);
      throw error;
    }
  }

  async createInterview(interview: any): Promise<any> {
    try {
      return await apiCall('/interviews', {
        method: 'POST',
        body: JSON.stringify(interview),
      });
    } catch (error) {
      console.error('Error creating interview:', error);
      throw error;
    }
  }

  async updateInterview(id: string, updates: any): Promise<any> {
    try {
      return await apiCall(`/interviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    }
  }

  async startInterview(id: string): Promise<any> {
    try {
      return await apiCall(`/interviews/${id}/start`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  async completeInterview(id: string, scores: any): Promise<any> {
    try {
      return await apiCall(`/interviews/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(scores),
      });
    } catch (error) {
      console.error('Error completing interview:', error);
      throw error;
    }
  }

  async getUpcomingInterviews(interviewerId?: string, limit?: number): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (interviewerId) queryParams.append('interviewerId', interviewerId);
      if (limit) queryParams.append('limit', limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/interviews/upcoming${queryString ? `?${queryString}` : ''}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Error loading upcoming interviews:', error);
      throw error;
    }
  }

  async getCalendarInterviews(startDate: string, endDate: string): Promise<any[]> {
    try {
      const endpoint = `/interviews/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Error loading calendar interviews:', error);
      throw error;
    }
  }

  // Scripts
  async listScripts(params?: {
    search?: string;
    jobRole?: string;
    tag?: string;
    isTemplate?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ scripts: any[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.jobRole) queryParams.append('jobRole', params.jobRole);
      if (params?.tag) queryParams.append('tag', params.tag);
      if (params?.isTemplate !== undefined) queryParams.append('isTemplate', params.isTemplate.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/scripts${queryString ? `?${queryString}` : ''}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Error loading scripts:', error);
      throw error;
    }
  }

  async getScript(id: string): Promise<any> {
    try {
      return await apiCall(`/scripts/${id}`);
    } catch (error) {
      console.error('Error loading script:', error);
      throw error;
    }
  }

  async getScriptTemplates(): Promise<any[]> {
    try {
      return await apiCall('/scripts/templates');
    } catch (error) {
      console.error('Error loading script templates:', error);
      throw error;
    }
  }

  async createScript(script: any): Promise<any> {
    try {
      return await apiCall('/scripts', {
        method: 'POST',
        body: JSON.stringify(script),
      });
    } catch (error) {
      console.error('Error creating script:', error);
      throw error;
    }
  }

  async cloneScript(id: string, newName: string): Promise<any> {
    try {
      return await apiCall(`/scripts/${id}/clone`, {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      });
    } catch (error) {
      console.error('Error cloning script:', error);
      throw error;
    }
  }

  // Applications
  async listApplications(params?: {
    candidateId?: string;
    jobPostingId?: string;
    source?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ applications: any[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.candidateId) queryParams.append('candidateId', params.candidateId);
      if (params?.jobPostingId) queryParams.append('jobPostingId', params.jobPostingId);
      if (params?.source) queryParams.append('source', params.source);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/applications${queryString ? `?${queryString}` : ''}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Error loading applications:', error);
      throw error;
    }
  }

  async getApplication(id: string): Promise<any> {
    try {
      return await apiCall(`/applications/${id}`);
    } catch (error) {
      console.error('Error loading application:', error);
      throw error;
    }
  }

  async createApplication(application: any): Promise<any> {
    try {
      return await apiCall('/applications', {
        method: 'POST',
        body: JSON.stringify(application),
      });
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  // Job Postings
  async listJobPostings(params?: {
    search?: string;
    department?: string;
    status?: string;
    location?: string;
    isRemote?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ jobPostings: any[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.location) queryParams.append('location', params.location);
      if (params?.isRemote !== undefined) queryParams.append('isRemote', params.isRemote.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/job-postings${queryString ? `?${queryString}` : ''}`;
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Error loading job postings:', error);
      throw error;
    }
  }

  async getJobPosting(id: string): Promise<any> {
    try {
      return await apiCall(`/job-postings/${id}`);
    } catch (error) {
      console.error('Error loading job posting:', error);
      throw error;
    }
  }

  async createJobPosting(jobPosting: any): Promise<any> {
    try {
      return await apiCall('/job-postings', {
        method: 'POST',
        body: JSON.stringify(jobPosting),
      });
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  }

  // Team Review - Get top candidates by interview score
  async getTopCandidatesForReview(params?: {
    jobPostingId?: string;
    limit?: number;
    minScore?: number;
  }): Promise<any[]> {
    try {
      // Get completed interviews with scores
      const interviews = await this.listInterviews({
        status: 'completed',
        jobPostingId: params?.jobPostingId,
        limit: params?.limit || 50,
      });

      // Filter by minimum score and sort by total score
      let candidates = interviews.interviews
        .filter(i => !params?.minScore || (i.totalScore || 0) >= params.minScore)
        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

      // Get candidate details
      const candidateIds = [...new Set(candidates.map(i => i.candidateId))];
      const candidatePromises = candidateIds.map(id => this.getCandidate(id).catch(() => null));
      const candidatesData = await Promise.all(candidatePromises);

      // Combine interview scores with candidate data
      return candidates
        .map(interview => {
          const candidate = candidatesData.find(c => c && c.id === interview.candidateId);
          return {
            candidate,
            interview,
            score: interview.totalScore || 0,
            recommendation: interview.recommendation,
          };
        })
        .filter(item => item.candidate)
        .slice(0, params?.limit || 10);
    } catch (error) {
      console.error('Error loading top candidates for review:', error);
      throw error;
    }
  }
}

export const atsService = new AtsService();
export default atsService;

