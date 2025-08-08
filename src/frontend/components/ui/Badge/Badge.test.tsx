import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Badge from './Badge';
import theme from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Badge Component', () => {
  it('renders with default props', () => {
    renderWithTheme(<Badge>Default Badge</Badge>);
    expect(screen.getByText('Default Badge')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = renderWithTheme(
      <Badge variant="solid">Solid Badge</Badge>
    );
    expect(screen.getByText('Solid Badge')).toBeInTheDocument();

    rerender(
      <ChakraProvider theme={theme}>
        <Badge variant="outline">Outline Badge</Badge>
      </ChakraProvider>
    );
    expect(screen.getByText('Outline Badge')).toBeInTheDocument();
  });

  it('renders with different color schemes', () => {
    const { rerender } = renderWithTheme(
      <Badge colorScheme="success">Success Badge</Badge>
    );
    expect(screen.getByText('Success Badge')).toBeInTheDocument();

    rerender(
      <ChakraProvider theme={theme}>
        <Badge colorScheme="danger">Danger Badge</Badge>
      </ChakraProvider>
    );
    expect(screen.getByText('Danger Badge')).toBeInTheDocument();

    rerender(
      <ChakraProvider theme={theme}>
        <Badge colorScheme="warning">Warning Badge</Badge>
      </ChakraProvider>
    );
    expect(screen.getByText('Warning Badge')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    renderWithTheme(
      <Badge data-testid="custom-badge" aria-label="Custom badge">
        Custom Badge
      </Badge>
    );
    
    const badge = screen.getByTestId('custom-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Custom badge');
  });

  it('renders with primary color scheme by default', () => {
    renderWithTheme(<Badge>Primary Badge</Badge>);
    expect(screen.getByText('Primary Badge')).toBeInTheDocument();
  });

  it('renders with subtle variant by default', () => {
    renderWithTheme(<Badge>Subtle Badge</Badge>);
    expect(screen.getByText('Subtle Badge')).toBeInTheDocument();
  });
}); 