import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from '@/services/employeeService';

export function useEmployeeMutations({ onSuccess, onError }) {
  const queryClient = useQueryClient();

  const invalidateEmployees = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (data) => {
      invalidateEmployees();
      onSuccess?.('Colaborador criado com sucesso.', data);
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      invalidateEmployees();
      onSuccess?.('Colaborador atualizado com sucesso.', data);
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      invalidateEmployees();
      onSuccess?.('Colaborador excluído com sucesso.');
    },
    onError,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
