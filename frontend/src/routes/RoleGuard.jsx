import { Navigate, Outlet } from 'react-router-dom';
import { hasAnyPermission } from '@/auth/permissions';
import { useAuthStore } from '@/store/authStore';

/**
 * Protege rotas por permissão (centralizado — evitar ifs espalhados nas páginas).
 * Uso: <Route element={<RoleGuard permissions={[PERMISSIONS.TEAMS_VIEW]} />}>
 */
export default function RoleGuard({ permissions = [], roles = [], redirectTo = '/' }) {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const allowedByRole = roles.length === 0 || roles.includes(role);
  const allowedByPermission =
    permissions.length === 0 || hasAnyPermission(role, permissions);

  if (!allowedByRole || !allowedByPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
