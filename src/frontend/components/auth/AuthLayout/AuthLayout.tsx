import React from 'react';
import {
  Container,
  VStack,
  Image,
  Box,
  Text,
} from '@chakra-ui/react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  maxWidth?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  maxWidth = 'lg',
}) => {
  return (
    <Container maxW={maxWidth} py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }}>
      <VStack spacing={6} align="stretch">
        {/* Logo and Header */}
        {showLogo && (
          <VStack spacing={4}>
            <Image
              src="/logo.svg"
              alt="DealCycle CRM"
              height="60px"
            />
            {title && (
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text color="gray.600" textAlign="center">
                {subtitle}
              </Text>
            )}
          </VStack>
        )}

        {/* Content */}
        <Box>
          {children}
        </Box>

        {/* Footer */}
        <Box textAlign="center" pt={4}>
          <Text fontSize="xs" color="gray.500">
            © 2024 DealCycle CRM. All rights reserved.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default AuthLayout;
