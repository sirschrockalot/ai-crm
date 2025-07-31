import React, { useState } from 'react';
import { useRouter } from 'next/router';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { useAuthStore } from '../../stores/authStore';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();
  const [isDevLoginVisible, setIsDevLoginVisible] = useState(false);
  const [devCredentials, setDevCredentials] = useState({ email: 'dev', password: 'dev' });
  const [devLoading, setDevLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/dev/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(devCredentials),
      });

      const data = await response.json();
      
      if (data.success) {
        await login(data.access_token, data.user);
        router.push('/leads/pipeline');
      } else {
        alert('Dev login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Dev login error:', error);
      alert('Dev login failed. Please check the console for details.');
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Presidential Digs CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <GoogleLoginButton />
          
          {/* Dev Login Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsDevLoginVisible(!isDevLoginVisible)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isDevLoginVisible ? 'Hide' : 'Show'} Development Login
            </button>
          </div>

          {/* Dev Login Form */}
          {isDevLoginVisible && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-3">
                Development Login (Dev Environment Only)
              </h3>
              <form onSubmit={handleDevLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-yellow-700">
                    Email
                  </label>
                  <input
                    type="text"
                    value={devCredentials.email}
                    onChange={(e) => setDevCredentials({ ...devCredentials, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                    placeholder="dev"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-yellow-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={devCredentials.password}
                    onChange={(e) => setDevCredentials({ ...devCredentials, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                    placeholder="dev"
                  />
                </div>
                <button
                  type="submit"
                  disabled={devLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {devLoading ? 'Signing in...' : 'Dev Login'}
                </button>
              </form>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 