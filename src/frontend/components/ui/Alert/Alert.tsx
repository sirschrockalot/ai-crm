import React from 'react';
import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
} from '@chakra-ui/react';

export interface AlertProps {
  status?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  description?: string;
  isClosable?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  variant?: 'solid' | 'subtle' | 'left-accent' | 'top-accent';
}

const Alert: React.FC<AlertProps> = ({
  status = 'info',
  title,
  description,
  isClosable = false,
  onClose,
  children,
  variant = 'subtle',
}) => {
  return (
    <ChakraAlert status={status} variant={variant}>
      <AlertIcon />
      <Box flex="1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
        {children}
      </Box>
      {isClosable && <CloseButton onClick={onClose} />}
    </ChakraAlert>
  );
};

export default Alert; 