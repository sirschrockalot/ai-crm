// Shared Hooks Library
// This file consolidates common hooks for the monolithic application

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';

// Shared API Hook
export const useSharedApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const executeRequest = useCallback(async (apiCall: () => Promise<any>, options?: {
    showToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (options?.showToast && options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = options?.errorMessage || 'An error occurred';
      setError(errorMessage);
      
      if (options?.showToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    executeRequest,
    clearError: () => setError(null),
  };
};

// Shared Form Hook
export const useSharedForm = (initialValues: any, validationSchema?: any) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(async () => {
    if (!validationSchema) return true;
    
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors: any) {
      const newErrors: Record<string, string> = {};
      validationErrors.inner.forEach((error: any) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (onSubmit: (values: any) => Promise<void>) => {
    setIsSubmitting(true);
    
    try {
      const isValid = await validate();
      if (isValid) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setValues,
  };
};

// Shared Navigation Hook
export const useSharedNavigation = () => {
  const router = useRouter();

  const navigate = useCallback((path: string, options?: {
    replace?: boolean;
    shallow?: boolean;
    scroll?: boolean;
  }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }, [router]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const isActive = useCallback((path: string) => {
    return router.pathname === path;
  }, [router.pathname]);

  return {
    navigate,
    goBack,
    isActive,
    currentPath: router.pathname,
    query: router.query,
  };
};

// Shared State Management Hook
export const useSharedState = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return {
    state,
    setState,
    updateState,
    resetState,
  };
};

// Shared Pagination Hook
export const useSharedPagination = (initialPage = 1, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    setTotalItems,
    resetPagination,
  };
};

// Shared Search Hook
export const useSharedSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (searchFunction: (query: string) => Promise<any>) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      await searchFunction(query);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    isSearching,
    search,
    clearSearch,
  };
};

// Shared Modal Hook
export const useSharedModal = (initialIsOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [data, setData] = useState<any>(null);

  const openModal = useCallback((modalData?: any) => {
    setIsOpen(true);
    if (modalData) {
      setData(modalData);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
  };
};

// Shared Loading Hook
export const useSharedLoading = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [loadingText, setLoadingText] = useState('');

  const startLoading = useCallback((text?: string) => {
    setLoading(true);
    if (text) {
      setLoadingText(text);
    }
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoadingText('');
  }, []);

  return {
    loading,
    loadingText,
    startLoading,
    stopLoading,
  };
};

// Export all hooks
export default {
  useSharedApi,
  useSharedForm,
  useSharedNavigation,
  useSharedState,
  useSharedPagination,
  useSharedSearch,
  useSharedModal,
  useSharedLoading,
};
