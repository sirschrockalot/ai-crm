import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../design-system/theme';
import '../styles/globals.css';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { DevModeIndicator } from '../components/ui/DevModeIndicator';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { NavigationProvider } from '../contexts/NavigationContext';
import { AuthProvider } from '../contexts/AuthContext';
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

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <NavigationProvider>
            {isClient && <DevModeIndicator />}
            <Component {...pageProps} />
            {isClient && <ErrorDisplay />}
          </NavigationProvider>
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
} 