import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { BreadcrumbItem } from '../components/ui/Breadcrumb';

export interface BreadcrumbConfig {
  showHome?: boolean;
  maxItems?: number;
  customLabels?: Record<string, string>;
  excludePaths?: string[];
}

export const useBreadcrumbs = (config: BreadcrumbConfig = {}) => {
  const router = useRouter();
  const {
    showHome = true,
    maxItems = 5,
    customLabels = {},
    excludePaths = [],
  } = config;

  // Generate breadcrumbs for current path
  const generateBreadcrumbs = useCallback((path: string): BreadcrumbItem[] => {
    // Check if path should be excluded
    if (excludePaths.some(excludePath => path.startsWith(excludePath))) {
      return [];
    }

    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        isActive: path === '/',
      });
    }

    segments.forEach((segment, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      const isActive = idx === segments.length - 1;
      
      // Use custom label if available, otherwise format segment
      const label = customLabels[segment] || 
        segment.replace(/-/g, ' ').replace(/_/g, ' ');

      breadcrumbs.push({
        label,
        href,
        isActive,
      });
    });

    return breadcrumbs;
  }, [showHome, customLabels, excludePaths]);

  // Get current breadcrumbs
  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(router.asPath);
  }, [router.asPath, generateBreadcrumbs]);

  // Get limited breadcrumbs if maxItems is specified
  const limitedBreadcrumbs = useMemo(() => {
    if (!maxItems || breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    return [
      ...breadcrumbs.slice(0, 1),
      { label: '...', href: '#', isActive: false },
      ...breadcrumbs.slice(-maxItems + 2),
    ];
  }, [breadcrumbs, maxItems]);

  // Check if breadcrumbs should be shown
  const shouldShowBreadcrumbs = useMemo(() => {
    return breadcrumbs.length > 0 && router.asPath !== '/';
  }, [breadcrumbs.length, router.asPath]);

  // Get breadcrumb for specific path
  const getBreadcrumbsForPath = useCallback((path: string) => {
    return generateBreadcrumbs(path);
  }, [generateBreadcrumbs]);

  // Update breadcrumb labels
  const updateBreadcrumbLabel = useCallback((segment: string, label: string) => {
    customLabels[segment] = label;
  }, [customLabels]);

  return {
    breadcrumbs: limitedBreadcrumbs,
    fullBreadcrumbs: breadcrumbs,
    shouldShowBreadcrumbs,
    generateBreadcrumbs: getBreadcrumbsForPath,
    updateBreadcrumbLabel,
  };
};
