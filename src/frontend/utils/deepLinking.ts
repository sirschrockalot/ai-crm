import { useRouter } from 'next/router';

export interface DeepLinkConfig {
  path: string;
  query?: Record<string, string>;
  replace?: boolean;
  shallow?: boolean;
}

export const useDeepLinking = () => {
  const router = useRouter();

  const navigateToDeepLink = (config: DeepLinkConfig) => {
    const { path, query = {}, replace = false, shallow = true } = config;
    
    if (replace) {
      router.replace({ pathname: path, query }, undefined, { shallow });
    } else {
      router.push({ pathname: path, query }, undefined, { shallow });
    }
  };

  const navigateWithQuery = (path: string, query: Record<string, string>) => {
    router.push({ pathname: path, query }, undefined, { shallow: true });
  };

  const updateQueryParams = (newParams: Record<string, string>) => {
    const currentQuery = { ...router.query, ...newParams };
    router.push({ pathname: router.pathname, query: currentQuery }, undefined, { shallow: true });
  };

  const removeQueryParams = (paramsToRemove: string[]) => {
    const currentQuery = { ...router.query };
    paramsToRemove.forEach(param => delete currentQuery[param]);
    router.push({ pathname: router.pathname, query: currentQuery }, undefined, { shallow: true });
  };

  const getQueryParam = (key: string): string | undefined => {
    const value = router.query[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const hasQueryParam = (key: string): boolean => {
    return router.query[key] !== undefined;
  };

  const createShareableLink = (path: string, query: Record<string, string>): string => {
    const baseUrl = window.location.origin;
    const queryString = new URLSearchParams(query).toString();
    return `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
  };

  const parseDeepLink = (url: string): DeepLinkConfig | null => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const query: Record<string, string> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        query[key] = value;
      });

      return { path, query };
    } catch (error) {
      return null;
    }
  };

  return {
    navigateToDeepLink,
    navigateWithQuery,
    updateQueryParams,
    removeQueryParams,
    getQueryParam,
    hasQueryParam,
    createShareableLink,
    parseDeepLink,
  };
};
