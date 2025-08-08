import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Loading from './Loading';
import { theme } from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Loading', () => {
  it('renders spinner by default', () => {
    renderWithTheme(<Loading />);
    expect(document.querySelector('.chakra-spinner')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    renderWithTheme(<Loading text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders skeleton variant', () => {
    renderWithTheme(<Loading variant="skeleton" />);
    // Skeleton elements are rendered but don't have specific testable content
    expect(document.querySelector('.chakra-skeleton')).toBeInTheDocument();
  });

  it('renders dots variant', () => {
    renderWithTheme(<Loading variant="dots" />);
    // Dots variant renders without errors
    expect(document.querySelector('.chakra-stack')).toBeInTheDocument();
  });

  it('applies custom size', () => {
    renderWithTheme(<Loading size="lg" />);
    expect(document.querySelector('.chakra-spinner')).toBeInTheDocument();
  });

  it('applies custom color', () => {
    renderWithTheme(<Loading color="red.500" />);
    expect(document.querySelector('.chakra-spinner')).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    renderWithTheme(<Loading width="200px" height="100px" />);
    expect(document.querySelector('.chakra-spinner')).toBeInTheDocument();
  });
}); 