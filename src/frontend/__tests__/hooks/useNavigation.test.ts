import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../../hooks/useNavigation';

// Mock Next.js router
const mockRouter = {
  asPath: '/dashboard/leads',
  pathname: '/dashboard/leads',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  reload: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  defaultLocale: 'en',
  domainLocales: [],
  isPreview: false,
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

describe('useNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.asPath = '/dashboard/leads';
  });

  describe('Initial State', () => {
    it('initializes with default navigation state', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.currentPath).toBe('/dashboard/leads');
      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.navigationHistory).toHaveLength(1);
      expect(result.current.isMobileMenuOpen).toBe(false);
    });

    it('generates initial breadcrumbs correctly', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs).toEqual([
        {
          label: 'Home',
          href: '/',
          isActive: false,
        },
        {
          label: 'dashboard',
          href: '/dashboard',
          isActive: false,
        },
        {
          label: 'leads',
          href: '/dashboard/leads',
          isActive: true,
        },
      ]);
    });
  });

  describe('Route Change Handling', () => {
    it('updates navigation state when route changes', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      // Change route
      mockRouter.asPath = '/dashboard/buyers';
      
      // Re-render to trigger useEffect
      rerender();
      
      expect(result.current.currentPath).toBe('/dashboard/buyers');
      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[2].label).toBe('buyers');
      expect(result.current.breadcrumbs[2].isActive).toBe(true);
    });

    it('maintains navigation history', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      // Change route multiple times
      mockRouter.asPath = '/dashboard/buyers';
      rerender();
      
      mockRouter.asPath = '/analytics';
      rerender();
      
      expect(result.current.navigationHistory).toContain('/dashboard/leads');
      expect(result.current.navigationHistory).toContain('/dashboard/buyers');
      expect(result.current.navigationHistory).toContain('/analytics');
    });

    it('limits navigation history to last 10 entries', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      // Change route 12 times
      for (let i = 1; i <= 12; i++) {
        mockRouter.asPath = `/page${i}`;
        rerender();
      }
      
      expect(result.current.navigationHistory).toHaveLength(10);
      expect(result.current.navigationHistory[0]).toBe('/page3');
      expect(result.current.navigationHistory[9]).toBe('/page12');
    });
  });

  describe('Breadcrumb Generation', () => {
    it('generates breadcrumbs for root path', () => {
      mockRouter.asPath = '/';
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs).toHaveLength(1);
      expect(result.current.breadcrumbs[0]).toEqual({
        label: 'Home',
        href: '/',
        isActive: true,
      });
    });

    it('generates breadcrumbs for single level path', () => {
      mockRouter.asPath = '/dashboard';
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[1]).toEqual({
        label: 'dashboard',
        href: '/dashboard',
        isActive: true,
      });
    });

    it('generates breadcrumbs for deep nested path', () => {
      mockRouter.asPath = '/dashboard/leads/active/qualified';
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs).toHaveLength(5);
      expect(result.current.breadcrumbs[4]).toEqual({
        label: 'qualified',
        href: '/dashboard/leads/active/qualified',
        isActive: true,
      });
    });

    it('formats segment labels correctly', () => {
      mockRouter.asPath = '/user-profile/settings-page';
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs[1].label).toBe('user profile');
      expect(result.current.breadcrumbs[2].label).toBe('settings page');
    });

    it('generates breadcrumbs for custom path', () => {
      const { result } = renderHook(() => useNavigation());
      
      const customBreadcrumbs = result.current.generateBreadcrumbs('/custom/path');
      
      expect(customBreadcrumbs).toHaveLength(3);
      expect(customBreadcrumbs[0].label).toBe('Home');
      expect(customBreadcrumbs[1].label).toBe('custom');
      expect(customBreadcrumbs[2].label).toBe('path');
    });
  });

  describe('Navigation Functions', () => {
    it('navigates to specified href', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigateTo('/dashboard/buyers');
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/buyers');
    });

    it('navigates back to previous path', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      // Change route to build history
      mockRouter.asPath = '/dashboard/buyers';
      rerender();
      
      act(() => {
        result.current.navigateBack();
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/leads');
    });

    it('navigates to home when no history', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigateBack();
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('handles navigation back with multiple history entries', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      // Build navigation history
      mockRouter.asPath = '/dashboard/buyers';
      rerender();
      
      mockRouter.asPath = '/analytics';
      rerender();
      
      act(() => {
        result.current.navigateBack();
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/buyers');
    });
  });

  describe('Mobile Menu Management', () => {
    it('toggles mobile menu state', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isMobileMenuOpen).toBe(false);
      
      act(() => {
        result.current.toggleMobileMenu();
      });
      
      expect(result.current.isMobileMenuOpen).toBe(true);
      
      act(() => {
        result.current.toggleMobileMenu();
      });
      
      expect(result.current.isMobileMenuOpen).toBe(false);
    });

    it('closes mobile menu', () => {
      const { result } = renderHook(() => useNavigation());
      
      // Open menu first
      act(() => {
        result.current.toggleMobileMenu();
      });
      
      expect(result.current.isMobileMenuOpen).toBe(true);
      
      // Close menu
      act(() => {
        result.current.closeMobileMenu();
      });
      
      expect(result.current.isMobileMenuOpen).toBe(false);
    });
  });

  describe('Route Checking', () => {
    it('checks if path is current path', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isCurrentPath('/dashboard/leads')).toBe(true);
      expect(result.current.isCurrentPath('/dashboard/buyers')).toBe(false);
      expect(result.current.isCurrentPath('/')).toBe(false);
    });

    it('checks if path is active route', () => {
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isActiveRoute('/dashboard')).toBe(true);
      expect(result.current.isActiveRoute('/dashboard/leads')).toBe(true);
      expect(result.current.isActiveRoute('/dashboard/buyers')).toBe(false);
      expect(result.current.isActiveRoute('/analytics')).toBe(false);
    });

    it('handles root path checking', () => {
      mockRouter.asPath = '/';
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isCurrentPath('/')).toBe(true);
      expect(result.current.isActiveRoute('/')).toBe(true);
    });
  });

  describe('State Synchronization', () => {
    it('synchronizes breadcrumbs with current path', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      // Change route
      mockRouter.asPath = '/dashboard/buyers/active';
      rerender();
      
      expect(result.current.breadcrumbs).toHaveLength(4);
      expect(result.current.breadcrumbs[3].label).toBe('active');
      expect(result.current.breadcrumbs[3].isActive).toBe(true);
    });

    it('maintains consistent state across route changes', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      const initialBreadcrumbs = result.current.breadcrumbs;
      
      // Change route
      mockRouter.asPath = '/dashboard/buyers';
      rerender();
      
      // Change back
      mockRouter.asPath = '/dashboard/leads';
      rerender();
      
      expect(result.current.breadcrumbs).toEqual(initialBreadcrumbs);
      expect(result.current.currentPath).toBe('/dashboard/leads');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty path segments', () => {
      mockRouter.asPath = '///dashboard///leads///';
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('dashboard');
      expect(result.current.breadcrumbs[2].label).toBe('leads');
    });

    it('handles special characters in paths', () => {
      mockRouter.asPath = '/user@domain.com/profile-settings';
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs[1].label).toBe('user@domain.com');
      expect(result.current.breadcrumbs[2].label).toBe('profile settings');
    });

    it('handles very long paths', () => {
      const longPath = '/level1/level2/level3/level4/level5/level6/level7/level8/level9/level10';
      mockRouter.asPath = longPath;
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.breadcrumbs).toHaveLength(11);
      expect(result.current.breadcrumbs[10].label).toBe('level10');
      expect(result.current.breadcrumbs[10].isActive).toBe(true);
    });
  });

  describe('Integration with Router', () => {
    it('responds to router.asPath changes', () => {
      const { result, rerender } = renderHook(() => useNavigation());
      
      // Simulate router change
      mockRouter.asPath = '/new-path';
      rerender();
      
      expect(result.current.currentPath).toBe('/new-path');
      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[1].label).toBe('new path');
    });

    it('calls router.push for navigation', () => {
      const { result } = renderHook(() => useNavigation());
      
      act(() => {
        result.current.navigateTo('/test-path');
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/test-path');
    });
  });
});
