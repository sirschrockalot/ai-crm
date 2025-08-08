import React from 'react';
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

export interface BadgeProps extends Omit<ChakraBadgeProps, 'variant'> {
  variant?: 'solid' | 'subtle' | 'outline';
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'gray' | 'orange';
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'subtle',
  colorScheme = 'primary',
  children,
  ...props
}) => {
  return (
    <ChakraBadge variant={variant} colorScheme={colorScheme} {...props}>
      {children}
    </ChakraBadge>
  );
};

export default Badge; 