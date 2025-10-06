import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, gotoLogin } = useAuth();

  console.log('🚪 ProtectedRoute チェック:', { isAuthenticated });

  useEffect(() => {
    if (!isAuthenticated) {
      gotoLogin();
    }
  }, [isAuthenticated, gotoLogin]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};