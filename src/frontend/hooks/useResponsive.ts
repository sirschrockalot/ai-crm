import { useState, useEffect } from 'react';

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024 && screenWidth < 1440;
  const isLargeDesktop = screenWidth >= 1440;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    screenWidth,
    screenHeight,
  };
};

// Hook for checking if device supports touch
export const useTouchSupport = () => {
  const [supportsTouch, setSupportsTouch] = useState(false);

  useEffect(() => {
    setSupportsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return supportsTouch;
};

// Hook for checking if device is in landscape mode
export const useOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  return isLandscape;
};
