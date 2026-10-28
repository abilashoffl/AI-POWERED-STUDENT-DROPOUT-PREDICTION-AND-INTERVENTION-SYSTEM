import API from './api';

export const getMentors = async () => {
  const response = await API.get('/mentors');
  return response.data;
};

export const createMentor = async (data) => {
  const response = await API.post('/mentors', data);
  return response.data;
};
