import { useEffect, useRef, useCallback, KeyboardEvent } from 'react';
import { useState } from 'react';

// Keyboard navigation options
interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (direction: 'forward' | 'backward') => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onSpace?: () => void;
  shortcuts?: Array<{
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
  }>;
}

// Keyboard navigation hook
export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const elementRef = useRef<HTMLElement>(null);
  const shortcutRefs = useRef<Map<string, () => void>>(new Map());

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const { key, ctrlKey, altKey, shiftKey, target } = event;
    
    // Prevent default behavior for navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(key)) {
      event.preventDefault();
    }

    // Handle arrow key navigation
    switch (key) {
      case 'ArrowUp':
        options.onArrowUp?.();
        break;
      case 'ArrowDown':
        options.onArrowDown?.();
        break;
      case 'ArrowLeft':
        options.onArrowLeft?.();
        break;
      case 'ArrowRight':
        options.onArrowRight?.();
        break;
      case 'Home':
        options.onHome?.();
        break;
      case 'End':
        options.onEnd?.();
        break;
      case 'PageUp':
        options.onPageUp?.();
        break;
      case 'PageDown':
        options.onPageDown?.();
        break;
    }

    // Handle special keys
    switch (key) {
      case 'Enter':
        options.onEnter?.();
        break;
      case 'Escape':
        options.onEscape?.();
        break;
      case 'Tab':
        if (options.onTab) {
          options.onTab(shiftKey ? 'backward' : 'forward');
        }
        break;
      case ' ':
        event.preventDefault();
        options.onSpace?.();
        break;
    }

    // Handle keyboard shortcuts
    if (options.shortcuts) {
      options.shortcuts.forEach(shortcut => {
        if (
          key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!ctrlKey === !!shortcut.ctrl &&
          !!altKey === !!shortcut.alt &&
          !!shiftKey === !!shortcut.shift
        ) {
          event.preventDefault();
          shortcut.action();
        }
      });
    }
  }, [options]);

  // Register keyboard shortcuts globally
  useEffect(() => {
    if (!options.shortcuts) return undefined;

    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      options.shortcuts?.forEach(shortcut => {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrl &&
          !!event.altKey === !!shortcut.alt &&
          !!event.shiftKey === !!shortcut.shift
        ) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [options.shortcuts]);

  // Focus management utilities
  const focusFirstElement = useCallback(() => {
    if (elementRef.current) {
      const focusableElements = elementRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, []);

  const focusLastElement = useCallback(() => {
    if (elementRef.current) {
      const focusableElements = elementRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
      }
    }
  }, []);

  const focusNextElement = useCallback(() => {
    if (elementRef.current) {
      const focusableElements = Array.from(elementRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      (focusableElements[nextIndex] as HTMLElement).focus();
    }
  }, []);

  const focusPreviousElement = useCallback(() => {
    if (elementRef.current) {
      const focusableElements = Array.from(elementRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
      const previousIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
      (focusableElements[previousIndex] as HTMLElement).focus();
    }
  }, []);

  // Tab order management
  const setTabOrder = useCallback((elementIds: string[]) => {
    elementIds.forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) {
        element.setAttribute('tabindex', (index + 1).toString());
      }
    });
  }, []);

  // Focus trap for modal/drawer navigation
  const createFocusTrap = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey as EventListener);
    return () => document.removeEventListener('keydown', handleTabKey as EventListener);
  }, []);

  return {
    elementRef,
    handleKeyDown,
    focusFirstElement,
    focusLastElement,
    focusNextElement,
    focusPreviousElement,
    setTabOrder,
    createFocusTrap,
  };
};

// Predefined keyboard shortcuts for common navigation actions
export const NAVIGATION_SHORTCUTS = [
  {
    key: 'h',
    description: 'Go to Home/Dashboard',
    action: () => window.location.href = '/dashboard',
  },
  {
    key: 'l',
    description: 'Go to Leads',
    action: () => window.location.href = '/leads',
  },
  {
    key: 'b',
    description: 'Go to Buyers',
    action: () => window.location.href = '/buyers',
  },
  {
    key: 'a',
    description: 'Go to Analytics',
    action: () => window.location.href = '/analytics',
  },
  {
    key: 'c',
    description: 'Go to Communications',
    action: () => window.location.href = '/communications',
  },
  {
    key: 't',
    description: 'Go to Time Tracking',
    action: () => window.location.href = '/time-tracking',
  },
  {
    key: 's',
    description: 'Go to Settings',
    action: () => window.location.href = '/settings',
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New Lead',
    action: () => window.location.href = '/leads/new',
  },
  {
    key: 'f',
    ctrl: true,
    description: 'Search',
    action: () => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
  },
  {
    key: 'Escape',
    description: 'Close modal/drawer',
    action: () => {
      // This will be handled by individual components
    },
  },
];

// Hook for managing focus indicators
export const useFocusIndicator = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      setFocusedElement(event.target as HTMLElement);
    };

    const handleFocusOut = () => {
      setFocusedElement(null);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return focusedElement;
};
