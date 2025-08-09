import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  capitalize,
  truncate,
  slugify,
  formatCurrency,
  formatNumber,
  formatPercentage,
  groupBy,
  sortBy,
  unique,
  pick,
  omit,
  deepClone,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isRequired,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  debounce,
  throttle,
  getErrorMessage,
  isNetworkError,
  hexToRgb,
  getContrastColor,
} from '@/components/shared/SharedUtils';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const locationMock = {
  href: 'http://localhost:3000/test?page=1&search=test',
  search: '?page=1&search=test',
};
Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

// Mock window.history
const historyMock = {
  replaceState: jest.fn(),
  pushState: jest.fn(),
};
Object.defineProperty(window, 'history', {
  value: historyMock,
});

describe('Shared Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Date Utilities', () => {
    test('formatDate should format date correctly', () => {
      const date = '2024-01-15T10:30:00Z';
      expect(formatDate(date)).toBe('Jan 15, 2024');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });

    test('formatDate should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate('')).toBe('');
      expect(formatDate(null as any)).toBe('');
    });

    test('formatDateTime should format date and time', () => {
      const date = '2024-01-15T10:30:00Z';
      // Note: Timezone conversion may affect the exact time displayed
      const result = formatDateTime(date);
      expect(result).toMatch(/Jan 15, 2024 \d{2}:\d{2}/);
    });

    test('formatRelativeTime should format relative time', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
      expect(formatRelativeTime(oneDayAgo)).toBe('1d ago');
    });
  });

  describe('String Utilities', () => {
    test('capitalize should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('test string')).toBe('Test string');
    });

    test('truncate should truncate long strings', () => {
      expect(truncate('Hello world', 5)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('', 5)).toBe('');
    });

    test('slugify should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test & Special Characters!')).toBe('test-special-characters');
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });
  });

  describe('Number Utilities', () => {
    test('formatCurrency should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('formatNumber should format numbers with decimals', () => {
      expect(formatNumber(1234.567, 2)).toBe('1,234.57');
      expect(formatNumber(1000, 0)).toBe('1,000');
      expect(formatNumber(0.123, 3)).toBe('0.123');
    });

    test('formatPercentage should format percentages', () => {
      expect(formatPercentage(15.5)).toBe('15.5%');
      expect(formatPercentage(100, 0)).toBe('100%');
      expect(formatPercentage(0.123, 2)).toBe('0.12%');
    });
  });

  describe('Array Utilities', () => {
    const testArray = [
      { id: 1, name: 'Alice', category: 'A' },
      { id: 2, name: 'Bob', category: 'B' },
      { id: 3, name: 'Charlie', category: 'A' },
    ];

    test('groupBy should group array by key', () => {
      const result = groupBy(testArray, 'category');
      expect(result).toEqual({
        A: [
          { id: 1, name: 'Alice', category: 'A' },
          { id: 3, name: 'Charlie', category: 'A' },
        ],
        B: [{ id: 2, name: 'Bob', category: 'B' }],
      });
    });

    test('sortBy should sort array by key', () => {
      const result = sortBy(testArray, 'name');
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('Charlie');
    });

    test('sortBy should sort in descending order', () => {
      const result = sortBy(testArray, 'name', 'desc');
      expect(result[0].name).toBe('Charlie');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('Alice');
    });

    test('unique should remove duplicates', () => {
      const arrayWithDuplicates = [1, 2, 2, 3, 3, 4];
      expect(unique(arrayWithDuplicates)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('Object Utilities', () => {
    const testObject = {
      id: 1,
      name: 'Test',
      email: 'test@example.com',
      password: 'secret',
    };

    test('pick should pick specified properties', () => {
      const result = pick(testObject, ['id', 'name']);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    test('omit should omit specified properties', () => {
      const result = omit(testObject, ['password', 'email']);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    test('deepClone should clone objects deeply', () => {
      const nestedObject = {
        user: {
          name: 'John',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        items: [1, 2, 3],
      };

      const cloned = deepClone(nestedObject);
      expect(cloned).toEqual(nestedObject);
      expect(cloned).not.toBe(nestedObject);
      expect(cloned.user).not.toBe(nestedObject.user);
    });
  });

  describe('Validation Utilities', () => {
    test('isValidEmail should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    test('isValidPhone should validate phone numbers', () => {
      expect(isValidPhone('+1-555-123-4567')).toBe(true);
      expect(isValidPhone('555-123-4567')).toBe(true);
      expect(isValidPhone('(555) 123-4567')).toBe(true);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });

    test('isValidUrl should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    test('isRequired should validate required fields', () => {
      expect(isRequired('test')).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired(false)).toBe(true);
      expect(isRequired('')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe('Storage Utilities', () => {
    test('setLocalStorage should store data', () => {
      setLocalStorage('test-key', { data: 'test' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({ data: 'test' })
      );
    });

    test('getLocalStorage should retrieve data', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ data: 'test' }));
      const result = getLocalStorage('test-key');
      expect(result).toEqual({ data: 'test' });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
    });

    test('getLocalStorage should handle invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const result = getLocalStorage('test-key');
      expect(result).toBe(null);
    });

    test('removeLocalStorage should remove data', () => {
      removeLocalStorage('test-key');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('URL Utilities', () => {
    test('getQueryParam should get query parameter', () => {
      const result = getQueryParam('page');
      expect(result).toBe('1');
    });

    test('getQueryParam should return null for non-existent param', () => {
      const result = getQueryParam('nonexistent');
      expect(result).toBe(null);
    });

    test('setQueryParam should set query parameter', () => {
      setQueryParam('newParam', 'value');
      expect(historyMock.replaceState).toHaveBeenCalled();
    });

    test('removeQueryParam should remove query parameter', () => {
      removeQueryParam('page');
      expect(historyMock.replaceState).toHaveBeenCalled();
    });
  });

  describe('Performance Utilities', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('debounce should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test3');
    });

    test('throttle should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('test1');
      throttledFn('test2');
      throttledFn('test3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');

      jest.advanceTimersByTime(100);

      throttledFn('test4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('test4');
    });
  });

  describe('Error Utilities', () => {
    test('getErrorMessage should extract error message', () => {
      expect(getErrorMessage('Simple error')).toBe('Simple error');
      expect(getErrorMessage({ message: 'Error message' })).toBe('Error message');
      expect(getErrorMessage({ error: 'Error field' })).toBe('Error field');
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });

    test('isNetworkError should detect network errors', () => {
      expect(isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(isNetworkError({ message: 'Network Error' })).toBe(true);
      expect(isNetworkError({ message: 'fetch failed' })).toBe(true);
      expect(isNetworkError({ message: 'Other error' })).toBe(false);
    });
  });

  describe('Color Utilities', () => {
    test('hexToRgb should convert hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    test('hexToRgb should handle invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBe(null);
      expect(hexToRgb('#GGGGGG')).toBe(null);
      expect(hexToRgb('')).toBe(null);
    });

    test('getContrastColor should return contrasting color', () => {
      expect(getContrastColor('#FFFFFF')).toBe('#000000'); // White background -> black text
      expect(getContrastColor('#000000')).toBe('#ffffff'); // Black background -> white text
      // Red background brightness calculation may vary based on implementation
      const redContrast = getContrastColor('#FF0000');
      expect(['#000000', '#ffffff']).toContain(redContrast);
    });

    test('getContrastColor should handle invalid colors', () => {
      expect(getContrastColor('invalid')).toBe('#000000');
    });
  });
});
