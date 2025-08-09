import { EventEmitter } from 'events';

export interface RealtimeConfig {
  wsUrl?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  pollingInterval?: number;
  enablePolling?: boolean;
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

  constructor(config: RealtimeConfig = {}) {
    super();
    this.config = {
      wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      pollingInterval: 2000,
      enablePolling: true,
      ...config,
    };
    this.connectionId = this.generateConnectionId();
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.wsUrl!);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
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
          reject(error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
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
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('Starting polling fallback');
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
    try {
      // Poll for updates from all active subscriptions
      for (const [id, subscription] of this.subscriptions) {
        if (subscription.active) {
          await this.pollSubscription(subscription);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  private async pollSubscription(subscription: RealtimeSubscription): Promise<void> {
    try {
      const response = await fetch(`${this.config.wsUrl?.replace('ws', 'http')}/api/realtime/${subscription.channel}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const message: RealtimeMessage = {
          type: 'poll_update',
          data,
          timestamp: Date.now(),
          id: subscription.id,
        };
        
        subscription.handler(message);
      }
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
    for (const [id, subscription] of this.subscriptions) {
      if (subscription.active && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          channel: subscription.channel,
          subscriptionId: id,
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
        'disconnected',
      lastMessage: undefined,
    };
  }

  public getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public isPolling(): boolean {
    return this.isPolling;
  }
}

// Create default instance
export const realtimeService = new RealtimeService();

// Export for use in other modules
export default realtimeService;
