import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (config: AxiosRequestConfig) => Promise<T>;
  get: (url: string, config?: Omit<AxiosRequestConfig, 'method' | 'url'>) => Promise<T>;
  post: (url: string, data?: any, config?: Omit<AxiosRequestConfig, 'method' | 'url' | 'data'>) => Promise<T>;
  put: (url: string, data?: any, config?: Omit<AxiosRequestConfig, 'method' | 'url' | 'data'>) => Promise<T>;
  delete: (url: string, config?: Omit<AxiosRequestConfig, 'method' | 'url'>) => Promise<T>;
  reset: () => void;
}

export function useApi<T = any>(options: UseApiOptions = {}): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (config: AxiosRequestConfig): Promise<T> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Ensure the URL doesn't have double /api prefixes
        let finalUrl = config.url;
        const baseURL = options.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        
        // If the URL already starts with /api, remove it to avoid double prefixing
        if (finalUrl?.startsWith('/api')) {
          finalUrl = finalUrl.substring(4);
        }
        
        // If the URL doesn't start with /, add it
        if (finalUrl && !finalUrl.startsWith('/')) {
          finalUrl = `/${finalUrl}`;
        }

        const response: AxiosResponse<T> = await axios({
          baseURL,
          timeout: options.timeout || 10000,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...config,
          url: finalUrl,
        });

        setState({
          data: response.data,
          loading: false,
          error: null,
        });

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = (axiosError.response?.data as any)?.message || (axiosError as any).message || 'An error occurred';
        
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        throw error;
      }
    },
    [options.baseURL, options.timeout, options.headers]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const get = useCallback((url: string, config?: Omit<AxiosRequestConfig, 'method' | 'url'>) => {
    return execute({ method: 'GET', url, ...config });
  }, [execute]);

  const post = useCallback((url: string, data?: any, config?: Omit<AxiosRequestConfig, 'method' | 'url' | 'data'>) => {
    return execute({ method: 'POST', url, data, ...config });
  }, [execute]);

  const put = useCallback((url: string, data?: any, config?: Omit<AxiosRequestConfig, 'method' | 'url' | 'data'>) => {
    return execute({ method: 'PUT', url, data, ...config });
  }, [execute]);

  const del = useCallback((url: string, config?: Omit<AxiosRequestConfig, 'method' | 'url'>) => {
    return execute({ method: 'DELETE', url, ...config });
  }, [execute]);

  return {
    ...state,
    execute,
    get,
    post,
    put,
    delete: del,
    reset,
  };
}

// Convenience hooks for common HTTP methods
export function useGet<T = any>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const execute = useCallback(() => {
    return api.execute({ method: 'GET', url });
  }, [api, url]);

  return { ...api, execute };
}

export function usePost<T = any>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const execute = useCallback((data?: any) => {
    return api.execute({ method: 'POST', url, data });
  }, [api, url]);

  return { ...api, execute };
}

export function usePut<T = any>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const execute = useCallback((data?: any) => {
    return api.execute({ method: 'PUT', url, data });
  }, [api, url]);

  return { ...api, execute };
}

export function useDelete<T = any>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options);
  
  const execute = useCallback(() => {
    return api.execute({ method: 'DELETE', url });
  }, [api, url]);

  return { ...api, execute };
} 