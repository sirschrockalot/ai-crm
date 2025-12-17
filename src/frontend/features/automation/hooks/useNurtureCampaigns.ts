import { useState, useCallback, useEffect } from 'react';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { NurtureConfig, NurtureCampaign, NurtureSchedule } from '../types/nurture';

export const useNurtureCampaigns = () => {
  const { isAuthenticated } = useAuth();
  const api = useApi<NurtureConfig>();

  const [config, setConfig] = useState<NurtureConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (!isAuthenticated) {
      setConfig(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await api.execute({ method: 'GET', url: '/api/automation/nurture' });
      setConfig(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load nurture config';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [api, isAuthenticated]);

  const saveConfig = useCallback(
    async (partial: Partial<NurtureConfig>) => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        setError(null);
        const next = await api.execute({
          method: 'PUT',
          url: '/api/automation/nurture',
          data: partial,
        });
        setConfig(next);
        return next;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save nurture config';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, isAuthenticated],
  );

  const updateSchedule = useCallback(
    async (schedule: NurtureSchedule) => {
      return saveConfig({ schedule });
    },
    [saveConfig],
  );

  const updateCampaigns = useCallback(
    async (campaigns: NurtureCampaign[]) => {
      return saveConfig({ campaigns });
    },
    [saveConfig],
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    campaigns: config?.campaigns || [],
    schedule: config?.schedule || null,
    loading: loading || api.loading,
    error: error || api.error,
    loadConfig,
    updateSchedule,
    updateCampaigns,
  };
};


