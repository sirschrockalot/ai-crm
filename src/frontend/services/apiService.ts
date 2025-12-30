import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { withErrorHandling, formatErrorForUser } from '../utils/error';
import { trackApiError, trackApiSuccess } from './statsService';

export interface ApiServiceConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  enableCache?: boolean;
  cacheTimeout?: number;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  useCache?: boolean;
  cacheKey?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

class ApiService {
  private instance: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private config: ApiServiceConfig;

  constructor(config: ApiServiceConfig = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 10000,
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      ...config,
    };

    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // If sending FormData, let the browser/axios set the correct multipart headers
        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
          if (config.headers) {
            // Axios flattens headers; handle both common and direct keys
            delete (config.headers as any)['Content-Type'];
          }
        }

        // Add authentication token
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Track successful API calls for error rate calculation
        trackApiSuccess();
        return response;
      },
      async (error: AxiosError) => {
        // Track API errors for error rate calculation
        if (error.response && error.response.status >= 400) {
          trackApiError();
        }
        const originalRequest = error.config as any;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAuthToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Token refresh failed, redirect to login
            this.handleAuthError();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async refreshAuthToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await axios.post(`${this.config.baseURL}/api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken } = response.data;
      localStorage.setItem('auth_token', accessToken);
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  private handleAuthError() {
    // Clear tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');

    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCacheKey(config: ApiRequestConfig): string {
    return config.cacheKey || `${config.method}_${config.url}_${JSON.stringify(config.params || {})}`;
  }

  private getCachedData(cacheKey: string): any | null {
    if (!this.config.enableCache) return null;

    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout!) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCachedData(cacheKey: string, data: any): void {
    if (!this.config.enableCache) return;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  public async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const wrappedFunction = withErrorHandling(async () => {
      // Check cache for GET requests
      if (config.method?.toUpperCase() === 'GET' && config.useCache !== false) {
        const cacheKey = this.getCacheKey(config);
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
          return {
            data: cachedData,
            status: 200,
            statusText: 'OK',
            headers: {},
          };
        }
      }

      // Make the request
      const response: AxiosResponse<T> = await this.instance(config);

      // Cache successful GET responses
      if (config.method?.toUpperCase() === 'GET' && config.useCache !== false) {
        const cacheKey = this.getCacheKey(config);
        this.setCachedData(cacheKey, response.data);
      }

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    }, (error) => {
      const apiError: ApiError = {
        message: formatErrorForUser(error),
        code: (error as AxiosError).code,
        status: (error as AxiosError).response?.status,
        details: (error as AxiosError).response?.data,
      };
      throw apiError;
    });

    return await wrappedFunction();
  }

  public async get<T = any>(url: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T = any>(url: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T = any>(url: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  public invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.clearCache();
      return;
    }

    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get('/api/health');
      return true;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  }
}

// Create default instance
export const apiService = new ApiService();

// Export for use in other modules
export default apiService;
