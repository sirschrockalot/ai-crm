import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Chart from './Chart';
import theme from '../../../theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

const mockData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
];

describe('Chart Component', () => {
  it('renders line chart', () => {
    renderWithTheme(
      <Chart type="line" data={mockData} width={400} height={300} />
    );
    // Chart renders as SVG, so we check for the container
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders area chart', () => {
    renderWithTheme(
      <Chart type="area" data={mockData} width={400} height={300} />
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders bar chart', () => {
    renderWithTheme(
      <Chart type="bar" data={mockData} width={400} height={300} />
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders pie chart', () => {
    renderWithTheme(
      <Chart type="pie" data={mockData} width={400} height={300} />
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with title', () => {
    renderWithTheme(
      <Chart type="line" data={mockData} title="Sales Chart" />
    );
    expect(screen.getByText('Sales Chart')).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    renderWithTheme(
      <Chart type="line" data={mockData} width={500} height={400} />
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without grid when showGrid is false', () => {
    renderWithTheme(
      <Chart type="line" data={mockData} showGrid={false} width={400} height={300} />
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without tooltip when showTooltip is false', () => {
    renderWithTheme(
      <Chart type="line" data={mockData} showTooltip={false} width={400} height={300} />
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders without legend when showLegend is false', () => {
    renderWithTheme(
      <Chart type="line" data={mockData} showLegend={false} width={400} height={300} />
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    renderWithTheme(
      <Chart 
        type="line" 
        data={mockData} 
        data-testid="custom-chart"
        aria-label="Custom chart"
        width={400}
        height={300}
      />
    );
    
    const chart = screen.getByTestId('custom-chart');
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute('aria-label', 'Custom chart');
  });
}); 