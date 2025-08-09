import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import { ChartConfig, ChartDataPoint } from '../types/analytics';

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'funnel';
  data: ChartDataPoint[];
  options?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    animate?: boolean;
    xAxisDataKey?: string;
    yAxisDataKey?: string;
    dataKey?: string;
  };
  height?: number;
  width?: number;
}

const COLORS = [
  '#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5',
  '#319795', '#DD6B20', '#2B6CB0', '#38A169', '#D69E2E'
];

export const Chart: React.FC<ChartProps> = ({
  type,
  data,
  options = {},
  height = 300,
  width = '100%',
}) => {
  const {
    title,
    colors = COLORS,
    showLegend = true,
    showGrid = true,
    animate = true,
    xAxisDataKey = 'name',
    yAxisDataKey = 'value',
    dataKey = 'value',
  } = options;

  const textColor = useColorModeValue('gray.800', 'gray.200');
  const gridColor = useColorModeValue('gray.200', 'gray.700');

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}l${mx - sx},${my - sy}l${ex - mx},${ey - my}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={textColor}>
          {`${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  const renderChart = () => {
    const commonProps = {
      data,
      height,
      width,
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                dataKey={xAxisDataKey} 
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                stroke={textColor}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: useColorModeValue('white', 'gray.800'),
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
                animationDuration={animate ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                dataKey={xAxisDataKey} 
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                stroke={textColor}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: useColorModeValue('white', 'gray.800'),
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              {showLegend && <Legend />}
              <Bar
                dataKey={dataKey}
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
                animationDuration={animate ? 1000 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderActiveShape}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                animationDuration={animate ? 1000 : 0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: useColorModeValue('white', 'gray.800'),
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                animationDuration={animate ? 1000 : 0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: useColorModeValue('white', 'gray.800'),
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                dataKey={xAxisDataKey} 
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                stroke={textColor}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: useColorModeValue('white', 'gray.800'),
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                animationDuration={animate ? 1000 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                dataKey={xAxisDataKey} 
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                stroke={textColor}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: useColorModeValue('white', 'gray.800'),
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              {showLegend && <Legend />}
              <Scatter
                dataKey={dataKey}
                fill={colors[0]}
                animationDuration={animate ? 1000 : 0}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        // Funnel chart implementation using bar chart with custom styling
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="horizontal">
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis 
                type="number"
                stroke={textColor}
                fontSize={12}
              />
              <YAxis 
                dataKey={xAxisDataKey}
                type="category"
                stroke={textColor}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: useColorModeValue('white', 'gray.800'),
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                }}
              />
              {showLegend && <Legend />}
              <Bar
                dataKey={dataKey}
                fill={colors[0]}
                radius={[0, 4, 4, 0]}
                animationDuration={animate ? 1000 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <Box
            bg="gray.50"
            h={height}
            w={width}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="1px dashed"
            borderColor="gray.300"
          >
            <Text color="gray.500">Unsupported chart type: {type}</Text>
          </Box>
        );
    }
  };

  return (
    <Box>
      {title && (
        <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
          {title}
        </Text>
      )}
      {renderChart()}
    </Box>
  );
};
