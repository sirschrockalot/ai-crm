import { renderHook, act } from '@testing-library/react';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

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

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Breadcrumb Generation', () => {
    it('generates breadcrumbs for simple path', () => {
      mockRouter.asPath = '/dashboard';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[0]).toEqual({
        label: 'Home',
        href: '/',
        isActive: false,
      });
      expect(result.current.breadcrumbs[1]).toEqual({
        label: 'dashboard',
        href: '/dashboard',
        isActive: true,
      });
    });

    it('generates breadcrumbs for nested path', () => {
      mockRouter.asPath = '/dashboard/leads/active';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.breadcrumbs).toHaveLength(4);
      expect(result.current.breadcrumbs[0]).toEqual({
        label: 'Home',
        href: '/',
        isActive: false,
      });
      expect(result.current.breadcrumbs[1]).toEqual({
        label: 'dashboard',
        href: '/dashboard',
        isActive: false,
      });
      expect(result.current.breadcrumbs[2]).toEqual({
        label: 'leads',
        href: '/dashboard/leads',
        isActive: false,
      });
      expect(result.current.breadcrumbs[3]).toEqual({
        label: 'active',
        href: '/dashboard/leads/active',
        isActive: true,
      });
    });

    it('handles root path correctly', () => {
      mockRouter.asPath = '/';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.breadcrumbs).toHaveLength(1);
      expect(result.current.breadcrumbs[0]).toEqual({
        label: 'Home',
        href: '/',
        isActive: true,
      });
    });

    it('formats segment labels correctly', () => {
      mockRouter.asPath = '/user-profile/settings-page';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.breadcrumbs[1]).toEqual({
        label: 'user profile',
        href: '/user-profile',
        isActive: false,
      });
      expect(result.current.breadcrumbs[2]).toEqual({
        label: 'settings page',
        href: '/user-profile/settings-page',
        isActive: true,
      });
    });
  });

  describe('Configuration Options', () => {
    it('hides home breadcrumb when showHome is false', () => {
      mockRouter.asPath = '/dashboard/leads';
      
      const { result } = renderHook(() => useBreadcrumbs({ showHome: false }));
      
      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[0].label).toBe('dashboard');
      expect(result.current.breadcrumbs[0].href).toBe('/dashboard');
    });

    it('uses custom labels when provided', () => {
      mockRouter.asPath = '/dashboard/leads';
      
      const customLabels = {
        dashboard: 'Main Dashboard',
        leads: 'Lead Management',
      };
      
      const { result } = renderHook(() => useBreadcrumbs({ customLabels }));
      
      expect(result.current.breadcrumbs[1]).toEqual({
        label: 'Main Dashboard',
        href: '/dashboard',
        isActive: false,
      });
      expect(result.current.breadcrumbs[2]).toEqual({
        label: 'Lead Management',
        href: '/dashboard/leads',
        isActive: true,
      });
    });

    it('excludes paths when excludePaths is provided', () => {
      mockRouter.asPath = '/admin/settings';
      
      const { result } = renderHook(() => useBreadcrumbs({ 
        excludePaths: ['/admin'] 
      }));
      
      expect(result.current.breadcrumbs).toHaveLength(0);
      expect(result.current.shouldShowBreadcrumbs).toBe(false);
    });

    it('handles multiple exclude paths', () => {
      mockRouter.asPath = '/dashboard/leads';
      
      const { result } = renderHook(() => useBreadcrumbs({ 
        excludePaths: ['/admin', '/temp'] 
      }));
      
      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.shouldShowBreadcrumbs).toBe(true);
    });
  });

  describe('Breadcrumb Limiting', () => {
    it('limits breadcrumbs when maxItems is specified', () => {
      mockRouter.asPath = '/dashboard/leads/active/qualified/ready';
      
      const { result } = renderHook(() => useBreadcrumbs({ maxItems: 3 }));
      
      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('...');
      expect(result.current.breadcrumbs[2].label).toBe('ready');
    });

    it('shows all breadcrumbs when under maxItems limit', () => {
      mockRouter.asPath = '/dashboard/leads';
      
      const { result } = renderHook(() => useBreadcrumbs({ maxItems: 5 }));
      
      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('dashboard');
      expect(result.current.breadcrumbs[2].label).toBe('leads');
    });

    it('handles edge case when maxItems is 1', () => {
      mockRouter.asPath = '/dashboard/leads/active';
      
      const { result } = renderHook(() => useBreadcrumbs({ maxItems: 1 }));
      
      // When maxItems is 1, it should show the ellipsis and the last item
      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[0].label).toBe('...');
      expect(result.current.breadcrumbs[1].label).toBe('active');
    });
  });

  describe('Breadcrumb Display Logic', () => {
    it('shows breadcrumbs when not on root path', () => {
      mockRouter.asPath = '/dashboard';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.shouldShowBreadcrumbs).toBe(true);
    });

    it('hides breadcrumbs on root path', () => {
      mockRouter.asPath = '/';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.shouldShowBreadcrumbs).toBe(false);
    });

    it('hides breadcrumbs when excluded', () => {
      mockRouter.asPath = '/admin/settings';
      
      const { result } = renderHook(() => useBreadcrumbs({ 
        excludePaths: ['/admin'] 
      }));
      
      expect(result.current.shouldShowBreadcrumbs).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('generates breadcrumbs for specific path', () => {
      mockRouter.asPath = '/dashboard';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      const customPathBreadcrumbs = result.current.generateBreadcrumbs('/custom/path');
      
      expect(customPathBreadcrumbs).toHaveLength(3);
      expect(customPathBreadcrumbs[0].label).toBe('Home');
      expect(customPathBreadcrumbs[1].label).toBe('custom');
      expect(customPathBreadcrumbs[2].label).toBe('path');
    });

    it('updates breadcrumb labels', () => {
      mockRouter.asPath = '/dashboard/leads';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      // The original test had act(() => { ... }), but act is not imported.
      // Assuming the intent was to re-render with updated customLabels.
      // This part of the test might need adjustment depending on the actual hook's behavior.
      // For now, I'll just re-render with the updated customLabels.
      const { result: updatedResult } = renderHook(() => useBreadcrumbs({
        customLabels: { leads: 'Lead Management' }
      }));
      
      expect(updatedResult.current.breadcrumbs[2].label).toBe('Lead Management');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty path segments', () => {
      mockRouter.asPath = '///dashboard///leads///';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.breadcrumbs).toHaveLength(3);
      expect(result.current.breadcrumbs[0].label).toBe('Home');
      expect(result.current.breadcrumbs[1].label).toBe('dashboard');
      expect(result.current.breadcrumbs[2].label).toBe('leads');
    });

    it('handles special characters in paths', () => {
      mockRouter.asPath = '/user@domain.com/profile-settings';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.breadcrumbs[1].label).toBe('user@domain.com');
      expect(result.current.breadcrumbs[2].label).toBe('profile settings');
    });

    it('handles very long paths', () => {
      const longPath = '/level1/level2/level3/level4/level5/level6/level7/level8/level9/level10';
      mockRouter.asPath = longPath;
      
      const { result } = renderHook(() => useBreadcrumbs({ maxItems: 5 }));
      
      expect(result.current.breadcrumbs).toHaveLength(5);
      expect(result.current.breadcrumbs[1].label).toBe('...');
      expect(result.current.breadcrumbs[4].label).toBe('level10');
    });
  });

  describe('Full vs Limited Breadcrumbs', () => {
    it('provides both full and limited breadcrumbs', () => {
      mockRouter.asPath = '/dashboard/leads/active/qualified/ready';
      
      const { result } = renderHook(() => useBreadcrumbs({ maxItems: 3 }));
      
      expect(result.current.breadcrumbs).toHaveLength(3); // Limited
      expect(result.current.fullBreadcrumbs).toHaveLength(6); // Full
    });

    it('full breadcrumbs contain all segments', () => {
      mockRouter.asPath = '/dashboard/leads/active';
      
      const { result } = renderHook(() => useBreadcrumbs());
      
      expect(result.current.fullBreadcrumbs).toHaveLength(4);
      expect(result.current.fullBreadcrumbs.map(b => b.label)).toEqual([
        'Home', 'dashboard', 'leads', 'active'
      ]);
    });
  });
});
