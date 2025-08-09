// AutomationStats Component
// Performance metrics and analytics for automation workflows

import React, { useState } from 'react';
import { AutomationStatsProps, AutomationStats as StatsType, AutomationFilters } from '../types/automation';

export const AutomationStats: React.FC<AutomationStatsProps> = ({
  stats,
  timeRange,
  filters,
  onFilterChange,
  className = '',
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['executions', 'successRate']);

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format percentage
  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%';
  };

  // Format time
  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return ms + 'ms';
    } else if (ms < 60000) {
      return (ms / 1000).toFixed(1) + 's';
    } else {
      return (ms / 60000).toFixed(1) + 'm';
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange: 'today' | 'week' | 'month' | 'year') => {
    onFilterChange({ ...filters, timeRange: newTimeRange });
  };

  // Handle metric selection
  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  // Get metric cards
  const getMetricCards = () => {
    const cards = [
      {
        title: 'Total Workflows',
        value: formatNumber(stats.totalWorkflows),
        change: '+12%',
        changeType: 'positive',
        icon: '📊',
        color: 'bg-blue-500',
      },
      {
        title: 'Active Workflows',
        value: formatNumber(stats.activeWorkflows),
        change: '+5%',
        changeType: 'positive',
        icon: '⚡',
        color: 'bg-green-500',
      },
      {
        title: 'Executions Today',
        value: formatNumber(stats.executionsToday),
        change: '+8%',
        changeType: 'positive',
        icon: '📈',
        color: 'bg-purple-500',
      },
      {
        title: 'Success Rate',
        value: formatPercentage(stats.successRate),
        change: '+2%',
        changeType: 'positive',
        icon: '✅',
        color: 'bg-green-500',
      },
      {
        title: 'Avg Execution Time',
        value: formatTime(stats.averageExecutionTime),
        change: '-15%',
        changeType: 'negative',
        icon: '⏱️',
        color: 'bg-yellow-500',
      },
    ];

    return cards;
  };

  // Get top triggers chart data
  const getTopTriggersData = () => {
    return stats.topTriggers.map((trigger, index) => ({
      name: trigger.type,
      value: trigger.count,
      percentage: (trigger.count / stats.executionsToday) * 100,
      color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5],
    }));
  };

  // Get top actions chart data
  const getTopActionsData = () => {
    return stats.topActions.map((action, index) => ({
      name: action.type,
      value: action.count,
      percentage: (action.count / stats.executionsToday) * 100,
      color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5],
    }));
  };

  return (
    <div className={`automation-stats ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation Analytics</h2>
          <p className="text-gray-600">Performance metrics and insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {getMetricCards().map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center text-white text-sm`}>
                {card.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                card.changeType === 'positive' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {card.change}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </div>
            
            <div className="text-sm text-gray-600">
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Triggers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Triggers</h3>
          <div className="space-y-3">
            {getTopTriggersData().map((trigger, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: trigger.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {trigger.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${trigger.percentage}%`,
                        backgroundColor: trigger.color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {trigger.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Actions</h3>
          <div className="space-y-3">
            {getTopActionsData().map((action, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: action.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {action.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${action.percentage}%`,
                        backgroundColor: action.color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {action.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Execution Trends */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Execution Trends</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Today</span>
                <span className="font-medium">{formatNumber(stats.executionsToday)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Week</span>
                <span className="font-medium">{formatNumber(stats.executionsThisWeek)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This Month</span>
                <span className="font-medium">{formatNumber(stats.executionsThisMonth)}</span>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Success Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">{formatPercentage(stats.successRate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Execution Time</span>
                <span className="font-medium">{formatTime(stats.averageExecutionTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Workflows</span>
                <span className="font-medium">{formatNumber(stats.activeWorkflows)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 transition-colors">
                📊 View Detailed Reports
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 transition-colors">
                ⚙️ Configure Alerts
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 transition-colors">
                📈 Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Filters</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({ ...filters, status: 'active' })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters?.status === 'active'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, status: 'inactive' })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters?.status === 'inactive'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inactive Only
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, status: 'all' })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters?.status === 'all' || !filters?.status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Workflows
          </button>
        </div>
      </div>
    </div>
  );
};
