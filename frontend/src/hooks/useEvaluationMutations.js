import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  completeEvaluation,
  createEvaluation,
  createSelfEvaluation,
  deleteEvaluation,
  updateEvaluation,
} from '@/services/evaluationService';

export function useEvaluationMutations({ onSuccess, onError }) {
  const queryClient = useQueryClient();

  const invalidateEvaluations = () => {
    queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const createMutation = useMutation({
    mutationFn: createEvaluation,
    onSuccess: (data) => {
      invalidateEvaluations();
      onSuccess?.('Rascunho criado com sucesso.', data);
    },
    onError,
  });

  const createSelfMutation = useMutation({
    mutationFn: createSelfEvaluation,
    onSuccess: (data) => {
      invalidateEvaluations();
      onSuccess?.('Autoavaliação iniciada com sucesso.', data);
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: updateEvaluation,
    onSuccess: (data) => {
      invalidateEvaluations();
      queryClient.setQueryData(['evaluations', data.id], data);
      onSuccess?.('Progresso salvo.', data);
    },
    onError,
  });

  const completeMutation = useMutation({
    mutationFn: completeEvaluation,
    onSuccess: (data) => {
      invalidateEvaluations();
      onSuccess?.(
        data.isAutoEvaluation
          ? 'Autoavaliação concluída com sucesso.'
          : 'Avaliação concluída com sucesso.',
        data,
      );
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvaluation,
    onSuccess: () => {
      invalidateEvaluations();
      onSuccess?.('Rascunho excluído com sucesso.');
    },
    onError,
  });

  return {
    createMutation,
    createSelfMutation,
    updateMutation,
    completeMutation,
    deleteMutation,
  };
}
