import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

export interface CardProps extends BoxProps {
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'filled' | 'unstyled';
}

const Card: React.FC<CardProps> = ({
  header,
  body,
  footer,
  children,
  variant = 'elevated',
  ...props
}) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'elevated':
        return {
          bg: 'white',
          boxShadow: 'md',
          borderRadius: 'lg',
        };
      case 'outline':
        return {
          bg: 'white',
          border: '1px solid',
          borderColor: 'gray.200',
          borderRadius: 'lg',
        };
      case 'filled':
        return {
          bg: 'gray.50',
          borderRadius: 'lg',
        };
      case 'unstyled':
        return {};
      default:
        return {
          bg: 'white',
          boxShadow: 'md',
          borderRadius: 'lg',
        };
    }
  };

  const cardContent = children || (
    <>
      {header && (
        <Box
          px={6}
          py={4}
          borderBottom={header ? '1px solid' : 'none'}
          borderColor="gray.200"
        >
          {header}
        </Box>
      )}
      {body && (
        <Box px={6} py={4}>
          {body}
        </Box>
      )}
      {footer && (
        <Box
          px={6}
          py={4}
          borderTop={footer ? '1px solid' : 'none'}
          borderColor="gray.200"
          bg="gray.50"
        >
          {footer}
        </Box>
      )}
    </>
  );

  return (
    <Box {...getVariantStyles(variant)} {...props}>
      {cardContent}
    </Box>
  );
};

export default Card; 