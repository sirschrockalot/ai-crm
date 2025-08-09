// Performance optimization utilities

import React from 'react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Measure page load time
  measureLoadTime(pageName: string): () => number {
    const startTime = performance.now();
    return () => {
      const loadTime = performance.now() - startTime;
      this.recordMetric(pageName, 'loadTime', loadTime);
      return loadTime;
    };
  }

  // Measure component render time
  measureRenderTime(componentName: string): () => number {
    const startTime = performance.now();
    return () => {
      const renderTime = performance.now() - startTime;
      this.recordMetric(componentName, 'renderTime', renderTime);
      return renderTime;
    };
  }

  // Get memory usage
  getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // Record performance metric
  private recordMetric(name: string, type: keyof PerformanceMetrics, value: number): void {
    const existing = this.metrics.get(name) || {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
    };

    this.metrics.set(name, {
      ...existing,
      [type]: value,
    });
  }

  // Get performance metrics
  getMetrics(name?: string): PerformanceMetrics | Map<string, PerformanceMetrics> {
    if (name) {
      return this.metrics.get(name) || {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
      };
    }
    return this.metrics;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Lazy loading utility
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.LazyExoticComponent<T> => {
  return React.lazy(importFunc);
};

// Debounce utility
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

// Throttle utility
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

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Bundle size optimization
export const optimizeBundle = {
  // Split large components
  splitComponent: (component: React.ComponentType, chunkName?: string) => {
    return React.lazy(() => 
      import(/* webpackChunkName: "[request]" */ `../components/${component.name}`)
    );
  },

  // Preload critical components
  preloadComponent: (componentPath: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = componentPath;
    document.head.appendChild(link);
  },

  // Optimize images
  optimizeImage: (src: string, width: number, height: number) => {
    return `${src}?w=${width}&h=${height}&fit=crop&auto=format`;
  },
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const optimizer = PerformanceOptimizer.getInstance();
  
  const measureRender = () => {
    return optimizer.measureRenderTime(componentName);
  };

  const getMetrics = () => {
    return optimizer.getMetrics(componentName) as PerformanceMetrics;
  };

  return {
    measureRender,
    getMetrics,
    memoryUsage: optimizer.getMemoryUsage(),
  };
};

// Preload components for better performance
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): () => null {
  return (): null => {
    importFunc();
    return null;
  };
}

// Image optimization utilities
export const imageLoader = ({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Cache utilities
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [name] of Array.from(this.metrics.entries())) {
      result[name] = this.getAverageMetric(name);
    }
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Bundle size monitoring
export function getBundleSize(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(0);
      return;
    }

    // Estimate bundle size based on loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach((script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('_next/static/chunks/')) {
        // Estimate size based on script tag
        totalSize += 100; // Rough estimate in KB
      }
    });

    resolve(totalSize);
  });
}

// Memory usage monitoring
export function getMemoryUsage(): Promise<{
  used: number;
  total: number;
  percentage: number;
}> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      resolve({ used: 0, total: 0, percentage: 0 });
      return;
    }

    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize / 1024 / 1024; // MB
    const total = memory.totalJSHeapSize / 1024 / 1024; // MB
    const percentage = (used / total) * 100;

    resolve({ used, total, percentage });
  });
}

// Service Worker utilities
export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

// Preload critical resources
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/_next/static/css/app.css';
  document.head.appendChild(criticalCSS);

  // Preload critical fonts
  const criticalFont = document.createElement('link');
  criticalFont.rel = 'preload';
  criticalFont.as = 'font';
  criticalFont.type = 'font/woff2';
  criticalFont.href = '/fonts/inter-var.woff2';
  criticalFont.crossOrigin = 'anonymous';
  document.head.appendChild(criticalFont);
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  if (typeof window === 'undefined') {
    return {} as IntersectionObserver;
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Resource hints for performance
export function addResourceHints(): void {
  if (typeof window === 'undefined') return;

  // DNS prefetch for external domains
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = '//api.dealcycle.com';
  document.head.appendChild(dnsPrefetch);

  // Preconnect to API
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://api.dealcycle.com';
  document.head.appendChild(preconnect);
}

// Performance budget monitoring
export class PerformanceBudget {
  private static instance: PerformanceBudget;
  private budgets: Map<string, number> = new Map();

  static getInstance(): PerformanceBudget {
    if (!PerformanceBudget.instance) {
      PerformanceBudget.instance = new PerformanceBudget();
    }
    return PerformanceBudget.instance;
  }

  setBudget(metric: string, threshold: number): void {
    this.budgets.set(metric, threshold);
  }

  checkBudget(metric: string, value: number): boolean {
    const threshold = this.budgets.get(metric);
    if (!threshold) return true;
    return value <= threshold;
  }

  getBudgets(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [metric, threshold] of Array.from(this.budgets.entries())) {
      result[metric] = threshold;
    }
    return result;
  }
}

// Export singleton instances
export const cacheManager = CacheManager.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
export const performanceBudget = PerformanceBudget.getInstance(); 