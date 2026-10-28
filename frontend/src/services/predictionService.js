import API from './api';

export const createPrediction = async (data) => {
  const response = await API.post('/predictions', data);
  return response.data;
};

export const simulatePrediction = async (data) => {
  const response = await API.post('/predictions/simulate', data);
  return response.data;
};

export const getPredictionHistoryByStudent = async (studentId) => {
  const response = await API.get(`/predictions/student/${studentId}`);
  return response.data;
};

export const getAllPredictions = async () => {
  const response = await API.get('/predictions');
  return response.data;
};
