import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Input from './Input';
import theme from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Input Component', () => {
  it('renders with default props', () => {
    renderWithTheme(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    renderWithTheme(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    renderWithTheme(
      <Input 
        label="Email" 
        placeholder="Enter email" 
        error="Invalid email format" 
      />
    );
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    renderWithTheme(
      <Input 
        placeholder="Enter text" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledWith('test value');
  });

  it('renders with different types', () => {
    const { rerender } = renderWithTheme(
      <Input type="email" placeholder="Enter email" />
    );
    expect(screen.getByPlaceholderText('Enter email')).toHaveAttribute('type', 'email');

    rerender(
      <ChakraProvider theme={theme}>
        <Input type="password" placeholder="Enter password" />
      </ChakraProvider>
    );
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'password');
  });

  it('renders in disabled state', () => {
    renderWithTheme(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('renders as required', () => {
    renderWithTheme(
      <Input 
        label="Required Field" 
        required 
        placeholder="Required input" 
      />
    );
    const input = screen.getByPlaceholderText('Required input');
    expect(input).toBeRequired();
  });

  it('passes through additional props', () => {
    renderWithTheme(
      <Input 
        data-testid="custom-input" 
        aria-label="Custom input"
        placeholder="Custom input" 
      />
    );
    
    const input = screen.getByTestId('custom-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-label', 'Custom input');
  });

  it('renders without label when not provided', () => {
    renderWithTheme(<Input placeholder="No label input" />);
    expect(screen.getByPlaceholderText('No label input')).toBeInTheDocument();
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });
}); 