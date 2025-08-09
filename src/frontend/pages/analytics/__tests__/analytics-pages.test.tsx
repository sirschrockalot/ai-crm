import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import AnalyticsPage from '../index';
import PerformanceAnalyticsPage from '../performance';
import ConversionAnalyticsPage from '../conversions';
import TeamPerformancePage from '../team';
import CustomReportsPage from '../reports';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock analytics hooks
jest.mock('../../../features/analytics/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    loading: false,
    error: null,
    analyticsData: {},
    fetchAnalyticsData: jest.fn(),
    fetchPerformanceMetrics: jest.fn(),
    fetchConversionData: jest.fn(),
    fetchTeamPerformance: jest.fn(),
    getCustomReport: jest.fn(),
    exportAnalytics: jest.fn(),
  }),
}));

// Mock layout components
jest.mock('../../../components/layout', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
  Header: () => <div data-testid="header">Header</div>,
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

// Mock UI components
jest.mock('../../../components/ui', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
  Loading: () => <div data-testid="loading">Loading</div>,
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
}));

// Mock analytics components
jest.mock('../../../features/analytics', () => ({
  AnalyticsDashboard: () => <div data-testid="analytics-dashboard">Analytics Dashboard</div>,
  PerformanceMetrics: () => <div data-testid="performance-metrics">Performance Metrics</div>,
  ConversionCharts: () => <div data-testid="conversion-charts">Conversion Charts</div>,
  TeamPerformance: () => <div data-testid="team-performance">Team Performance</div>,
  CustomReports: () => <div data-testid="custom-reports">Custom Reports</div>,
  AnalyticsNavigation: () => <div data-testid="analytics-navigation">Analytics Navigation</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('Analytics Pages', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: jest.fn(),
    });
  });

  describe('Analytics Index Page', () => {
    it('renders analytics navigation', () => {
      renderWithProviders(<AnalyticsPage />);
      
      expect(screen.getByTestId('analytics-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('renders error boundary', () => {
      renderWithProviders(<AnalyticsPage />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Performance Analytics Page', () => {
    it('renders performance metrics component', () => {
      renderWithProviders(<PerformanceAnalyticsPage />);
      
      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('renders error boundary', () => {
      renderWithProviders(<PerformanceAnalyticsPage />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Conversion Analytics Page', () => {
    it('renders conversion charts component', () => {
      renderWithProviders(<ConversionAnalyticsPage />);
      
      expect(screen.getByTestId('conversion-charts')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('renders error boundary', () => {
      renderWithProviders(<ConversionAnalyticsPage />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Team Performance Page', () => {
    it('renders team performance component', () => {
      renderWithProviders(<TeamPerformancePage />);
      
      expect(screen.getByTestId('team-performance')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('renders error boundary', () => {
      renderWithProviders(<TeamPerformancePage />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Custom Reports Page', () => {
    it('renders custom reports component', () => {
      renderWithProviders(<CustomReportsPage />);
      
      expect(screen.getByTestId('custom-reports')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('renders error boundary', () => {
      renderWithProviders(<CustomReportsPage />);
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });
});
