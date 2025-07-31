import React, { useState } from 'react';

interface PreferencesFormProps {
  onSubmit: (preferences: any) => void;
  isLoading: boolean;
  currentPreferences?: any;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ 
  onSubmit, 
  isLoading, 
  currentPreferences = {} 
}) => {
  const [preferences, setPreferences] = useState({
    theme: currentPreferences.theme || 'auto',
    notifications: {
      email: currentPreferences.notifications?.email ?? true,
      sms: currentPreferences.notifications?.sms ?? false,
      push: currentPreferences.notifications?.push ?? true,
    },
    default_view: currentPreferences.default_view || 'dashboard',
  });

  const handleNotificationChange = (type: 'email' | 'sms' | 'push', value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }));
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    setPreferences(prev => ({
      ...prev,
      theme,
    }));
  };

  const handleDefaultViewChange = (view: 'leads' | 'buyers' | 'dashboard') => {
    setPreferences(prev => ({
      ...prev,
      default_view: view,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Theme Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Theme
        </label>
        <div className="space-y-2">
          {(['light', 'dark', 'auto'] as const).map((theme) => (
            <label key={theme} className="flex items-center">
              <input
                type="radio"
                name="theme"
                value={theme}
                checked={preferences.theme === theme}
                onChange={() => handleThemeChange(theme)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700 capitalize">
                {theme === 'auto' ? 'Auto (System)' : theme}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Notification Preferences
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">Email Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.notifications.sms}
              onChange={(e) => handleNotificationChange('sms', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">SMS Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.notifications.push}
              onChange={(e) => handleNotificationChange('push', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">Push Notifications</span>
          </label>
        </div>
      </div>

      {/* Default View */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Default Dashboard View
        </label>
        <select
          value={preferences.default_view}
          onChange={(e) => handleDefaultViewChange(e.target.value as 'leads' | 'buyers' | 'dashboard')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="dashboard">Dashboard Overview</option>
          <option value="leads">Leads Management</option>
          <option value="buyers">Buyers Database</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Choose the default page you'll see when you log in
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </div>
          ) : (
            'Update Preferences'
          )}
        </button>
      </div>
    </form>
  );
};

export default PreferencesForm; 