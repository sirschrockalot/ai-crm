import React, { useEffect, useState } from 'react';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

interface RouteTransitionProps {
  children: React.ReactNode;
  loadingText?: string;
  transitionDuration?: number;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  loadingText = 'Loading...',
  transitionDuration = 300,
}) => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingTextState, setLoadingTextState] = useState(loadingText);

  useEffect(() => {
    const handleStart = (url: string) => {
      setIsTransitioning(true);
      setLoadingTextState(`Loading ${url}...`);
    };

    const handleComplete = () => {
      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router, transitionDuration]);

  if (isTransitioning) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.9)"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color="gray.600">
            {loadingTextState}
          </Text>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
};
