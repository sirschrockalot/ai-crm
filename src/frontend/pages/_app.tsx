import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../design-system/theme';
import '../styles/globals.css';
// AG Grid CSS imports - Next.js handles these at build time
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { DevModeIndicator } from '../components/ui/DevModeIndicator';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { NavigationProvider } from '../contexts/NavigationContext';
import { AuthProvider, useAuth as useAuthContext } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

// Import utilities only on client side to prevent hydration issues
let localStorageCleanup: any;
let debugUtils: any;

if (typeof window !== 'undefined') {
  // Dynamic imports to prevent SSR issues
  import('../utils/localStorageCleanup').then(module => {
    localStorageCleanup = module;
  });
  import('../utils/debugUtils').then(module => {
    debugUtils = module;
  });
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Filter out browser extension errors (harmless)
    const errorMessage = event.error?.message || event.message || '';
    if (errorMessage.includes('runtime.lastError') || 
        errorMessage.includes('Extension context invalidated') ||
        errorMessage.includes('message channel closed')) {
      // Suppress browser extension errors - they don't affect app functionality
      return;
    }
    console.error('Global error caught:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Filter out browser extension errors
    const errorMessage = event.reason?.message || String(event.reason) || '';
    if (errorMessage.includes('runtime.lastError') || 
        errorMessage.includes('Extension context invalidated') ||
        errorMessage.includes('message channel closed')) {
      // Suppress browser extension errors
      return;
    }
    console.error('Unhandled promise rejection:', event.reason);
  });
}

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/google/callback',
  '/_error',
];

function AuthGuard({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();
  
  // Check if auth bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    router.pathname.startsWith(route),
  );

  useEffect(() => {
    // Skip auth check if bypass is enabled
    if (bypassAuth) {
      return;
    }
    
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router, bypassAuth]);

  // Allow access if bypass is enabled, or if it's a public route, or if authenticated
  if (bypassAuth || isPublicRoute || isAuthenticated) {
    return <Component {...pageProps} />;
  }

  // While auth state is resolving or redirecting, render nothing
  return null;
}

export default function App(appProps: AppProps) {
  const [isClient, setIsClient] = useState(false);
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  useEffect(() => {
    setIsClient(true);
    
    // Clear auth tokens if bypass is enabled to prevent conflicts
    if (bypassAuth && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }, [bypassAuth]);

  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <NavigationProvider>
            {isClient && <DevModeIndicator />}
            <AuthGuard {...appProps} />
            {isClient && <ErrorDisplay />}
          </NavigationProvider>
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
} 