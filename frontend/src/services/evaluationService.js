import api from '@/api/client';

export async function getEvaluations(params) {
  const { data } = await api.get('/evaluations', { params });
  return data;
}

export async function getEvaluation(id) {
  const { data } = await api.get(`/evaluations/${id}`);
  return data;
}

export async function getEvaluationSummary(id) {
  const { data } = await api.get(`/evaluations/${id}/summary`);
  return data;
}

export async function createEvaluation(payload) {
  const { data } = await api.post('/evaluations', payload);
  return data;
}

export async function updateEvaluation({ id, ...payload }) {
  const { data } = await api.put(`/evaluations/${id}`, payload);
  return data;
}

export async function completeEvaluation(id) {
  const { data } = await api.post(`/evaluations/${id}/complete`);
  return data;
}

export async function deleteEvaluation(id) {
  const { data } = await api.delete(`/evaluations/${id}`);
  return data;
}
