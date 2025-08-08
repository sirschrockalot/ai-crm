import { useState, useCallback } from 'react';
import { useApi } from '../useApi';

export interface Communication {
  id: string;
  leadId: string;
  buyerId?: string;
  type: 'email' | 'sms' | 'phone' | 'meeting' | 'note';
  subject?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommunicationData {
  leadId: string;
  buyerId?: string;
  type: 'email' | 'sms' | 'phone' | 'meeting' | 'note';
  subject?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  scheduledAt?: Date;
}

export interface UpdateCommunicationData extends Partial<CreateCommunicationData> {
  status?: Communication['status'];
  sentAt?: Date;
}

export interface CommunicationsFilters {
  leadId?: string;
  buyerId?: string;
  type?: Communication['type'];
  direction?: Communication['direction'];
  status?: Communication['status'];
  startDate?: Date;
  endDate?: Date;
}

export function useCommunications() {
  const api = useApi<Communication[]>();
  const singleCommunicationApi = useApi<Communication>();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [currentCommunication, setCurrentCommunication] = useState<Communication | null>(null);

  const fetchCommunications = useCallback(async (filters?: CommunicationsFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.execute({
      method: 'GET',
      url: `/api/communications${params.toString() ? `?${params.toString()}` : ''}`,
    });

    setCommunications(response);
    return response;
  }, [api]);

  const fetchCommunication = useCallback(async (id: string) => {
    const response = await singleCommunicationApi.execute({
      method: 'GET',
      url: `/api/communications/${id}`,
    });

    setCurrentCommunication(response);
    return response;
  }, [singleCommunicationApi]);

  const createCommunication = useCallback(async (data: CreateCommunicationData) => {
    const response = await singleCommunicationApi.execute({
      method: 'POST',
      url: '/api/communications',
      data,
    });

    setCommunications(prev => [...prev, response]);
    return response;
  }, [singleCommunicationApi]);

  const updateCommunication = useCallback(async (id: string, data: UpdateCommunicationData) => {
    const response = await singleCommunicationApi.execute({
      method: 'PUT',
      url: `/api/communications/${id}`,
      data,
    });

    setCommunications(prev => prev.map(comm => comm.id === id ? response : comm));
    if (currentCommunication?.id === id) {
      setCurrentCommunication(response);
    }
    return response;
  }, [singleCommunicationApi, currentCommunication]);

  const deleteCommunication = useCallback(async (id: string) => {
    await singleCommunicationApi.execute({
      method: 'DELETE',
      url: `/api/communications/${id}`,
    });

    setCommunications(prev => prev.filter(comm => comm.id !== id));
    if (currentCommunication?.id === id) {
      setCurrentCommunication(null);
    }
  }, [singleCommunicationApi, currentCommunication]);

  const sendCommunication = useCallback(async (id: string) => {
    const response = await singleCommunicationApi.execute({
      method: 'POST',
      url: `/api/communications/${id}/send`,
    });

    setCommunications(prev => prev.map(comm => comm.id === id ? response : comm));
    if (currentCommunication?.id === id) {
      setCurrentCommunication(response);
    }
    return response;
  }, [singleCommunicationApi, currentCommunication]);

  const getLeadCommunications = useCallback(async (leadId: string) => {
    return fetchCommunications({ leadId });
  }, [fetchCommunications]);

  const getBuyerCommunications = useCallback(async (buyerId: string) => {
    return fetchCommunications({ buyerId });
  }, [fetchCommunications]);

  return {
    communications,
    currentCommunication,
    loading: api.loading || singleCommunicationApi.loading,
    error: api.error || singleCommunicationApi.error,
    fetchCommunications,
    fetchCommunication,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    sendCommunication,
    getLeadCommunications,
    getBuyerCommunications,
    reset: () => {
      api.reset();
      singleCommunicationApi.reset();
    },
  };
} 