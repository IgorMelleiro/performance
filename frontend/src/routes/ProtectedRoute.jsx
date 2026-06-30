import { CircularProgress, Box } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/layouts/AppLayout';

function AuthLoading() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { isBootstrapping } = useAuthBootstrap();

  if (!hasHydrated) {
    return <AuthLoading />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isBootstrapping) {
    return <AuthLoading />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
