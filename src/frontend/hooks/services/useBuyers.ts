import { useState, useCallback } from 'react';
import { useApi } from '../useApi';

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
  buyerType: 'individual' | 'company' | 'investor';
  investmentRange: '0-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k+';
  preferredPropertyTypes: string[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  preferredPropertyTypes: string[];
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

  const fetchBuyers = useCallback(async (filters?: BuyersFilters) => {
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
      url: `/api/buyers${params.toString() ? `?${params.toString()}` : ''}`,
    });

    setBuyers(response);
    return response;
  }, [api]);

  const fetchBuyer = useCallback(async (id: string) => {
    const response = await singleBuyerApi.execute({
      method: 'GET',
      url: `/api/buyers/${id}`,
    });

    setCurrentBuyer(response);
    return response;
  }, [singleBuyerApi]);

  const createBuyer = useCallback(async (data: CreateBuyerData) => {
    const response = await singleBuyerApi.execute({
      method: 'POST',
      url: '/api/buyers',
      data,
    });

    setBuyers(prev => [...prev, response]);
    return response;
  }, [singleBuyerApi]);

  const updateBuyer = useCallback(async (id: string, data: UpdateBuyerData) => {
    const response = await singleBuyerApi.execute({
      method: 'PUT',
      url: `/api/buyers/${id}`,
      data,
    });

    setBuyers(prev => prev.map(buyer => buyer.id === id ? response : buyer));
    if (currentBuyer?.id === id) {
      setCurrentBuyer(response);
    }
    return response;
  }, [singleBuyerApi, currentBuyer]);

  const deleteBuyer = useCallback(async (id: string) => {
    await singleBuyerApi.execute({
      method: 'DELETE',
      url: `/api/buyers/${id}`,
    });

    setBuyers(prev => prev.filter(buyer => buyer.id !== id));
    if (currentBuyer?.id === id) {
      setCurrentBuyer(null);
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
    fetchBuyers,
    fetchBuyer,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    toggleBuyerStatus,
    reset: () => {
      api.reset();
      singleBuyerApi.reset();
    },
  };
} 