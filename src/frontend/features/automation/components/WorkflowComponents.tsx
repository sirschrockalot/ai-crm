// WorkflowComponents Component
// Component library for workflow elements with search and categorization

import React, { useState, useMemo } from 'react';
import { WorkflowComponentsProps } from '../types/automation';

export const WorkflowComponents: React.FC<WorkflowComponentsProps> = ({
  components,
  onComponentSelect,
  onComponentAdd,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(components.map(c => c.category)));
    return ['all', ...cats];
  }, [components]);

  // Filter components based on search and category
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          component.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [components, searchTerm, selectedCategory]);

  // Group components by category
  const groupedComponents = useMemo(() => {
    const grouped = filteredComponents.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<string, typeof components>);

    return grouped;
  }, [filteredComponents]);

  // Handle component selection
  const handleComponentClick = (component: any) => {
    onComponentSelect(component);
    onComponentAdd(component);
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'triggers':
        return '⚡';
      case 'actions':
        return '⚙️';
      case 'conditions':
        return '🔀';
      case 'delays':
        return '⏰';
      case 'integrations':
        return '🔗';
      default:
        return '📦';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'triggers':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'actions':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'conditions':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delays':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'integrations':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`workflow-components ${className}`}>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
          <div key={category} className="border border-gray-200 rounded-lg">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg border-b border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="font-medium text-gray-900">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({categoryComponents.length})
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isExpanded[category] ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Category Components */}
            {isExpanded[category] && (
              <div className="p-2 space-y-2">
                {categoryComponents.map((component) => (
                  <div
                    key={`${component.type}-${component.name}`}
                    onClick={() => handleComponentClick(component)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                          {component.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {component.name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(component.category)}`}>
                            {component.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {component.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredComponents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      )}

      {/* Quick Add Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Add</h4>
        <div className="grid grid-cols-2 gap-2">
          {components.slice(0, 6).map((component) => (
            <button
              key={`quick-${component.type}-${component.name}`}
              onClick={() => handleComponentClick(component)}
              className="p-2 text-xs border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{component.icon}</span>
                <span className="font-medium text-gray-900 truncate">
                  {component.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
