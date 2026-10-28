import API from './api';

export const getInterventions = async (params = {}) => {
  const response = await API.get('/interventions', { params });
  return response.data;
};

export const createIntervention = async (data) => {
  const response = await API.post('/interventions', data);
  return response.data;
};

export const updateIntervention = async (id, data) => {
  const response = await API.put(`/interventions/${id}`, data);
  return response.data;
};

export const studentInterventionAction = async (id, data) => {
  const response = await API.put(`/interventions/${id}/student-action`, data);
  return response.data;
};

export const deleteIntervention = async (id) => {
  const response = await API.delete(`/interventions/${id}`);
  return response.data;
};
