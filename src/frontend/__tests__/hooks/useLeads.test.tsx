import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLeads } from '../../hooks/services/useLeads';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Mock the useApi hook
jest.mock('../../hooks/useApi', () => ({
  useApi: () => ({
    execute: jest.fn(),
    loading: false,
    error: null,
    reset: jest.fn(),
  }),
}));

describe('useLeads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useLeads());

    expect(result.current.leads).toEqual([]);
    expect(result.current.currentLead).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch leads successfully', async () => {
    const { result } = renderHook(() => useLeads());

    await act(async () => {
      await result.current.fetchLeads();
    });

    await waitFor(() => {
      expect(result.current.leads).toHaveLength(2);
      expect(result.current.leads[0].firstName).toBe('John');
      expect(result.current.leads[1].firstName).toBe('Jane');
    });
  });

  it('should create a new lead', async () => {
    const { result } = renderHook(() => useLeads());

    const newLead = {
      firstName: 'New',
      lastName: 'Lead',
      email: 'new@example.com',
      phone: '555-9999',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      propertyType: 'single_family' as const,
      estimatedValue: 300000,
    };

    await act(async () => {
      await result.current.createLead(newLead);
    });

    await waitFor(() => {
      expect(result.current.leads).toHaveLength(1);
      expect(result.current.leads[0].firstName).toBe('New');
    });
  });

  it('should update a lead', async () => {
    const { result } = renderHook(() => useLeads());

    // First fetch leads
    await act(async () => {
      await result.current.fetchLeads();
    });

    // Then update a lead
    await act(async () => {
      await result.current.updateLead('1', { firstName: 'Updated' });
    });

    await waitFor(() => {
      const updatedLead = result.current.leads.find(lead => lead.id === '1');
      expect(updatedLead?.firstName).toBe('Updated');
    });
  });

  it('should delete a lead', async () => {
    const { result } = renderHook(() => useLeads());

    // First fetch leads
    await act(async () => {
      await result.current.fetchLeads();
    });

    // Then delete a lead
    await act(async () => {
      await result.current.deleteLead('1');
    });

    await waitFor(() => {
      expect(result.current.leads).toHaveLength(1);
      expect(result.current.leads.find(lead => lead.id === '1')).toBeUndefined();
    });
  });

  it('should handle API errors', async () => {
    // Override the default handler for this test
    server.use(
      rest.get('/api/leads', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Internal server error' }));
      })
    );

    const { result } = renderHook(() => useLeads());

    await act(async () => {
      await result.current.fetchLeads();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should handle bulk operations', async () => {
    const { result } = renderHook(() => useLeads());

    await act(async () => {
      await result.current.bulkUpdate(['1', '2'], { status: 'qualified' });
    });

    await waitFor(() => {
      expect(result.current.bulkOperation).toBeTruthy();
    });
  });

  it('should validate lead IDs', async () => {
    const { result } = renderHook(() => useLeads());

    await act(async () => {
      const validation = await result.current.validateLeadIds(['1', '2', 'invalid']);
      expect(validation.validIds).toContain('1');
      expect(validation.validIds).toContain('2');
      expect(validation.invalidIds).toContain('invalid');
    });
  });

  it('should get bulk operation stats', async () => {
    const { result } = renderHook(() => useLeads());

    await act(async () => {
      const stats = await result.current.getBulkOperationStats(['1', '2']);
      expect(stats.totalLeads).toBe(2);
      expect(stats.validLeads).toBe(2);
    });
  });
}); 