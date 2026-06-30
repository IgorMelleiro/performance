import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export function useAuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (query.data && token) {
      setAuth(query.data, token);
    }
  }, [query.data, token, setAuth]);

  useEffect(() => {
    if (query.isError) {
      clearAuth();
    }
  }, [query.isError, clearAuth]);

  return {
    isBootstrapping: Boolean(token) && query.isLoading,
  };
}
