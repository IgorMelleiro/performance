import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addTeamManager,
  addTeamMember,
  createTeam,
  deleteTeam,
  removeTeamManager,
  removeTeamMember,
  updateTeam,
} from '@/services/teamService';

export function useTeamMutations({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  const invalidateTeams = (teamId) => {
    queryClient.invalidateQueries({ queryKey: ['teams'] });
    if (teamId) {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
    }
  };

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      invalidateTeams();
      onSuccess?.('Time criado com sucesso.', data);
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: updateTeam,
    onSuccess: (data) => {
      invalidateTeams(data?.id);
      onSuccess?.('Time atualizado com sucesso.', data);
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      invalidateTeams();
      onSuccess?.('Time excluído com sucesso.');
    },
    onError,
  });

  const addMemberMutation = useMutation({
    mutationFn: addTeamMember,
    onSuccess: (data) => {
      invalidateTeams(data?.id);
      onSuccess?.('Colaborador adicionado ao time.', data);
    },
    onError,
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: (_data, variables) => {
      invalidateTeams(variables.teamId);
      onSuccess?.('Colaborador removido do time.');
    },
    onError,
  });

  const addManagerMutation = useMutation({
    mutationFn: addTeamManager,
    onSuccess: (data) => {
      invalidateTeams(data?.id);
      onSuccess?.('Gerente vinculado ao time.', data);
    },
    onError,
  });

  const removeManagerMutation = useMutation({
    mutationFn: removeTeamManager,
    onSuccess: (_data, variables) => {
      invalidateTeams(variables.teamId);
      onSuccess?.('Gerente removido do time.');
    },
    onError,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    addMemberMutation,
    removeMemberMutation,
    addManagerMutation,
    removeManagerMutation,
  };
}
