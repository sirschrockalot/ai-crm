import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import ProfileForm from '../../components/profile/ProfileForm';
import PreferencesForm from '../../components/profile/PreferencesForm';
import ThemeToggle from '../../components/ui/ThemeToggle';

interface ProfileData {
  name: string;
  phone?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    dashboard_layout?: object;
    default_view?: 'leads' | 'buyers' | 'dashboard';
  };
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile, updatePreferences } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const profileForm = useForm<ProfileData>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      preferences: {
        theme: user?.preferences?.theme || 'auto',
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          sms: user?.preferences?.notifications?.sms ?? false,
          push: user?.preferences?.notifications?.push ?? true,
        },
        default_view: user?.preferences?.default_view || 'dashboard',
      },
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        phone: user.phone || '',
        preferences: {
          theme: user.preferences?.theme || 'auto',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
            push: user.preferences?.notifications?.push ?? true,
          },
          default_view: user.preferences?.default_view || 'dashboard',
        },
      });
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (data: ProfileData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await updateProfile({
        name: data.name,
        phone: data.phone,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSubmit = async (preferences: any) => {
    setIsLoading(true);
    setMessage(null);

    try {
      await updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile information and preferences
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <ProfileForm
              form={profileForm}
              onSubmit={handleProfileSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
            <PreferencesForm
              onSubmit={handlePreferencesSubmit}
              isLoading={isLoading}
              currentPreferences={user?.preferences}
            />
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Theme</h2>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 