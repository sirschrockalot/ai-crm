import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { useResponsive } from '../../../hooks/useResponsive';

interface ResponsiveContainerProps extends BoxProps {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string | object;
  margin?: string | object;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = '1200px',
  padding = { base: 4, md: 6, lg: 8 },
  margin = '0 auto',
  ...props
}) => {
  // const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <Box
      maxW={maxWidth}
      mx={margin}
      px={padding}
      {...props}
    >
      {children}
    </Box>
  );
};
