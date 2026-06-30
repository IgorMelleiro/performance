import { useQuery } from '@tanstack/react-query';
import {
  getEvaluation,
  getEvaluations,
  getEvaluationSummary,
} from '@/services/evaluationService';
import { getTemplate, getTemplates } from '@/services/templateService';

export function useEvaluations(filters) {
  return useQuery({
    queryKey: ['evaluations', filters],
    queryFn: () =>
      getEvaluations({
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
      }),
    placeholderData: (previousData) => previousData,
  });
}

export function useEvaluation(id, enabled = true) {
  return useQuery({
    queryKey: ['evaluations', id],
    queryFn: () => getEvaluation(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useEvaluationSummary(id, enabled = true) {
  return useQuery({
    queryKey: ['evaluations', id, 'summary'],
    queryFn: () => getEvaluationSummary(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });
}

export function useTemplate(id, enabled = true) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => getTemplate(id),
    enabled: Boolean(id) && enabled,
  });
}
