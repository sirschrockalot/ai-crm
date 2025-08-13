import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../../../design-system/theme';
import Navigation from '../../../components/layout/Navigation/Navigation';
import { useRouter } from 'next/router';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders home breadcrumb', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/',
        pathname: '/',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('dashboard')).not.toBeInTheDocument();
    });

    it('renders single level breadcrumb', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard',
        pathname: '/dashboard',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('dashboard')).toBeInTheDocument();
    });

    it('renders multi-level breadcrumb', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/leads/123',
        pathname: '/dashboard/leads/123',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('dashboard')).toBeInTheDocument();
      expect(screen.getByText('leads')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Links', () => {
    it('renders correct href for each breadcrumb level', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/leads',
        pathname: '/dashboard/leads',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      const homeLink = screen.getByText('Home').closest('a');
      const dashboardLink = screen.getByText('dashboard').closest('a');
      const leadsLink = screen.getByText('leads').closest('a');
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(leadsLink).toHaveAttribute('href', '/dashboard/leads');
    });

    it('marks last breadcrumb as current page', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/leads',
        pathname: '/dashboard/leads',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      const leadsBreadcrumb = screen.getByText('leads').closest('li');
      expect(leadsBreadcrumb).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Text Formatting', () => {
    it('capitalizes breadcrumb text', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/lead-management',
        pathname: '/dashboard/lead-management',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      expect(screen.getByText('lead management')).toBeInTheDocument();
    });

    it('replaces hyphens with spaces', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/user-settings/profile',
        pathname: '/dashboard/user-settings/profile',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      expect(screen.getByText('user settings')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty path segments', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/',
        pathname: '/',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    });

    it('handles path with trailing slash', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/',
        pathname: '/dashboard/',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('dashboard')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper breadcrumb structure', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/leads',
        pathname: '/dashboard/leads',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
    });

    it('has proper ARIA labels', () => {
      mockUseRouter.mockReturnValue({
        asPath: '/dashboard/leads',
        pathname: '/dashboard/leads',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        reload: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
      } as any);

      renderWithTheme(<Navigation />);
      
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toHaveAttribute('aria-label', 'Breadcrumb');
    });
  });
});
