// Monitoring and logging utilities for DealCycle CRM Frontend

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  userAgent: string;
  url: string;
}

interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class MonitoringService {
  private isEnabled: boolean;
  private logLevel: number;
  private sentryDsn?: string;
  private analyticsId?: string;

  constructor() {
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
    this.logLevel = LOG_LEVELS[process.env.NEXT_PUBLIC_LOG_LEVEL as keyof LogLevel] || LOG_LEVELS.INFO;
    this.sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    this.analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  }

  // Performance monitoring
  trackPerformance(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    try {
      // Send to analytics
      if (this.analyticsId && typeof window !== 'undefined') {
        (window as any).gtag?.('event', 'performance', {
          event_category: 'performance',
          event_label: metric.name,
          value: metric.value,
          custom_parameter: metric.unit,
        });
      }

      // Send to Sentry
      if (this.sentryDsn) {
        this.sendToSentry('performance', metric);
      }

      // Log locally
      this.log('INFO', `Performance: ${metric.name} = ${metric.value}${metric.unit}`);
    } catch (error) {
      console.error('Failed to track performance metric:', error);
    }
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    try {
      // Send to Sentry
      if (this.sentryDsn) {
        this.sendToSentry('error', errorEvent);
      }

      // Send to analytics
      if (this.analyticsId && typeof window !== 'undefined') {
        (window as any).gtag?.('event', 'exception', {
          description: error.message,
          fatal: false,
        });
      }

      // Log locally
      this.log('ERROR', `Error: ${error.message}`, error.stack);
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  }

  // Custom event tracking
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      // Send to analytics
      if (this.analyticsId && typeof window !== 'undefined') {
        (window as any).gtag?.('event', eventName, properties);
      }

      // Send to Sentry
      if (this.sentryDsn) {
        this.sendToSentry('event', { name: eventName, properties });
      }

      // Log locally
      this.log('INFO', `Event: ${eventName}`, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Page view tracking
  trackPageView(page: string): void {
    if (!this.isEnabled) return;

    try {
      // Send to analytics
      if (this.analyticsId && typeof window !== 'undefined') {
        (window as any).gtag?.('config', this.analyticsId, {
          page_path: page,
        });
      }

      // Log locally
      this.log('INFO', `Page view: ${page}`);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // Core Web Vitals tracking
  trackCoreWebVitals(): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformance({
          name: 'LCP',
          value: (lastEntry as any).startTime,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.trackPerformance({
            name: 'FID',
            value: (entry as any).processingStart - (entry as any).startTime,
            unit: 'ms',
            timestamp: Date.now(),
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift (CLS)
      new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.trackPerformance({
          name: 'CLS',
          value: clsValue,
          unit: '',
          timestamp: Date.now(),
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Failed to track Core Web Vitals:', error);
    }
  }

  // Logging utility
  log(level: keyof LogLevel, message: string, data?: any): void {
    if (!this.isEnabled || LOG_LEVELS[level] < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // Console logging
    switch (level) {
      case 'DEBUG':
        console.debug(`[${timestamp}] ${message}`, data);
        break;
      case 'INFO':
        console.info(`[${timestamp}] ${message}`, data);
        break;
      case 'WARN':
        console.warn(`[${timestamp}] ${message}`, data);
        break;
      case 'ERROR':
        console.error(`[${timestamp}] ${message}`, data);
        break;
    }

    // Send to external logging service if configured
    this.sendToLoggingService(logEntry);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.log('INFO', 'Health check passed');
        return true;
      } else {
        this.log('ERROR', 'Health check failed', { status: response.status });
        return false;
      }
    } catch (error) {
      this.log('ERROR', 'Health check failed', error);
      return false;
    }
  }

  // Private methods
  private sendToSentry(type: string, data: any): void {
    if (!this.sentryDsn) return;

    // In a real implementation, you would use Sentry SDK
    // For now, we'll just log it
    console.log(`Sentry ${type}:`, data);
  }

  private sendToLoggingService(logEntry: any): void {
    // In a real implementation, you would send to a logging service
    // For now, we'll just log it
    console.log('Log entry:', logEntry);
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Export convenience functions
export const trackError = (error: Error, context?: Record<string, any>) => 
  monitoring.trackError(error, context);

export const trackEvent = (eventName: string, properties?: Record<string, any>) => 
  monitoring.trackEvent(eventName, properties);

export const trackPageView = (page: string) => 
  monitoring.trackPageView(page);

export const trackPerformance = (metric: PerformanceMetric) => 
  monitoring.trackPerformance(metric);

export const log = (level: keyof LogLevel, message: string, data?: any) => 
  monitoring.log(level, message, data);

export const healthCheck = () => 
  monitoring.healthCheck();

// Initialize monitoring when the module is loaded
if (typeof window !== 'undefined') {
  // Track Core Web Vitals
  monitoring.trackCoreWebVitals();

  // Track page views
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    monitoring.trackPageView(window.location.pathname);
  };

  // Track initial page view
  monitoring.trackPageView(window.location.pathname);
} 