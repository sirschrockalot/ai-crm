import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, RealtimeMessage, RealtimeConnection } from '../services/realtimeService';
import { useAuth } from './useAuth';

export interface UseRealtimeOptions {
  autoConnect?: boolean;
  channel?: string;
  onMessage?: (message: RealtimeMessage) => void;
  onConnectionChange?: (connection: RealtimeConnection) => void;
  onError?: (error: any) => void;
}

export interface UseRealtimeReturn {
  isConnected: boolean;
  isPolling: boolean;
  connection: RealtimeConnection;
  subscribe: (channel: string, handler: (message: RealtimeMessage) => void) => string;
  unsubscribe: (subscriptionId: string) => void;
  send: (message: RealtimeMessage) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  lastMessage: RealtimeMessage | null;
  error: string | null;
}

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const {
    autoConnect = true,
    channel,
    onMessage,
    onConnectionChange,
    onError,
  } = options;

  const { isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [connection, setConnection] = useState<RealtimeConnection>({
    id: '',
    status: 'disconnected',
  });
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscriptionRefs = useRef<Map<string, string>>(new Map());

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setConnection(realtimeService.getConnectionStatus());
  }, []);

  // Connection event handlers
  const handleConnected = useCallback(() => {
    setIsConnected(true);
    setIsPolling(false);
    setConnection(realtimeService.getConnectionStatus());
    setError(null);
    onConnectionChange?.(realtimeService.getConnectionStatus());
  }, [onConnectionChange]);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    setConnection(realtimeService.getConnectionStatus());
    onConnectionChange?.(realtimeService.getConnectionStatus());
  }, [onConnectionChange]);

  const handleReconnecting = useCallback(() => {
    setConnection(realtimeService.getConnectionStatus());
    onConnectionChange?.(realtimeService.getConnectionStatus());
  }, [onConnectionChange]);

  const handlePollingStarted = useCallback(() => {
    setIsPolling(true);
  }, []);

  const handlePollingStopped = useCallback(() => {
    setIsPolling(false);
  }, []);

  const handleError = useCallback((error: any) => {
    setError(error.message || 'Real-time connection error');
    onError?.(error);
  }, [onError]);

  const handleMessage = useCallback((message: RealtimeMessage) => {
    setLastMessage(message);
    onMessage?.(message);
  }, [onMessage]);

  // Subscribe to real-time events (only on client side)
  useEffect(() => {
    if (!isClient) return;

    realtimeService.on('connected', handleConnected);
    realtimeService.on('disconnected', handleDisconnected);
    realtimeService.on('reconnecting', handleReconnecting);
    realtimeService.on('polling_started', handlePollingStarted);
    realtimeService.on('polling_stopped', handlePollingStopped);
    realtimeService.on('error', handleError);
    realtimeService.on('message', handleMessage);

    return () => {
      realtimeService.off('connected', handleConnected);
      realtimeService.off('disconnected', handleDisconnected);
      realtimeService.off('reconnecting', handleReconnecting);
      realtimeService.off('polling_started', handlePollingStarted);
      realtimeService.off('polling_stopped', handlePollingStopped);
      realtimeService.off('error', handleError);
      realtimeService.off('message', handleMessage);
    };
  }, [isClient, handleConnected, handleDisconnected, handleReconnecting, handlePollingStarted, handlePollingStopped, handleError, handleMessage]);

  // Auto-connect when authenticated (only on client side)
  useEffect(() => {
    if (isClient && autoConnect && isAuthenticated && !isConnected) {
      connect().catch(console.error);
    }
  }, [isClient, autoConnect, isAuthenticated, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isClient) {
        // Unsubscribe from all channels
        for (const [key, subscriptionId] of subscriptionRefs.current) {
          realtimeService.unsubscribe(subscriptionId);
        }
        subscriptionRefs.current.clear();
      }
    };
  }, [isClient]);

  const connect = useCallback(async () => {
    if (!isClient) return;
    
    try {
      setError(null);
      await realtimeService.connect();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  }, [isClient]);

  const disconnect = useCallback(() => {
    if (isClient) {
      realtimeService.disconnect();
    }
  }, [isClient]);

  const subscribe = useCallback((channel: string, handler: (message: RealtimeMessage) => void): string => {
    if (!isClient) {
      console.warn('Cannot subscribe to real-time channel: not in browser environment');
      return '';
    }
    
    const subscriptionId = realtimeService.subscribe(channel, handler);
    subscriptionRefs.current.set(channel, subscriptionId);
    return subscriptionId;
  }, [isClient]);

  const unsubscribe = useCallback((subscriptionId: string) => {
    if (!isClient) return;
    
    realtimeService.unsubscribe(subscriptionId);
    
    // Remove from refs
    for (const [key, id] of subscriptionRefs.current) {
      if (id === subscriptionId) {
        subscriptionRefs.current.delete(key);
        break;
      }
    }
  }, [isClient]);

  const send = useCallback((message: RealtimeMessage) => {
    if (isClient) {
      realtimeService.send(message);
    }
  }, [isClient]);

  return {
    isConnected,
    isPolling,
    connection,
    subscribe,
    unsubscribe,
    send,
    connect,
    disconnect,
    lastMessage,
    error,
  };
}

// Specialized hook for dashboard real-time updates
export function useDashboardRealtime() {
  const realtime = useRealtime({
    autoConnect: true,
    onMessage: (message) => {
      // Handle dashboard-specific real-time updates
      switch (message.type) {
        case 'dashboard_stats_update':
          // Update dashboard statistics
          break;
        case 'dashboard_alert':
          // Handle new alerts
          break;
        case 'dashboard_activity':
          // Handle new activity
          break;
        default:
          break;
      }
    },
  });

  const subscribeToDashboard = useCallback((handler: (message: RealtimeMessage) => void) => {
    return realtime.subscribe('dashboard', handler);
  }, [realtime]);

  const subscribeToAlerts = useCallback((handler: (message: RealtimeMessage) => void) => {
    return realtime.subscribe('alerts', handler);
  }, [realtime]);

  const subscribeToActivity = useCallback((handler: (message: RealtimeMessage) => void) => {
    return realtime.subscribe('activity', handler);
  }, [realtime]);

  return {
    ...realtime,
    subscribeToDashboard,
    subscribeToAlerts,
    subscribeToActivity,
  };
}

// Specialized hook for analytics real-time updates
export function useAnalyticsRealtime() {
  const realtime = useRealtime({
    autoConnect: true,
    onMessage: (message) => {
      // Handle analytics-specific real-time updates
      switch (message.type) {
        case 'analytics_metrics_update':
          // Update analytics metrics
          break;
        case 'analytics_chart_update':
          // Update chart data
          break;
        case 'analytics_report_ready':
          // Handle report completion
          break;
        default:
          break;
      }
    },
  });

  const subscribeToMetrics = useCallback((handler: (message: RealtimeMessage) => void) => {
    return realtime.subscribe('analytics:metrics', handler);
  }, [realtime]);

  const subscribeToCharts = useCallback((handler: (message: RealtimeMessage) => void) => {
    return realtime.subscribe('analytics:charts', handler);
  }, [realtime]);

  const subscribeToReports = useCallback((handler: (message: RealtimeMessage) => void) => {
    return realtime.subscribe('analytics:reports', handler);
  }, [realtime]);

  return {
    ...realtime,
    subscribeToMetrics,
    subscribeToCharts,
    subscribeToReports,
  };
}
