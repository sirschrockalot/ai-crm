import React from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalProps as ChakraModalProps,
} from '@chakra-ui/react';

export interface ModalProps extends Omit<ChakraModalProps, 'children'> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showFooter = false,
  footerContent,
  showCloseButton = true,
  ...props
}) => {
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} size={size} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        {showCloseButton && <ModalCloseButton />}
        <ModalBody>{children}</ModalBody>
        {showFooter && <ModalFooter>{footerContent}</ModalFooter>}
      </ModalContent>
    </ChakraModal>
  );
};

export default Modal; 