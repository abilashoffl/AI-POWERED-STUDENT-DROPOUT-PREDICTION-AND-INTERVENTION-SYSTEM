import API from './api';

export const getOverview = async () => {
  const response = await API.get('/analytics/overview');
  return response.data;
};

export const getRiskStats = async () => {
  const response = await API.get('/analytics/risk');
  return response.data;
};

export const getDepartmentStats = async () => {
  const response = await API.get('/analytics/departments');
  return response.data;
};
