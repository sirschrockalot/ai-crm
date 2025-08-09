import React from 'react';
import Loading from '../ui/Loading';

interface DashboardLoadingProps {
  variant?: 'spinner' | 'skeleton' | 'dots';
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  skeletonLines?: number;
  width?: string | number;
  height?: string | number;
}

export const DashboardLoading: React.FC<DashboardLoadingProps> = (props) => {
  return <Loading {...props} />;
};

// Legacy exports for backward compatibility
export const DashboardMetricsLoading: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <Loading
    variant="skeleton"
    skeletonLines={count}
    text="Loading metrics..."
  />
);

export const DashboardChartsLoading: React.FC = () => (
  <Loading
    variant="skeleton"
    text="Loading charts..."
  />
);

export const DashboardActivityLoading: React.FC = () => (
  <Loading
    variant="skeleton"
    text="Loading activity..."
  />
);

export default DashboardLoading;
