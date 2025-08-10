// Utility to clean up invalid localStorage values
export const cleanupLocalStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const keysToCheck = [
    'dashboard_data',
    'dashboard_filters',
    'shared_api_cache',
    'auth_token',
    'user_preferences',
    'theme_preferences',
    'language_preferences',
  ];

  keysToCheck.forEach(key => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === 'undefined' || item === 'null' || item === '') {
        console.log(`Cleaning up invalid localStorage key: ${key}`);
        window.localStorage.removeItem(key);
      } else if (item) {
        // Try to parse to check if it's valid JSON
        try {
          JSON.parse(item);
        } catch (parseError) {
          console.log(`Cleaning up invalid JSON in localStorage key: ${key}`);
          window.localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error cleaning up localStorage key "${key}":`, error);
    }
  });
};

// Run cleanup on module load
if (typeof window !== 'undefined') {
  cleanupLocalStorage();
}
