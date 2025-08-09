import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BreadcrumbItem } from '../components/ui/Breadcrumb';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  isActive?: boolean;
}

export interface NavigationState {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  navigationHistory: string[];
  isMobileMenuOpen: boolean;
}

export const useNavigation = () => {
  const router = useRouter();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPath: '',
    breadcrumbs: [],
    navigationHistory: [],
    isMobileMenuOpen: false,
  });

  // Update navigation state when route changes
  useEffect(() => {
    const path = router.asPath;
    setNavigationState(prev => ({
      ...prev,
      currentPath: path,
      navigationHistory: [...prev.navigationHistory, path].slice(-10), // Keep last 10
    }));
  }, [router.asPath]);

  // Generate breadcrumbs for current path
  const generateBreadcrumbs = useCallback((path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Home',
        href: '/',
        isActive: path === '/',
      },
    ];

    segments.forEach((segment, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      const isActive = idx === segments.length - 1;
      
      breadcrumbs.push({
        label: segment.replace(/-/g, ' ').replace(/_/g, ' '),
        href,
        isActive,
      });
    });

    return breadcrumbs;
  }, []);

  // Update breadcrumbs when path changes
  useEffect(() => {
    const breadcrumbs = generateBreadcrumbs(navigationState.currentPath);
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs,
    }));
  }, [navigationState.currentPath, generateBreadcrumbs]);

  // Navigation functions
  const navigateTo = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  const navigateBack = useCallback(() => {
    if (navigationState.navigationHistory.length > 1) {
      const previousPath = navigationState.navigationHistory[navigationState.navigationHistory.length - 2];
      router.push(previousPath);
    } else {
      router.push('/');
    }
  }, [router, navigationState.navigationHistory]);

  const toggleMobileMenu = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isMobileMenuOpen: !prev.isMobileMenuOpen,
    }));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isMobileMenuOpen: false,
    }));
  }, []);

  const isCurrentPath = useCallback((href: string) => {
    return navigationState.currentPath === href;
  }, [navigationState.currentPath]);

  const isActiveRoute = useCallback((href: string) => {
    return navigationState.currentPath.startsWith(href);
  }, [navigationState.currentPath]);

  return {
    ...navigationState,
    navigateTo,
    navigateBack,
    toggleMobileMenu,
    closeMobileMenu,
    isCurrentPath,
    isActiveRoute,
    generateBreadcrumbs,
  };
};
