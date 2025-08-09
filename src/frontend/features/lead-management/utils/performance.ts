// Performance monitoring utilities for lead management

export interface PerformanceMetrics {
  componentRenderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(componentName: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const existing = this.metrics.get(componentName) || {
        componentRenderTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
      };
      
      this.metrics.set(componentName, {
        ...existing,
        componentRenderTime: renderTime,
      });
    };
  }

  recordApiResponseTime(componentName: string, responseTime: number): void {
    const existing = this.metrics.get(componentName) || {
      componentRenderTime: 0,
      apiResponseTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
    };
    
    this.metrics.set(componentName, {
      ...existing,
      apiResponseTime: responseTime,
    });
  }

  getMetrics(componentName?: string): PerformanceMetrics | Map<string, PerformanceMetrics> {
    if (componentName) {
      return this.metrics.get(componentName) || {
        componentRenderTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
      };
    }
    return this.metrics;
  }

  getAverageRenderTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.componentRenderTime);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getAverageApiResponseTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.apiResponseTime);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Performance hooks
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  const startTimer = () => monitor.startTimer(componentName);
  const recordApiTime = (time: number) => monitor.recordApiResponseTime(componentName, time);
  
  return { startTimer, recordApiTime };
};

// Performance optimization utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memory usage monitoring
export const getMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  return 0;
};

// Bundle size estimation (mock)
export const getBundleSize = (): number => {
  // In a real app, this would be calculated from webpack stats
  return 245; // KB (from build output)
};
