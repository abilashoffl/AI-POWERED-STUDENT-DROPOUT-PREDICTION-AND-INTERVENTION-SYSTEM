import API from './api';

export const getStudents = async (params = {}) => {
  const response = await API.get('/students', { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await API.get(`/students/${id}`);
  return response.data;
};

export const createStudent = async (data) => {
  const response = await API.post('/students', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await API.put(`/students/${id}`, data);
  return response.data;
};

export const updateStudentProfile = async (data) => {
  const response = await API.put('/students/profile/me', data);
  return response.data;
};

export const requestSupport = async (data) => {
  const response = await API.post('/students/request-support', data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await API.delete(`/students/${id}`);
  return response.data;
};
