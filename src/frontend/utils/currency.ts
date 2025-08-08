// Currency formatting utilities
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const parseCurrency = (value: string, currency: string = 'USD'): number => {
  try {
    // Remove currency symbol and non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    return 0;
  }
};

export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    return value.toString();
  }
};

export const formatPercentage = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    return `${value.toFixed(decimals)}%`;
  }
};

export const formatCompactNumber = (
  value: number,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  } catch (error) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return (part / total) * 100;
};

export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

export const roundToDecimals = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const isValidCurrency = (value: string): boolean => {
  const parsed = parseCurrency(value);
  return !isNaN(parsed) && parsed >= 0;
};

export const formatCurrencyRange = (
  min: number,
  max: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const minFormatted = formatCurrency(min, currency, locale);
  const maxFormatted = formatCurrency(max, currency, locale);
  return `${minFormatted} - ${maxFormatted}`;
};

export const formatCurrencyWithSymbol = (
  amount: number,
  symbol: string = '$',
  decimals: number = 2
): string => {
  return `${symbol}${amount.toFixed(decimals)}`;
};

export const formatCurrencyCompact = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  } catch (error) {
    return formatCurrencyWithSymbol(amount);
  }
}; 