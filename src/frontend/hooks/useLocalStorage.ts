import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  // Initialize on client side only
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      // Handle null, undefined, or empty string
      if (!item || item === 'null' || item === 'undefined' || item === '') {
        setStoredValue(initialValue);
        return;
      }
      
      // Try to parse the JSON
      const parsed = JSON.parse(item);
      setStoredValue(parsed);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // Remove the invalid value from localStorage
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Error removing invalid localStorage key "${key}":`, removeError);
      }
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        // Don't store null, undefined, or empty values
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined' || !isClient) {
      return undefined;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          // Handle null, undefined, or empty string
          if (!e.newValue || e.newValue === 'null' || e.newValue === 'undefined' || e.newValue === '') {
            setStoredValue(initialValue);
            return;
          }
          
          const parsed = JSON.parse(e.newValue);
          setStoredValue(parsed);
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, isClient]);

  return [storedValue, setValue, removeValue] as const;
}

// Utility functions for localStorage operations
export const localStorageUtils = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      // Handle null, undefined, or empty string
      if (!item || item === 'null' || item === 'undefined' || item === '') {
        return defaultValue;
      }
      
      const parsed = JSON.parse(item);
      return parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // Remove the invalid value from localStorage
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Error removing invalid localStorage key "${key}":`, removeError);
      }
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Don't store null, undefined, or empty values
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  has: (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    const item = window.localStorage.getItem(key);
    return item !== null && item !== 'null' && item !== 'undefined' && item !== '';
  },

  keys: (): string[] => {
    if (typeof window === 'undefined') {
      return [];
    }

    return Object.keys(window.localStorage);
  },
}; 