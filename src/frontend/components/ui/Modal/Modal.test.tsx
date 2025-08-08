import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Modal from './Modal';
import theme from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  it('renders when open', () => {
    renderWithTheme(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithTheme(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    renderWithTheme(<Modal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with different sizes', () => {
    const { rerender } = renderWithTheme(
      <Modal {...defaultProps} size="sm" />
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();

    rerender(
      <ChakraProvider theme={theme}>
        <Modal {...defaultProps} size="lg" />
      </ChakraProvider>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders footer when showFooter is true', () => {
    renderWithTheme(
      <Modal 
        {...defaultProps} 
        showFooter={true} 
        footerContent={<button>Save</button>} 
      />
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('does not render footer when showFooter is false', () => {
    renderWithTheme(
      <Modal 
        {...defaultProps} 
        showFooter={false} 
        footerContent={<button>Save</button>} 
      />
    );
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('does not render close button when showCloseButton is false', () => {
    renderWithTheme(
      <Modal {...defaultProps} showCloseButton={false} />
    );
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders close button by default', () => {
    renderWithTheme(<Modal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    renderWithTheme(
      <Modal 
        {...defaultProps} 
        aria-label="Custom modal"
      />
    );
    
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });
}); 