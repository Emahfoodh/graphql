import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const RootPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const hasuraToken = localStorage.getItem('hasura-jwt-token');
    if (hasuraToken) {
      router.push('/dashboard'); // Redirect to dashboard if token exists
    } else {
      router.push('/login'); // Redirect to login if no token
    }
  }, []);

  return <div>Redirecting...</div>; // Placeholder content while redirecting
};

export default RootPage;
