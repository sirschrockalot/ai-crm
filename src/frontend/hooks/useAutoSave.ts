import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  autoSaveInterval?: number; // in milliseconds
  enabled?: boolean;
  saveOnUnload?: boolean;
  debounceDelay?: number; // in milliseconds
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
  resetAutoSave: () => void;
}

export function useAutoSave<T>({
  data,
  onSave,
  autoSaveInterval = 30000, // 30 seconds default
  enabled = true,
  saveOnUnload = true,
  debounceDelay = 1000, // 1 second default
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>();
  const toast = useToast();

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave: T) => {
      if (!enabled || !dataToSave) return;

      try {
        setIsSaving(true);
        await onSave(dataToSave);
        setLastSaved(new Date());
        
        // Show success toast only for auto-saves, not manual saves
        toast({
          title: 'Auto-saved',
          description: 'Your changes have been automatically saved',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'bottom-right',
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast({
          title: 'Auto-save failed',
          description: 'Failed to auto-save your changes. Please save manually.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      } finally {
        setIsSaving(false);
      }
    }, debounceDelay),
    [enabled, onSave, debounceDelay, toast]
  );

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!enabled || !data) return;

    try {
      setIsSaving(true);
      await onSave(data);
      setLastSaved(new Date());
      
      toast({
        title: 'Saved',
        description: 'Your changes have been saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save your changes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [enabled, data, onSave, toast]);

  // Reset auto-save state
  const resetAutoSave = useCallback(() => {
    setLastSaved(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Auto-save on data changes
  useEffect(() => {
    if (!enabled || !data) return undefined;

    // Check if data has actually changed
    const hasDataChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    if (!hasDataChanged) return undefined;

    lastDataRef.current = data;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(data);
    }, debounceDelay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, enabled, debouncedSave, debounceDelay]);

  // Periodic auto-save
  useEffect(() => {
    if (!enabled || !data) return undefined;

    intervalRef.current = setInterval(() => {
      if (data && JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
        debouncedSave(data);
      }
    }, autoSaveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, data, autoSaveInterval, debouncedSave]);

  // Save on page unload
  useEffect(() => {
    if (!enabled || !saveOnUnload) return undefined;

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (data && JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
        // Try to save synchronously (may not work in all browsers)
        try {
          // Use sendBeacon for more reliable unload saving
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          navigator.sendBeacon('/api/leads/auto-save', blob);
        } catch (error) {
          console.error('Failed to save on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, saveOnUnload, data]);

  return {
    isSaving,
    lastSaved,
    saveNow,
    resetAutoSave,
  };
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
