import { useState, useCallback, useEffect, useRef } from 'react';

export interface ListNavigationOptions<T> {
  items: T[];
  initialIndex?: number;
  onSelect?: (item: T, index: number) => void;
  onCancel?: () => void;
  onNavigate?: (index: number, item: T) => void;
  wrapAround?: boolean;
  autoFocus?: boolean;
}

export interface ListNavigationState<T> {
  currentIndex: number;
  isNavigating: boolean;
  navigationItems: T[];
}

export interface ListNavigationActions<T> {
  setCurrentIndex: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  navigateToStart: () => void;
  navigateToEnd: () => void;
  selectCurrent: () => void;
  cancel: () => void;
  updateItems: (items: T[]) => void;
  focusCurrentItem: (element?: HTMLElement) => void;
  scrollToItem: (element?: HTMLElement) => void;
}

export function useListNavigation<T>({
  items = [],
  initialIndex = 0,
  onSelect,
  onCancel,
  onNavigate,
  wrapAround = true,
  autoFocus = false,
}: Partial<ListNavigationOptions<T>> = {}): ListNavigationState<T> & ListNavigationActions<T> {
  const [state, setState] = useState<ListNavigationState<T>>({
    currentIndex: Math.max(0, Math.min(initialIndex, items.length - 1)),
    isNavigating: false,
    navigationItems: items,
  });

  const lastItemsRef = useRef(items);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update items when they change
  useEffect(() => {
    if (items !== lastItemsRef.current) {
      setState(prev => ({
        ...prev,
        navigationItems: items,
        currentIndex: items.length > 0 ? 0 : -1,
      }));
      lastItemsRef.current = items;
    }
  }, [items]);

  // Reset index when items change
  useEffect(() => {
    if (items.length !== lastItemsRef.current.length) {
      setState(prev => ({
        ...prev,
        currentIndex: items.length > 0 ? 0 : -1,
      }));
    }
  }, [items.length]);

  const setCurrentIndex = useCallback((index: number) => {
    if (items.length === 0) return;
    
    let newIndex = index;
    if (wrapAround) {
      if (index < 0) newIndex = items.length - 1;
      if (index >= items.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(index, items.length - 1));
    }

    setState(prev => ({
      ...prev,
      currentIndex: newIndex,
      isNavigating: true,
    }));

    // Reset navigation state after a short delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isNavigating: false }));
    }, 150);

    onNavigate?.(newIndex, items[newIndex]);
  }, [items, wrapAround, onNavigate]);

  const navigateNext = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex(state.currentIndex + 1);
  }, [items.length, state.currentIndex, setCurrentIndex]);

  const navigatePrevious = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex(state.currentIndex - 1);
  }, [items.length, state.currentIndex, setCurrentIndex]);

  const navigateToStart = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex(0);
  }, [items.length, setCurrentIndex]);

  const navigateToEnd = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex(items.length - 1);
  }, [items.length, setCurrentIndex]);

  const selectCurrent = useCallback(() => {
    if (items.length === 0 || state.currentIndex === -1) return;
    onSelect?.(items[state.currentIndex], state.currentIndex);
  }, [items, state.currentIndex, onSelect]);

  const cancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const updateItems = useCallback((newItems: T[]) => {
    setState(prev => ({
      ...prev,
      navigationItems: newItems,
      currentIndex: newItems.length > 0 ? 0 : -1,
    }));
  }, []);

  const focusCurrentItem = useCallback((element?: HTMLElement) => {
    if (element) {
      element.focus();
    } else if (autoFocus && items.length > 0 && state.currentIndex >= 0) {
      // Try to find and focus the current item in the DOM
      const currentItemElement = document.querySelector(`[data-navigation-index="${state.currentIndex}"]`) as HTMLElement;
      if (currentItemElement) {
        currentItemElement.focus();
      }
    }
  }, [autoFocus, items.length, state.currentIndex]);

  const scrollToItem = useCallback((element?: HTMLElement) => {
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    } else if (items.length > 0 && state.currentIndex >= 0) {
      // Try to find and scroll to the current item in the DOM
      const currentItemElement = document.querySelector(`[data-navigation-index="${state.currentIndex}"]`) as HTMLElement;
      if (currentItemElement) {
        currentItemElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [items.length, state.currentIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    setCurrentIndex,
    navigateNext,
    navigatePrevious,
    navigateToStart,
    navigateToEnd,
    selectCurrent,
    cancel,
    updateItems,
    focusCurrentItem,
    scrollToItem,
  };
}
