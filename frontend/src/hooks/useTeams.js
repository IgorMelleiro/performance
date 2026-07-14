import { useQuery } from '@tanstack/react-query';
import {
  getTeam,
  getTeams,
  searchTeamEmployees,
  searchTeamManagers,
} from '@/services/teamService';

export function useTeams(filters) {
  return useQuery({
    queryKey: ['teams', filters],
    queryFn: () =>
      getTeams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });
}

export function useTeam(teamId, enabled = true) {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => getTeam(teamId),
    enabled: Boolean(teamId) && enabled,
  });
}

export function useTeamEmployeeSearch(search, excludeTeamId, enabled = true) {
  return useQuery({
    queryKey: ['teams', 'search', 'employees', search, excludeTeamId],
    queryFn: () =>
      searchTeamEmployees({
        search: search || undefined,
        excludeTeamId: excludeTeamId || undefined,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useTeamManagerSearch(search, excludeTeamId, enabled = true) {
  return useQuery({
    queryKey: ['teams', 'search', 'managers', search, excludeTeamId],
    queryFn: () =>
      searchTeamManagers({
        search: search || undefined,
        excludeTeamId: excludeTeamId || undefined,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
