import React from 'react';
import { useRouter } from 'next/router';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { useAuthStore } from '../../stores/authStore';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

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