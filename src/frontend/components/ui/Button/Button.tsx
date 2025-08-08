import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  const getChakraVariant = (variant: string): string => {
    switch (variant) {
      case 'primary':
        return 'solid';
      case 'secondary':
        return 'outline';
      case 'danger':
        return 'solid';
      case 'ghost':
        return 'ghost';
      case 'outline':
        return 'outline';
      default:
        return 'solid';
    }
  };

  const getColorScheme = (variant: string): string => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'red';
      case 'ghost':
        return 'gray';
      case 'outline':
        return 'gray';
      default:
        return 'primary';
    }
  };

  return (
    <ChakraButton
      variant={getChakraVariant(variant)}
      colorScheme={getColorScheme(variant)}
      size={size}
      isLoading={isLoading}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button; 