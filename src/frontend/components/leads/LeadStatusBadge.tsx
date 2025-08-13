import React from 'react';
import { Badge, BadgeProps } from '@chakra-ui/react';

export interface LeadStatusBadgeProps extends Omit<BadgeProps, 'children'> {
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost' | string;
  size?: 'sm' | 'md' | 'lg';
}

const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  ...props 
}) => {
  // Get status colors based on mockup design
  const getStatusColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return {
          bg: '#DBEAFE',
          color: '#1E40AF',
        };
      case 'contacted':
        return {
          bg: '#FEF3C7',
          color: '#92400E',
        };
      case 'qualifying':
      case 'qualified':
        return {
          bg: '#FCE7F3',
          color: '#BE185D',
        };
      case 'negotiating':
        return {
          bg: '#FCE7F3',
          color: '#BE185D',
        };
      case 'converted':
      case 'contract':
        return {
          bg: '#D1FAE5',
          color: '#065F46',
        };
      case 'lost':
        return {
          bg: '#FEE2E2',
          color: '#DC2626',
        };
      default:
        return {
          bg: '#E2E8F0',
          color: '#64748B',
        };
    }
  };

  // Get size-specific styles
  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          px: 2,
          py: 1,
          fontSize: 'xs',
          borderRadius: '6px',
        };
      case 'md':
        return {
          px: 3,
          py: 1,
          fontSize: 'sm',
          borderRadius: '12px',
        };
      case 'lg':
        return {
          px: 4,
          py: 2,
          fontSize: 'md',
          borderRadius: '20px',
        };
      default:
        return {
          px: 3,
          py: 1,
          fontSize: 'sm',
          borderRadius: '12px',
        };
    }
  };

  const colors = getStatusColors(status);
  const sizeStyles = getSizeStyles(size);

  return (
    <Badge
      bg={colors.bg}
      color={colors.color}
      fontWeight="500"
      {...sizeStyles}
      {...props}
    >
      {status}
    </Badge>
  );
};

export default LeadStatusBadge;
