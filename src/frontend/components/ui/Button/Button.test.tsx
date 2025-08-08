import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Button from './Button';
import theme from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Button Component', () => {
  it('renders with default props', () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    renderWithTheme(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(button).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    renderWithTheme(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button', { name: 'Secondary Button' });
    expect(button).toBeInTheDocument();
  });

  it('renders with danger variant', () => {
    renderWithTheme(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByRole('button', { name: 'Danger Button' });
    expect(button).toBeInTheDocument();
  });

  it('renders with ghost variant', () => {
    renderWithTheme(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByRole('button', { name: 'Ghost Button' });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders in loading state', () => {
    renderWithTheme(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole('button', { name: /Loading Button/ });
    expect(button).toBeDisabled();
  });

  it('renders in disabled state', () => {
    renderWithTheme(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
  });

  it('renders with different sizes', () => {
    const { rerender } = renderWithTheme(<Button size="sm">Small Button</Button>);
    expect(screen.getByRole('button', { name: 'Small Button' })).toBeInTheDocument();

    rerender(
      <ChakraProvider theme={theme}>
        <Button size="lg">Large Button</Button>
      </ChakraProvider>
    );
    expect(screen.getByRole('button', { name: 'Large Button' })).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    renderWithTheme(
      <Button data-testid="custom-button" aria-label="Custom button">
        Custom Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });
}); 