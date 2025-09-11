import { useState, useCallback, useEffect } from 'react';
import { apiService, ApiResponse, ApiError } from '../services/apiService';
import { loadingService } from '../services/loadingService';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from './useLocalStorage';
import { useDebouncedCallback } from './useDebounce';
import { withErrorHandling, formatErrorForUser } from '../utils/error';

export interface UseSharedApiOptions {
  enableCache?: boolean;
  cacheKey?: string;
  loadingId?: string;
  debounceMs?: number;
  autoExecute?: boolean;
  dependencies?: any[];
}

export interface UseSharedApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (config?: any) => Promise<T>;
  reset: () => void;
  clearCache: () => void;
}

// Development mode authentication bypass
const isDevelopmentMode = process.env.NODE_ENV === 'development';
const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

export function useSharedApi<T = any>(
  options: UseSharedApiOptions = {}
): UseSharedApiReturn<T> {
  const {
    enableCache = true,
    cacheKey,
    loadingId,
    debounceMs = 0,
    autoExecute = false,
    dependencies = [],
  } = options;

  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local storage for caching
  const [cachedData, setCachedData] = useLocalStorage<string | null>(
    cacheKey || 'shared_api_cache',
    null
  );

  const execute = useCallback(
    withErrorHandling(async (config?: any) => {
      // Skip authentication check in development mode
      if (!bypassAuth && !isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Try to load cached data first
      if (enableCache && !config && cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setData(parsed);
          return parsed;
        } catch (error) {
          console.warn('Failed to parse cached data:', error);
        }
      }

      // Start loading
      setLoading(true);
      setError(null);
      if (loadingId) {
        loadingService.startLoading(loadingId);
      }

      try {
        const response: ApiResponse<T> = await apiService.request<T>({
          ...config,
          useCache: enableCache,
          cacheKey: cacheKey || config?.url,
        });

        setData(response.data);
        
        // Cache the response
        if (enableCache) {
          setCachedData(JSON.stringify(response.data));
        }

        return response.data;
      } catch (err) {
        const apiError = err as ApiError;
        const errorMessage = formatErrorForUser(apiError);
        setError(errorMessage);
        throw apiError;
      } finally {
        setLoading(false);
        if (loadingId) {
          loadingService.stopLoading(loadingId);
        }
      }
    }, (error) => {
      console.error('API execution error:', error);
      setError(formatErrorForUser(error));
      setLoading(false);
      if (loadingId) {
        loadingService.stopLoading(loadingId);
      }
      throw error;
    }),
    [isAuthenticated, enableCache, cacheKey, loadingId, cachedData, setCachedData]
  );

  // Debounced execute function (only if debounceMs > 0)
  const debouncedExecute = useDebouncedCallback(execute, debounceMs);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const clearCache = useCallback(() => {
    if (cacheKey) {
      apiService.invalidateCache(cacheKey);
    }
    setCachedData(null);
  }, [cacheKey, setCachedData]);

  // Auto-execute if enabled
  useEffect(() => {
    if (autoExecute && (bypassAuth || isAuthenticated)) {
      execute();
    }
  }, [autoExecute, isAuthenticated, execute, ...dependencies]);

  return {
    data,
    loading,
    error,
    execute: debounceMs > 0 ? debouncedExecute : execute,
    reset,
    clearCache,
  };
}

// Specialized hooks for common HTTP methods
export function useGet<T = any>(
  url: string,
  options: UseSharedApiOptions = {}
): UseSharedApiReturn<T> {
  const api = useSharedApi<T>(options);
  
  const execute = useCallback(
    async (config?: any) => {
      return await api.execute({
        method: 'GET',
        url,
        ...config,
      });
    },
    [api, url]
  );

  return {
    ...api,
    execute,
  };
}

export function usePost<T = any>(
  url: string,
  options: UseSharedApiOptions = {}
): UseSharedApiReturn<T> {
  const api = useSharedApi<T>(options);
  
  const execute = useCallback(
    async (data?: any, config?: any) => {
      return await api.execute({
        method: 'POST',
        url,
        data,
        ...config,
      });
    },
    [api, url]
  );

  return {
    ...api,
    execute,
  };
}

export function usePut<T = any>(
  url: string,
  options: UseSharedApiOptions = {}
): UseSharedApiReturn<T> {
  const api = useSharedApi<T>(options);
  
  const execute = useCallback(
    async (data?: any, config?: any) => {
      return await api.execute({
        method: 'PUT',
        url,
        data,
        ...config,
      });
    },
    [api, url]
  );

  return {
    ...api,
    execute,
  };
}

export function useDelete<T = any>(
  url: string,
  options: UseSharedApiOptions = {}
): UseSharedApiReturn<T> {
  const api = useSharedApi<T>(options);
  
  const execute = useCallback(
    async (config?: any) => {
      return await api.execute({
        method: 'DELETE',
        url,
        ...config,
      });
    },
    [api, url]
  );

  return {
    ...api,
    execute,
  };
}
