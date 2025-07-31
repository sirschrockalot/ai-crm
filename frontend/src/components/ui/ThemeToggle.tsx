import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../stores/userStore';

const ThemeToggle: React.FC = () => {
  const { user, updatePreferences } = useUserStore();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences?.theme) {
      setCurrentTheme(user.preferences.theme);
      applyTheme(user.preferences.theme);
    }
  }, [user]);

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    setIsLoading(true);
    setCurrentTheme(theme);
    applyTheme(theme);

    try {
      await updatePreferences({ theme });
    } catch (error) {
      console.error('Failed to update theme preference:', error);
      // Revert to previous theme on error
      setCurrentTheme(user?.preferences?.theme || 'auto');
      applyTheme(user?.preferences?.theme || 'auto');
    } finally {
      setIsLoading(false);
    }
  };

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Theme</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose your preferred theme for the application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            disabled={isLoading}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
              currentTheme === theme.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{theme.icon}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {theme.label}
              </div>
              {currentTheme === theme.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center text-sm text-gray-500">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating theme...
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>• <strong>Light:</strong> Bright theme for daytime use</p>
        <p>• <strong>Dark:</strong> Dark theme for low-light environments</p>
        <p>• <strong>Auto:</strong> Automatically switches based on your system preference</p>
      </div>
    </div>
  );
};

export default ThemeToggle; 