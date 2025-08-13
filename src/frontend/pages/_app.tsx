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
    console.error('Global error caught:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
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