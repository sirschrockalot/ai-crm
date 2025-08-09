import { renderHook, act, waitFor } from '@testing-library/react';
import { useSharedApi, useSharedForm, useSharedNavigation, useSharedState, useSharedPagination, useSharedSearch, useSharedModal, useSharedLoading } from '@/components/shared/SharedHooks';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/test',
    query: { page: '1' },
  }),
}));

// Mock Chakra UI toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(),
}));

describe('Shared Hooks', () => {
  describe('useSharedApi', () => {
    test('should handle successful API calls', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'success' });
      
      const { result } = renderHook(() => useSharedApi());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      
      await act(async () => {
        const response = await result.current.executeRequest(mockApiCall);
        expect(response).toEqual({ data: 'success' });
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    test('should handle API errors', async () => {
      const mockApiCall = jest.fn().mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useSharedApi());
      
      await act(async () => {
        try {
          await result.current.executeRequest(mockApiCall);
        } catch (error) {
          // Expected to throw
        }
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('An error occurred');
    });

    test('should clear error', () => {
      const { result } = renderHook(() => useSharedApi());
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('useSharedForm', () => {
    test('should initialize with default values', () => {
      const initialValues = { name: '', email: '' };
      
      const { result } = renderHook(() => useSharedForm(initialValues));
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });

    test('should handle field changes', () => {
      const initialValues = { name: '', email: '' };
      
      const { result } = renderHook(() => useSharedForm(initialValues));
      
      act(() => {
        result.current.handleChange('name', 'John Doe');
      });
      
      expect(result.current.values.name).toBe('John Doe');
    });

    test('should handle field blur', () => {
      const initialValues = { name: '', email: '' };
      
      const { result } = renderHook(() => useSharedForm(initialValues));
      
      act(() => {
        result.current.handleBlur('name');
      });
      
      expect(result.current.touched.name).toBe(true);
    });

    test('should handle form submission', async () => {
      const initialValues = { name: '', email: '' };
      const mockOnSubmit = jest.fn();
      
      const { result } = renderHook(() => useSharedForm(initialValues));
      
      await act(async () => {
        await result.current.handleSubmit(mockOnSubmit);
      });
      
      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    test('should reset form', () => {
      const initialValues = { name: '', email: '' };
      
      const { result } = renderHook(() => useSharedForm(initialValues));
      
      act(() => {
        result.current.handleChange('name', 'John Doe');
        result.current.handleBlur('name');
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('useSharedNavigation', () => {
    test('should provide navigation functions', () => {
      const { result } = renderHook(() => useSharedNavigation());
      
      expect(result.current.navigate).toBeDefined();
      expect(result.current.goBack).toBeDefined();
      expect(result.current.isActive).toBeDefined();
      expect(result.current.currentPath).toBe('/test');
      expect(result.current.query).toEqual({ page: '1' });
    });

    test('should check if path is active', () => {
      const { result } = renderHook(() => useSharedNavigation());
      
      expect(result.current.isActive('/test')).toBe(true);
      expect(result.current.isActive('/other')).toBe(false);
    });
  });

  describe('useSharedState', () => {
    test('should initialize with provided state', () => {
      const initialState = { count: 0, name: 'test' };
      
      const { result } = renderHook(() => useSharedState(initialState));
      
      expect(result.current.state).toEqual(initialState);
    });

    test('should update state', () => {
      const initialState = { count: 0, name: 'test' };
      
      const { result } = renderHook(() => useSharedState(initialState));
      
      act(() => {
        result.current.updateState({ count: 1 });
      });
      
      expect(result.current.state.count).toBe(1);
      expect(result.current.state.name).toBe('test');
    });

    test('should reset state', () => {
      const initialState = { count: 0, name: 'test' };
      
      const { result } = renderHook(() => useSharedState(initialState));
      
      act(() => {
        result.current.updateState({ count: 1 });
      });
      
      act(() => {
        result.current.resetState();
      });
      
      expect(result.current.state).toEqual(initialState);
    });
  });

  describe('useSharedPagination', () => {
    test('should initialize with default values', () => {
      const { result } = renderHook(() => useSharedPagination());
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });

    test('should calculate total pages correctly', () => {
      const { result } = renderHook(() => useSharedPagination(1, 10));
      
      act(() => {
        result.current.setTotalItems(25);
      });
      
      expect(result.current.totalPages).toBe(3);
    });

    test('should navigate to next page', () => {
      const { result } = renderHook(() => useSharedPagination(1, 10));
      
      act(() => {
        result.current.setTotalItems(25);
      });
      
      act(() => {
        result.current.nextPage();
      });
      
      expect(result.current.currentPage).toBe(2);
    });

    test('should navigate to previous page', () => {
      const { result } = renderHook(() => useSharedPagination(2, 10));
      
      act(() => {
        result.current.setTotalItems(25);
        result.current.prevPage();
      });
      
      expect(result.current.currentPage).toBe(1);
    });

    test('should go to specific page', () => {
      const { result } = renderHook(() => useSharedPagination(1, 10));
      
      act(() => {
        result.current.setTotalItems(25);
      });
      
      act(() => {
        result.current.goToPage(3);
      });
      
      expect(result.current.currentPage).toBe(3);
    });

    test('should not go beyond page limits', () => {
      const { result } = renderHook(() => useSharedPagination(1, 10));
      
      act(() => {
        result.current.setTotalItems(25);
      });
      
      act(() => {
        result.current.goToPage(5); // Beyond total pages
      });
      
      expect(result.current.currentPage).toBe(3); // Should stay at max
    });

    test('should reset pagination', () => {
      const { result } = renderHook(() => useSharedPagination(1, 10));
      
      act(() => {
        result.current.setTotalItems(100);
        result.current.goToPage(3);
      });
      
      act(() => {
        result.current.resetPagination();
      });
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(10);
    });
  });

  describe('useSharedSearch', () => {
    test('should initialize with empty query', () => {
      const { result } = renderHook(() => useSharedSearch());
      
      expect(result.current.query).toBe('');
      expect(result.current.isSearching).toBe(false);
    });

    test('should update query', () => {
      const { result } = renderHook(() => useSharedSearch());
      
      act(() => {
        result.current.setQuery('test query');
      });
      
      expect(result.current.query).toBe('test query');
    });

    test('should clear search', () => {
      const { result } = renderHook(() => useSharedSearch('test query'));
      
      act(() => {
        result.current.clearSearch();
      });
      
      expect(result.current.query).toBe('');
    });

    test('should execute search', async () => {
      const mockSearchFunction = jest.fn();
      const { result } = renderHook(() => useSharedSearch('test'));
      
      await act(async () => {
        await result.current.search(mockSearchFunction);
      });
      
      expect(mockSearchFunction).toHaveBeenCalledWith('test');
      expect(result.current.isSearching).toBe(false);
    });

    test('should not search with empty query', async () => {
      const mockSearchFunction = jest.fn();
      const { result } = renderHook(() => useSharedSearch(''));
      
      await act(async () => {
        await result.current.search(mockSearchFunction);
      });
      
      expect(mockSearchFunction).not.toHaveBeenCalled();
    });
  });

  describe('useSharedModal', () => {
    test('should initialize with closed state', () => {
      const { result } = renderHook(() => useSharedModal());
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBe(null);
    });

    test('should open modal', () => {
      const { result } = renderHook(() => useSharedModal());
      
      act(() => {
        result.current.openModal({ id: 1, name: 'test' });
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual({ id: 1, name: 'test' });
    });

    test('should close modal', () => {
      const { result } = renderHook(() => useSharedModal(true));
      
      act(() => {
        result.current.closeModal();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBe(null);
    });
  });

  describe('useSharedLoading', () => {
    test('should initialize with loading false', () => {
      const { result } = renderHook(() => useSharedLoading());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingText).toBe('');
    });

    test('should start loading', () => {
      const { result } = renderHook(() => useSharedLoading());
      
      act(() => {
        result.current.startLoading('Loading data...');
      });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.loadingText).toBe('Loading data...');
    });

    test('should stop loading', () => {
      const { result } = renderHook(() => useSharedLoading(true));
      
      act(() => {
        result.current.stopLoading();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingText).toBe('');
    });
  });
});
