// Use EventEmitter from events module or create a simple one for browser
let EventEmitter: any;
if (typeof window === 'undefined') {
  // Node.js environment
  EventEmitter = require('events');
} else {
  // Browser environment - create a simple EventEmitter
  class SimpleEventEmitter {
    private events: { [key: string]: Function[] } = {};

    on(event: string, listener: Function) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    }

    off(event: string, listener: Function) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event: string, ...args: any[]) {
      if (!this.events[event]) return;
      this.events[event].forEach(listener => listener(...args));
    }
  }
  EventEmitter = SimpleEventEmitter;
}

export interface RealtimeConfig {
  wsUrl?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  pollingInterval?: number;
  enablePolling?: boolean;
  enableWebSocket?: boolean;
}

export interface RealtimeMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface RealtimeConnection {
  id: string;
  status: 'connected' | 'disconnected' | 'reconnecting' | 'connecting';
  lastMessage?: RealtimeMessage;
  error?: string;
}

export interface RealtimeSubscription {
  id: string;
  channel: string;
  handler: (message: RealtimeMessage) => void;
  active: boolean;
}

class RealtimeService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: RealtimeConfig;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private connectionId: string;
  private isPolling = false;
  private isClient = false;

  constructor(config: RealtimeConfig = {}) {
    super();
    
    // Check if we're in a browser environment
    this.isClient = typeof window !== 'undefined';
    
    this.config = {
      wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      pollingInterval: 5000, // Increased polling interval
      enablePolling: true,
      enableWebSocket: false, // Disable WebSocket for now
      ...config,
    };
    this.connectionId = this.generateConnectionId();
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Don't attempt to connect if not in browser environment
      if (!this.isClient) {
        console.log('RealtimeService: Not in browser environment, skipping connection');
        resolve();
        return;
      }

      // For now, skip WebSocket connection and use polling only
      if (!this.config.enableWebSocket) {
        console.log('RealtimeService: WebSocket disabled, using polling mode');
        this.startPolling();
        this.emit('connected', { id: this.connectionId });
        resolve();
        return;
      }

      try {
        console.log('RealtimeService: Attempting to connect to:', this.config.wsUrl);
        this.ws = new WebSocket(this.config.wsUrl!);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.reconnectAttempts = 0;
          this.emit('connected', { id: this.connectionId });
          this.resubscribeAll();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: RealtimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.emit('disconnected', { id: this.connectionId, code: event.code });
          
          if (this.config.enablePolling) {
            this.startPolling();
          }
          
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', { id: this.connectionId, error });
          
          // Don't reject immediately, let the onclose handler deal with reconnection
          if (this.reconnectAttempts === 0) {
            console.log('WebSocket connection failed, will attempt reconnection');
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        if (this.config.enablePolling) {
          this.startPolling();
        }
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopPolling();
    this.emit('disconnected', { id: this.connectionId });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts!) {
      console.log('Max reconnection attempts reached');
      this.emit('reconnect_failed', { id: this.connectionId });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay! * this.reconnectAttempts;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.emit('reconnecting', { id: this.connectionId, attempt: this.reconnectAttempts });
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
        this.attemptReconnect();
      });
    }, delay);
  }

  private startPolling(): void {
    if (this.isPolling || !this.isClient) return;
    
    this.isPolling = true;
    console.log('Starting polling mode');
    this.emit('polling_started', { id: this.connectionId });
    
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, this.config.pollingInterval);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    this.emit('polling_stopped', { id: this.connectionId });
  }

  private async pollForUpdates(): Promise<void> {
    if (!this.isClient) return;
    
    try {
      // Poll for updates from all active subscriptions
      const subscriptions = Array.from(this.subscriptions.values());
      for (const subscription of subscriptions) {
        if (subscription.active) {
          await this.pollSubscription(subscription);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  private async pollSubscription(subscription: RealtimeSubscription): Promise<void> {
    if (!this.isClient) return;
    
    try {
      // For now, just simulate polling since backend doesn't have realtime endpoints
      // In a real implementation, this would call actual API endpoints
      const mockData = {
        type: 'poll_update',
        channel: subscription.channel,
        timestamp: Date.now(),
        data: {
          message: `Polling update for ${subscription.channel}`,
          timestamp: new Date().toISOString(),
        },
      };
      
      const message: RealtimeMessage = {
        type: 'poll_update',
        data: mockData,
        timestamp: Date.now(),
        id: subscription.id,
      };
      
      subscription.handler(message);
    } catch (error) {
      console.error(`Polling error for subscription ${subscription.id}:`, error);
    }
  }

  public subscribe(channel: string, handler: (message: RealtimeMessage) => void): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      handler,
      active: true,
    };
    
    this.subscriptions.set(subscriptionId, subscription);
    
    // Send subscription message if WebSocket is connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channel,
        subscriptionId,
      }));
    }
    
    this.emit('subscribed', { id: subscriptionId, channel });
    return subscriptionId;
  }

  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;
    
    subscription.active = false;
    this.subscriptions.delete(subscriptionId);
    
    // Send unsubscribe message if WebSocket is connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        subscriptionId,
      }));
    }
    
    this.emit('unsubscribed', { id: subscriptionId, channel: subscription.channel });
  }

  private resubscribeAll(): void {
    const subscriptions = Array.from(this.subscriptions.values());
    for (const subscription of subscriptions) {
      if (subscription.active && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          channel: subscription.channel,
          subscriptionId: subscription.id,
        }));
      }
    }
  }

  private handleMessage(message: RealtimeMessage): void {
    // Emit the message for general listeners
    this.emit('message', message);
    
    // Route to specific subscription handlers
    if (message.id) {
      const subscription = this.subscriptions.get(message.id);
      if (subscription && subscription.active) {
        subscription.handler(message);
      }
    }
    
    // Handle system messages
    switch (message.type) {
      case 'ping':
        this.sendPong();
        break;
      case 'subscription_confirmed':
        this.emit('subscription_confirmed', message);
        break;
      case 'subscription_error':
        this.emit('subscription_error', message);
        break;
      default:
        // Emit channel-specific events
        this.emit(`channel:${message.type}`, message);
    }
  }

  private sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong' }));
    }
  }

  public send(message: RealtimeMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  public getConnectionStatus(): RealtimeConnection {
    return {
      id: this.connectionId,
      status: this.ws ? 
        (this.ws.readyState === WebSocket.OPEN ? 'connected' : 
         this.ws.readyState === WebSocket.CONNECTING ? 'connecting' : 'disconnected') : 
        (this.isPolling ? 'connected' : 'disconnected'),
      lastMessage: undefined,
    };
  }

  public getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || this.isPolling;
  }

  public getPollingStatus(): boolean {
    return this.isPolling;
  }
}

// Create default instance
export const realtimeService = new RealtimeService();

// Export for use in other modules
export default realtimeService;
