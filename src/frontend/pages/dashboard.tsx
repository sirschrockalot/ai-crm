import { useEffect } from 'react';
import { useRouter } from 'next/router';

const DashboardRedirect: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard structure
    router.replace('/dashboard');
  }, [router]);

  return null;
};

export default DashboardRedirect; 