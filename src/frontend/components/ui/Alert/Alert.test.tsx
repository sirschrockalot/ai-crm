import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Alert from './Alert';
import { theme } from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Alert', () => {
  it('renders with default props', () => {
    renderWithTheme(<Alert description="Test alert" />);
    expect(screen.getByText('Test alert')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    renderWithTheme(
      <Alert title="Test Title" description="Test Description" />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with different status variants', () => {
    const { rerender } = renderWithTheme(
      <Alert status="success" description="Success alert" />
    );
    expect(screen.getByText('Success alert')).toBeInTheDocument();

    rerender(
      <ChakraProvider theme={theme}>
        <Alert status="error" description="Error alert" />
      </ChakraProvider>
    );
    expect(screen.getByText('Error alert')).toBeInTheDocument();

    rerender(
      <ChakraProvider theme={theme}>
        <Alert status="warning" description="Warning alert" />
      </ChakraProvider>
    );
    expect(screen.getByText('Warning alert')).toBeInTheDocument();
  });

  it('renders close button when isClosable is true', () => {
    const onClose = jest.fn();
    renderWithTheme(
      <Alert description="Test alert" isClosable onClose={onClose} />
    );
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders children content', () => {
    renderWithTheme(
      <Alert>
        <div data-testid="custom-content">Custom content</div>
      </Alert>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('applies custom variant', () => {
    renderWithTheme(
      <Alert variant="solid" description="Solid alert" />
    );
    expect(screen.getByText('Solid alert')).toBeInTheDocument();
  });
}); 