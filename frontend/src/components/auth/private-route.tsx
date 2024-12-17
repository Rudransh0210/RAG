import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { AppLayout } from '../layout/app-layout';

export function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}