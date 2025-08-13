import { useCallback, useEffect, KeyboardEvent } from 'react';
import { useListNavigation, ListNavigationOptions } from './useListNavigation';

export interface KeyboardListNavigationOptions<T> extends ListNavigationOptions<T> {
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  preventDefault?: boolean;
}

export function useKeyboardListNavigation<T>(options: KeyboardListNavigationOptions<T> = {}) {
  const {
    onKeyDown,
    preventDefault = true,
    ...listOptions
  } = options;

  const listNavigation = useListNavigation(listOptions);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const { key, ctrlKey, altKey, shiftKey } = event;

    // Call custom key handler first
    onKeyDown?.(event);

    // Handle navigation keys
    switch (key) {
      case 'ArrowDown':
        if (preventDefault) event.preventDefault();
        listNavigation.navigateNext();
        break;
      case 'ArrowUp':
        if (preventDefault) event.preventDefault();
        listNavigation.navigatePrevious();
        break;
      case 'ArrowRight':
        if (preventDefault) event.preventDefault();
        listNavigation.navigateNext();
        break;
      case 'ArrowLeft':
        if (preventDefault) event.preventDefault();
        listNavigation.navigatePrevious();
        break;
      case 'Home':
        if (preventDefault) event.preventDefault();
        listNavigation.navigateToStart();
        break;
      case 'End':
        if (preventDefault) event.preventDefault();
        listNavigation.navigateToEnd();
        break;
      case 'Enter':
        if (preventDefault) event.preventDefault();
        listNavigation.selectCurrent();
        break;
      case ' ':
        if (preventDefault) event.preventDefault();
        listNavigation.selectCurrent();
        break;
      case 'Escape':
        if (preventDefault) event.preventDefault();
        listNavigation.cancel();
        break;
    }

    // Handle modifier keys - still allow navigation but with different behavior
    if (ctrlKey || altKey) {
      // Allow navigation with modifier keys
      switch (key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'Home':
        case 'End':
          if (preventDefault) event.preventDefault();
          break;
      }
    }

    // Handle shift key - still allow navigation
    if (shiftKey) {
      switch (key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'Home':
        case 'End':
          if (preventDefault) event.preventDefault();
          break;
      }
    }
  }, [listNavigation, onKeyDown, preventDefault]);

  // Global keyboard event handling for when the component doesn't have focus
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle global navigation keys
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'Home':
        case 'End':
        case 'Enter':
        case ' ':
        case 'Escape':
          // Only handle if the component is focused or should receive global events
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return {
    ...listNavigation,
    handleKeyDown,
  };
}
