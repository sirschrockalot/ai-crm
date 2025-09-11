import React, { useState, useEffect } from 'react';
import { Box, Text, Badge, HStack } from '@chakra-ui/react';

interface DevModeIndicatorProps {
  show?: boolean;
}

export const DevModeIndicator: React.FC<DevModeIndicatorProps> = ({ show = true }) => {
  const [isClient, setIsClient] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    const bypassAuthValue = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    setBypassAuth(bypassAuthValue);
  }, []);

  // Don't render anything on server side
  if (!isClient || !bypassAuth || !show) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      bg="orange.500"
      color="white"
      px={3}
      py={2}
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
      zIndex={1000}
      boxShadow="md"
    >
      <HStack spacing={2}>
        <Badge colorScheme="orange" variant="solid" size="sm">
          DEV
        </Badge>
        <Text fontSize="xs">Auth Bypassed</Text>
      </HStack>
    </Box>
  );
};

export default DevModeIndicator;
