import { useState, useCallback } from 'react';
import { useApi } from '../useApi';
import { Buyer, PropertyType } from '../../types';

// Mock data for development/testing when API is not available
const mockBuyers: Buyer[] = [
  {
    id: '1',
    companyName: 'Acme Corp',
    contactName: 'John Doe',
    email: 'john@acme.com',
    phone: '555-0123',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    buyerType: 'company',
    investmentRange: '100k-250k',
    preferredPropertyTypes: ['single_family', 'multi_family'] as PropertyType[],
    notes: 'Interested in residential properties',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    companyName: 'Beta LLC',
    contactName: 'Jane Smith',
    email: 'jane@beta.com',
    phone: '555-0456',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    buyerType: 'individual',
    investmentRange: '50k-100k',
    preferredPropertyTypes: ['single_family'] as PropertyType[],
    notes: 'First-time buyer',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export interface CreateBuyerData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  buyerType: 'individual' | 'company' | 'investor';
  investmentRange: '0-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k+';
  preferredPropertyTypes: PropertyType[];
  notes?: string;
  isActive?: boolean;
}

export interface UpdateBuyerData extends Partial<CreateBuyerData> {}

export interface BuyersFilters {
  buyerType?: Buyer['buyerType'];
  investmentRange?: Buyer['investmentRange'];
  city?: string;
  state?: string;
  isActive?: boolean;
}

export function useBuyers() {
  const api = useApi<Buyer[]>();
  const singleBuyerApi = useApi<Buyer>();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [currentBuyer, setCurrentBuyer] = useState<Buyer | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchBuyers = useCallback(async (filters?: BuyersFilters) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.execute({
        method: 'GET',
        url: `/buyers${params.toString() ? `?${params.toString()}` : ''}`,
      });

      setBuyers(response);
      setUseMockData(false);
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data if API fails
      setBuyers(mockBuyers);
      setUseMockData(true);
      return mockBuyers;
    }
  }, [api]);

  const fetchBuyer = useCallback(async (id: string) => {
    try {
      const response = await singleBuyerApi.execute({
        method: 'GET',
        url: `/buyers/${id}`,
      });

      setCurrentBuyer(response);
      return response;
    } catch (error) {
      console.warn('API call failed for single buyer:', error);
      // Fallback to mock data
      const mockBuyer = mockBuyers.find(b => b.id === id);
      if (mockBuyer) {
        setCurrentBuyer(mockBuyer);
        return mockBuyer;
      }
      throw error;
    }
  }, [singleBuyerApi]);

  const createBuyer = useCallback(async (data: CreateBuyerData) => {
    try {
      const response = await singleBuyerApi.execute({
        method: 'POST',
        url: '/buyers',
        data,
      });

      setBuyers(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.warn('API call failed for creating buyer:', error);
      // Create mock buyer if API fails
      const mockBuyer: Buyer = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: data.isActive ?? true,
      };
      setBuyers(prev => [...prev, mockBuyer]);
      return mockBuyer;
    }
  }, [singleBuyerApi]);

  const updateBuyer = useCallback(async (id: string, data: UpdateBuyerData) => {
    try {
      const response = await singleBuyerApi.execute({
        method: 'PUT',
        url: `/buyers/${id}`,
        data,
      });

      setBuyers(prev => prev.map(buyer => buyer.id === id ? response : buyer));
      if (currentBuyer?.id === id) {
        setCurrentBuyer(response);
      }
      return response;
    } catch (error) {
      console.warn('API call failed for updating buyer:', error);
      // Update mock buyer if API fails
            setBuyers(prev => prev.map(buyer =>
        buyer.id === id
          ? { ...buyer, ...data, updatedAt: new Date(), isActive: data.isActive ?? buyer.isActive }
          : buyer
      ));
      if (currentBuyer?.id === id) {
        setCurrentBuyer(prev => prev ? { ...prev, ...data, updatedAt: new Date(), isActive: data.isActive ?? prev.isActive } : null);
      }
      return { id, ...data, updatedAt: new Date() } as Buyer;
    }
  }, [singleBuyerApi, currentBuyer]);

  const deleteBuyer = useCallback(async (id: string) => {
    try {
      await singleBuyerApi.execute({
        method: 'DELETE',
        url: `/buyers/${id}`,
      });

      setBuyers(prev => prev.filter(buyer => buyer.id !== id));
      if (currentBuyer?.id === id) {
        setCurrentBuyer(null);
      }
    } catch (error) {
      console.warn('API call failed for deleting buyer:', error);
      // Remove from mock data if API fails
      setBuyers(prev => prev.filter(buyer => buyer.id !== id));
      if (currentBuyer?.id === id) {
        setCurrentBuyer(null);
      }
    }
  }, [singleBuyerApi, currentBuyer]);

  const toggleBuyerStatus = useCallback(async (id: string) => {
    const buyer = buyers.find(b => b.id === id);
    if (!buyer) return null;

    return updateBuyer(id, { isActive: !buyer.isActive });
  }, [buyers, updateBuyer]);

  return {
    buyers,
    currentBuyer,
    loading: api.loading || singleBuyerApi.loading,
    error: api.error || singleBuyerApi.error,
    useMockData,
    fetchBuyers,
    fetchBuyer,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    toggleBuyerStatus,
    reset: () => {
      api.reset();
      singleBuyerApi.reset();
      setUseMockData(false);
    },
  };
} 