import { hasAnyPermission, hasPermission } from '@/auth/permissions';
import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  return {
    role,
    user,
    can: (permission) => hasPermission(role, permission),
    canAny: (permissions) => hasAnyPermission(role, permissions),
    isRh: role === 'RH',
    isGerente: role === 'GERENTE',
    isFuncionario: role === 'FUNCIONARIO',
  };
}
