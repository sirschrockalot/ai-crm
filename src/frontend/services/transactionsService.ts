import { v4 as uuidv4 } from 'uuid';

// API Configuration - Use Next.js API routes as proxy
const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
const TRANSACTIONS_JWT_TOKEN = process.env.NEXT_PUBLIC_TRANSACTIONS_JWT_TOKEN;

const getLiveAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export interface TransactionProperty {
  id: string;
  status: 'gathering_docs' | 'gathering_title' | 'title_issues' | 'client_help_needed' | 'on_hold' | 'pending_closing' | 'ready_to_close' | 'closed' | 'cancelled';
  propertyType?: string;
  transactionType?: string;
  loanType?: string;
  clientAccount?: string;
  preliminarySearch?: 'yes' | 'no';
  jointVenture?: 'yes' | 'no';
  dispoWithEZ?: 'yes' | 'no';
  address: string;
  city: string;
  state: string;
  zip?: string;
  
  // Seller Information
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  seller2Name?: string;
  seller2Phone?: string;
  seller2Email?: string;
  
  // Buyer Information
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  
  // Agent Details
  acquisitionsAgent?: string;
  acquisitionsAgentEmail?: string;
  acquisitionsAgentPhone?: string;
  dispositionsAgent?: string;
  dispositionsAgentEmail?: string;
  dispositionsAgentPhone?: string;
  
  // Title & Lender Details
  titleName?: string;
  titleEmail?: string;
  titlePhone?: string;
  titleOfficeAddress?: string;
  lenderName?: string;
  lenderEmail?: string;
  lenderOffice?: string;
  lenderPhone?: string;
  lenderType?: string;
  
  contractDate: string; // ISO date
  coordinatorName?: string;
  notes?: string;
  documents?: { id: string; name: string; url: string; uploadedAt: string }[];
  activities?: { id: string; user: string; userEmail: string; message: string; timestamp: string; likes: number }[];
  createdAt: string;
  updatedAt: string;
}

const mockTransactions: TransactionProperty[] = [
  {
    id: 'tx-001',
    status: 'pending_closing',
    address: '1456 Grantling St',
    city: 'Thomason',
    state: 'GA',
    zip: '30286',
    
    // Seller Information
    sellerName: 'Avell and Richard Trawick',
    sellerPhone: '478-363-7178',
    sellerEmail: 'trawick55@yahoo.com;trawick_rick@yahoo.com',
    seller2Name: '-',
    seller2Phone: '478-363-7178',
    seller2Email: 'trawick_rick@yahoo.com',
    
    // Buyer Information
    buyerName: 'Willie Little',
    buyerPhone: '(706) 601-0721',
    buyerEmail: 'willie66little1@gmail.com',
    
    // Agent Details
    acquisitionsAgent: 'Joel Schrock',
    acquisitionsAgentEmail: 'joel.schrock@presidentialdigs.com',
    acquisitionsAgentPhone: '2623979533',
    dispositionsAgent: '-',
    dispositionsAgentEmail: '-',
    dispositionsAgentPhone: '-',
    
    // Title & Lender Details
    titleName: 'McLain and Merritt',
    titleEmail: 'creid@mmatllaw.com;kkey@mmatllaw.com',
    titlePhone: '(404) 266-9171',
    titleOfficeAddress: '3445 Peachtree Road, NE, Suite 500, Atlanta, GA 30326',
    lenderName: '-',
    lenderEmail: '-',
    lenderOffice: '-',
    lenderPhone: '-',
    lenderType: '-',
    
    contractDate: '2024-01-15',
    coordinatorName: 'Amanda Young',
    propertyType: 'single_family',
    transactionType: 'assignment',
    documents: [
      { id: 'doc-001', name: 'Purchase Agreement.pdf', url: '/mock-doc-preview.png', uploadedAt: '2024-01-16T10:00:00Z' },
      { id: 'doc-002', name: 'Title Report.pdf', url: '/mock-doc-preview.png', uploadedAt: '2024-01-20T11:30:00Z' },
      { id: 'doc-003', name: 'Closing Disclosure.pdf', url: '/mock-doc-preview.png', uploadedAt: '2024-02-01T15:00:00Z' },
      { id: 'doc-004', name: 'Seller ID.jpg', url: '/mock-doc-preview.png', uploadedAt: '2024-01-15T09:00:00Z' },
      { id: 'doc-005', name: 'HOA Docs.pdf', url: '/mock-doc-preview.png', uploadedAt: '2024-01-25T13:00:00Z' },
      { id: 'doc-006', name: 'Survey.pdf', url: '/mock-doc-preview.png', uploadedAt: '2024-01-28T16:00:00Z' },
      { id: 'doc-007', name: 'Inspection Report.pdf', url: '/mock-doc-preview.png', uploadedAt: '2024-01-18T10:00:00Z' },
    ],
    activities: [
      { id: 'act-001', user: 'Claudia', userEmail: 'Claudia@ezreiclosings.com', message: '@joel.schrock@presidentialdigs.com Amanda is out of the office, moving this file towards closed', timestamp: '2024-01-20T14:30:00Z', likes: 2 },
      { id: 'act-002', user: 'Joel', userEmail: 'joel.schrock@presidentialdigs.com', message: 'Title can get moving on this until he can get the original document over to them and we can finally get this thing closed', timestamp: '2024-01-20T11:15:00Z', likes: 1 },
      { id: 'act-003', user: 'Amanda', userEmail: 'amandayoung@ezreiclosings.com', message: 'File reviewed and assigned to title company', timestamp: '2024-01-15T10:00:00Z', likes: 0 },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'tx-002',
    status: 'gathering_docs',
    address: '789 Oak Avenue',
    city: 'Atlanta',
    state: 'GA',
    zip: '30309',
    sellerName: 'Maria Rodriguez',
    contractDate: '2024-01-20',
    coordinatorName: 'Sarah Johnson',
    propertyType: 'condo',
    transactionType: 'double_close',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'tx-003',
    status: 'ready_to_close',
    address: '321 Pine Street',
    city: 'Savannah',
    state: 'GA',
    zip: '31401',
    sellerName: 'John and Lisa Smith',
    contractDate: '2024-01-10',
    coordinatorName: 'Michael Brown',
    propertyType: 'single_family',
    transactionType: 'wholetail',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
  },
  {
    id: 'tx-004',
    status: 'gathering_title',
    address: '456 Elm Drive',
    city: 'Augusta',
    state: 'GA',
    zip: '30901',
    sellerName: 'Robert Davis',
    contractDate: '2024-01-18',
    coordinatorName: 'Amanda Young',
    propertyType: 'multi_family',
    transactionType: 'assignment',
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
  },
  {
    id: 'tx-005',
    status: 'on_hold',
    address: '987 Maple Lane',
    city: 'Columbus',
    state: 'GA',
    zip: '31901',
    sellerName: 'Jennifer Wilson',
    contractDate: '2024-01-12',
    coordinatorName: 'Sarah Johnson',
    propertyType: 'single_family',
    transactionType: 'double_close',
    notes: 'Waiting for seller to provide additional documentation',
    createdAt: '2024-01-12T16:20:00Z',
    updatedAt: '2024-01-12T16:20:00Z',
  },
];

// Helper function to make API calls through Next.js API routes
const apiCall = async (endpoint: string, options: any = {}) => {
  // Use Next.js API route as proxy instead of calling service directly
  const url = `${API_BASE_URL}/api/transactions${endpoint}`;
  
  // Check if auth bypass is enabled
  const bypassAuth = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  
  const token = getLiveAuthToken() || TRANSACTIONS_JWT_TOKEN;
  
  // Only require token if bypass auth is not enabled
  if (!bypassAuth && !token) {
    // Don't throw error immediately - let the API route handle it
    // This allows the user to see the page even if token is missing
    console.warn('Authentication token not found. API call may fail.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Only add Authorization header if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });

  if (response.status === 401) {
    // Token might be expired, try to refresh or redirect to login
    if (!bypassAuth && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      // Only redirect if not in bypass mode
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

  return response.json();
};

export const transactionsService = {
  async list(): Promise<TransactionProperty[]> {
    try {
      return await apiCall('');
    } catch (error: any) {
      // Check if it's an authentication error and bypass is enabled
      const bypassAuth = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      if (bypassAuth && error.message?.includes('Authentication')) {
        // In bypass mode, still try to return empty array or mock data
        console.warn('Auth bypass enabled, using mock data:', error.message);
        return [...mockTransactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      return [...mockTransactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },

  async get(id: string): Promise<TransactionProperty | null> {
    try {
      return await apiCall(`/${id}`);
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      return mockTransactions.find(t => t.id === id) || null;
    }
  },

  async create(data: Omit<TransactionProperty, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: TransactionProperty['status'] }): Promise<TransactionProperty> {
    try {
      return await apiCall('', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      const now = new Date().toISOString();
      const record: TransactionProperty = {
        id: uuidv4(),
        status: data.status ?? 'gathering_docs',
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      mockTransactions.unshift(record);
      return record;
    }
  },

  async update(id: string, data: Partial<TransactionProperty>): Promise<TransactionProperty | null> {
    try {
      return await apiCall(`/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      const idx = mockTransactions.findIndex(t => t.id === id);
      if (idx === -1) return null;
      mockTransactions[idx] = { ...mockTransactions[idx], ...data, updatedAt: new Date().toISOString() };
      return mockTransactions[idx];
    }
  },

  async updateStatus(id: string, status: TransactionProperty['status']): Promise<TransactionProperty | null> {
    try {
      return await apiCall(`/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      const idx = mockTransactions.findIndex(t => t.id === id);
      if (idx === -1) return null;
      mockTransactions[idx] = { ...mockTransactions[idx], status, updatedAt: new Date().toISOString() };
      return mockTransactions[idx];
    }
  },

  async addActivity(id: string, activity: { user: string; userEmail: string; message: string }): Promise<TransactionProperty | null> {
    try {
      return await apiCall(`/${id}/activities`, {
        method: 'POST',
        body: JSON.stringify(activity),
      });
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      const transaction = mockTransactions.find(tx => tx.id === id);
      if (transaction) {
        const newActivity = {
          id: uuidv4(),
          ...activity,
          timestamp: new Date().toISOString(),
          likes: 0,
        };
        transaction.activities = [newActivity, ...(transaction.activities || [])];
        transaction.updatedAt = new Date().toISOString();
        return transaction;
      }
      return null;
    }
  },

  async uploadDocument(id: string, file: File): Promise<TransactionProperty | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = getLiveAuthToken() || TRANSACTIONS_JWT_TOKEN;
      
      const response = await fetch(`${API_BASE_URL}/api/transactions/${id}/documents`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      const transaction = mockTransactions.find(tx => tx.id === id);
      if (transaction) {
        const newDocument = {
          id: uuidv4(),
          name: file.name,
          url: '/mock-doc-preview.png',
          uploadedAt: new Date().toISOString(),
        };
        transaction.documents = [...(transaction.documents || []), newDocument];
        transaction.updatedAt = new Date().toISOString();
        return transaction;
      }
      return null;
    }
  },
};


