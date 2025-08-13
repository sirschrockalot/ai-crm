import { useEffect, useState } from 'react';

/**
 * Formats a date in a consistent way to prevent hydration mismatches
 * Uses UTC timezone to ensure server and client render the same content
 */
export const formatDateSafe = (date: Date | string | undefined): string => {
  if (!date) return 'Never';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Use UTC methods to ensure consistent rendering between server and client
  const month = dateObj.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = dateObj.getUTCDate();
  const hour = dateObj.getUTCHours();
  const minute = dateObj.getUTCMinutes();
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  
  return `${month} ${day}, ${displayHour}:${displayMinute} ${ampm}`;
};

/**
 * Hook for rendering relative time that prevents hydration mismatches
 * Only renders on the client side to avoid server/client differences
 */
export const useRelativeTime = (timestamp: string | Date): string => {
  const [relativeTime, setRelativeTime] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateTime = () => {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) {
        setRelativeTime('Just now');
      } else if (diffInMinutes < 60) {
        setRelativeTime(`${diffInMinutes}m ago`);
      } else if (diffInMinutes < 1440) {
        setRelativeTime(`${Math.floor(diffInMinutes / 60)}h ago`);
      } else {
        setRelativeTime(date.toLocaleDateString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timestamp, isClient]);

  // Return empty string during SSR to prevent hydration mismatch
  if (!isClient) {
    return '';
  }

  return relativeTime;
};

/**
 * Formats a date for display in charts and tables
 * Uses consistent formatting to prevent hydration issues
 */
export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Use consistent timezone (UTC) for server-side rendering
  const month = dateObj.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = dateObj.getUTCDate();
  
  return `${month} ${day}`;
};

/**
 * Formats a timestamp for API calls and data storage
 * Ensures consistent timezone handling
 */
export const formatTimestampForAPI = (date: Date): string => {
  return date.toISOString();
};
