import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export type ChartType = 'line' | 'area' | 'bar' | 'pie';

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ChartProps extends BoxProps {
  type: ChartType;
  data: ChartData[];
  width?: number | string;
  height?: number | string;
  title?: string;
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  colors?: string[];
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  width = '100%',
  height = 300,
  title,
  xAxisDataKey = 'name',
  yAxisDataKey = 'value',
  colors = COLORS,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  ...props
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisDataKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yAxisDataKey}
              stroke={colors[0]}
              strokeWidth={2}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisDataKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yAxisDataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisDataKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Bar dataKey={yAxisDataKey} fill={colors[0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisDataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Box {...props}>
      {title && (
        <Box mb={4} textAlign="center" fontWeight="bold">
          {title}
        </Box>
      )}
      <ResponsiveContainer width={width} height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </Box>
  );
};

export default Chart; 