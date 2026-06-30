import api from '@/api/client';

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data;
}
