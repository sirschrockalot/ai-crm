import React from 'react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
  variant?: 'alert' | 'card' | 'minimal';
}

export const DashboardErrorBoundary: React.FC<DashboardErrorBoundaryProps> = (props) => {
  return <ErrorBoundary {...props} />;
};

export default DashboardErrorBoundary;
