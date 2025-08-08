// Data transformation utilities

export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface FilterConfig<T> {
  key: keyof T;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'in' | 'notIn';
}

export interface GroupConfig<T> {
  key: keyof T;
  label?: string;
}

// Sorting utilities
export function sortArray<T>(array: T[], config: SortConfig<T>): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[config.key];
    const bValue = b[config.key];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : 1;
    return config.direction === 'asc' ? comparison : -comparison;
  });
}

export function sortArrayByMultiple<T>(array: T[], configs: SortConfig<T>[]): T[] {
  return [...array].sort((a, b) => {
    for (const config of configs) {
      const aValue = a[config.key];
      const bValue = b[config.key];

      if (aValue === bValue) continue;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return config.direction === 'asc' ? comparison : -comparison;
    }
    return 0;
  });
}

// Filtering utilities
export function filterArray<T>(array: T[], config: FilterConfig<T>): T[] {
  return array.filter(item => {
    const value = item[config.key];
    
    switch (config.operator) {
      case 'equals':
        return value === config.value;
      case 'contains':
        return String(value).toLowerCase().includes(String(config.value).toLowerCase());
      case 'startsWith':
        return String(value).toLowerCase().startsWith(String(config.value).toLowerCase());
      case 'endsWith':
        return String(value).toLowerCase().endsWith(String(config.value).toLowerCase());
      case 'greaterThan':
        return value > config.value;
      case 'lessThan':
        return value < config.value;
      case 'in':
        return Array.isArray(config.value) ? config.value.includes(value) : false;
      case 'notIn':
        return Array.isArray(config.value) ? !config.value.includes(value) : false;
      default:
        return true;
    }
  });
}

export function filterArrayByMultiple<T>(array: T[], configs: FilterConfig<T>[]): T[] {
  return array.filter(item => {
    return configs.every(config => {
      const value = item[config.key];
      
      switch (config.operator) {
        case 'equals':
          return value === config.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(config.value).toLowerCase());
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(config.value).toLowerCase());
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(config.value).toLowerCase());
        case 'greaterThan':
          return value > config.value;
        case 'lessThan':
          return value < config.value;
        case 'in':
          return Array.isArray(config.value) ? config.value.includes(value) : false;
        case 'notIn':
          return Array.isArray(config.value) ? !config.value.includes(value) : false;
        default:
          return true;
      }
    });
  });
}

// Grouping utilities
export function groupArray<T>(array: T[], config: GroupConfig<T>): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(item[config.key] || 'Unknown');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function groupArrayByMultiple<T>(array: T[], configs: GroupConfig<T>[]): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = configs.map(config => String(item[config.key] || 'Unknown')).join('|');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Pagination utilities
export function paginateArray<T>(array: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}

export function getPaginationInfo<T>(array: T[], page: number, pageSize: number) {
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    totalItems,
    totalPages,
    currentPage: page,
    pageSize,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
  };
}

// Search utilities
export function searchArray<T>(array: T[], searchTerm: string, searchKeys: (keyof T)[]): T[] {
  if (!searchTerm.trim()) return array;

  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return searchKeys.some(key => {
      const value = item[key];
      return String(value).toLowerCase().includes(term);
    });
  });
}

// Data transformation utilities
export function transformArray<T, U>(array: T[], transformer: (item: T) => U): U[] {
  return array.map(transformer);
}

export function flattenArray<T>(array: T[][]): T[] {
  return array.flat();
}

export function uniqueArray<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function uniqueArrayBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Aggregation utilities
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = Number(item[key]) || 0;
    return sum + value;
  }, 0);
}

export function averageBy<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0;
  return sumBy(array, key) / array.length;
}

export function minBy<T>(array: T[], key: keyof T): T | null {
  if (array.length === 0) return null;
  return array.reduce((min, item) => {
    const minValue = Number(min[key]) || 0;
    const itemValue = Number(item[key]) || 0;
    return itemValue < minValue ? item : min;
  });
}

export function maxBy<T>(array: T[], key: keyof T): T | null {
  if (array.length === 0) return null;
  return array.reduce((max, item) => {
    const maxValue = Number(max[key]) || 0;
    const itemValue = Number(item[key]) || 0;
    return itemValue > maxValue ? item : max;
  });
}

export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce((counts, item) => {
    const value = String(item[key] || 'Unknown');
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
} 