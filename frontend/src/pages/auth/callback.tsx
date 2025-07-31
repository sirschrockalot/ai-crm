import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../stores/authStore';

const CallbackPage: React.FC = () => {
  const router = useRouter();
  const { setAuth, setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const { access_token, refresh_token, user } = router.query;

      if (access_token && refresh_token && user) {
        try {
          // Parse user data
          const userData = JSON.parse(decodeURIComponent(user as string));
          
          // Store tokens and user data
          localStorage.setItem('access_token', access_token as string);
          localStorage.setItem('refresh_token', refresh_token as string);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Update auth store
          setAuth(true);
          setUser(userData);
          
          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          router.push('/auth/error');
        }
      } else {
        // No tokens received, redirect to error page
        router.push('/auth/error');
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router, setAuth, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing your login...</p>
      </div>
    </div>
  );
};

export default CallbackPage; 