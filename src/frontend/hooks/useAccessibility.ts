import { useEffect, useRef, useCallback } from 'react';

// Accessibility options
interface AccessibilityOptions {
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'additions removals' | 'all' | 'removals' | 'text';
  onAnnounce?: (message: string, priority?: 'polite' | 'assertive') => void;
}

// Accessibility hook
export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const elementRef = useRef<HTMLElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Create live region for announcements
  useEffect(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && liveRegionRef.current.parentNode) {
        liveRegionRef.current.parentNode.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Clear the message after a short delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  // Set ARIA attributes
  const setAriaAttributes = useCallback((attributes: Record<string, string | boolean>) => {
    if (elementRef.current) {
      Object.entries(attributes).forEach(([key, value]) => {
        elementRef.current!.setAttribute(key, String(value));
      });
    }
  }, []);

  // Get accessibility props for components
  const getAccessibilityProps = useCallback(() => {
    const props: Record<string, any> = {};
    
    if (options.role) props.role = options.role;
    if (options['aria-label']) props['aria-label'] = options['aria-label'];
    if (options['aria-describedby']) props['aria-describedby'] = options['aria-describedby'];
    if (options['aria-expanded'] !== undefined) props['aria-expanded'] = options['aria-expanded'];
    if (options['aria-selected'] !== undefined) props['aria-selected'] = options['aria-selected'];
    if (options['aria-current']) props['aria-current'] = options['aria-current'];
    if (options['aria-hidden'] !== undefined) props['aria-hidden'] = options['aria-hidden'];
    if (options['aria-live']) props['aria-live'] = options['aria-live'];
    if (options['aria-atomic'] !== undefined) props['aria-atomic'] = options['aria-atomic'];
    if (options['aria-relevant']) props['aria-relevant'] = options['aria-relevant'];

    return props;
  }, [options]);

  return {
    elementRef,
    announce,
    setAriaAttributes,
    getAccessibilityProps,
  };
};

// Predefined ARIA labels for common navigation elements
export const NAVIGATION_ARIA_LABELS = {
  navigation: 'Main navigation',
  navigationToggle: 'Toggle navigation menu',
  navigationCollapse: 'Collapse navigation',
  navigationExpand: 'Expand navigation',
  navigationItem: 'Navigation item',
  navigationSubmenu: 'Navigation submenu',
  breadcrumb: 'Breadcrumb navigation',
  breadcrumbItem: 'Breadcrumb item',
  quickActions: 'Quick actions',
  quickAction: 'Quick action',
  search: 'Search',
  searchInput: 'Search input',
  searchButton: 'Search button',
  close: 'Close',
  menu: 'Menu',
  submenu: 'Submenu',
  expand: 'Expand',
  collapse: 'Collapse',
  next: 'Next',
  previous: 'Previous',
  first: 'First',
  last: 'Last',
  page: 'Page',
  of: 'of',
  results: 'results',
  loading: 'Loading',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Information',
};

// Predefined ARIA roles for common navigation elements
export const NAVIGATION_ARIA_ROLES = {
  navigation: 'navigation',
  menubar: 'menubar',
  menuitem: 'menuitem',
  menuitemcheckbox: 'menuitemcheckbox',
  menuitemradio: 'menuitemradio',
  menu: 'menu',
  menugroup: 'menugroup',
  separator: 'separator',
  button: 'button',
  link: 'link',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  breadcrumb: 'navigation',
  search: 'search',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  application: 'application',
  dialog: 'dialog',
  alertdialog: 'alertdialog',
  tooltip: 'tooltip',
  status: 'status',
  log: 'log',
  marquee: 'marquee',
  timer: 'timer',
  progressbar: 'progressbar',
  slider: 'slider',
  spinbutton: 'spinbutton',
  combobox: 'combobox',
  listbox: 'listbox',
  option: 'option',
  checkbox: 'checkbox',
  radio: 'radio',
  textbox: 'textbox',
  grid: 'grid',
  gridcell: 'gridcell',
  row: 'row',
  rowgroup: 'rowgroup',
  columnheader: 'columnheader',
  rowheader: 'rowheader',
  tree: 'tree',
  treeitem: 'treeitem',
  treegrid: 'treegrid',
  list: 'list',
  listitem: 'listitem',
  definition: 'definition',
  term: 'term',
  group: 'group',
  region: 'region',
  article: 'article',
  section: 'section',
  heading: 'heading',
  img: 'img',
  presentation: 'presentation',
  none: 'none',
};

// Hook for managing focus management
export const useFocusManagement = () => {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentFocusIndexRef = useRef<number>(-1);

  // Get all focusable elements
  const getFocusableElements = useCallback((container: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  // Set focus to specific element
  const setFocus = useCallback((element: HTMLElement) => {
    element.focus();
    currentFocusIndexRef.current = focusableElementsRef.current.indexOf(element);
  }, []);

  // Move focus to next element
  const focusNext = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return;
    
    currentFocusIndexRef.current = (currentFocusIndexRef.current + 1) % focusableElementsRef.current.length;
    focusableElementsRef.current[currentFocusIndexRef.current].focus();
  }, []);

  // Move focus to previous element
  const focusPrevious = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return;
    
    currentFocusIndexRef.current = currentFocusIndexRef.current <= 0 
      ? focusableElementsRef.current.length - 1 
      : currentFocusIndexRef.current - 1;
    focusableElementsRef.current[currentFocusIndexRef.current].focus();
  }, []);

  // Move focus to first element
  const focusFirst = useCallback(() => {
    if (focusableElementsRef.current.length > 0) {
      currentFocusIndexRef.current = 0;
      focusableElementsRef.current[0].focus();
    }
  }, []);

  // Move focus to last element
  const focusLast = useCallback(() => {
    if (focusableElementsRef.current.length > 0) {
      currentFocusIndexRef.current = focusableElementsRef.current.length - 1;
      focusableElementsRef.current[focusableElementsRef.current.length - 1].focus();
    }
  }, []);

  // Initialize focus management
  const initializeFocusManagement = useCallback((container: HTMLElement) => {
    focusableElementsRef.current = getFocusableElements(container);
    currentFocusIndexRef.current = -1;
  }, [getFocusableElements]);

  return {
    initializeFocusManagement,
    setFocus,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    getFocusableElements,
  };
};
