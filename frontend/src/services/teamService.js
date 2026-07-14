import api from '@/api/client';

export async function getTeams(params) {
  const { data } = await api.get('/teams', { params });
  return data;
}

export async function getTeam(id) {
  const { data } = await api.get(`/teams/${id}`);
  return data;
}

export async function createTeam(payload) {
  const { data } = await api.post('/teams', payload);
  return data;
}

export async function updateTeam({ id, ...payload }) {
  const { data } = await api.put(`/teams/${id}`, payload);
  return data;
}

export async function deleteTeam(id) {
  const { data } = await api.delete(`/teams/${id}`);
  return data;
}

export async function addTeamMember({ teamId, employeeId }) {
  const { data } = await api.post(`/teams/${teamId}/members`, { employeeId });
  return data;
}

export async function removeTeamMember({ teamId, employeeId }) {
  const { data } = await api.delete(`/teams/${teamId}/members/${employeeId}`);
  return data;
}

export async function addTeamManager({ teamId, managerId }) {
  const { data } = await api.post(`/teams/${teamId}/managers`, { managerId });
  return data;
}

export async function removeTeamManager({ teamId, managerId }) {
  const { data } = await api.delete(`/teams/${teamId}/managers/${managerId}`);
  return data;
}

export async function setTeamManagers({ teamId, managerIds }) {
  const { data } = await api.put(`/teams/${teamId}/managers`, { managerIds });
  return data;
}

export async function searchTeamEmployees(params) {
  const { data } = await api.get('/teams/search/employees', { params });
  return data;
}

export async function searchTeamManagers(params) {
  const { data } = await api.get('/teams/search/managers', { params });
  return data;
}
