import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Card from './Card';
import theme from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('Card Component', () => {
  it('renders with children', () => {
    renderWithTheme(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with header', () => {
    renderWithTheme(
      <Card header={<div>Card Header</div>} />
    );
    expect(screen.getByText('Card Header')).toBeInTheDocument();
  });

  it('renders with body', () => {
    renderWithTheme(
      <Card body={<div>Card Body</div>} />
    );
    expect(screen.getByText('Card Body')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    renderWithTheme(
      <Card footer={<div>Card Footer</div>} />
    );
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('renders with header, body, and footer', () => {
    renderWithTheme(
      <Card
        header={<div>Card Header</div>}
        body={<div>Card Body</div>}
        footer={<div>Card Footer</div>}
      />
    );
    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Card Body')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('renders with elevated variant by default', () => {
    renderWithTheme(<Card>Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('renders with outline variant', () => {
    renderWithTheme(<Card variant="outline">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('renders with filled variant', () => {
    renderWithTheme(<Card variant="filled">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('renders with unstyled variant', () => {
    renderWithTheme(<Card variant="unstyled">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    renderWithTheme(
      <Card data-testid="custom-card" aria-label="Custom card">
        Content
      </Card>
    );
    
    const card = screen.getByTestId('custom-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('aria-label', 'Custom card');
  });

  it('prioritizes children over header/body/footer', () => {
    renderWithTheme(
      <Card
        header={<div>Header</div>}
        body={<div>Body</div>}
        footer={<div>Footer</div>}
      >
        <div>Children Content</div>
      </Card>
    );
    
    expect(screen.getByText('Children Content')).toBeInTheDocument();
    expect(screen.queryByText('Header')).not.toBeInTheDocument();
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
    expect(screen.queryByText('Footer')).not.toBeInTheDocument();
  });
}); 