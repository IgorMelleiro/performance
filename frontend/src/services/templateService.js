import api from '@/api/client';

export async function getTemplates() {
  const { data } = await api.get('/templates');
  return data;
}

export async function getTemplate(id) {
  const { data } = await api.get(`/templates/${id}`);
  return data;
}
