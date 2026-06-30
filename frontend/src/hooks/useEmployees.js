import { useQuery } from '@tanstack/react-query';
import { getEmployeeHistory, getEmployees } from '@/services/employeeService';

export function useEmployees(filters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () =>
      getEmployees({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        department: filters.department || undefined,
        active: filters.active === 'all' ? undefined : filters.active,
      }),
    placeholderData: (previousData) => previousData,
  });
}

export function useEmployeeHistory(employeeId, enabled) {
  return useQuery({
    queryKey: ['employees', employeeId, 'history'],
    queryFn: () => getEmployeeHistory(employeeId),
    enabled: Boolean(employeeId) && enabled,
  });
}
