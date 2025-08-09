// Error handling utilities
import { useState, useCallback } from 'react';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

export interface ErrorLogEntry extends ErrorInfo {
  id: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

// Error formatting utilities
export function formatError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      timestamp: new Date(),
    };
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String(error.message),
      code: 'code' in error ? String(error.code) : undefined,
      details: error,
      timestamp: new Date(),
    };
  }

  return {
    message: 'An unknown error occurred',
    details: error,
    timestamp: new Date(),
  };
}

export function formatErrorMessage(error: unknown): string {
  const errorInfo = formatError(error);
  return errorInfo.message;
}

export function formatErrorForUser(error: unknown): string {
  const errorInfo = formatError(error);
  
  // Map common error codes to user-friendly messages
  if (errorInfo.code) {
    switch (errorInfo.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 'UNAUTHORIZED':
        return 'You are not authorized to perform this action. Please log in and try again.';
      case 'FORBIDDEN':
        return 'You do not have permission to access this resource.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'SERVER_ERROR':
        return 'A server error occurred. Please try again later.';
      default:
        break;
    }
  }

  // Check for common error patterns in the message
  const message = errorInfo.message.toLowerCase();
  if (message.includes('network') || message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'You are not authorized to perform this action. Please log in and try again.';
  }
  if (message.includes('forbidden') || message.includes('403')) {
    return 'You do not have permission to access this resource.';
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'The requested resource was not found.';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'Please check your input and try again.';
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (message.includes('server error') || message.includes('500')) {
    return 'A server error occurred. Please try again later.';
  }

  return errorInfo.message || 'An unexpected error occurred. Please try again.';
}

// Error logging utilities
export function logError(error: unknown, context?: Record<string, any>): void {
  const errorInfo = formatError(error);
  const logEntry: ErrorLogEntry = {
    ...errorInfo,
    id: generateErrorId(),
    context,
    timestamp: new Date(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', logEntry);
  }

  // In production, you would send this to an error tracking service
  // like Sentry, LogRocket, or your own error tracking endpoint
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTrackingService(logEntry);
    console.error('Production error:', logEntry);
  }
}

export function logErrorWithContext(
  error: unknown,
  context: Record<string, any>,
  userId?: string,
  sessionId?: string
): void {
  const errorInfo = formatError(error);
  const logEntry: ErrorLogEntry = {
    ...errorInfo,
    id: generateErrorId(),
    context,
    userId,
    sessionId,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date(),
  };

  logError(error, context);
}

// Error boundary utilities
export function isErrorBoundaryError(error: unknown): boolean {
  return error instanceof Error && error.name === 'ErrorBoundaryError';
}

export function createErrorBoundaryError(message: string, originalError?: unknown): Error {
  const error = new Error(message);
  error.name = 'ErrorBoundaryError';
  if (originalError) {
    (error as any).originalError = originalError;
  }
  return error;
}

// Error recovery utilities
export function canRetryError(error: unknown): boolean {
  const errorInfo = formatError(error);
  
  // Don't retry client errors (4xx)
  if (errorInfo.code && /^4\d{2}$/.test(errorInfo.code)) {
    return false;
  }

  // Don't retry validation errors
  if (errorInfo.message.toLowerCase().includes('validation')) {
    return false;
  }

  // Don't retry authentication errors
  if (errorInfo.message.toLowerCase().includes('unauthorized') || 
      errorInfo.message.toLowerCase().includes('forbidden')) {
    return false;
  }

  return true;
}

export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

// Error aggregation utilities
export function aggregateErrors(errors: unknown[]): ErrorInfo[] {
  return errors.map(formatError);
}

export function getMostCommonError(errors: unknown[]): string | null {
  const errorMessages = errors.map(formatErrorMessage);
  const messageCounts = errorMessages.reduce((counts, message) => {
    counts[message] = (counts[message] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const mostCommon = Object.entries(messageCounts).reduce((max, [message, count]) => {
    return count > max.count ? { message, count } : max;
  }, { message: '', count: 0 });

  return mostCommon.count > 0 ? mostCommon.message : null;
}

// Utility functions
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Error types for better type safety
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Error handling middleware for async functions
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: unknown, ...args: T) => void
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error);
      if (errorHandler) {
        errorHandler(error, ...args);
      }
      throw error;
    }
  };
}

// Error boundary hook for React components
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    logError(error);
    setError(error);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
} 